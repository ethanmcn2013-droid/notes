import "server-only";

import { auth } from "@clerk/nextjs/server";

/**
 * Tagged error thrown when no Clerk session is attached. Client
 * surfaces match on `name` (not message) to render a sign-in nudge
 * instead of the raw "Not authenticated" string.
 */
export class UnauthorizedError extends Error {
  override readonly name = "UnauthorizedError";
  constructor(message = "Not authenticated") {
    super(message);
  }
}

/**
 * Server-side helper: returns the Clerk userId or throws
 * UnauthorizedError if no session.
 *
 * Server actions in /server/actions/notes.ts call this before any
 * read or write so we never accidentally leak across users.
 */
export async function requireUser(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}
