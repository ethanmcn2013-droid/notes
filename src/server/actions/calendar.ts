import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { db } from "@/server/db/client";
import {
  calendarConnections,
  notes,
  spawnedCalendarEvents,
} from "@/server/db/schema";
import {
  listGoogleEvents,
  refreshGoogleAccessToken,
  type CalendarEvent,
} from "@/server/calendar/google";

/**
 * N·24 (Pattern 4), calendar spawn pipeline.
 *
 * This module owns the *server-side* spawn act: for each connected
 * calendar, find events starting in the next ~5 minutes, and create
 * one note per event-occurrence we have not already handled.
 *
 * Locked refusals (PRODUCT.md §8, restated three times in the
 * handoff):
 *   1. No auto-detected action items. Ever. The note body is
 *      composed from `title` + `attendees` only. The event
 *      description is not even fetched (see google.ts `fields=`).
 *   2. No meeting summaries. There is no AI step in this pipeline.
 *   3. No body content beyond title + attendees + blank line. The
 *      composer below is the entire scaffold.
 *   4. No notification. The spawn writes a note to the stream; the
 *      user discovers it on their next /app foreground. PRODUCT.md
 *      §9 "zero notifications" holds.
 *   5. No retroactive backfill. We only ever look forward from
 *      `Date.now()`. First-connect users do not get a historical
 *      dump.
 *
 * Idempotency: PRIMARY KEY (user_id, provider, calendar_event_id,
 * occurrence_start) on spawned_calendar_events. Two devices racing
 * → one INSERT wins, the other no-ops. Cron retries (Vercel
 * occasionally fires the same minute twice) → same protection.
 *
 * Edge cases the spec calls out (six):
 *   - Back-to-back meetings: each spawns its own note (no merging).
 *   - Solo focus block (no attendees): note is title-only. Still spawns.
 *   - Declined events: `userDeclined` flag from google.ts; we refuse.
 *   - Disconnected after spawn: spawned notes stay. Worker is a no-op.
 *   - User edits the body: pill disappears (read-side: see Notebook).
 *   - Multi-device race: PK collision → no-op.
 *   - All-day events: `isAllDay` flag → skip. They are not meetings.
 *   - Past events on first connect: window is `now ... now + 6 min`,
 *     so never look back.
 */

// 5-minute pre-event spawn window per the spec. We accept a small
// upper buffer (6m) so a cron firing late by ~30s still catches the
// event before the 5-minute mark.
const SPAWN_LEAD_MS = 6 * 60 * 1000;
// Don't backfill: never look at events more than this old (covers
// cron drift). Effectively "now", anything older than this is past.
const SPAWN_BACKWARD_TOLERANCE_MS = 60 * 1000;

function makeNoteId() {
  return `n_${crypto.randomUUID().replace(/-/g, "")}`;
}

/**
 * Compose the note body. This is the *entire* shape of a calendar-
 * spawned note. If a future contributor finds themselves adding a
 * "agenda" line or a "join link" line: stop, re-read PRODUCT.md §8,
 * and the three refusals at the top of this file.
 */
export function composeCalendarNoteBody(event: CalendarEvent): string {
  const lines: string[] = [];
  lines.push(event.title);
  for (const a of event.attendees) {
    lines.push(a);
  }
  // Trailing blank line: the cursor lands here when the user opens
  // the note. Matches the handoff's "blank line for capture".
  lines.push("");
  return lines.join("\n");
}

/**
 * Spawn one note for one event occurrence. Idempotent: a second call
 * with the same (userId, provider, eventId, occurrenceStart) is a
 * no-op. Returns whether a fresh note was created.
 *
 * Refusal anchor (PRODUCT.md §8): the body composed here is title +
 * attendees only. No description, no action items, no summary.
 */
export async function spawnCalendarNote(args: {
  userId: string;
  provider: "google";
  event: CalendarEvent;
}): Promise<{ created: boolean; noteId: string | null }> {
  const { userId, provider, event } = args;

  // Refusals at the call gate (cheap):
  if (event.userDeclined) return { created: false, noteId: null };
  if (event.isAllDay) return { created: false, noteId: null };

  const now = Date.now();
  const noteId = makeNoteId();

  // Two-step idempotency: try to claim the (event, occurrence)
  // ledger row first. If a row already exists, the ON CONFLICT skips
  // and the ledger reads tells us nothing was inserted.
  const claim = await db
    .insert(spawnedCalendarEvents)
    .values({
      userId,
      provider,
      calendarEventId: event.id,
      occurrenceStart: event.start,
      noteId,
      createdAt: now,
    })
    .onConflictDoNothing()
    .returning({ noteId: spawnedCalendarEvents.noteId });

  if (claim.length === 0) {
    // Already spawned. Honour the existing row; this is the no-op
    // path for multi-device races and cron double-fires.
    return { created: false, noteId: null };
  }

  // We won the claim, write the note. The body is composed from
  // title + attendees ONLY. createdAt === updatedAt so the read side
  // can detect "untouched" and render the provenance pill.
  const body = composeCalendarNoteBody(event);
  await db.insert(notes).values({
    id: noteId,
    userId,
    body,
    createdAt: now,
    updatedAt: now,
    source: "calendar",
  });

  return { created: true, noteId };
}

/**
 * Worker entrypoint. Iterates every active calendar connection,
 * fetches the spawn window from each, and spawns notes idempotently.
 *
 * Called by:
 *   - /api/calendar/cron (Vercel cron, every 5 minutes).
 *   - Manual operator trigger if needed (admin-only).
 *
 * Returns a small summary suitable for cron logs. No throwing per
 * connection: a single user's expired refresh token must not block
 * the rest of the fleet.
 */
export async function runCalendarSpawnSweep(): Promise<{
  connectionsProcessed: number;
  spawned: number;
  errors: number;
}> {
  const now = Date.now();
  const windowStart = now - SPAWN_BACKWARD_TOLERANCE_MS;
  const windowEnd = now + SPAWN_LEAD_MS;

  // isolation-ok: fleet-wide cron (runCalendarSpawnSweep → /api/calendar/cron,
  // every 5 min) intentionally reads every user connection. All per-user work
  // below is keyed to conn.userId. Not a tenant-facing query.
  const connections = await db
    .select({
      userId: calendarConnections.userId,
      provider: calendarConnections.provider,
      calendarId: calendarConnections.calendarId,
      refreshToken: calendarConnections.refreshToken,
    })
    .from(calendarConnections);

  let spawned = 0;
  let errors = 0;

  for (const conn of connections) {
    try {
      if (conn.provider !== "google") {
        // v1 ships Google only. A future Microsoft adapter slots in
        // here without touching the spawn surface.
        continue;
      }
      const accessToken = await refreshGoogleAccessToken(conn.refreshToken);
      const events = await listGoogleEvents(
        accessToken,
        conn.calendarId,
        windowStart,
        windowEnd
      );
      for (const e of events) {
        const r = await spawnCalendarNote({
          userId: conn.userId,
          provider: "google",
          event: e,
        });
        if (r.created) spawned += 1;
      }
      await db
        .update(calendarConnections)
        .set({ lastSyncedAt: now, updatedAt: now })
        .where(
          and(
            eq(calendarConnections.userId, conn.userId),
            eq(calendarConnections.provider, conn.provider),
            eq(calendarConnections.calendarId, conn.calendarId)
          )
        );
    } catch (err) {
      errors += 1;
      // Log only; do not rethrow. A single bad connection cannot
      // block the sweep.
      // eslint-disable-next-line no-console
      console.error("[calendar-spawn] connection failed", {
        userId: conn.userId,
        provider: conn.provider,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return {
    connectionsProcessed: connections.length,
    spawned,
    errors,
  };
}

/**
 * Persist (or replace) a calendar connection for a user. Called by
 * the OAuth callback after a successful token exchange.
 */
export async function saveCalendarConnection(args: {
  userId: string;
  provider: "google";
  calendarId: string;
  refreshToken: string;
}): Promise<void> {
  const { userId, provider, calendarId, refreshToken } = args;
  const now = Date.now();

  // UPSERT by (user_id, provider, calendar_id). Re-connecting
  // refreshes the refresh_token (Google issues a new one each time
  // prompt=consent is used).
  await db
    .insert(calendarConnections)
    .values({
      userId,
      provider,
      calendarId,
      refreshToken,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [
        calendarConnections.userId,
        calendarConnections.provider,
        calendarConnections.calendarId,
      ],
      set: {
        refreshToken: sql`excluded.refresh_token`,
        updatedAt: now,
      },
    });
}

/**
 * Disconnect: remove the connection. Spawned notes stay (the spec
 * is explicit on this, they belong to the user once written).
 */
export async function deleteCalendarConnection(args: {
  userId: string;
  provider: "google";
  calendarId: string;
}): Promise<void> {
  const { userId, provider, calendarId } = args;
  await db
    .delete(calendarConnections)
    .where(
      and(
        eq(calendarConnections.userId, userId),
        eq(calendarConnections.provider, provider),
        eq(calendarConnections.calendarId, calendarId)
      )
    );
}

/**
 * Read: does the signed-in user have any active calendar connection?
 * Used by the account UI to render "Connect" vs "Connected".
 */
export async function listCalendarConnections(
  userId: string
): Promise<
  Array<{
    provider: string;
    calendarId: string;
    lastSyncedAt: number | null;
  }>
> {
  const rows = await db
    .select({
      provider: calendarConnections.provider,
      calendarId: calendarConnections.calendarId,
      lastSyncedAt: calendarConnections.lastSyncedAt,
    })
    .from(calendarConnections)
    .where(eq(calendarConnections.userId, userId));
  return rows;
}
