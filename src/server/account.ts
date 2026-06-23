import "server-only";
import { db } from "@/server/db/client";
import { eraseAccountData } from "@/server/account-erasure";
import { revokeGoogleToken } from "@/server/calendar/google";

/**
 * Hard-delete the user's footprint in Notes' Turso DB and revoke any
 * calendar OAuth tokens they held.
 *
 * Called by `POST /api/account/delete` BEFORE the Clerk admin delete.
 *
 * The erasure itself lives in `account-erasure.ts` as a db-injected pure
 * function so it can be exercised end-to-end against an in-memory libSQL
 * DB (see account-erasure.test.ts). It clears all four user-keyed tables —
 * including `calendar_connections`, which holds long-lived Google refresh
 * tokens — and returns those tokens so we can revoke them at Google here.
 *
 * Revocation is best-effort and runs AFTER the DB purge: a revoke failure
 * (network, already-expired token) must never block the deletion. The DB
 * row is already gone, so the worst case is a token that lapses naturally.
 *
 * Idempotent: re-running after partial failure is safe.
 */
export async function deleteAccountForUser(clerkId: string): Promise<void> {
  const { refreshTokens } = await eraseAccountData(db, clerkId);

  for (const token of refreshTokens) {
    await revokeGoogleToken(token);
  }
}
