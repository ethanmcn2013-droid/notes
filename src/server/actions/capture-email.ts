"use server";

import { eq } from "drizzle-orm";
import { requireUser } from "@/server/auth";
import { db } from "@/server/db/client";
import { userPreferences } from "@/server/db/schema";
import { notesProEnabled } from "@/server/entitlements";

const CAPTURE_DOMAIN =
  process.env.NEXT_PUBLIC_NOTES_CAPTURE_DOMAIN ?? "notes.signalstudio.ie";

function makeSlug(): string {
  // 8 chars, base-36, ~41 bits of entropy. Plenty for routing; we
  // don't need this to be unguessable to an attacker — the bearer
  // secret on the webhook is the actual auth.
  return Math.random().toString(36).slice(2, 6) +
    Math.random().toString(36).slice(2, 6);
}

export type CaptureEmailResult =
  | { ok: true; address: string; slug: string }
  | { ok: false; reason: "free-tier-not-enabled" }
  | { ok: false; reason: "inbound-not-configured" };

/**
 * Resolve the signed-in user's capture-email address. Two gates:
 *
 *   1. Tier: must be workspace+ (notesProEnabled).
 *   2. Inbound mail provider must be wired (NOTES_CAPTURE_INBOUND_SECRET
 *      env must be set). Until DNS/Resend is configured, we hide the
 *      address rather than show one that silently drops mail.
 *
 * Row is lazy-created on first ok call — never seeded at signup, so
 * the cost (a single INSERT) only lands on users who actually want
 * this feature AND can use it.
 */
export async function getCaptureEmail(): Promise<CaptureEmailResult> {
  const userId = await requireUser();
  if (!(await notesProEnabled(userId))) {
    return { ok: false, reason: "free-tier-not-enabled" };
  }
  if (!process.env.NOTES_CAPTURE_INBOUND_SECRET) {
    return { ok: false, reason: "inbound-not-configured" };
  }

  const existing = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  let slug = existing[0]?.captureSlug;
  if (!slug) {
    // Unique-collision is statistically impossible at 8 chars but
    // the DB constraint protects us anyway. One retry covers it.
    for (let attempt = 0; attempt < 3 && !slug; attempt++) {
      const candidate = makeSlug();
      try {
        await db.insert(userPreferences).values({
          userId,
          captureSlug: candidate,
        });
        slug = candidate;
      } catch {
        // try again
      }
    }
    if (!slug) {
      throw new Error("Failed to allocate capture slug after 3 attempts");
    }
  }

  return {
    ok: true,
    slug,
    address: `capture-${slug}@${CAPTURE_DOMAIN}`,
  };
}

/**
 * Rotate the user's capture slug — useful if the address leaked to
 * a public mailing list. The old address stops resolving immediately
 * after this returns. Tier-gated.
 */
export async function regenerateCaptureSlug(): Promise<CaptureEmailResult> {
  const userId = await requireUser();
  if (!(await notesProEnabled(userId))) {
    return { ok: false, reason: "free-tier-not-enabled" };
  }

  const next = makeSlug();
  const now = Date.now();
  await db
    .insert(userPreferences)
    .values({ userId, captureSlug: next })
    .onConflictDoUpdate({
      target: userPreferences.userId,
      set: { captureSlug: next, updatedAt: now },
    });

  return {
    ok: true,
    slug: next,
    address: `capture-${next}@${CAPTURE_DOMAIN}`,
  };
}
