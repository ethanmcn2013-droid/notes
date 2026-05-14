-- N-1 (2026-05-14) · Email-to-capture user preferences.
--
-- Each Notes user gets a stable, random 8-char `capture_slug` used as
-- the local part of their personal inbound address:
--
--     capture-<slug>@notes.signalstudio.ie
--
-- The slug is regenerable from /app settings (forthcoming) — useful
-- if the address leaks into a public mailing list. The created/updated
-- timestamps follow the same epoch-ms convention as the notes table.

CREATE TABLE user_preferences (
  user_id TEXT PRIMARY KEY,
  capture_slug TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE INDEX user_preferences_capture_slug_idx ON user_preferences (capture_slug);
