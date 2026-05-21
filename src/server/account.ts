import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/client";
import { notes, userPreferences } from "@/server/db/schema";

/**
 * Hard-delete the user's footprint in Notes' Turso DB.
 *
 * Called by `POST /api/account/delete` BEFORE the Clerk admin delete.
 *
 * Notes' schema is two user-keyed tables — every note row belongs to
 * one userId, and the per-user `userPreferences` row holds the
 * email-to-capture slug. Both purge by clerk userId (Notes uses Clerk
 * userId directly as the userId column).
 *
 * Idempotent: re-running after partial failure is safe.
 */
export async function deleteAccountForUser(clerkId: string): Promise<void> {
  await db.delete(notes).where(eq(notes.userId, clerkId));
  await db.delete(userPreferences).where(eq(userPreferences.userId, clerkId));
}
