-- N.31, durable Notes -> Tasks approval outbox.
--
-- Additive: no existing note row or receipt is rewritten. Apply exactly once
-- after 0006_note_workspace_context.sql and before enabling the hybrid
-- notebook release flag. A pending row is an immutable send reservation;
-- never edit or delete it manually during ordinary incident recovery. Retrying
-- the exact approved request lets Tasks idempotency reconcile it safely. Once
-- finalized, application code blanks the duplicate source/approved text and
-- retains the SHA-256 + task receipt metadata only.

CREATE TABLE note_task_send_outbox (
  operation_id TEXT PRIMARY KEY NOT NULL,
  note_id TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  source_selection TEXT NOT NULL,
  approved_body TEXT NOT NULL,
  approved_body_sha256 TEXT NOT NULL
    CHECK (
      length(approved_body_sha256) = 64
      AND approved_body_sha256 NOT GLOB '*[^0-9a-f]*'
    ),
  workspace_id TEXT NOT NULL,
  base_updated_at INTEGER NOT NULL,
  reserved_updated_at INTEGER NOT NULL
    CHECK (reserved_updated_at > base_updated_at),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'completed')),
  task_id TEXT,
  lease_token TEXT,
  lease_expires_at INTEGER,
  attempt_count INTEGER NOT NULL DEFAULT 1
    CHECK (attempt_count >= 1),
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  completed_at INTEGER,
  CHECK (
    (
      status = 'pending'
      AND task_id IS NULL
      AND completed_at IS NULL
      AND (
        (lease_token IS NULL AND lease_expires_at IS NULL)
        OR
        (lease_token IS NOT NULL AND lease_expires_at IS NOT NULL)
      )
    )
    OR
    (
      status = 'completed'
      AND task_id IS NOT NULL
      AND completed_at IS NOT NULL
      AND lease_token IS NULL
      AND lease_expires_at IS NULL
    )
  )
);

CREATE UNIQUE INDEX note_task_send_outbox_user_note_uq
  ON note_task_send_outbox (user_id, note_id);

CREATE INDEX note_task_send_outbox_user_status_idx
  ON note_task_send_outbox (user_id, status, updated_at);

CREATE INDEX note_task_send_outbox_note_idx
  ON note_task_send_outbox (note_id);
