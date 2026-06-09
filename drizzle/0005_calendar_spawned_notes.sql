-- N·24 (Pattern 4, 2026-06-09) · Calendar-spawned note plumbing.
--
-- Three additions, one migration:
--   1. notes.source — nullable text, "calendar" for spawned, null otherwise.
--      Read by the stream row to render the `from calendar` provenance pill.
--      Gated by updatedAt === createdAt: the pill disappears the moment the
--      user edits.
--   2. calendar_connections — OAuth refresh tokens per (user, provider,
--      calendar). Provider is "google" in v1. Access tokens are minted at
--      use-time and never persisted. Encryption-at-application-layer flagged
--      as Plan 4 follow-up; v1 relies on Turso at-rest encryption.
--   3. spawned_calendar_events — idempotency ledger keyed on
--      (user, provider, calendar_event_id, occurrence_start). Two devices
--      racing → one wins on UNIQUE, the other no-ops. Recurring events
--      spawn once per occurrence (occurrence_start differs per instance).
--
-- Refusal anchor (PRODUCT.md §8, restated three times in the handoff):
-- source="calendar" is a *scaffold* — title + attendees only. No
-- auto-detected action items. No meeting summaries. No body content
-- beyond the locked shape. The schema enforces nothing about this;
-- spawnCalendarNote() enforces it in code. Future contributors: read §8.
--
-- SQLite has no ADD COLUMN IF NOT EXISTS; run this migration exactly
-- once against any database whose notes table predates it.

ALTER TABLE notes ADD COLUMN source TEXT;

CREATE TABLE calendar_connections (
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  calendar_id TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  last_synced_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  PRIMARY KEY (user_id, provider, calendar_id)
);

CREATE INDEX calendar_connections_user_idx
  ON calendar_connections (user_id, provider, calendar_id);

CREATE TABLE spawned_calendar_events (
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  calendar_event_id TEXT NOT NULL,
  occurrence_start INTEGER NOT NULL,
  note_id TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  PRIMARY KEY (user_id, provider, calendar_event_id, occurrence_start)
);

CREATE INDEX spawned_calendar_events_user_event_occurrence_idx
  ON spawned_calendar_events (
    user_id, provider, calendar_event_id, occurrence_start
  );
