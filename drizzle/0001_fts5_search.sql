-- N-2 (2026-05-14) · Server-side full-text search for the notebook.
--
-- Replaces the client-side substring filter with SQLite FTS5. The
-- virtual table mirrors notes(id, user_id, body) — body is the only
-- indexed column; id + user_id are stored UNINDEXED so we can scope
-- searches to the signed-in user without a join.
--
-- External content (content='notes') means notes_fts is a thin index
-- pointing at the canonical notes table; storage doubling is avoided.
-- Triggers below keep the FTS5 index in sync on insert / update /
-- delete. The rebuild call at the end backfills existing rows.
--
-- Budget per PRODUCT.md §9: 200ms p99. FTS5 on Turso routinely
-- delivers sub-20ms for the user-scoped query pattern we use.

CREATE VIRTUAL TABLE notes_fts USING fts5(
  id UNINDEXED,
  user_id UNINDEXED,
  body,
  content='notes',
  content_rowid='rowid',
  tokenize='porter unicode61 remove_diacritics 2'
);

CREATE TRIGGER notes_ai AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(rowid, id, user_id, body)
  VALUES (new.rowid, new.id, new.user_id, new.body);
END;

CREATE TRIGGER notes_ad AFTER DELETE ON notes BEGIN
  INSERT INTO notes_fts(notes_fts, rowid, id, user_id, body)
  VALUES('delete', old.rowid, old.id, old.user_id, old.body);
END;

CREATE TRIGGER notes_au AFTER UPDATE ON notes BEGIN
  INSERT INTO notes_fts(notes_fts, rowid, id, user_id, body)
  VALUES('delete', old.rowid, old.id, old.user_id, old.body);
  INSERT INTO notes_fts(rowid, id, user_id, body)
  VALUES (new.rowid, new.id, new.user_id, new.body);
END;

-- Backfill any rows that already existed when this migration ran.
INSERT INTO notes_fts(notes_fts) VALUES('rebuild');
