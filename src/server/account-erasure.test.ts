/**
 * Account-erasure integration test — Signal Notes. GDPR right-to-erasure /
 * App Store 5.1.1(v) guard.
 *
 * Runs the REAL `eraseAccountData` against a real in-memory libSQL DB
 * across all four user-keyed tables, with a second "bystander" user whose
 * rows must survive. The load-bearing assertion is that
 * `calendar_connections` — which holds a long-lived Google OAuth refresh
 * token — is fully cleared and the token is surfaced for revocation. A
 * regression that drops the calendar deletes (the bug this fixes) fails here.
 *
 * Notes has no `tsx`; this runs under Node's native TS type-stripping, the
 * same way roadmap runs its .ts tests:
 *   node --import tsx --test src/server/account-erasure.test.ts
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./db/schema";
import { eraseAccountData } from "./account-erasure";

/** Fresh in-memory DB with the four user-keyed tables (DDL mirrors schema.ts). */
async function freshDb() {
  const client = createClient({ url: ":memory:" });
  await client.executeMultiple(`
    CREATE TABLE notes (
      id text PRIMARY KEY NOT NULL,
      user_id text NOT NULL,
      body text NOT NULL,
      created_at integer NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at integer NOT NULL DEFAULT (unixepoch() * 1000),
      extract_body text,
      promoted_task_id text,
      archived_at integer,
      source text
    );
    CREATE TABLE calendar_connections (
      user_id text NOT NULL,
      provider text NOT NULL,
      calendar_id text NOT NULL,
      refresh_token text NOT NULL,
      last_synced_at integer,
      created_at integer NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at integer NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE TABLE spawned_calendar_events (
      user_id text NOT NULL,
      provider text NOT NULL,
      calendar_event_id text NOT NULL,
      occurrence_start integer NOT NULL,
      note_id text NOT NULL,
      created_at integer NOT NULL DEFAULT (unixepoch() * 1000)
    );
    CREATE TABLE user_preferences (
      user_id text PRIMARY KEY NOT NULL,
      capture_slug text NOT NULL UNIQUE,
      created_at integer NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at integer NOT NULL DEFAULT (unixepoch() * 1000)
    );
  `);
  const db = drizzle(client, { schema });
  return { client, db };
}

async function count(client: Client, where: string): Promise<number> {
  const rs = await client.execute(`SELECT COUNT(*) AS c FROM ${where}`);
  return Number(rs.rows[0]!.c);
}

async function seed(client: Client) {
  await client.executeMultiple(`
    INSERT INTO notes (id, user_id, body) VALUES
      ('n-t1','u-target','target note'),
      ('n-t2','u-target','target note 2'),
      ('n-b1','u-bystander','bystander note');
    INSERT INTO calendar_connections (user_id, provider, calendar_id, refresh_token) VALUES
      ('u-target','google','primary','REFRESH-TARGET'),
      ('u-bystander','google','primary','REFRESH-BYSTANDER');
    INSERT INTO spawned_calendar_events (user_id, provider, calendar_event_id, occurrence_start, note_id) VALUES
      ('u-target','google','evt-1',111,'n-t1'),
      ('u-bystander','google','evt-2',222,'n-b1');
    INSERT INTO user_preferences (user_id, capture_slug) VALUES
      ('u-target','slug-target'),
      ('u-bystander','slug-bystander');
  `);
}

test("erasure clears all four user-keyed tables and returns the calendar token", async () => {
  const { client, db } = await freshDb();
  try {
    await seed(client);

    const { refreshTokens } = await eraseAccountData(db, "u-target");

    // The OAuth refresh token must be surfaced for revocation.
    assert.deepEqual(refreshTokens, ["REFRESH-TARGET"]);

    // Zero residual rows for the target across every table — including the
    // calendar tables the old erasure left behind.
    for (const where of [
      "notes WHERE user_id='u-target'",
      "calendar_connections WHERE user_id='u-target'",
      "spawned_calendar_events WHERE user_id='u-target'",
      "user_preferences WHERE user_id='u-target'",
    ]) {
      assert.equal(await count(client, where), 0, `residual rows in ${where}`);
    }

    // Bystander fully intact.
    assert.equal(await count(client, "notes"), 1);
    assert.equal(await count(client, "calendar_connections"), 1);
    assert.equal(await count(client, "spawned_calendar_events"), 1);
    assert.equal(await count(client, "user_preferences"), 1);
    assert.equal(
      await count(client, "calendar_connections WHERE refresh_token='REFRESH-BYSTANDER'"),
      1,
    );

    // Idempotent re-run.
    const again = await eraseAccountData(db, "u-target");
    assert.deepEqual(again.refreshTokens, []);
    assert.equal(await count(client, "notes"), 1);
  } finally {
    client.close();
  }
});

test("erasing an unknown user is a no-op (no throw, no token)", async () => {
  const { client, db } = await freshDb();
  try {
    await seed(client);
    const { refreshTokens } = await eraseAccountData(db, "u-nobody");
    assert.deepEqual(refreshTokens, []);
    assert.equal(await count(client, "notes"), 3);
    assert.equal(await count(client, "calendar_connections"), 2);
  } finally {
    client.close();
  }
});
