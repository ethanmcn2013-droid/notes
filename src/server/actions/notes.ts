"use server";

import { and, desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireUser } from "@/server/auth";
import { db } from "@/server/db/client";
import { notes, type Note } from "@/server/db/schema";

function makeId() {
  return `n_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
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
 * The extract_body lives alongside the raw note. Cross-repo write to
 * Signal Tasks (and population of promoted_task_id) is the second
 * half of Cycle 9.4b and lands in a follow-up cycle. Until then, the
 * extract is "drafted, pending Tasks send" — visible to the creator
 * only.
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
