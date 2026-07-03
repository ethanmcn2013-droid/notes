import "server-only";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

import { runCalendarSpawnSweep } from "@/server/actions/calendar";
import { calendarSpawnEnabled } from "@/server/calendar/feature-flag";

/**
 * N·24 (Pattern 4), calendar spawn cron.
 *
 * GET /api/calendar/cron
 *
 * Triggered by Vercel cron every 5 minutes (see vercel.json). Each
 * run sweeps every active connection, fetches the spawn window
 * (`now - 1m … now + 6m`), and creates one note per never-spawned
 * occurrence.
 *
 * Auth shape: Vercel cron jobs include an `Authorization: Bearer
 * <CRON_SECRET>` header (Vercel-injected). We verify constant-time
 * against `CRON_SECRET`. Same shape as the other Signal Studio
 * cron-backed routes.
 *
 * Refusal anchor (PRODUCT.md §9 "Zero notifications"): a successful
 * sweep produces zero side-effects beyond the spawned notes
 * themselves. No email, no push, no slack, no "your meeting starts
 * soon", the note arrives in the stream and the user discovers it
 * on their next foreground.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function authOk(req: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const presented = (req.headers.get("authorization") ?? "").replace(
    /^Bearer\s+/i,
    ""
  );
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!calendarSpawnEnabled()) {
    // Cron continues to fire even when the surface is off; quietly
    // 200 so Vercel doesn't mark the cron as failing while we soak.
    return NextResponse.json({ ok: true, disabled: true });
  }

  if (!authOk(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const result = await runCalendarSpawnSweep();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "sweep-failed",
      },
      { status: 500 }
    );
  }
}
