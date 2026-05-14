"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/server/auth";
import { db } from "@/server/db/client";
import { notes, type Note } from "@/server/db/schema";

function makeId() {
  return `n_${crypto.randomUUID().replace(/-/g, "")}`;
}

export type NoteRead = Pick<
  Note,
  "id" | "body" | "createdAt" | "updatedAt" | "extractBody" | "promotedTaskId"
>;

/**
 * Server action: create a note for the signed-in user.
 * Returns the created note so the client can update its UI without a
 * second round-trip.
 *
 * Privacy guardrail: raw note bodies are private account data. Shared
 * workspace, roadmap, task, and analytics surfaces must use future
 * creator-approved extract endpoints, not this raw note action.
 */
export async function createNote(body: string): Promise<NoteRead> {
  const userId = await requireUser();
  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error("Note body is empty");
  }

  const now = Date.now();
  const id = makeId();

  await db.insert(notes).values({
    id,
    userId,
    body: trimmed,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/app");

  return {
    id,
    body: trimmed,
    createdAt: now,
    updatedAt: now,
    extractBody: null,
    promotedTaskId: null,
  };
}

/**
 * Server action: list notes for the signed-in user, newest first.
 *
 * Notes are intentionally excluded from collaborative sharing surfaces:
 * this query is always scoped to the current Clerk user and must not be
 * reused for guest, public, workspace, roadmap, or analytics views.
 *
 * v1: no pagination — the stream is bounded by the user's own
 * notebook size. Pagination/virtualisation lands when a real user
 * crosses 500 notes.
 */
export async function listNotes(): Promise<NoteRead[]> {
  const userId = await requireUser();

  const rows = await db
    .select({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      extractBody: notes.extractBody,
      promotedTaskId: notes.promotedTaskId,
    })
    .from(notes)
    .where(eq(notes.userId, userId))
    .orderBy(desc(notes.createdAt));

  return rows;
}

/**
 * Server action: full-text search across the user's notes via FTS5.
 *
 * Replaces the client-side substring filter (N-2, 2026-05-14). The
 * notes_fts virtual table is kept in sync with the notes table via
 * INSERT/UPDATE/DELETE triggers (see drizzle/0001_fts5_search.sql).
 *
 * Query handling:
 *   - Empty / whitespace → returns [] (caller falls back to the full
 *     listNotes() stream).
 *   - Single-token queries: appended with * to enable prefix matching
 *     so "wedd" matches "wedding". Multi-token queries pass through
 *     verbatim — FTS5 implicit AND between tokens.
 *   - Special MATCH chars (",", AND/OR/NOT) sanitised so a user typing
 *     a literal comma doesn't crash the query.
 *
 * Privacy guardrail: same as listNotes — every row is filtered to
 * the current Clerk user. notes_fts.user_id is UNINDEXED but stored,
 * so the WHERE filter happens before MATCH ranking.
 *
 * Returns notes ordered by FTS5 rank, most-relevant first. Capped at
 * 100 results — Notes's stream UX shows a few results at a time, so
 * paging beyond that is unnecessary.
 */
export async function searchNotes(query: string): Promise<NoteRead[]> {
  const userId = await requireUser();
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Sanitise: keep alphanumeric + space; drop chars that FTS5 treats
  // as operators or quote delimiters. Cheap, defensive — a user's
  // search box is not a SQL prompt.
  const safe = trimmed.replace(/["'(),:.;\\]+/g, " ").replace(/\s+/g, " ").trim();
  if (!safe) return [];

  // Single-token: prefix-match so live-typing surfaces results.
  // Multi-token: AND-match via FTS5's implicit space-AND.
  const match = safe.includes(" ") ? safe : `${safe}*`;

  const rows = await db.all<{
    id: string;
    body: string;
    created_at: number;
    updated_at: number;
    extract_body: string | null;
    promoted_task_id: string | null;
  }>(sql`
    SELECT n.id, n.body, n.created_at, n.updated_at, n.extract_body, n.promoted_task_id
    FROM notes_fts fts
    JOIN notes n ON n.rowid = fts.rowid
    WHERE fts.user_id = ${userId}
      AND notes_fts MATCH ${match}
    ORDER BY fts.rank
    LIMIT 100
  `);

  return rows.map((r) => ({
    id: r.id,
    body: r.body,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    extractBody: r.extract_body,
    promotedTaskId: r.promoted_task_id,
  }));
}

/**
 * Server action: delete a note the user owns.
 */
export async function deleteNote(id: string): Promise<void> {
  const userId = await requireUser();

  await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, userId)));

  revalidatePath("/app");
}

/**
 * Server action: draft an action extract from a note. The creator
 * authors the action wording deliberately — Notes never auto-detects
 * todos from raw note bodies (PRODUCT.md §8 refusal).
 *
 * The extract_body lives alongside the raw note. The cross-repo write
 * to Signal Tasks (and population of promoted_task_id) runs through
 * sendExtractToTasks below.
 */
export async function setNoteExtract(
  id: string,
  body: string
): Promise<NoteRead> {
  const userId = await requireUser();
  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error("Action body is empty");
  }
  if (trimmed.length > 280) {
    throw new Error("Action is longer than 280 characters");
  }

  const now = Date.now();

  const result = await db
    .update(notes)
    .set({ extractBody: trimmed, updatedAt: now })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      extractBody: notes.extractBody,
      promotedTaskId: notes.promotedTaskId,
    });

  const row = result[0];
  if (!row) {
    throw new Error("Note not found");
  }

  revalidatePath("/app");
  return row;
}

/**
 * Server action: clear the drafted extract from a note. The raw note
 * body is untouched. If the extract had already been written to Tasks
 * (promoted_task_id non-null), the Task is not deleted from Tasks —
 * Notes owns the extract draft, not the resulting Task.
 */
export async function clearNoteExtract(id: string): Promise<NoteRead> {
  const userId = await requireUser();
  const now = Date.now();

  const result = await db
    .update(notes)
    .set({ extractBody: null, updatedAt: now })
    .where(and(eq(notes.id, id), eq(notes.userId, userId)))
    .returning({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      extractBody: notes.extractBody,
      promotedTaskId: notes.promotedTaskId,
    });

  const row = result[0];
  if (!row) {
    throw new Error("Note not found");
  }

  revalidatePath("/app");
  return row;
}

/**
 * Cross-repo Notes -> Tasks write (Cycle 9.4b second half,
 * 2026-05-12). Calls the Tasks endpoint with the drafted extract,
 * stores the resulting taskId on the note, returns the destination
 * workspace name + deep link so the UI can label "Sent to [workspace]
 * — open in Tasks."
 *
 * Privacy guardrail: only extract_body crosses the boundary. The raw
 * note body never leaves Notes.
 *
 * Idempotency: Tasks keys on (userId, noteId) — a repeat call returns
 * the same task instead of creating a duplicate. Safe to retry.
 */
export type ExtractSendResult = {
  taskId: string;
  workspaceName: string;
  workspaceSlug: string;
  taskUrl: string;
  created: boolean;
};

export async function sendExtractToTasks(
  noteId: string
): Promise<{ note: NoteRead; result: ExtractSendResult }> {
  const userId = await requireUser();
  const tasksUrl = (
    process.env.TASKS_API_URL ?? "https://tasks.signalstudio.ie"
  ).replace(/\/+$/, "");
  const secret = process.env.NOTES_TO_TASKS_SECRET;
  if (!secret) {
    throw new Error(
      "Cross-repo send is not configured (NOTES_TO_TASKS_SECRET missing)"
    );
  }

  // Read the note's extract so the network call sees the freshest
  // creator-authored wording — not whatever the client passed.
  const [note] = await db
    .select({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      extractBody: notes.extractBody,
      promotedTaskId: notes.promotedTaskId,
    })
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .limit(1);

  if (!note) {
    throw new Error("Note not found");
  }
  const extract = note.extractBody?.trim() ?? "";
  if (!extract) {
    throw new Error("Draft an action first");
  }

  let response: Response;
  try {
    response = await fetch(`${tasksUrl}/api/notes-extract`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${secret}`,
      },
      body: JSON.stringify({ userId, noteId, body: extract }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error("Tasks timed out — try again in a moment");
    }
    throw err;
  }

  if (!response.ok) {
    let detail = `Tasks returned ${response.status}`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) detail = data.error;
    } catch {
      // ignore — keep the status-code fallback
    }
    throw new Error(detail);
  }

  const raw = await response.json();
  if (
    typeof raw !== "object" ||
    !raw ||
    typeof (raw as Record<string, unknown>).taskId !== "string" ||
    typeof (raw as Record<string, unknown>).taskUrl !== "string"
  ) {
    throw new Error("Tasks returned an invalid response — try again");
  }
  const result = raw as ExtractSendResult;

  // Persist the task id Notes-side so the next render shows the
  // "Sent to [workspace]" state without re-calling Tasks.
  const updated = await db
    .update(notes)
    .set({ promotedTaskId: result.taskId, updatedAt: Date.now() })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      extractBody: notes.extractBody,
      promotedTaskId: notes.promotedTaskId,
    });

  const noteRow = updated[0];
  if (!noteRow) {
    throw new Error("Note vanished between send and store");
  }

  revalidatePath("/app");
  return { note: noteRow, result };
}
