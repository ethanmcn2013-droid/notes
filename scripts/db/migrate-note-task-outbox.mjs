import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { createClient } from "@libsql/client";

const here = path.dirname(fileURLToPath(import.meta.url));
export const defaultRoot = path.resolve(here, "..", "..");
const ledgerTable = "notes_schema_migrations";
const outboxTable = "note_task_send_outbox";
const hashPattern = /^[a-f0-9]{64}$/;
const releasePattern = /^[a-f0-9]{40}$/;
const supportedEnvironments = new Set([
  "test",
  "development",
  "preview",
  "staging",
  "production",
]);

function invariant(condition, message) {
  if (!condition) throw new Error(`notes-db:migrate-0007: ${message}`);
}

export function canonicalText(value) {
  return String(value).replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

export function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function canonicalFileSha256(file) {
  return sha256(canonicalText(fs.readFileSync(file, "utf8")));
}

export function rawFileSha256(file) {
  return sha256(fs.readFileSync(file));
}

function normalizedSchemaSql(value) {
  return canonicalText(value).replace(/\s+/g, " ").trim();
}

export function databaseIdentitySha256(databaseUrl) {
  if (databaseUrl === ":memory:") return sha256("sqlite::memory:");
  const parsed = new URL(databaseUrl);
  const protocol = parsed.protocol.toLowerCase();
  if (protocol === "file:") {
    const normalizedPath = path.resolve(fileURLToPath(parsed)).replace(/\\/g, "/").toLowerCase();
    return sha256(`file://${normalizedPath}`);
  }
  const hostname = parsed.hostname.toLowerCase();
  invariant(hostname.length > 0, "database URL has no hostname");
  const port = parsed.port ? `:${parsed.port}` : "";
  const pathname = parsed.pathname.replace(/\/+$/, "") || "/";
  return sha256(`${protocol}//${hostname}${port}${pathname}`);
}

export function isLocalDatabaseUrl(databaseUrl) {
  return databaseUrl === ":memory:" || /^file:/i.test(databaseUrl);
}

/**
 * Split the checked-in SQLite migration without changing statement text.
 * Handles quoted semicolons and both SQL comment forms; 0007 has no trigger
 * bodies, so a top-level semicolon is an unambiguous statement boundary.
 */
export function splitSqlStatements(sql) {
  const source = canonicalText(sql);
  const statements = [];
  let statement = "";
  let quote = null;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") {
        lineComment = false;
        statement += "\n";
      }
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (!quote && char === "-" && next === "-") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (!quote && char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (quote) {
      statement += char;
      if (char === quote) {
        if (next === quote && quote !== "]") {
          statement += next;
          index += 1;
        } else {
          quote = null;
        }
      }
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      statement += char;
      continue;
    }
    if (char === "[") {
      quote = "]";
      statement += char;
      continue;
    }
    if (char === ";") {
      if (statement.trim()) statements.push(statement.trim());
      statement = "";
      continue;
    }
    statement += char;
  }

  invariant(!quote && !blockComment, "migration SQL contains an unterminated quote or comment");
  invariant(!statement.trim(), "migration SQL must terminate every statement with a semicolon");
  return statements;
}

function migrationObjects(statements) {
  const objects = [];
  for (const sql of statements) {
    const match = sql.match(/^CREATE\s+(UNIQUE\s+)?(TABLE|INDEX)\s+([a-z_][a-z0-9_]*)\b/i);
    invariant(match, "0007 may contain only named CREATE TABLE or CREATE INDEX statements");
    objects.push({
      type: match[2].toLowerCase() === "table" ? "table" : "index",
      name: match[3],
      table: match[2].toLowerCase() === "table" ? match[3] : outboxTable,
      sql,
    });
  }
  invariant(objects.length === 4, "0007 must define exactly one table and three indexes");
  invariant(objects.filter((item) => item.type === "table" && item.name === outboxTable).length === 1, "0007 outbox table is missing");
  return objects.sort((left, right) => left.type.localeCompare(right.type) || left.name.localeCompare(right.name));
}

export function schemaFingerprintSha256(objects) {
  return sha256(JSON.stringify(objects.map((object) => [
    object.type,
    object.name,
    object.table,
    normalizedSchemaSql(object.sql),
  ])));
}

function readJson(file, label) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`notes-db:migrate-0007: cannot read ${label} at ${file}: ${error.message}`);
  }
}

export function loadMigrationContext({ root = defaultRoot } = {}) {
  root = path.resolve(root);
  const ledgerPath = path.join(root, "drizzle", "note-task-outbox-migration-ledger.json");
  const ledger = readJson(ledgerPath, "migration ledger");
  invariant(ledger.schemaVersion === "notes-migration-ledger/1", "unsupported migration ledger schemaVersion");
  invariant(ledger.dialect === "sqlite", "migration ledger dialect must be sqlite");
  invariant(ledger.databaseLedgerTable === ledgerTable, "unexpected database ledger table");
  invariant(Array.isArray(ledger.entries) && ledger.entries.length === 1, "migration ledger must contain only 0007");
  const entry = ledger.entries[0];
  invariant(entry.id === "0007_note_task_send_outbox", "migration ledger has an unexpected id");
  invariant(entry.file === `drizzle/${entry.id}.sql`, "migration path must match its id");
  invariant(hashPattern.test(entry.sha256 ?? ""), "migration ledger has an invalid SQL hash");
  invariant(hashPattern.test(entry.schemaFingerprintSha256 ?? ""), "migration ledger has an invalid schema fingerprint");
  const migrationPath = path.resolve(root, entry.file);
  invariant(migrationPath.startsWith(`${root}${path.sep}`), "migration path escapes repository root");
  invariant(fs.existsSync(migrationPath), "0007 migration SQL is missing");
  const sql = canonicalText(fs.readFileSync(migrationPath, "utf8"));
  invariant(sha256(sql) === entry.sha256, "0007 canonical SQL hash differs from the ledger");
  const statements = splitSqlStatements(sql);
  const objects = migrationObjects(statements);
  invariant(schemaFingerprintSha256(objects) === entry.schemaFingerprintSha256, "0007 schema fingerprint differs from the ledger");
  return {
    root,
    ledger,
    ledgerPath,
    ledgerSha256: canonicalFileSha256(ledgerPath),
    entry: { ...entry, sql, statements, objects },
  };
}

function validateIsoTimestamp(value, label) {
  invariant(typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value)), `${label} is not an ISO timestamp`);
}

function requireExactKeys(value, expected, label) {
  invariant(value && typeof value === "object" && !Array.isArray(value), `${label} must be an object`);
  const actual = Object.keys(value).sort();
  const allowed = [...expected].sort();
  invariant(JSON.stringify(actual) === JSON.stringify(allowed), `${label} contains missing or unapproved fields`);
}

export function validateExecutionReceipt(file, context, {
  databaseUrl,
  environment,
  releaseSha,
}) {
  invariant(file, "--receipt is required");
  const absolute = path.resolve(file);
  invariant(fs.existsSync(absolute), `execution receipt is missing: ${absolute}`);
  const receipt = readJson(absolute, "execution receipt");
  requireExactKeys(receipt, [
    "schemaVersion", "id", "environment", "databaseIdentitySha256",
    "ledgerSha256", "releaseSha", "migration", "backup", "dryRun", "createdAt",
  ], "execution receipt");
  requireExactKeys(receipt.migration, ["id", "sqlSha256", "schemaFingerprintSha256"], "migration receipt");
  requireExactKeys(receipt.backup, ["status", "sha256", "databaseIdentitySha256", "verifiedAt"], "backup receipt");
  requireExactKeys(receipt.dryRun, [
    "status", "sourceBackupSha256", "databaseSha256", "migrationId",
    "migrationSqlSha256", "schemaFingerprintSha256", "notesCountBefore",
    "notesCountAfter", "integrityCheck", "foreignKeyViolations", "completedAt",
  ], "dry-run receipt");
  invariant(receipt.schemaVersion === "notes-migration-execution/1", "unsupported execution receipt schemaVersion");
  invariant(typeof receipt.id === "string" && /^[a-z0-9][a-z0-9._-]{7,127}$/.test(receipt.id), "execution receipt has an invalid id");
  invariant(supportedEnvironments.has(environment), `unsupported environment ${environment}`);
  invariant(receipt.environment === environment, "execution receipt environment does not match");
  invariant(receipt.databaseIdentitySha256 === databaseIdentitySha256(databaseUrl), "execution receipt targets a different database");
  invariant(receipt.ledgerSha256 === context.ledgerSha256, "execution receipt ledger hash does not match");
  invariant(releasePattern.test(releaseSha ?? ""), "--release-sha must be a full lowercase 40-character Git SHA");
  invariant(receipt.releaseSha === releaseSha, "execution receipt releaseSha does not match --release-sha");
  invariant(receipt.migration?.id === context.entry.id, "execution receipt migration id does not match");
  invariant(receipt.migration?.sqlSha256 === context.entry.sha256, "execution receipt SQL hash does not match");
  invariant(receipt.migration?.schemaFingerprintSha256 === context.entry.schemaFingerprintSha256, "execution receipt schema fingerprint does not match");
  invariant(hashPattern.test(receipt.backup?.sha256 ?? ""), "execution receipt is missing a verified backup hash");
  invariant(receipt.backup?.status === "verified", "execution receipt backup status must be verified");
  invariant(receipt.backup?.databaseIdentitySha256 === receipt.databaseIdentitySha256, "backup identity does not match the target database");
  validateIsoTimestamp(receipt.backup?.verifiedAt, "backup.verifiedAt");
  invariant(receipt.dryRun?.status === "passed", "execution receipt dry run did not pass");
  invariant(receipt.dryRun?.sourceBackupSha256 === receipt.backup.sha256, "dry run is not bound to the verified backup");
  invariant(hashPattern.test(receipt.dryRun?.databaseSha256 ?? ""), "execution receipt is missing the isolated dry-run database hash");
  invariant(receipt.dryRun?.migrationId === context.entry.id, "dry run migration id does not match");
  invariant(receipt.dryRun?.migrationSqlSha256 === context.entry.sha256, "dry run SQL hash does not match");
  invariant(receipt.dryRun?.schemaFingerprintSha256 === context.entry.schemaFingerprintSha256, "dry run schema fingerprint does not match");
  invariant(Number.isSafeInteger(receipt.dryRun?.notesCountBefore) && receipt.dryRun.notesCountBefore >= 0, "dry run notesCountBefore is invalid");
  invariant(receipt.dryRun?.notesCountAfter === receipt.dryRun.notesCountBefore, "dry run did not preserve the notes count");
  invariant(receipt.dryRun?.integrityCheck === "ok", "dry run integrity check did not pass");
  invariant(receipt.dryRun?.foreignKeyViolations === 0, "dry run has foreign-key violations");
  validateIsoTimestamp(receipt.dryRun?.completedAt, "dryRun.completedAt");
  validateIsoTimestamp(receipt.createdAt, "createdAt");
  invariant(Date.parse(receipt.backup.verifiedAt) <= Date.parse(receipt.dryRun.completedAt), "dry run predates backup verification");
  invariant(Date.parse(receipt.dryRun.completedAt) <= Date.parse(receipt.createdAt), "execution receipt predates its dry run");
  return {
    id: receipt.id,
    sha256: canonicalFileSha256(absolute),
    absolute,
    document: receipt,
  };
}

function localDryRunReceipt(context, {
  databaseUrl,
  environment,
  releaseSha,
  verifiedBackupSha256,
}) {
  invariant(environment === "test", "receipt-free execution is limited to an isolated test dry run");
  invariant(/^file:/i.test(databaseUrl), "isolated dry run requires a file: database URL");
  invariant(releasePattern.test(releaseSha ?? ""), "--release-sha must be a full lowercase 40-character Git SHA");
  invariant(hashPattern.test(verifiedBackupSha256 ?? ""), "isolated dry run requires the verified backup SHA-256");
  const id = "notes-0007-isolated-copy-dry-run";
  const marker = sha256(JSON.stringify({
    id,
    databaseIdentitySha256: databaseIdentitySha256(databaseUrl),
    ledgerSha256: context.ledgerSha256,
    sqlSha256: context.entry.sha256,
    releaseSha,
    verifiedBackupSha256,
  }));
  return {
    id,
    sha256: marker,
    document: {
      backup: { sha256: verifiedBackupSha256 },
      // The isolated ledger needs a content hash before the final database
      // bytes exist. This marker is deliberately not production evidence;
      // main() emits the real post-close database hash as dryRunEvidence.
      dryRun: { databaseSha256: marker },
    },
  };
}

function normalizeScalar(value) {
  return typeof value === "bigint" ? Number(value) : value;
}

function firstScalar(result) {
  invariant(result.rows.length > 0, "proof query returned no rows");
  const row = result.rows[0];
  const key = Object.hasOwn(row, "value") ? "value" : Object.keys(row)[0];
  return normalizeScalar(row[key]);
}

async function tableExists(client, name) {
  const result = await client.execute({
    sql: "SELECT COUNT(*) AS value FROM sqlite_schema WHERE type = 'table' AND name = ?",
    args: [name],
  });
  return Number(firstScalar(result)) === 1;
}

async function readLedgerRow(client, migrationId) {
  if (!(await tableExists(client, ledgerTable))) return null;
  const result = await client.execute({
    sql: `SELECT * FROM ${ledgerTable} WHERE migration_id = ?`,
    args: [migrationId],
  });
  if (result.rows.length === 0) return null;
  invariant(result.rows.length === 1, "database ledger contains duplicate 0007 rows");
  return Object.fromEntries(Object.entries(result.rows[0]).map(([key, value]) => [key, normalizeScalar(value)]));
}

async function verifyPrerequisite(client) {
  invariant(await tableExists(client, "notes"), "required notes table is missing");
  const columns = (await client.execute("PRAGMA table_info('notes')")).rows.map((row) => String(row.name));
  const requiredColumns = [
    "id", "user_id", "body", "created_at", "updated_at", "extract_body",
    "promoted_task_id", "archived_at", "source", "workspace_id",
  ];
  for (const column of requiredColumns) invariant(columns.includes(column), `0006 prerequisite is missing notes.${column}`);
  const indexColumns = (await client.execute("PRAGMA index_info('notes_user_workspace_created_idx')")).rows.map((row) => String(row.name));
  invariant(JSON.stringify(indexColumns) === JSON.stringify(["user_id", "workspace_id", "created_at"]), "0006 prerequisite index is missing or differs");
}

async function currentOutboxObjects(client) {
  const result = await client.execute({
    sql: "SELECT type, name, tbl_name, sql FROM sqlite_schema WHERE tbl_name = ? AND name NOT LIKE 'sqlite_autoindex_%' ORDER BY type, name",
    args: [outboxTable],
  });
  return result.rows.map((row) => ({
    type: String(row.type),
    name: String(row.name),
    table: String(row.tbl_name),
    sql: String(row.sql),
  }));
}

async function verifyStructuredOutbox(client, context) {
  const objects = await currentOutboxObjects(client);
  invariant(objects.length === context.entry.objects.length, "outbox schema does not have exactly the registered objects");
  context.entry.objects.forEach((expected, ordinal) => {
    const actual = objects[ordinal];
    invariant(actual.type === expected.type && actual.name === expected.name && actual.table === expected.table, `outbox object identity differs at ${expected.name}`);
    invariant(actual.sql === expected.sql, `outbox SQL differs at ${expected.name}`);
  });
  invariant(schemaFingerprintSha256(objects) === context.entry.schemaFingerprintSha256, "outbox schema fingerprint does not match");

  const columns = (await client.execute(`PRAGMA table_info('${outboxTable}')`)).rows.map((row) => ({
    name: String(row.name),
    type: String(row.type),
    notnull: Number(row.notnull),
    defaultValue: row.dflt_value === null ? null : String(row.dflt_value),
    primaryKey: Number(row.pk),
  }));
  const expectedColumns = [
    ["operation_id", "TEXT", 1, null, 1], ["note_id", "TEXT", 1, null, 0],
    ["user_id", "TEXT", 1, null, 0], ["source_selection", "TEXT", 1, null, 0],
    ["approved_body", "TEXT", 1, null, 0], ["approved_body_sha256", "TEXT", 1, null, 0],
    ["workspace_id", "TEXT", 1, null, 0], ["base_updated_at", "INTEGER", 1, null, 0],
    ["reserved_updated_at", "INTEGER", 1, null, 0], ["status", "TEXT", 1, "'pending'", 0],
    ["task_id", "TEXT", 0, null, 0], ["lease_token", "TEXT", 0, null, 0],
    ["lease_expires_at", "INTEGER", 0, null, 0], ["attempt_count", "INTEGER", 1, "1", 0],
    ["created_at", "INTEGER", 1, "unixepoch() * 1000", 0], ["updated_at", "INTEGER", 1, "unixepoch() * 1000", 0],
    ["completed_at", "INTEGER", 0, null, 0],
  ].map(([name, type, notnull, defaultValue, primaryKey]) => ({ name, type, notnull, defaultValue, primaryKey }));
  invariant(JSON.stringify(columns) === JSON.stringify(expectedColumns), "outbox column contract differs");

  const foreignKeys = (await client.execute(`PRAGMA foreign_key_list('${outboxTable}')`)).rows.map((row) => ({
    table: String(row.table), from: String(row.from), to: String(row.to),
    onUpdate: String(row.on_update), onDelete: String(row.on_delete),
  }));
  invariant(JSON.stringify(foreignKeys) === JSON.stringify([{
    table: "notes", from: "note_id", to: "id", onUpdate: "NO ACTION", onDelete: "CASCADE",
  }]), "outbox foreign-key contract differs");

  const expectedIndexes = new Map([
    ["note_task_send_outbox_note_idx", { unique: 0, columns: ["note_id"] }],
    ["note_task_send_outbox_user_note_uq", { unique: 1, columns: ["user_id", "note_id"] }],
    ["note_task_send_outbox_user_status_idx", { unique: 0, columns: ["user_id", "status", "updated_at"] }],
  ]);
  const indexRows = (await client.execute(`PRAGMA index_list('${outboxTable}')`)).rows;
  for (const [name, expected] of expectedIndexes) {
    const index = indexRows.find((row) => String(row.name) === name);
    invariant(index && Number(index.unique) === expected.unique && String(index.origin) === "c", `outbox index ${name} differs`);
    const indexColumns = (await client.execute(`PRAGMA index_info('${name}')`)).rows.map((row) => String(row.name));
    invariant(JSON.stringify(indexColumns) === JSON.stringify(expected.columns), `outbox index columns differ for ${name}`);
  }
  invariant(indexRows.filter((row) => String(row.origin) === "c").length === 3, "outbox has an unexpected named index");
  return context.entry.schemaFingerprintSha256;
}

async function databaseHealth(client) {
  const integrityRows = (await client.execute("PRAGMA integrity_check")).rows;
  const integrity = integrityRows.length === 1 ? String(Object.values(integrityRows[0])[0]) : "failed";
  const foreignKeyViolations = (await client.execute("PRAGMA foreign_key_check")).rows.length;
  return { integrityCheck: integrity, foreignKeyViolations };
}

function ledgerTableStatement() {
  return `CREATE TABLE IF NOT EXISTS ${ledgerTable} (
    migration_id TEXT PRIMARY KEY NOT NULL,
    sql_sha256 TEXT NOT NULL,
    source_ledger_sha256 TEXT NOT NULL,
    schema_fingerprint_sha256 TEXT NOT NULL,
    execution_receipt_id TEXT NOT NULL,
    execution_receipt_sha256 TEXT NOT NULL,
    database_identity_sha256 TEXT NOT NULL,
    backup_sha256 TEXT NOT NULL,
    dry_run_database_sha256 TEXT NOT NULL,
    release_sha TEXT NOT NULL,
    environment TEXT NOT NULL,
    notes_count_before INTEGER NOT NULL,
    notes_count_after INTEGER NOT NULL,
    integrity_check TEXT NOT NULL,
    foreign_key_violations INTEGER NOT NULL,
    applied_at INTEGER NOT NULL,
    CHECK (length(sql_sha256) = 64),
    CHECK (length(source_ledger_sha256) = 64),
    CHECK (length(schema_fingerprint_sha256) = 64),
    CHECK (length(execution_receipt_sha256) = 64),
    CHECK (length(database_identity_sha256) = 64),
    CHECK (length(backup_sha256) = 64),
    CHECK (length(dry_run_database_sha256) = 64),
    CHECK (notes_count_before = notes_count_after),
    CHECK (integrity_check = 'ok'),
    CHECK (foreign_key_violations = 0)
  )`;
}

function transactionalStatements(context, receipt, {
  databaseIdentity,
  environment,
  releaseSha,
  appliedAt,
}) {
  const proofTable = "__notes_0007_proofs";
  const stateTable = "__notes_0007_state";
  const statements = [
    `DROP TABLE IF EXISTS temp.${proofTable}`,
    `DROP TABLE IF EXISTS temp.${stateTable}`,
    `CREATE TEMP TABLE ${stateTable} (notes_count INTEGER NOT NULL)`,
    `INSERT INTO temp.${stateTable} (notes_count) SELECT COUNT(*) FROM notes`,
    ...context.entry.statements,
    `CREATE TEMP TABLE ${proofTable} (
      id TEXT PRIMARY KEY NOT NULL,
      actual TEXT NOT NULL,
      expected TEXT NOT NULL,
      CHECK (actual = expected)
    )`,
    {
      sql: `INSERT INTO temp.${proofTable} (id, actual, expected)
        VALUES ('notes-count', CAST((SELECT COUNT(*) FROM notes) AS TEXT), CAST((SELECT notes_count FROM temp.${stateTable}) AS TEXT))`,
      args: [],
    },
  ];
  for (const object of context.entry.objects) {
    statements.push({
      sql: `INSERT INTO temp.${proofTable} (id, actual, expected)
        VALUES (?, COALESCE((SELECT sql FROM sqlite_schema WHERE type = ? AND name = ? AND tbl_name = ?), '__MISSING__'), ?)`,
      args: [`object:${object.name}`, object.type, object.name, object.table, object.sql],
    });
  }
  statements.push(
    `INSERT INTO temp.${proofTable} (id, actual, expected)
      VALUES ('object-count', CAST((SELECT COUNT(*) FROM sqlite_schema WHERE tbl_name = '${outboxTable}' AND name NOT LIKE 'sqlite_autoindex_%') AS TEXT), '${context.entry.objects.length}')`,
    `INSERT INTO temp.${proofTable} (id, actual, expected)
      VALUES ('integrity', CAST((SELECT COUNT(*) FROM pragma_integrity_check WHERE integrity_check <> 'ok') AS TEXT), '0')`,
    `INSERT INTO temp.${proofTable} (id, actual, expected)
      VALUES ('foreign-keys', CAST((SELECT COUNT(*) FROM pragma_foreign_key_check) AS TEXT), '0')`,
    ledgerTableStatement(),
    {
      sql: `INSERT INTO ${ledgerTable} (
        migration_id, sql_sha256, source_ledger_sha256, schema_fingerprint_sha256,
        execution_receipt_id, execution_receipt_sha256,
        database_identity_sha256, backup_sha256, dry_run_database_sha256,
        release_sha, environment, notes_count_before, notes_count_after,
        integrity_check, foreign_key_violations, applied_at
      ) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, notes_count,
        (SELECT COUNT(*) FROM notes), 'ok', 0, ?
        FROM temp.${stateTable}`,
      args: [
        context.entry.id,
        context.entry.sha256,
        context.ledgerSha256,
        context.entry.schemaFingerprintSha256,
        receipt.id,
        receipt.sha256,
        databaseIdentity,
        receipt.document.backup.sha256,
        receipt.document.dryRun.databaseSha256,
        releaseSha,
        environment,
        appliedAt,
      ],
    },
    `DROP TABLE temp.${proofTable}`,
    `DROP TABLE temp.${stateTable}`,
  );
  return statements;
}

function validateLedgerRow(row, context, receipt, {
  databaseIdentity,
  environment,
  releaseSha,
}) {
  invariant(row, "0007 database ledger row is missing");
  invariant(row.migration_id === context.entry.id, "database ledger migration id differs");
  invariant(row.sql_sha256 === context.entry.sha256, "database ledger SQL hash differs");
  invariant(row.source_ledger_sha256 === context.ledgerSha256, "database source ledger hash differs");
  invariant(row.schema_fingerprint_sha256 === context.entry.schemaFingerprintSha256, "database ledger schema fingerprint differs");
  invariant(row.execution_receipt_id === receipt.id && row.execution_receipt_sha256 === receipt.sha256, "database ledger execution receipt differs");
  invariant(row.database_identity_sha256 === databaseIdentity, "database ledger target identity differs");
  invariant(row.backup_sha256 === receipt.document.backup.sha256, "database ledger backup hash differs");
  invariant(row.dry_run_database_sha256 === receipt.document.dryRun.databaseSha256, "database ledger dry-run hash differs");
  invariant(row.release_sha === releaseSha, "database ledger release SHA differs");
  invariant(row.environment === environment, "database ledger environment differs");
  invariant(row.notes_count_before === row.notes_count_after, "database ledger records note loss");
  invariant(row.integrity_check === "ok" && row.foreign_key_violations === 0, "database ledger health proof differs");
  invariant(Number.isSafeInteger(row.applied_at) && row.applied_at > 0, "database ledger applied_at is invalid");
  return row;
}

export async function runNoteTaskOutboxMigration({
  client,
  databaseUrl,
  environment,
  receiptPath,
  releaseSha,
  verifiedBackupSha256,
  context = loadMigrationContext(),
  now = () => Date.now(),
}) {
  invariant(client, "database client is required");
  invariant(typeof databaseUrl === "string" && databaseUrl.length > 0, "database URL is required");
  invariant(supportedEnvironments.has(environment), `unsupported environment ${environment}`);
  const databaseIdentity = databaseIdentitySha256(databaseUrl);
  const receipt = receiptPath
    ? validateExecutionReceipt(receiptPath, context, { databaseUrl, environment, releaseSha })
    : localDryRunReceipt(context, {
      databaseUrl, environment, releaseSha, verifiedBackupSha256,
    });
  await client.execute("PRAGMA foreign_keys = ON");
  await verifyPrerequisite(client);

  const hasOutbox = await tableExists(client, outboxTable);
  const ledgerRow = await readLedgerRow(client, context.entry.id);
  invariant(hasOutbox === Boolean(ledgerRow), hasOutbox
    ? "outbox exists without an exact 0007 ledger row; refuse unreceipted adoption"
    : "0007 ledger row exists but the outbox table is missing");

  if (hasOutbox) {
    validateLedgerRow(ledgerRow, context, receipt, { databaseIdentity, environment, releaseSha });
    const schemaFingerprint = await verifyStructuredOutbox(client, context);
    const health = await databaseHealth(client);
    invariant(health.integrityCheck === "ok" && health.foreignKeyViolations === 0, "database health checks failed on no-op verification");
    return {
      status: "no-op",
      migrationId: context.entry.id,
      databaseIdentitySha256: databaseIdentity,
      sqlSha256: context.entry.sha256,
      schemaFingerprintSha256: schemaFingerprint,
      executionReceipt: { id: receipt.id, sha256: receipt.sha256 },
      ledger: {
        table: ledgerTable,
        releaseSha: ledgerRow.release_sha,
        appliedAt: ledgerRow.applied_at,
        notesCountBefore: ledgerRow.notes_count_before,
        notesCountAfter: ledgerRow.notes_count_after,
      },
      health,
    };
  }

  try {
    await client.batch(transactionalStatements(context, receipt, {
      databaseIdentity,
      environment,
      releaseSha,
      appliedAt: now(),
    }), "write");
  } catch (error) {
    // A concurrent runner may have won after the preflight. Only the exact,
    // receipt-bound state is accepted as success; every other failure surfaces.
    const concurrentRow = await readLedgerRow(client, context.entry.id).catch(() => null);
    if (await tableExists(client, outboxTable).catch(() => false) && concurrentRow) {
      validateLedgerRow(concurrentRow, context, receipt, { databaseIdentity, environment, releaseSha });
      await verifyStructuredOutbox(client, context);
      return runNoteTaskOutboxMigration({
        client, databaseUrl, environment, receiptPath, releaseSha,
        verifiedBackupSha256, context, now,
      });
    }
    throw new Error("notes-db:migrate-0007: atomic migration failed; SQL, proofs, and ledger write were rolled back", { cause: error });
  }

  const appliedRow = validateLedgerRow(
    await readLedgerRow(client, context.entry.id),
    context,
    receipt,
    { databaseIdentity, environment, releaseSha },
  );
  const schemaFingerprint = await verifyStructuredOutbox(client, context);
  const health = await databaseHealth(client);
  invariant(health.integrityCheck === "ok" && health.foreignKeyViolations === 0, "post-migration database health checks failed");
  return {
    status: "applied",
    migrationId: context.entry.id,
    databaseIdentitySha256: databaseIdentity,
    sqlSha256: context.entry.sha256,
    schemaFingerprintSha256: schemaFingerprint,
    executionReceipt: { id: receipt.id, sha256: receipt.sha256 },
    ledger: {
      table: ledgerTable,
      releaseSha: appliedRow.release_sha,
      appliedAt: appliedRow.applied_at,
      notesCountBefore: appliedRow.notes_count_before,
      notesCountAfter: appliedRow.notes_count_after,
    },
    health,
  };
}

export async function main(argv = process.argv.slice(2)) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    strict: true,
    options: {
      environment: { type: "string" },
      "confirm-production": { type: "string" },
      receipt: { type: "string" },
      "release-sha": { type: "string" },
      "confirm-dry-run": { type: "string" },
      "backup-sha256": { type: "string" },
    },
  });
  const command = positionals[0] ?? "migrate";
  invariant(positionals.length <= 1 && ["migrate", "dry-run"].includes(command), "only migrate and dry-run commands are supported");
  if (command === "migrate") {
    invariant(values.environment === "production", "production execution requires explicit --environment=production");
    invariant(values["confirm-production"] === "notes", "production execution requires explicit --confirm-production=notes");
    invariant(values.receipt, "production execution requires explicit --receipt=<path>");
    invariant(values["release-sha"], "production execution requires explicit --release-sha=<full-git-sha>");
  } else {
    invariant(values.environment === "test", "isolated dry run requires explicit --environment=test");
    invariant(values["confirm-dry-run"] === "isolated-copy", "isolated dry run requires explicit --confirm-dry-run=isolated-copy");
    invariant(!values.receipt, "isolated dry run creates evidence and must not consume a production receipt");
    invariant(values["release-sha"], "isolated dry run requires explicit --release-sha=<full-git-sha>");
  }
  const databaseUrl = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  invariant(databaseUrl, "TURSO_DATABASE_URL is required");
  let verifiedBackupSha256;
  let databaseFile;
  if (command === "migrate") {
    invariant(!isLocalDatabaseUrl(databaseUrl), "production execution refuses a local database URL");
    invariant(authToken, "TURSO_AUTH_TOKEN is required");
  } else {
    invariant(/^file:/i.test(databaseUrl), "isolated dry run requires a file: database URL");
    invariant(hashPattern.test(values["backup-sha256"] ?? ""), "isolated dry run requires --backup-sha256=<verified-backup-hash>");
    databaseFile = fileURLToPath(new URL(databaseUrl));
    invariant(fs.existsSync(databaseFile) && fs.statSync(databaseFile).isFile(), "isolated dry-run database file is missing");
    invariant(!fs.existsSync(`${databaseFile}-wal`) && !fs.existsSync(`${databaseFile}-shm`), "isolated dry-run copy has WAL/SHM sidecars; checkpoint the backup before hashing");
    verifiedBackupSha256 = rawFileSha256(databaseFile);
    invariant(verifiedBackupSha256 === values["backup-sha256"], "isolated dry-run copy hash differs from --backup-sha256");
  }
  const client = createClient({ url: databaseUrl, authToken });
  let result;
  try {
    result = await runNoteTaskOutboxMigration({
      client,
      databaseUrl,
      environment: values.environment,
      receiptPath: values.receipt,
      releaseSha: values["release-sha"],
      verifiedBackupSha256,
    });
    if (command === "dry-run") await client.execute("PRAGMA wal_checkpoint(TRUNCATE)");
  } finally {
    await client.close();
  }
  if (command === "dry-run") {
    const walPath = `${databaseFile}-wal`;
    invariant(!fs.existsSync(walPath) || fs.statSync(walPath).size === 0, "isolated dry-run database still has uncheckpointed WAL bytes");
    result = {
      ...result,
      dryRunEvidence: {
        status: "passed",
        sourceBackupSha256: verifiedBackupSha256,
        databaseSha256: rawFileSha256(databaseFile),
        migrationId: result.migrationId,
        migrationSqlSha256: result.sqlSha256,
        schemaFingerprintSha256: result.schemaFingerprintSha256,
        notesCountBefore: result.ledger.notesCountBefore,
        notesCountAfter: result.ledger.notesCountAfter,
        integrityCheck: result.health.integrityCheck,
        foreignKeyViolations: result.health.foreignKeyViolations,
        completedAt: new Date().toISOString(),
      },
    };
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  });
}
