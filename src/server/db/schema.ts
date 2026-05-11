import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Locked schema (PRODUCT.md §6) — one row per note, plus the
 * one-way promotion edge to Signal Tasks.
 *
 * v1 surface: { id, body, created_at, updated_at, promoted_task_id? }.
 * No tags, no folders, no metadata. Search is on body text via the
 * upcoming FTS5 layer (Cycle 9.4); for now, the (user_id, created_at)
 * index drives the stream.
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
