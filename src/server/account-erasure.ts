import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import {
  calendarConnections,
  notes,
  spawnedCalendarEvents,
  userPreferences,
} from "./db/schema";
import * as schema from "./db/schema";

/**
 * Database handle accepted by {@link eraseAccountData}. Typed against the
 * full schema so the function can run against the production singleton OR
 * an in-memory test DB — the seam that makes erasure provably testable
 * (see account-erasure.test.ts).
 */
export type ErasureDb = LibSQLDatabase<typeof schema>;

/**
 * Hard-delete a user's ENTIRE footprint across every user-keyed table in
 * Notes' Turso DB, and return the calendar refresh tokens that were
 * attached so the caller can revoke them at Google.
 *
 * GDPR right-to-erasure / App Store 5.1.1(v). Notes keys every row by the
 * Clerk userId directly (no separate users table, no FKs). The four
 * user-keyed tables are `notes`, `calendar_connections`,
 * `spawned_calendar_events`, and `user_preferences`.
 *
 * ── Why this changed ──────────────────────────────────────────────────
 * The previous erasure deleted only `notes` + `user_preferences`. It left
 * `calendar_connections` — which stores a long-lived Google OAuth
 * **refresh token** (`refresh_token NOT NULL`) — and `spawned_calendar_events`
 * behind. A deleted user's refresh token survived and could still mint
 * access tokens against their calendar. That is both a standing-credential
 * security hole and a GDPR Art. 17 breach. This function now clears all
 * four tables and surfaces the tokens for revocation.
 *
 * Idempotent: every delete is a no-op once the rows are gone, so a retry
 * after a partial failure is safe. Token collection happens first (while
 * the rows exist); deletion happens after.
 */
export async function eraseAccountData(
  database: ErasureDb,
  clerkId: string,
): Promise<{ refreshTokens: string[] }> {
  // Collect refresh tokens BEFORE deleting, so a deletion failure never
  // loses the pointer needed to revoke the credential at Google.
  const connections = await database
    .select({ refreshToken: calendarConnections.refreshToken })
    .from(calendarConnections)
    .where(eq(calendarConnections.userId, clerkId));
  const refreshTokens = connections
    .map((c) => c.refreshToken)
    .filter((t): t is string => Boolean(t));

  await database.delete(notes).where(eq(notes.userId, clerkId));
  await database
    .delete(spawnedCalendarEvents)
    .where(eq(spawnedCalendarEvents.userId, clerkId));
  await database
    .delete(calendarConnections)
    .where(eq(calendarConnections.userId, clerkId));
  await database
    .delete(userPreferences)
    .where(eq(userPreferences.userId, clerkId));

  return { refreshTokens };
}
