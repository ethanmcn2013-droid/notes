import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Locked schema (PRODUCT.md §6) — one row per note, plus the
 * one-way approved extraction edge to Signal Tasks.
 *
 * v1 surface: { id, body, created_at, updated_at, extract_body?,
 * promoted_task_id? }. No tags, no folders, no metadata.
 * v1 search: client-side substring filter over all notes (acceptable up to ~500 notes per user).
 * The (user_id, created_at) index drives the stream.
 *
 * Privacy guardrail: body is private to the owner. Collaborative views
 * should store/read approved extracts, never raw note rows. Only the
 * extract_body (creator-authored, deliberate) ever leaves Notes.
 *
 * extract_body holds the creator-authored action wording — never the
 * raw note body, never auto-detected. Set by setNoteExtract, cleared
 * by clearNoteExtract. promoted_task_id is filled in by the cross-repo
 * write (Cycle 9.4b, shipped) once the action lands as a Task. Both
 * null = no extract drafted.
 *
 * archived_at (Unix ms, nullable) — RW-3a D1 promote semantics.
 *   NULL     = note is in the active stream (listNotes returns it).
 *   non-null = note has been promoted and archived from the stream.
 * listNotes() filters WHERE archived_at IS NULL; listArchivedNotes()
 * returns the complement. unPromoteNote() clears both this and
 * promoted_task_id, restoring the note to the stream.
 */

export const notes = sqliteTable(
  "notes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    body: text("body").notNull(),
    createdAt: integer("created_at", { mode: "number" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "number" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    extractBody: text("extract_body"),
    promotedTaskId: text("promoted_task_id"),
    archivedAt: integer("archived_at", { mode: "number" }),
  },
  (table) => ({
    userCreated: index("notes_user_created_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;

/**
 * Per-user preferences. v1 holds only the email-to-capture slug
 * (N-1, 2026-05-14). Row is lazy-created the first time the user
 * asks for their capture address — never on signup.
 */
export const userPreferences = sqliteTable(
  "user_preferences",
  {
    userId: text("user_id").primaryKey(),
    captureSlug: text("capture_slug").notNull().unique(),
    createdAt: integer("created_at", { mode: "number" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
    updatedAt: integer("updated_at", { mode: "number" })
      .notNull()
      .default(sql`(unixepoch() * 1000)`),
  },
  (table) => ({
    captureSlugIdx: index("user_preferences_capture_slug_idx").on(
      table.captureSlug,
    ),
  })
);

export type UserPreferences = typeof userPreferences.$inferSelect;
export type NewUserPreferences = typeof userPreferences.$inferInsert;
