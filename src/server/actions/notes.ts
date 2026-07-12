"use server";

import { and, desc, eq, isNull, isNotNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createTasksAssertion } from "@/server/cross-product-assertion";

import { requireUser } from "@/server/auth";
import { db } from "@/server/db/client";
import { notes, type Note } from "@/server/db/schema";
import { isDemoMode } from "@/lib/access-mode";
import { authorizeTasksWorkspace } from "@/server/tasks-personalization";
import {
  demoArchivedNotes,
  demoNotes,
  demoSearchNotes,
} from "@/server/demo/notes-demo";

function makeId() {
  return `n_${crypto.randomUUID().replace(/-/g, "")}`;
}

export type NoteRead = Pick<
  Note,
  | "id"
  | "body"
  | "createdAt"
  | "updatedAt"
  | "extractBody"
  | "promotedTaskId"
  | "archivedAt"
  | "source"
  | "workspaceId"
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
// Module-local, a "use server" file may only *export* async
// functions, so the client mirrors this ceiling via its own
// constant rather than importing this one.
const MAX_NOTE_BODY_CHARS = 10_000;

export async function createNote(
  body: string,
  requestedWorkspaceId?: string | null,
): Promise<NoteRead> {
  const userId = await requireUser();
  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error("Note body is empty");
  }
  if (trimmed.length > MAX_NOTE_BODY_CHARS) {
    // A note is a thought, not a document. The textarea enforces the
    // same ceiling client-side; this is the trust-boundary backstop
    // for direct action calls and oversized pastes.
    throw new Error("Note is longer than 10,000 characters");
  }

  const now = Date.now();
  const id = makeId();
  let workspaceId: string | null = null;
  if (requestedWorkspaceId?.trim()) {
    const access = await authorizeTasksWorkspace(userId, requestedWorkspaceId);
    // Capture is the load-bearing action. If Tasks is unavailable or the
    // user's membership changed between render and save, keep the note
    // private and Unfiled instead of losing their words.
    if (access === "allowed") workspaceId = requestedWorkspaceId;
  }

  await db.insert(notes).values({
    id,
    userId,
    body: trimmed,
    createdAt: now,
    updatedAt: now,
    workspaceId,
  });

  // No revalidate: the client owns the optimistic merge and reconciles
  // against this return value. Revalidating thrashes the route cache
  // for every keystroke that ships.

  return {
    id,
    body: trimmed,
    createdAt: now,
    updatedAt: now,
    extractBody: null,
    promotedTaskId: null,
    archivedAt: null,
    source: null,
    workspaceId,
  };
}

/**
 * Server action: list notes for the signed-in user, newest first.
 *
 * Notes are intentionally excluded from collaborative sharing surfaces:
 * this query is always scoped to the current Clerk user and must not be
 * reused for guest, public, workspace, roadmap, or analytics views.
 *
 * v1: no pagination, the stream is bounded by the user's own
 * notebook size. Pagination/virtualisation lands when a real user
 * crosses 500 notes.
 */
export async function listNotes(): Promise<NoteRead[]> {
  // Demo/Review: serve the in-memory seed; never reach the real DB.
  if (isDemoMode()) return demoNotes();

  const userId = await requireUser();

  const rows = await db
    .select({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      extractBody: notes.extractBody,
      promotedTaskId: notes.promotedTaskId,
      archivedAt: notes.archivedAt,
      source: notes.source,
      workspaceId: notes.workspaceId,
    })
    .from(notes)
    .where(and(eq(notes.userId, userId), isNull(notes.archivedAt)))
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
 *     verbatim, FTS5 implicit AND between tokens.
 *   - Special MATCH chars (",", AND/OR/NOT) sanitised so a user typing
 *     a literal comma doesn't crash the query.
 *
 * Privacy guardrail: same as listNotes, every row is filtered to
 * the current Clerk user. notes_fts.user_id is UNINDEXED but stored,
 * so the WHERE filter happens before MATCH ranking.
 *
 * Returns notes ordered by FTS5 rank, most-relevant first. Capped at
 * 100 results, Notes's stream UX shows a few results at a time, so
 * paging beyond that is unnecessary.
 */
export async function searchNotes(query: string): Promise<NoteRead[]> {
  if (isDemoMode()) return demoSearchNotes(query);

  const userId = await requireUser();
  const trimmed = query.trim();
  if (!trimmed) return [];

  // Sanitise: drop quote delimiters, parentheses, punctuation,
  // FTS5 operator chars (* ^), and standalone boolean keywords that
  // would otherwise alter MATCH semantics in surprising ways. The
  // search box is not a query-DSL prompt, keep it intent-only.
  const stripped = trimmed
    .replace(/["'(),:.;\\*^]+/g, " ")
    .replace(/\b(AND|OR|NOT|NEAR)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!stripped) return [];

  // Single-token: prefix-match so live-typing surfaces results.
  // Multi-token: AND-match via FTS5's implicit space-AND.
  const match = stripped.includes(" ") ? stripped : `${stripped}*`;

  const rows = await db.all<{
    id: string;
    body: string;
    created_at: number;
    updated_at: number;
    extract_body: string | null;
    promoted_task_id: string | null;
    archived_at: number | null;
    source: string | null;
    workspace_id: string | null;
  }>(sql`
    SELECT n.id, n.body, n.created_at, n.updated_at, n.extract_body, n.promoted_task_id, n.archived_at, n.source, n.workspace_id
    FROM notes_fts fts
    JOIN notes n ON n.rowid = fts.rowid
    WHERE fts.user_id = ${userId}
      AND n.archived_at IS NULL
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
    archivedAt: r.archived_at,
    source: r.source,
    workspaceId: r.workspace_id,
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

  revalidatePath("/app", "page");
}

/**
 * Move one owned note into a currently-authorized canonical workspace, or
 * return it to Unfiled. This is deliberately single-note: Notes never offers
 * a mass owner/workspace reassignment seam.
 */
export async function setNoteWorkspace(
  noteId: string,
  requestedWorkspaceId: string | null,
): Promise<NoteRead> {
  const userId = await requireUser();
  const workspaceId = requestedWorkspaceId?.trim() || null;

  if (workspaceId) {
    const access = await authorizeTasksWorkspace(userId, workspaceId);
    if (access === "unavailable") {
      throw new Error("Workspaces are unavailable right now. Your note is still private.");
    }
    if (access !== "allowed") {
      throw new Error("That workspace is no longer available to your account.");
    }
  }

  const now = Date.now();
  const result = await db
    .update(notes)
    .set({ workspaceId, updatedAt: now })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      extractBody: notes.extractBody,
      promotedTaskId: notes.promotedTaskId,
      archivedAt: notes.archivedAt,
      source: notes.source,
      workspaceId: notes.workspaceId,
    });

  const row = result[0];
  if (!row) throw new Error("Note not found");
  return row;
}

/**
 * Server action: draft an action extract from a note. The creator
 * authors the action wording deliberately, Notes never auto-detects
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
      archivedAt: notes.archivedAt,
      source: notes.source,
      workspaceId: notes.workspaceId,
    });

  const row = result[0];
  if (!row) {
    throw new Error("Note not found");
  }

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
      archivedAt: notes.archivedAt,
      source: notes.source,
      workspaceId: notes.workspaceId,
    });

  const row = result[0];
  if (!row) {
    throw new Error("Note not found");
  }

  return row;
}

/**
 * Cross-repo Notes -> Tasks write (Cycle 9.4b second half,
 * 2026-05-12). Calls the Tasks endpoint with the drafted extract,
 * stores the resulting taskId on the note, returns the destination
 * workspace name + deep link so the UI can label "Sent to [workspace]
 *, open in Tasks."
 *
 * Privacy guardrail: only extract_body crosses the boundary. The raw
 * note body never leaves Notes.
 *
 * Idempotency: Tasks keys on (subject, noteId), a repeat call returns
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
  noteId: string,
  workspaceId: string,
): Promise<{ note: NoteRead; result: ExtractSendResult }> {
  const userId = await requireUser();
  const tasksUrlRaw =
    process.env.TASKS_API_URL ??
    (process.env.VERCEL_ENV === "production"
      ? "https://tasks.signalstudio.ie"
      : null);
  if (!tasksUrlRaw) {
    // Refuse the silent prod default outside production, a
    // misconfigured preview env would otherwise write into prod
    // Tasks. Local dev / preview must set TASKS_API_URL explicitly.
    throw new Error(
      "Cross-repo send is not configured (TASKS_API_URL missing)"
    );
  }
  const tasksUrl = tasksUrlRaw.replace(/\/+$/, "");
  const secret = process.env.NOTES_TO_TASKS_SECRET;
  if (!secret) {
    throw new Error(
      "Cross-repo send is not configured (NOTES_TO_TASKS_SECRET missing)"
    );
  }
  if (!workspaceId.trim()) throw new Error("Choose a Tasks workspace first");

  // Read the note's extract so the network call sees the freshest
  // creator-authored wording, not whatever the client passed.
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
        authorization: `Bearer ${createTasksAssertion(userId, noteId, workspaceId, secret)}`,
      },
      body: JSON.stringify({ noteId, body: extract, workspaceId }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error("Tasks timed out, try again in a moment");
    }
    throw err;
  }

  if (!response.ok) {
    let detail = `Tasks returned ${response.status}`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) detail = data.error;
    } catch {
      // ignore, keep the status-code fallback
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
    throw new Error("Tasks returned an invalid response, try again");
  }
  const result = raw as ExtractSendResult;

  // Persist the task id and archive the note Notes-side (RW-3a D1
  // semantics). The note leaves the active stream; listArchivedNotes()
  // surfaces it in the "In Tasks" section. The task in Tasks is
  // independent, it is never deleted by un-promote.
  const now2 = Date.now();
  const updated = await db
    .update(notes)
    .set({ promotedTaskId: result.taskId, archivedAt: now2, updatedAt: now2 })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      extractBody: notes.extractBody,
      promotedTaskId: notes.promotedTaskId,
      archivedAt: notes.archivedAt,
      source: notes.source,
      workspaceId: notes.workspaceId,
    });

  const noteRow = updated[0];
  if (!noteRow) {
    throw new Error("Note vanished between send and store");
  }

  // Revalidation is best-effort: a Turso hiccup here must not surface
  // as an unhandled SC render error to the user (D2 hardening).
  try {
    revalidatePath("/app", "page");
  } catch {
    // Non-fatal, the extract was sent and archived; the client
    // will see the updated state on next natural refresh.
  }
  return { note: noteRow, result };
}

/**
 * RW-3a: Direct promote, the note body's first line becomes the task
 * title without requiring an intermediate "Draft action" step.
 *
 * This is the gesture path (long-press on touch; hover ghost button on
 * pointer). It sets extractBody to the first line of the note body,
 * then fires the same cross-repo write as sendExtractToTasks, and
 * archives the note (D1 semantics). The two-step "Draft action → Send
 * to Tasks" flow in the open-note panel remains unchanged as an escape
 * hatch for notes that need reshaping before becoming tasks.
 *
 * Privacy guardrail: only the first line (extract) crosses the boundary,
 * never the full raw note body. Same as sendExtractToTasks.
 *
 * Idempotency: Tasks keys on (userId, noteId), repeat calls return the
 * same task, not a duplicate. Safe to retry after a network failure.
 */
export async function promoteNoteToTasks(
  noteId: string,
  workspaceId: string,
): Promise<{ note: NoteRead; result: ExtractSendResult }> {
  const userId = await requireUser();

  const tasksUrlRaw =
    process.env.TASKS_API_URL ??
    (process.env.VERCEL_ENV === "production"
      ? "https://tasks.signalstudio.ie"
      : null);
  if (!tasksUrlRaw) {
    throw new Error(
      "Cross-repo send is not configured (TASKS_API_URL missing)"
    );
  }
  const tasksUrl = tasksUrlRaw.replace(/\/+$/, "");
  const secret = process.env.NOTES_TO_TASKS_SECRET;
  if (!secret) {
    throw new Error(
      "Cross-repo send is not configured (NOTES_TO_TASKS_SECRET missing)"
    );
  }
  if (!workspaceId.trim()) throw new Error("Choose a Tasks workspace first");

  // Read the note fresh, confirms ownership, gets the latest body.
  const [note] = await db
    .select({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      extractBody: notes.extractBody,
      promotedTaskId: notes.promotedTaskId,
      archivedAt: notes.archivedAt,
      source: notes.source,
      workspaceId: notes.workspaceId,
    })
    .from(notes)
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .limit(1);

  if (!note) {
    throw new Error("Note not found");
  }
  if (note.archivedAt !== null) {
    throw new Error("Note is already promoted");
  }

  // Derive the task title from the first non-empty line of the body.
  // This is the gesture path: the jot IS the task, no rephrasing needed.
  const firstLine = note.body.trim().split(/\r?\n/)[0]?.trim() ?? "";
  if (!firstLine) {
    throw new Error("Note body is empty");
  }
  // Cap at 280 chars (same ceiling as extract_body).
  const taskTitle = firstLine.length > 280 ? firstLine.slice(0, 280) : firstLine;

  // Cross-repo write, same endpoint + auth as sendExtractToTasks.
  // extractBody is written ONLY after a successful Tasks response,
  // consolidated into the final archive update below. Writing it here
  // (before the fetch) was P0-1: a failed fetch left the note with
  // extractBody set but no promotedTaskId/archivedAt, corrupting it
  // permanently in listNotes().
  let response: Response;
  try {
    response = await fetch(`${tasksUrl}/api/notes-extract`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${createTasksAssertion(userId, noteId, workspaceId, secret)}`,
      },
      body: JSON.stringify({ noteId, body: taskTitle, workspaceId }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error("Tasks timed out, try again in a moment");
    }
    throw err;
  }

  if (!response.ok) {
    let detail = `Tasks returned ${response.status}`;
    try {
      const data = (await response.json()) as { error?: string };
      if (data.error) detail = data.error;
    } catch {
      // ignore, keep the status-code fallback
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
    throw new Error("Tasks returned an invalid response, try again");
  }
  const result = raw as ExtractSendResult;

  // Archive the note (D1 semantics) and persist the taskId + extractBody
  // in a single atomic write. All three fields are written together so a
  // Tasks-fetch failure (above) leaves the note completely untouched.
  const archiveTs = Date.now();
  const updated = await db
    .update(notes)
    .set({
      extractBody: taskTitle,
      promotedTaskId: result.taskId,
      archivedAt: archiveTs,
      updatedAt: archiveTs,
    })
    .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
    .returning({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      extractBody: notes.extractBody,
      promotedTaskId: notes.promotedTaskId,
      archivedAt: notes.archivedAt,
      source: notes.source,
      workspaceId: notes.workspaceId,
    });

  const noteRow = updated[0];
  if (!noteRow) {
    throw new Error("Note vanished between promote and archive");
  }

  // Revalidation is best-effort: a Turso hiccup here must not surface
  // as an unhandled SC render error to the user (D2 hardening).
  try {
    revalidatePath("/app", "page");
  } catch {
    // Non-fatal, the promote completed; client sees state on next refresh.
  }
  return { note: noteRow, result };
}

/**
 * RW-3a: List promoted (archived) notes for the "In Tasks" section.
 *
 * Returns notes where archived_at IS NOT NULL AND promoted_task_id IS
 * NOT NULL, ordered newest-archived first. These are the notes Niamh
 * can find below the active stream, always, never hidden in a dump.
 */
export async function listArchivedNotes(): Promise<NoteRead[]> {
  if (isDemoMode()) return demoArchivedNotes();

  const userId = await requireUser();

  const rows = await db
    .select({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      extractBody: notes.extractBody,
      promotedTaskId: notes.promotedTaskId,
      archivedAt: notes.archivedAt,
      source: notes.source,
      workspaceId: notes.workspaceId,
    })
    .from(notes)
    .where(
      and(
        eq(notes.userId, userId),
        isNotNull(notes.archivedAt),
        isNotNull(notes.promotedTaskId)
      )
    )
    .orderBy(desc(notes.archivedAt));

  return rows;
}

/**
 * RW-3a: Un-promote a note, clear archived_at and promoted_task_id,
 * returning the note to the active stream.
 *
 * The task in Tasks is NOT deleted, it was intentionally created and
 * Tasks owns it. This action only severs the Notes-side archive state.
 * Copy in the UI: "Note returned here. The task stays in Tasks."
 *
 * Un-promote is undoable via the existing undo-toast pattern (6s
 * window, same as delete). No confirm dialog, reversibility is built
 * into the model.
 */
export async function unPromoteNote(noteId: string): Promise<NoteRead> {
  const userId = await requireUser();

  const now = Date.now();
  const result = await db
    .update(notes)
    .set({ archivedAt: null, promotedTaskId: null, updatedAt: now })
    .where(
      and(
        eq(notes.id, noteId),
        eq(notes.userId, userId),
        isNotNull(notes.archivedAt)
      )
    )
    .returning({
      id: notes.id,
      body: notes.body,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      extractBody: notes.extractBody,
      promotedTaskId: notes.promotedTaskId,
      archivedAt: notes.archivedAt,
      source: notes.source,
      workspaceId: notes.workspaceId,
    });

  const row = result[0];
  if (!row) {
    throw new Error("Note not found or not promoted");
  }

  revalidatePath("/app", "page");
  return row;
}
