-- N.25, Planning Period context projection.
--
-- Additive and nullable by design:
--   - every existing note keeps its id and body unchanged;
--   - existing and unavailable-context captures remain Unfiled (NULL);
--   - the value is only a canonical Tasks workspace id projection;
--   - Notes does not copy workspace names, planning periods, or membership.

ALTER TABLE notes ADD COLUMN workspace_id TEXT;

CREATE INDEX notes_user_workspace_created_idx
  ON notes (user_id, workspace_id, created_at);
