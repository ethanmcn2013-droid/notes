import "server-only";

import { auth } from "@clerk/nextjs/server";

/**
 * Server-side helper: returns the Clerk userId or throws if no session.
 * Server actions in /server/actions/notes.ts call this before any
 * read or write so we never accidentally leak across users.
 */
export async function requireUser(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return userId;
}
