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
  "id" | "body" | "createdAt" | "updatedAt" | "promotedTaskId"
>;

/**
 * Server action: create a note for the signed-in user.
 * Returns the created note so the client can update its UI without a
 * second round-trip.
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
    promotedTaskId: null,
  };
}

/**
 * Server action: list notes for the signed-in user, newest first.
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
