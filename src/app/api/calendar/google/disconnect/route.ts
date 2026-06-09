import "server-only";
import { NextResponse } from "next/server";

import { requireUser } from "@/server/auth";
import { deleteCalendarConnection } from "@/server/actions/calendar";
import { calendarSpawnEnabled } from "@/server/calendar/feature-flag";

/**
 * N·24 (Pattern 4) — disconnect Google Calendar.
 *
 * POST /api/calendar/google/disconnect
 *
 * Removes the connection. Already-spawned notes stay where they are
 * (handoff §2 edge: "calendar disconnected after some notes spawned
 * → existing notes stay. Source pill stays until edited.").
 *
 * Token revocation at Google is intentionally NOT called here: the
 * refresh token simply stops being used; if the user wants to fully
 * revoke they do so from their Google account permissions page. This
 * keeps the disconnect a single-write idempotent action — no network
 * call that could fail and leave the UI in a half-state.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  if (!calendarSpawnEnabled()) {
    return new NextResponse("Not found", { status: 404 });
  }
  const userId = await requireUser();
  await deleteCalendarConnection({
    userId,
    provider: "google",
    calendarId: "primary",
  });
  return NextResponse.json({ ok: true });
}
