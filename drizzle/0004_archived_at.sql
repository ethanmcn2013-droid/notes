-- RW-3a (2026-05-18) · Notes→Tasks promote — D1 archive semantics.
--
-- The promoted note must leave the active stream without being destroyed.
-- archived_at (Unix ms, nullable) implements this:
--   - NULL  = note is in the active stream (listNotes returns it)
--   - non-null = note has been promoted+archived (listArchivedNotes returns it)
--
-- Un-promote clears both archived_at and promoted_task_id, returning the
-- note to the active stream. The task created in Tasks is never deleted
-- (Notes owns the note; Tasks owns the task — they are independent after
-- the promote edge fires).
--
-- SQLite has no ADD COLUMN IF NOT EXISTS. Run once against any DB whose
-- notes table was created before this migration.

ALTER TABLE notes ADD COLUMN archived_at INTEGER;
