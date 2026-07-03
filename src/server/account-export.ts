import { eq } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import {
  calendarConnections,
  notes,
  spawnedCalendarEvents,
  userPreferences,
} from "./db/schema";
import * as schema from "./db/schema";

export type ExportDb = LibSQLDatabase<typeof schema>;

/**
 * GDPR Art. 20 (data portability), assemble a machine-readable copy of
 * everything Notes holds for a user, keyed by their Clerk userId.
 *
 * The counterpart to `account-erasure.ts`: erasure removes the footprint,
 * this returns it. Same db-injection seam so it's testable against an
 * in-memory libSQL DB (see account-export.test.ts).
 *
 * SECURITY: `calendar_connections.refresh_token` is DELIBERATELY OMITTED.
 * It is a live OAuth credential, not user content, handing it back in a
 * downloadable file would let a leaked export mint calendar access. We
 * export the connection metadata (provider, calendar, sync time) instead.
 */
export async function exportAccountData(database: ExportDb, clerkId: string) {
  const [noteRows, connectionRows, spawnedRows, prefsRows] = await Promise.all([
    database.select().from(notes).where(eq(notes.userId, clerkId)),
    database
      .select({
        provider: calendarConnections.provider,
        calendarId: calendarConnections.calendarId,
        lastSyncedAt: calendarConnections.lastSyncedAt,
        createdAt: calendarConnections.createdAt,
        updatedAt: calendarConnections.updatedAt,
      })
      .from(calendarConnections)
      .where(eq(calendarConnections.userId, clerkId)),
    database
      .select()
      .from(spawnedCalendarEvents)
      .where(eq(spawnedCalendarEvents.userId, clerkId)),
    database
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, clerkId)),
  ]);

  return {
    product: "notes" as const,
    exportedAt: new Date().toISOString(),
    userId: clerkId,
    notes: noteRows,
    // Token-free by design, see the security note above.
    calendarConnections: connectionRows,
    spawnedCalendarEvents: spawnedRows,
    preferences: prefsRows[0] ?? null,
  };
}
