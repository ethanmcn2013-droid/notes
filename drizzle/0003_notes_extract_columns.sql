-- N-15.1 (2026-05-16) · Production schema-drift repair.
--
-- The `notes` base table was originally created by `drizzle-kit push`
-- against a dev DB and never captured as a baseline migration, so the
-- creator-authored extract columns drifted: production's `notes` table
-- has no `extract_body` / `promoted_task_id`. listNotes() selects both
-- (NoteRead), so every authenticated /app request 500s on prod with
-- `SQLite input error: no such column: extract_body`.
--
-- Both columns are nullable and creator-authored (never auto-filled):
--   - extract_body     — deliberate action wording for Notes→Tasks
--                        promotion; cleared by clearNoteExtract.
--   - promoted_task_id  — set by the cross-repo promotion writer.
--
-- SQLite has no `ADD COLUMN IF NOT EXISTS` — run this exactly once
-- against any environment whose `notes` table predates these columns
-- (production). Dev/preview DBs created via drizzle-kit push already
-- have them; running there will error harmlessly on the first ADD.

ALTER TABLE notes ADD COLUMN extract_body TEXT;
ALTER TABLE notes ADD COLUMN promoted_task_id TEXT;
