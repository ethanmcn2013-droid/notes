import "server-only";
import { NextResponse } from "next/server";
import { randomBytes, createHmac } from "node:crypto";

import { requireUser } from "@/server/auth";
import { buildGoogleAuthUrl } from "@/server/calendar/google";
import { calendarSpawnEnabled } from "@/server/calendar/feature-flag";

/**
 * N·24 (Pattern 4) — Google Calendar OAuth: connect entrypoint.
 *
 * GET /api/calendar/google/connect → 302 to Google's consent screen.
 *
 * Operator gating (handoff §6 recommended "per-user opt-in" but also
 * allowed env-flag): we ship BOTH. The route 404s when
 * `NOTES_CALENDAR_SPAWN_ENABLED` is not "1" — operator kill-switch
 * across the fleet. When enabled, the route still requires the user
 * to land here intentionally (the account UI button) — that is the
 * per-user opt-in. OFF by default at both gates.
 *
 * State param: random nonce + HMAC(nonce | userId) using
 * NOTES_CALENDAR_STATE_SECRET. The callback verifies the HMAC to
 * defeat CSRF on the redirect — Google echoes whatever state we
 * send, and a forged callback could otherwise bind a stranger's
 * Google account to the victim's Notes account.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!calendarSpawnEnabled()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const userId = await requireUser();
  const secret = process.env.NOTES_CALENDAR_STATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "calendar-not-configured" },
      { status: 500 }
    );
  }

  const nonce = randomBytes(16).toString("hex");
  const mac = createHmac("sha256", secret)
    .update(`${nonce}|${userId}`)
    .digest("hex")
    .slice(0, 32);
  const state = `${nonce}.${mac}.${Buffer.from(userId).toString("base64url")}`;

  let url: string;
  try {
    url = buildGoogleAuthUrl(state);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "google-config-missing" },
      { status: 500 }
    );
  }

  return NextResponse.redirect(url);
}
