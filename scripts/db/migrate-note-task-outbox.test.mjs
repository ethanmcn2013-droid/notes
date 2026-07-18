import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { createClient } from "@libsql/client";
import {
  canonicalFileSha256,
  canonicalText,
  databaseIdentitySha256,
  defaultRoot,
  loadMigrationContext,
  main,
  rawFileSha256,
  runNoteTaskOutboxMigration,
  schemaFingerprintSha256,
  sha256,
  splitSqlStatements,
} from "./migrate-note-task-outbox.mjs";

const releaseSha = "a".repeat(40);
const fixedNow = 1_784_416_400_000;

async function createPrerequisite(client, notes = 2) {
  await client.executeMultiple(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE notes (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      extract_body TEXT,
      promoted_task_id TEXT,
      archived_at INTEGER,
      source TEXT,
      workspace_id TEXT
    );
    CREATE INDEX notes_user_workspace_created_idx
      ON notes (user_id, workspace_id, created_at);
  `);
  for (let index = 0; index < notes; index += 1) {
    await client.execute({
      sql: "INSERT INTO notes (id, user_id, body) VALUES (?, ?, ?)",
      args: [`note-${index}`, "owner-fixture", `private fixture ${index}`],
    });
  }
}

function executionReceipt(context, databaseUrl, overrides = {}) {
  const databaseIdentity = databaseIdentitySha256(databaseUrl);
  const base = {
    schemaVersion: "notes-migration-execution/1",
    id: "notes-0007-test-receipt",
    environment: "test",
    databaseIdentitySha256: databaseIdentity,
    ledgerSha256: context.ledgerSha256,
    releaseSha,
    migration: {
      id: context.entry.id,
      sqlSha256: context.entry.sha256,
      schemaFingerprintSha256: context.entry.schemaFingerprintSha256,
    },
    backup: {
      status: "verified",
      sha256: "b".repeat(64),
      databaseIdentitySha256: databaseIdentity,
      verifiedAt: "2026-07-18T19:00:00.000Z",
    },
    dryRun: {
      status: "passed",
      sourceBackupSha256: "b".repeat(64),
      databaseSha256: "c".repeat(64),
      migrationId: context.entry.id,
      migrationSqlSha256: context.entry.sha256,
      schemaFingerprintSha256: context.entry.schemaFingerprintSha256,
      notesCountBefore: 2,
      notesCountAfter: 2,
      integrityCheck: "ok",
      foreignKeyViolations: 0,
      completedAt: "2026-07-18T19:05:00.000Z",
    },
    createdAt: "2026-07-18T19:06:00.000Z",
  };
  return {
    ...base,
    ...overrides,
    migration: { ...base.migration, ...overrides.migration },
    backup: { ...base.backup, ...overrides.backup },
    dryRun: { ...base.dryRun, ...overrides.dryRun },
  };
}

async function withFixture(run, { notes = 2, context = loadMigrationContext(), receiptOverrides } = {}) {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "notes-0007-contract-"));
  const databaseUrl = ":memory:";
  const receiptPath = path.join(fixtureDir, "execution-receipt.json");
  const client = createClient({ url: databaseUrl });
  await createPrerequisite(client, notes);
  const receipt = executionReceipt(context, databaseUrl, receiptOverrides);
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  try {
    return await run({ client, databaseUrl, receiptPath, receipt, context, fixtureDir });
  } finally {
    await client.close();
    fs.rmSync(fixtureDir, { recursive: true, force: true });
  }
}

test("ledger binds canonical 0007 SQL and exact 17-column/3-index schema", () => {
  const context = loadMigrationContext();
  assert.equal(context.entry.sha256, canonicalFileSha256(path.join(context.root, context.entry.file)));
  assert.equal(context.entry.statements.length, 4);
  assert.equal(context.entry.objects.filter((object) => object.type === "table").length, 1);
  assert.equal(context.entry.objects.filter((object) => object.type === "index").length, 3);
  assert.equal(schemaFingerprintSha256(context.entry.objects), context.entry.schemaFingerprintSha256);
  assert.deepEqual(
    context.entry.objects.filter((object) => object.type === "index").map((object) => object.name),
    [
      "note_task_send_outbox_note_idx",
      "note_task_send_outbox_user_note_uq",
      "note_task_send_outbox_user_status_idx",
    ],
  );
});

test("SQL splitter preserves quoted semicolons and rejects unterminated SQL", () => {
  assert.deepEqual(splitSqlStatements("-- lead\nCREATE TABLE probe (value TEXT DEFAULT ';');\n"), [
    "CREATE TABLE probe (value TEXT DEFAULT ';')",
  ]);
  assert.throws(() => splitSqlStatements("CREATE TABLE probe (value TEXT)"), /terminate every statement/);
  assert.equal(sha256(canonicalText("a\r\n")), sha256("a\n"));
});

test("database identity strips credentials, query, fragment, hostname case, and trailing slash", () => {
  assert.equal(
    databaseIdentitySha256("libsql://USER:secret@NOTES-DB.TURSO.IO/?token=secret#fragment"),
    databaseIdentitySha256("libsql://notes-db.turso.io"),
  );
  assert.notEqual(
    databaseIdentitySha256("libsql://notes-db.turso.io"),
    databaseIdentitySha256("libsql://other-db.turso.io"),
  );
});

test("receipt-backed migration is atomic, proves shape/health/count, and second run is a no-op", async () => withFixture(async ({
  client, databaseUrl, receiptPath, context,
}) => {
  const first = await runNoteTaskOutboxMigration({
    client,
    databaseUrl,
    environment: "test",
    receiptPath,
    releaseSha,
    context,
    now: () => fixedNow,
  });
  assert.equal(first.status, "applied");
  assert.equal(first.schemaFingerprintSha256, context.entry.schemaFingerprintSha256);
  assert.deepEqual(first.health, { integrityCheck: "ok", foreignKeyViolations: 0 });
  assert.equal(first.ledger.notesCountBefore, 2);
  assert.equal(first.ledger.notesCountAfter, 2);
  assert.equal(first.ledger.appliedAt, fixedNow);

  const columns = await client.execute("PRAGMA table_info('note_task_send_outbox')");
  assert.equal(columns.rows.length, 17);
  const indexes = await client.execute("PRAGMA index_list('note_task_send_outbox')");
  assert.equal(indexes.rows.filter((row) => String(row.origin) === "c").length, 3);
  const ledger = (await client.execute("SELECT * FROM notes_schema_migrations")).rows[0];
  assert.equal(ledger.sql_sha256, context.entry.sha256);
  assert.equal(ledger.source_ledger_sha256, context.ledgerSha256);
  assert.equal(ledger.schema_fingerprint_sha256, context.entry.schemaFingerprintSha256);
  assert.equal(ledger.execution_receipt_sha256, canonicalFileSha256(receiptPath));
  assert.equal(ledger.backup_sha256, "b".repeat(64));
  assert.equal(ledger.dry_run_database_sha256, "c".repeat(64));
  assert.equal(Number((await client.execute("SELECT COUNT(*) AS value FROM notes")).rows[0].value), 2);

  const contractInsert = `INSERT INTO note_task_send_outbox (
    operation_id, note_id, user_id, source_selection, approved_body,
    approved_body_sha256, workspace_id, base_updated_at, reserved_updated_at,
    status, task_id, lease_token, lease_expires_at, attempt_count, completed_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const validPending = [
    "valid-pending", "note-0", "owner-fixture", "x", "x", "d".repeat(64),
    "ws", 10, 11, "pending", null, "lease", 99, 1, null,
  ];
  const invalidRows = [
    ["hash-shape", validPending.map((value, index) => index === 5 ? "not-a-hash" : value)],
    ["reservation-version", validPending.map((value, index) => index === 8 ? 10 : value)],
    ["attempt-count", validPending.map((value, index) => index === 13 ? 0 : value)],
    ["pending-task", validPending.map((value, index) => index === 10 ? "task-too-early" : value)],
    ["partial-lease", validPending.map((value, index) => index === 12 ? null : value)],
  ];
  for (const [operationId, args] of invalidRows) {
    args[0] = operationId;
    await assert.rejects(client.execute({ sql: contractInsert, args }));
  }
  await client.execute({ sql: contractInsert, args: validPending });
  assert.equal(Number((await client.execute("SELECT COUNT(*) AS value FROM note_task_send_outbox")).rows[0].value), 1);
  await client.execute("DELETE FROM note_task_send_outbox");

  // Later user activity must not rewrite the historical pre/post proof or
  // prevent an exact second-run no-op.
  await client.execute("INSERT INTO notes (id, user_id, body) VALUES ('note-after-migration', 'owner-fixture', 'later fixture')");

  const second = await runNoteTaskOutboxMigration({
    client,
    databaseUrl,
    environment: "test",
    receiptPath,
    releaseSha,
    context,
    now: () => fixedNow + 1,
  });
  assert.equal(second.status, "no-op");
  assert.equal(second.ledger.appliedAt, fixedNow);
  assert.equal(second.ledger.notesCountBefore, 2);
  assert.equal(second.ledger.notesCountAfter, 2);
  assert.equal(Number((await client.execute("SELECT COUNT(*) AS value FROM notes")).rows[0].value), 3);
  assert.equal(Number((await client.execute("SELECT COUNT(*) AS value FROM notes_schema_migrations")).rows[0].value), 1);

  await client.execute("CREATE TRIGGER unexpected_outbox_trigger AFTER DELETE ON note_task_send_outbox BEGIN SELECT 1; END");
  await assert.rejects(
    runNoteTaskOutboxMigration({
      client, databaseUrl, environment: "test", receiptPath, releaseSha, context,
    }),
    /exactly the registered objects/,
  );
}));

test("wrong-target receipt fails before any migration object or ledger write", async () => withFixture(async ({
  client, databaseUrl, receiptPath, context,
}) => {
  const receipt = executionReceipt(context, databaseUrl, {
    databaseIdentitySha256: "f".repeat(64),
  });
  fs.writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
  await assert.rejects(
    runNoteTaskOutboxMigration({ client, databaseUrl, environment: "test", receiptPath, releaseSha, context }),
    /targets a different database/,
  );
  assert.equal(Number((await client.execute("SELECT COUNT(*) AS value FROM sqlite_schema WHERE name = 'note_task_send_outbox'")).rows[0].value), 0);
  assert.equal(Number((await client.execute("SELECT COUNT(*) AS value FROM sqlite_schema WHERE name = 'notes_schema_migrations'")).rows[0].value), 0);
}));

test("receipt requires verified backup, exact dry-run hash, equal counts, health, and release SHA", async () => {
  const cases = [
    [{ backup: { status: "pending" } }, /backup status must be verified/],
    [{ dryRun: { sourceBackupSha256: "d".repeat(64) } }, /not bound to the verified backup/],
    [{ dryRun: { notesCountAfter: 1 } }, /did not preserve the notes count/],
    [{ dryRun: { integrityCheck: "failed" } }, /integrity check did not pass/],
    [{ dryRun: { foreignKeyViolations: 1 } }, /foreign-key violations/],
    [{ releaseSha: "d".repeat(40) }, /releaseSha does not match/],
    [{ ledgerSha256: "d".repeat(64) }, /ledger hash does not match/],
    [{ unapprovedField: "must-fail" }, /unapproved fields/],
  ];
  for (const [receiptOverrides, expected] of cases) {
    await withFixture(async ({ client, databaseUrl, receiptPath, context }) => {
      await assert.rejects(
        runNoteTaskOutboxMigration({ client, databaseUrl, environment: "test", receiptPath, releaseSha, context }),
        expected,
      );
      assert.equal(Number((await client.execute("SELECT COUNT(*) AS value FROM sqlite_schema WHERE name = 'note_task_send_outbox'")).rows[0].value), 0);
    }, { receiptOverrides });
  }
});

test("failed exact-object proof rolls back outbox and ledger together", async () => {
  const base = loadMigrationContext();
  const objects = base.entry.objects.map((object) => object.name === "note_task_send_outbox_note_idx"
    ? { ...object, sql: `${object.sql} ` }
    : object);
  const context = {
    ...base,
    entry: {
      ...base.entry,
      objects,
      schemaFingerprintSha256: schemaFingerprintSha256(objects),
    },
  };
  await withFixture(async ({ client, databaseUrl, receiptPath }) => {
    await assert.rejects(
      runNoteTaskOutboxMigration({ client, databaseUrl, environment: "test", receiptPath, releaseSha, context }),
      /atomic migration failed/,
    );
    assert.equal(Number((await client.execute("SELECT COUNT(*) AS value FROM sqlite_schema WHERE name = 'note_task_send_outbox'")).rows[0].value), 0);
    assert.equal(Number((await client.execute("SELECT COUNT(*) AS value FROM sqlite_schema WHERE name = 'notes_schema_migrations'")).rows[0].value), 0);
    assert.equal(Number((await client.execute("SELECT COUNT(*) AS value FROM notes")).rows[0].value), 2);
  }, { context });
});

test("an exact-looking but unledgered outbox is rejected instead of adopted", async () => withFixture(async ({
  client, databaseUrl, receiptPath, context,
}) => {
  await client.batch(context.entry.statements, "write");
  await assert.rejects(
    runNoteTaskOutboxMigration({ client, databaseUrl, environment: "test", receiptPath, releaseSha, context }),
    /refuse unreceipted adoption/,
  );
  assert.equal(Number((await client.execute("SELECT COUNT(*) AS value FROM sqlite_schema WHERE name = 'notes_schema_migrations'")).rows[0].value), 0);
}));

test("isolated dry-run CLI verifies the backup bytes and emits receipt-ready evidence", async () => {
  const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "notes-0007-dry-run-"));
  const databaseFile = path.join(fixtureDir, "isolated-notes.db");
  const databaseUrl = pathToFileURL(databaseFile).href;
  try {
    const seedScript = `
      import { createClient } from "@libsql/client";
      const client = createClient({ url: ${JSON.stringify(databaseUrl)} });
      await client.executeMultiple(\`
        PRAGMA foreign_keys = ON;
        CREATE TABLE notes (
          id TEXT PRIMARY KEY NOT NULL,
          user_id TEXT NOT NULL,
          body TEXT NOT NULL,
          created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
          updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
          extract_body TEXT, promoted_task_id TEXT, archived_at INTEGER,
          source TEXT, workspace_id TEXT
        );
        CREATE INDEX notes_user_workspace_created_idx
          ON notes (user_id, workspace_id, created_at);
        INSERT INTO notes (id, user_id, body) VALUES
          ('note-0', 'owner-fixture', 'private fixture 0'),
          ('note-1', 'owner-fixture', 'private fixture 1');
      \`);
      await client.execute("PRAGMA wal_checkpoint(TRUNCATE)");
      await client.close();
    `;
    const seeded = spawnSync(process.execPath, ["--input-type=module", "-e", seedScript], {
      cwd: defaultRoot,
      encoding: "utf8",
    });
    assert.equal(seeded.status, 0, seeded.stderr);
    const backupSha256 = rawFileSha256(databaseFile);
    const executed = spawnSync(process.execPath, [
      "scripts/db/migrate-note-task-outbox.mjs",
      "dry-run",
      "--environment=test",
      "--confirm-dry-run=isolated-copy",
      `--backup-sha256=${backupSha256}`,
      `--release-sha=${releaseSha}`,
    ], {
      cwd: defaultRoot,
      encoding: "utf8",
      env: { ...process.env, TURSO_DATABASE_URL: databaseUrl, TURSO_AUTH_TOKEN: "" },
    });
    assert.equal(executed.status, 0, executed.stderr);
    const result = JSON.parse(executed.stdout);
    assert.equal(result.status, "applied");
    assert.equal(result.dryRunEvidence.status, "passed");
    assert.equal(result.dryRunEvidence.sourceBackupSha256, backupSha256);
    assert.equal(result.dryRunEvidence.databaseSha256, rawFileSha256(databaseFile));
    assert.equal(result.dryRunEvidence.notesCountBefore, 2);
    assert.equal(result.dryRunEvidence.notesCountAfter, 2);
    assert.equal(result.dryRunEvidence.integrityCheck, "ok");
    assert.equal(result.dryRunEvidence.foreignKeyViolations, 0);
    assert.equal(executed.stdout.includes("private fixture"), false);
    assert.equal(executed.stdout.includes("owner-fixture"), false);
  } finally {
    fs.rmSync(fixtureDir, { recursive: true, force: true, maxRetries: 10, retryDelay: 50 });
  }
});

test("production CLI gates fail before reading credentials", async () => {
  await assert.rejects(main([]), /explicit --environment=production/);
  await assert.rejects(main(["--environment=production"]), /explicit --confirm-production=notes/);
  await assert.rejects(main(["--environment=production", "--confirm-production=notes"]), /explicit --receipt/);
  await assert.rejects(main([
    "--environment=production",
    "--confirm-production=notes",
    "--receipt=missing.json",
  ]), /explicit --release-sha/);

  const previousUrl = process.env.TURSO_DATABASE_URL;
  const previousToken = process.env.TURSO_AUTH_TOKEN;
  process.env.TURSO_DATABASE_URL = ":memory:";
  process.env.TURSO_AUTH_TOKEN = "test-only-token";
  try {
    await assert.rejects(main([
      "--environment=production",
      "--confirm-production=notes",
      "--receipt=missing.json",
      `--release-sha=${releaseSha}`,
    ]), /refuses a local database URL/);
  } finally {
    if (previousUrl === undefined) delete process.env.TURSO_DATABASE_URL;
    else process.env.TURSO_DATABASE_URL = previousUrl;
    if (previousToken === undefined) delete process.env.TURSO_AUTH_TOKEN;
    else process.env.TURSO_AUTH_TOKEN = previousToken;
  }
});
