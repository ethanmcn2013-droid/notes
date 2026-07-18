import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import { createClient } from "@libsql/client";

import {
  approvedBodySha256,
  buildTrustedTaskUrl,
  canResumePendingTasksSend,
  isDefinitiveTasksSendRejection,
  makeTasksSendLeaseToken,
  makeTasksSendOperationId,
  parseTrustedLegacyTasksSendReceipt,
  parseTrustedTasksSendReceipt,
  shouldReleaseTasksSendReservation,
} from "./notes-task-send-contract";

test("SHA-256 covers the exact approved UTF-8 bytes", () => {
  assert.equal(
    approvedBodySha256("  Call Niamh — Friday\n"),
    "63dec4824d263ba9b9126c30b77bb244cb1cb170819ac6df38f77eaa58316b0c",
  );
  assert.notEqual(
    approvedBodySha256("  Call Niamh — Friday\n"),
    approvedBodySha256("Call Niamh — Friday"),
  );
});

test("trusted receipt verifies the exact body hash and ignores upstream links", () => {
  const expected = approvedBodySha256("Call the supplier Friday");
  const receipt = parseTrustedTasksSendReceipt(
    {
      taskId: "t-ab12cd34",
      workspaceName: "Launch",
      workspaceSlug: "launch",
      taskUrl: "https://attacker.example/private",
      created: true,
      acceptedBodySha256: expected,
    },
    expected,
  );

  assert.equal(receipt.taskId, "t-ab12cd34");
  assert.equal(receipt.created, true);
  assert.equal(receipt.taskUrl, buildTrustedTaskUrl("t-ab12cd34"));
  assert.ok(!receipt.taskUrl.includes("attacker.example"));
});

test("trusted receipt rejects a body mismatch and an unbounded task id", () => {
  const expected = approvedBodySha256("approved");
  assert.throws(
    () =>
      parseTrustedTasksSendReceipt(
        {
          taskId: "t-safe",
          created: false,
          acceptedBodySha256: approvedBodySha256("different"),
        },
        expected,
      ),
    /exact approved wording/,
  );
  assert.throws(
    () =>
      parseTrustedTasksSendReceipt(
        {
          taskId: `t-${"x".repeat(200)}`,
          created: false,
          acceptedBodySha256: expected,
        },
        expected,
      ),
    /invalid task id/,
  );
});

test("explicit legacy parser still bounds ids and distrusts upstream links", () => {
  const receipt = parseTrustedLegacyTasksSendReceipt({
    taskId: "t-rollback1",
    workspaceName: "Tasks",
    workspaceSlug: "tasks",
    taskUrl: "https://attacker.example/redirect",
    created: false,
  });
  assert.equal(receipt.taskUrl, buildTrustedTaskUrl("t-rollback1"));
  assert.throws(() =>
    parseTrustedLegacyTasksSendReceipt({
      taskId: "../../private",
      created: true,
    }),
  );
});

test("operation and lease ids are stable-format, unique request identities", () => {
  const first = makeTasksSendOperationId();
  const second = makeTasksSendOperationId();
  const lease = makeTasksSendLeaseToken();
  assert.match(first, /^o_[a-f0-9]{32}$/);
  assert.match(lease, /^l_[a-f0-9]{32}$/);
  assert.notEqual(first, second);
});

test("only the exact immutable pending request can resume", () => {
  const approvedBody = "Exact approved wording";
  const request = {
    noteId: "n_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    userId: "u-owner",
    sourceSelection: "Exact source selection",
    approvedBody,
    approvedBodySha256: approvedBodySha256(approvedBody),
    workspaceId: "w-launch",
  };
  const pending = { ...request, baseUpdatedAt: 100, reservedUpdatedAt: 101 };

  assert.equal(canResumePendingTasksSend(pending, request, 100), true);
  assert.equal(canResumePendingTasksSend(pending, request, 101), true);
  assert.equal(canResumePendingTasksSend(pending, request, 102), false);
  assert.equal(
    canResumePendingTasksSend(
      pending,
      { ...request, approvedBody: `${approvedBody}.` },
      100,
    ),
    false,
  );
  assert.equal(
    canResumePendingTasksSend(
      pending,
      { ...request, sourceSelection: "another selection" },
      100,
    ),
    false,
  );
  assert.equal(
    canResumePendingTasksSend(
      pending,
      { ...request, workspaceId: "w-other" },
      100,
    ),
    false,
  );
});

test("only pre-create receiver rejections release a reservation", () => {
  for (const status of [400, 401, 403, 404, 409, 413, 422]) {
    assert.equal(isDefinitiveTasksSendRejection(status), true, `${status}`);
  }
  for (const status of [408, 425, 429, 500, 502, 503, 504]) {
    assert.equal(isDefinitiveTasksSendRejection(status), false, `${status}`);
  }
  assert.equal(shouldReleaseTasksSendReservation(400, false), true);
  assert.equal(shouldReleaseTasksSendReservation(409, false), true);
  assert.equal(shouldReleaseTasksSendReservation(400, true), false);
  assert.equal(shouldReleaseTasksSendReservation(409, true), false);
});

test("legacy receipt-binding mutations fail closed for every durable outbox row", async () => {
  const source = await readFile(
    new URL("./actions/notes.ts", import.meta.url),
    "utf8",
  );
  const actionBlock = (name: string) => {
    const start = source.indexOf(`export async function ${name}(`);
    assert.ok(start >= 0, `missing ${name}`);
    const next = source.indexOf("\nexport async function ", start + 1);
    return source.slice(start, next >= 0 ? next : undefined);
  };

  for (const name of [
    "setNoteWorkspace",
    "setNoteExtract",
    "clearNoteExtract",
    "sendExtractToTasks",
    "promoteNoteToTasks",
    "unPromoteNote",
  ]) {
    const block = actionBlock(name);
    assert.match(
      block,
      /noTasksSendBinding\(userId, (?:noteId|id)\)/,
      `${name} can rewrite a durable Tasks receipt`,
    );
    assert.doesNotMatch(
      block,
      /noPendingTasksSend/,
      `${name} still allows completed receipt mutation`,
    );
  }

  const guardStart = source.indexOf("function noTasksSendBinding(");
  const guardEnd = source.indexOf(
    "async function throwTasksSendBindingMutationError(",
    guardStart,
  );
  const guard = source.slice(guardStart, guardEnd);
  assert.match(guard, /NOT EXISTS/);
  assert.doesNotMatch(
    guard,
    /noteTaskSendOutbox\.status/,
    "durable guard must not exclude completed rows",
  );

  const deletion = actionBlock("deleteNote");
  assert.ok(
    deletion.indexOf(".delete(noteTaskSendOutbox)") <
      deletion.indexOf(".delete(notes)"),
    "explicit note deletion must remove its durable receipt atomically first",
  );
});

test("0007 migration is additive and enforces one valid send per owner note", async () => {
  const client = createClient({ url: ":memory:" });
  try {
    await client.execute(`
      CREATE TABLE notes (
        id TEXT PRIMARY KEY NOT NULL,
        user_id TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);
    await client.execute(
      "INSERT INTO notes VALUES ('n_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','u-one','private',1,1)",
    );
    const migration = await readFile(
      new URL("../../drizzle/0007_note_task_send_outbox.sql", import.meta.url),
      "utf8",
    );
    await client.executeMultiple(migration);

    const indexes = await client.execute(
      "PRAGMA index_list('note_task_send_outbox')",
    );
    const indexNames = new Set(indexes.rows.map((row) => String(row.name)));
    assert.ok(indexNames.has("note_task_send_outbox_user_note_uq"));
    assert.ok(indexNames.has("note_task_send_outbox_user_status_idx"));
    assert.ok(indexNames.has("note_task_send_outbox_note_idx"));
    const foreignKeys = await client.execute(
      "PRAGMA foreign_key_list('note_task_send_outbox')",
    );
    assert.equal(foreignKeys.rows[0]?.table, "notes");
    assert.equal(String(foreignKeys.rows[0]?.on_delete).toUpperCase(), "CASCADE");

    const insert = `
      INSERT INTO note_task_send_outbox (
        operation_id, note_id, user_id, source_selection, approved_body,
        approved_body_sha256, workspace_id, base_updated_at, reserved_updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      "o_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "n_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "u-one",
      "private",
      "approved",
      approvedBodySha256("approved"),
      "w-one",
      1,
      2,
    ];
    await client.execute({ sql: insert, args: values });

    const immutableLegacyMutation = `
      UPDATE notes SET body = 'mutated'
      WHERE id = ? AND user_id = ?
        AND NOT EXISTS (
          SELECT 1 FROM note_task_send_outbox
          WHERE user_id = ? AND note_id = ?
        )
    `;
    const immutableArgs = [values[1], values[2], values[2], values[1]];
    const blockedWhilePending = await client.execute({
      sql: immutableLegacyMutation,
      args: immutableArgs,
    });
    assert.equal(blockedWhilePending.rowsAffected, 0);

    const operationId = String(values[0]);
    const leaseA = "l_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    const leaseB = "l_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
    const acquireLeaseSql = `
      UPDATE note_task_send_outbox
      SET lease_token = ?, lease_expires_at = ?,
          attempt_count = attempt_count + 1, updated_at = ?
      WHERE operation_id = ?
        AND status = 'pending'
        AND (lease_token IS NULL OR lease_expires_at <= ?)
    `;
    const acquiredA = await client.execute({
      sql: acquireLeaseSql,
      args: [leaseA, 200, 100, operationId, 100],
    });
    assert.equal(acquiredA.rowsAffected, 1);

    const blockedB = await client.execute({
      sql: acquireLeaseSql,
      args: [leaseB, 300, 100, operationId, 100],
    });
    assert.equal(blockedB.rowsAffected, 0);

    const acquiredBAfterExpiry = await client.execute({
      sql: acquireLeaseSql,
      args: [leaseB, 400, 201, operationId, 201],
    });
    assert.equal(acquiredBAfterExpiry.rowsAffected, 1);

    const staleAFinalize = await client.execute({
      sql: `
        UPDATE note_task_send_outbox
        SET status = 'completed', task_id = 't-stale',
            source_selection = '', approved_body = '',
            lease_token = NULL, lease_expires_at = NULL,
            completed_at = 202, updated_at = 202
        WHERE operation_id = ? AND status = 'pending' AND lease_token = ?
      `,
      args: [operationId, leaseA],
    });
    assert.equal(staleAFinalize.rowsAffected, 0);

    const currentLease = await client.execute({
      sql: `
        SELECT status, lease_token, lease_expires_at, attempt_count
        FROM note_task_send_outbox WHERE operation_id = ?
      `,
      args: [operationId],
    });
    assert.equal(currentLease.rows[0]?.status, "pending");
    assert.equal(currentLease.rows[0]?.lease_token, leaseB);
    assert.equal(currentLease.rows[0]?.lease_expires_at, 400);
    assert.equal(currentLease.rows[0]?.attempt_count, 3);

    const finalizedB = await client.execute({
      sql: `
        UPDATE note_task_send_outbox
        SET status = 'completed', task_id = 't-durable',
            source_selection = '', approved_body = '',
            lease_token = NULL, lease_expires_at = NULL,
            completed_at = 203, updated_at = 203
        WHERE operation_id = ? AND status = 'pending'
          AND lease_token = ? AND lease_expires_at > ?
      `,
      args: [operationId, leaseB, 203],
    });
    assert.equal(finalizedB.rowsAffected, 1);

    const completed = await client.execute({
      sql: `
        SELECT status, task_id, source_selection, approved_body,
               lease_token, lease_expires_at
        FROM note_task_send_outbox WHERE operation_id = ?
      `,
      args: [operationId],
    });
    assert.equal(completed.rows[0]?.status, "completed");
    assert.equal(completed.rows[0]?.task_id, "t-durable");
    assert.equal(completed.rows[0]?.source_selection, "");
    assert.equal(completed.rows[0]?.approved_body, "");
    assert.equal(completed.rows[0]?.lease_token, null);
    assert.equal(completed.rows[0]?.lease_expires_at, null);

    const blockedAfterCompletion = await client.execute({
      sql: immutableLegacyMutation,
      args: immutableArgs,
    });
    assert.equal(blockedAfterCompletion.rowsAffected, 0);
    const unchanged = await client.execute(
      "SELECT body FROM notes WHERE id='n_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'",
    );
    assert.equal(unchanged.rows[0]?.body, "private");

    await assert.rejects(
      client.execute({
        sql: insert,
        args: ["o_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", ...values.slice(1)],
      }),
      /UNIQUE constraint failed/,
    );
    await assert.rejects(
      client.execute(
        "UPDATE note_task_send_outbox SET status='unknown' WHERE user_id='u-one'",
      ),
      /CHECK constraint failed/,
    );
  } finally {
    client.close();
  }
});
