import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Locked schema (PRODUCT.md §6) — one row per note, plus the
 * one-way approved extraction edge to Signal Tasks.
 *
 * v1 surface: { id, body, created_at, updated_at, extract_body?,
 * promoted_task_id? }. No tags, no folders, no metadata. Search is on
 * body text via the upcoming FTS5 layer (Cycle 9.4); for now, the
 * (user_id, created_at) index drives the stream.
 *
 * Privacy guardrail: body is private to the owner. Collaborative views
 * should store/read approved extracts, never raw note rows. Only the
 * extract_body (creator-authored, deliberate) ever leaves Notes.
 *
 * extract_body holds the creator-authored action wording — never the
 * raw note body, never auto-detected. Set by setNoteExtract, cleared
 * by clearNoteExtract. promoted_task_id is filled in by the future
 * cross-repo write (Cycle 9.4b second half) once the action lands as
 * a Task. Both null = no extract drafted.
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
