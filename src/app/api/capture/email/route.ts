import "server-only";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/server/db/client";
import { notes, userPreferences } from "@/server/db/schema";
import { notesProEnabled } from "@/server/entitlements";

/**
 * Inbound email → note (N-1, 2026-05-14).
 *
 * Generic provider-shape webhook: accepts a normalized JSON body
 * with { to, from, subject, text }. The `to` address is parsed for
 * the slug, `capture-<slug>@notes.signalstudio.ie`, which maps
 * back to a Clerk userId via user_preferences.
 *
 * Operator setup (NOT yet done at time of commit):
 *   1. Configure an inbound email provider (Resend Inbound or
 *      Mailgun routes) to POST normalized JSON to this endpoint.
 *   2. Set DNS: MX for capture.notes.signalstudio.ie → provider.
 *   3. Set env vars on Vercel:
 *        - NOTES_CAPTURE_INBOUND_SECRET (shared bearer; the
 *          provider sends this in Authorization)
 *        - NOTES_CAPTURE_DOMAIN (informational; used by the server
 *          action to render the user-facing address; server-only,
 *          not NEXT_PUBLIC so it stays out of client bundles)
 *
 * Until those land, the endpoint returns 401 on every call. That's
 * the right shape, no inbound mail means no inbound mail.
 *
 * Privacy guardrail: the From address is recorded only inside the
 * note body's first line ("from: ..."). It is never extracted into
 * a separate column; raw note bodies stay private to the user. No
 * collaborative surface ever sees this content.
 */
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type InboundPayload = {
  to?: string | null;
  from?: string | null;
  subject?: string | null;
  text?: string | null;
};

const MAX_BODY_BYTES = 256 * 1024;
// Mirrors MAX_NOTE_BODY_CHARS in server/actions/notes.ts. Inbound
// mail inserts directly (not via createNote), so it enforces the
// same per-note ceiling, truncated, not rejected, since the sender
// never sees an error response.
const MAX_NOTE_BODY_CHARS = 10_000;
const THROTTLE_WINDOW_MS = 60_000;
const THROTTLE_MAX_PER_WINDOW = 30;

const throttleCounters = new Map<string, { count: number; resetAt: number }>();

function throttleKey(req: Request, slug: string | null): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  return `${ip}:${slug ?? "_"}`;
}

function rateLimit(req: Request, slug: string | null): boolean {
  const key = throttleKey(req, slug);
  const now = Date.now();
  const entry = throttleCounters.get(key);
  if (!entry || entry.resetAt <= now) {
    throttleCounters.set(key, { count: 1, resetAt: now + THROTTLE_WINDOW_MS });
    if (throttleCounters.size > 1024) {
      for (const [k, v] of throttleCounters) {
        if (v.resetAt <= now) throttleCounters.delete(k);
      }
    }
    return true;
  }
  if (entry.count >= THROTTLE_MAX_PER_WINDOW) return false;
  entry.count += 1;
  return true;
}

function authOk(req: Request): boolean {
  const expected = process.env.NOTES_CAPTURE_INBOUND_SECRET;
  if (!expected) return false;
  const presented = (req.headers.get("authorization") ?? "").replace(
    /^Bearer\s+/i,
    "",
  );
  const a = Buffer.from(presented);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function parseSlug(to: string | null | undefined): string | null {
  if (!to) return null;
  // Tolerate angle-bracketed forms ("Name <capture-abcd@...>"),
  // case variations, and surrounding whitespace.
  const m = to.match(/capture-([a-f0-9]{8,16})@/i);
  return m ? m[1].toLowerCase() : null;
}

function buildBody(
  from: string | null,
  subject: string | null,
  text: string | null,
): string {
  // Per the file-header privacy guardrail: when present, the From
  // address is recorded inline as the body's first line. Stays out
  // of any structured column; never leaves the user's notebook.
  const f = (from ?? "").trim();
  const s = (subject ?? "").trim();
  const t = (text ?? "").trim();
  const parts: string[] = [];
  if (f) parts.push(`from: ${f}`);
  if (s) parts.push(s);
  if (t) parts.push(t);
  const joined = parts.join("\n\n");
  if (joined.length <= MAX_NOTE_BODY_CHARS) return joined;
  const marker = "\n\n[truncated]";
  return joined.slice(0, MAX_NOTE_BODY_CHARS - marker.length) + marker;
}

export async function POST(req: Request) {
  if (!authOk(req)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // Guard against oversized bodies. The Content-Length check covers
  // well-behaved callers; the arrayBuffer cap covers chunked or
  // maliciously forged requests that omit / lie about Content-Length.
  const declaredLength = Number(req.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "payload-too-large" },
      { status: 413 },
    );
  }

  let rawBytes: ArrayBuffer;
  try {
    rawBytes = await req.arrayBuffer();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-body" }, { status: 400 });
  }
  if (rawBytes.byteLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, error: "payload-too-large" },
      { status: 413 },
    );
  }

  let payload: InboundPayload;
  try {
    payload = JSON.parse(new TextDecoder().decode(rawBytes)) as InboundPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid-json" }, { status: 400 });
  }

  const slug = parseSlug(payload.to);
  if (!rateLimit(req, slug)) {
    return NextResponse.json(
      { ok: false, error: "rate-limited" },
      { status: 429 },
    );
  }
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "no-slug-in-to", to: payload.to ?? null },
      { status: 400 },
    );
  }

  const found = await db
    .select({ userId: userPreferences.userId })
    .from(userPreferences)
    .where(eq(userPreferences.captureSlug, slug))
    .limit(1);

  const userId = found[0]?.userId;
  if (!userId) {
    // Slug doesn't map to anyone, silently 202 so spam doesn't
    // signal which slugs exist.
    return NextResponse.json({ ok: true, accepted: false }, { status: 202 });
  }

  // Delivery-time tier recheck. The slug was issued while the user
  // held workspace+, but entitlements expire, a workspace→free
  // downgrade must stop capture-by-email, not keep a paid feature
  // live until the slug is manually rotated. notesProEnabled
  // fail-closes to `free` on a Turso error (suite doctrine: an
  // outage tightens gates, never loosens them), which can drop a
  // legitimate message during a blip; accepted because serving a
  // paid feature to a downgraded user violates the honesty the
  // pricing surface promises ("drops to Free"). Same silent 202 as
  // the unknown-slug path so tier state never leaks to a sender.
  if (!(await notesProEnabled(userId))) {
    return NextResponse.json({ ok: true, accepted: false }, { status: 202 });
  }

  const body = buildBody(
    payload.from ?? null,
    payload.subject ?? null,
    payload.text ?? null,
  );
  if (!body) {
    return NextResponse.json({ ok: false, error: "empty-body" }, { status: 400 });
  }

  const id = `n_${crypto.randomUUID().replace(/-/g, "")}`;
  const now = Date.now();
  await db.insert(notes).values({
    id,
    userId,
    body,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({ ok: true, accepted: true, id });
}
