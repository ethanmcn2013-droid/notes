/**
 * Account-export integration test · Signal Notes. GDPR Art. 20 portability.
 *
 * Runs the REAL `exportAccountData` against an in-memory libSQL DB with a
 * bystander user, asserting the export contains exactly the caller's rows,
 * never the bystander's, and NEVER the OAuth refresh token.
 *
 * Run: node --import tsx --test src/server/account-export.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./db/schema";
import { exportAccountData } from "./account-export";

async function freshDb() {
  const client = createClient({ url: ":memory:" });
  await client.executeMultiple(`
    CREATE TABLE notes (
      id text PRIMARY KEY NOT NULL, user_id text NOT NULL, body text NOT NULL,
      created_at integer NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at integer NOT NULL DEFAULT (unixepoch() * 1000),
      extract_body text, promoted_task_id text, archived_at integer,
      workspace_id text, source text
    );
    CREATE TABLE note_task_send_outbox (
      operation_id text PRIMARY KEY NOT NULL, note_id text NOT NULL,
      user_id text NOT NULL, source_selection text NOT NULL,
      approved_body text NOT NULL, approved_body_sha256 text NOT NULL,
      workspace_id text NOT NULL, base_updated_at integer NOT NULL,
      reserved_updated_at integer NOT NULL, status text NOT NULL DEFAULT 'pending',
      task_id text, created_at integer NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at integer NOT NULL DEFAULT (unixepoch() * 1000), completed_at integer
    );
    CREATE UNIQUE INDEX note_task_send_outbox_user_note_uq
      ON note_task_send_outbox (user_id, note_id);
    CREATE TABLE calendar_connections (
      user_id text NOT NULL, provider text NOT NULL, calendar_id text NOT NULL,
      refresh_token text NOT NULL, last_synced_at integer,
      created_at integer NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at integer NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE TABLE spawned_calendar_events (
      user_id text NOT NULL, provider text NOT NULL, calendar_event_id text NOT NULL,
      occurrence_start integer NOT NULL, note_id text NOT NULL,
      created_at integer NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE TABLE user_preferences (
      user_id text PRIMARY KEY NOT NULL, capture_slug text NOT NULL UNIQUE,
      created_at integer NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at integer NOT NULL DEFAULT (unixepoch() * 1000)
    );
    INSERT INTO notes (id, user_id, body) VALUES
      ('n-t1','u-target','mine'), ('n-b1','u-bystander','theirs');
    INSERT INTO note_task_send_outbox (
      operation_id, note_id, user_id, source_selection, approved_body,
      approved_body_sha256, workspace_id, base_updated_at, reserved_updated_at
    ) VALUES
      ('o-target','n-t1','u-target','mine','portable approved wording',
       'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','w-target',1,2),
      ('o-bystander','n-b1','u-bystander','theirs','never export this wording',
       'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb','w-bystander',1,2);
    INSERT INTO calendar_connections (user_id, provider, calendar_id, refresh_token) VALUES
      ('u-target','google','primary','SECRET-TOKEN');
    INSERT INTO spawned_calendar_events (user_id, provider, calendar_event_id, occurrence_start, note_id) VALUES
      ('u-target','google','evt-1',1,'n-t1');
    INSERT INTO user_preferences (user_id, capture_slug) VALUES
      ('u-target','slug-target'), ('u-bystander','slug-bystander');
  `);
  return { client, db: drizzle(client, { schema }) };
}

test("export returns only the caller's data and never the refresh token", async () => {
  const { client, db } = await freshDb();
  try {
    const data = await exportAccountData(db, "u-target");

    assert.equal(data.userId, "u-target");
    assert.equal(data.notes.length, 1);
    assert.equal(data.notes[0]!.body, "mine");
    assert.equal(data.noteTaskSendOutbox.length, 1);
    assert.equal(data.noteTaskSendOutbox[0]!.approvedBody, "portable approved wording");
    assert.ok(!JSON.stringify(data).includes("never export this wording"));
    assert.equal(data.calendarConnections.length, 1);
    assert.equal(data.spawnedCalendarEvents.length, 1);
    assert.equal(data.preferences?.captureSlug, "slug-target");

    // The OAuth refresh token must never appear anywhere in the export.
    assert.ok(
      !JSON.stringify(data).includes("SECRET-TOKEN"),
      "refresh token leaked into the export",
    );
    assert.ok(!("refreshToken" in (data.calendarConnections[0] ?? {})));
  } finally {
    (client as Client).close();
  }
});

test("export of an unknown user is empty, not an error", async () => {
  const { client, db } = await freshDb();
  try {
    const data = await exportAccountData(db, "u-nobody");
    assert.equal(data.notes.length, 0);
    assert.equal(data.noteTaskSendOutbox.length, 0);
    assert.equal(data.preferences, null);
  } finally {
    (client as Client).close();
  }
});
