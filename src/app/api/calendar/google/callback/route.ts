import "server-only";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

import { exchangeGoogleCode } from "@/server/calendar/google";
import { saveCalendarConnection } from "@/server/actions/calendar";
import { calendarSpawnEnabled } from "@/server/calendar/feature-flag";

/**
 * N·24 (Pattern 4) — Google Calendar OAuth: callback.
 *
 * GET /api/calendar/google/callback?code=...&state=...
 *
 * Verifies the state HMAC issued by /connect (defeats CSRF on the
 * redirect), exchanges the auth code for a refresh token, stores the
 * connection bound to the primary calendar, and redirects to the
 * account page with a `connected=google` query so the UI can render
 * the success state inline (no toast, per PRODUCT.md §9).
 *
 * Failure modes (all redirect back to account with an error query —
 * no error toast, the account UI renders the message inline):
 *   - state mismatch (CSRF) → ?calendar_error=state
 *   - missing code (user denied consent) → ?calendar_error=denied
 *   - token exchange failed → ?calendar_error=exchange
 *   - DB write failed → ?calendar_error=store
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function verifyState(state: string): string | null {
  const secret = process.env.NOTES_CALENDAR_STATE_SECRET;
  if (!secret) return null;
  const parts = state.split(".");
  if (parts.length !== 3) return null;
  const [nonce, mac, userB64] = parts;
  let userId: string;
  try {
    userId = Buffer.from(userB64, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const expected = createHmac("sha256", secret)
    .update(`${nonce}|${userId}`)
    .digest("hex")
    .slice(0, 32);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return userId;
}

function redirectTo(path: string, base: URL): NextResponse {
  return NextResponse.redirect(new URL(path, base));
}

export async function GET(req: Request) {
  const base = new URL(req.url);

  if (!calendarSpawnEnabled()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const code = base.searchParams.get("code");
  const state = base.searchParams.get("state");
  const denied = base.searchParams.get("error");

  if (denied) {
    return redirectTo("/app/account?calendar_error=denied", base);
  }
  if (!code || !state) {
    return redirectTo("/app/account?calendar_error=denied", base);
  }

  const userId = verifyState(state);
  if (!userId) {
    return redirectTo("/app/account?calendar_error=state", base);
  }

  let tokens: { refreshToken: string };
  try {
    tokens = await exchangeGoogleCode(code);
  } catch {
    return redirectTo("/app/account?calendar_error=exchange", base);
  }

  try {
    await saveCalendarConnection({
      userId,
      provider: "google",
      // v1: bind to the primary calendar. Multi-calendar merging is
      // explicitly out of scope (handoff §2 Pattern 4 "out of scope").
      calendarId: "primary",
      refreshToken: tokens.refreshToken,
    });
  } catch {
    return redirectTo("/app/account?calendar_error=store", base);
  }

  return redirectTo("/app/account?calendar_connected=google", base);
}
