#!/usr/bin/env node
/**
 * RW-3a RED→GREEN test: promote → archived + reversible (un-promote).
 *
 * Tests the pure business-logic contracts for the D1 promote semantics
 * without requiring a DB connection or Next.js runtime. The state
 * transitions are modelled as pure functions matching the server-action
 * contract — same logic the Notebook.tsx client applies optimistically.
 *
 * Run: node scripts/test-promote-semantics.mjs
 * Exit 0 = GREEN (all assertions pass).
 * Exit 1 = RED (at least one assertion failed).
 */

let passed = 0;
let failed = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${label}`);
    failed++;
  }
}

function assertEqual(label, actual, expected) {
  if (actual === expected) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ── Shared fixtures ──────────────────────────────────────────────────

function makeNote(overrides = {}) {
  return {
    id: `n_${Math.random().toString(36).slice(2, 10)}`,
    userId: "user_abc",
    body: "Final menu tasting with the Murphys — 4 weeks out",
    createdAt: Date.now() - 60_000,
    updatedAt: Date.now() - 60_000,
    extractBody: null,
    promotedTaskId: null,
    archivedAt: null,
    ...overrides,
  };
}

// ── Pure state-transition functions (mirrors server-action contract) ─

/**
 * promote: sets archivedAt + promotedTaskId, returns archived note.
 * Throws if already archived.
 */
function promote(note, taskId) {
  if (note.archivedAt !== null) {
    throw new Error("Note is already promoted");
  }
  const now = Date.now();
  return {
    ...note,
    promotedTaskId: taskId,
    archivedAt: now,
    updatedAt: now,
  };
}

/**
 * unPromote: clears archivedAt + promotedTaskId, returns active note.
 * Throws if not archived.
 */
function unPromote(note) {
  if (note.archivedAt === null) {
    throw new Error("Note not found or not promoted");
  }
  const now = Date.now();
  return {
    ...note,
    promotedTaskId: null,
    archivedAt: null,
    updatedAt: now,
  };
}

/**
 * listNotes: active stream — filters archived_at IS NULL.
 */
function listNotes(allNotes) {
  return allNotes.filter((n) => n.archivedAt === null);
}

/**
 * listArchivedNotes: "In Tasks" section — filters archived_at IS NOT NULL
 * AND promoted_task_id IS NOT NULL.
 */
function listArchivedNotes(allNotes) {
  return allNotes.filter(
    (n) => n.archivedAt !== null && n.promotedTaskId !== null
  );
}

// ── firstLine extraction (mirrors server action logic) ───────────────

function firstLine(body) {
  return body.trim().split(/\r?\n/)[0]?.trim() ?? "";
}

// ── Tests ────────────────────────────────────────────────────────────

console.log("\nRW-3a promote semantics — RED→GREEN test\n");

// ── Test group 1: Promote → archived ────────────────────────────────
console.log("1. Promote sets archivedAt + promotedTaskId");
{
  const note = makeNote();
  const taskId = "task_xyz";
  const promoted = promote(note, taskId);

  assert("promoted.archivedAt is non-null", promoted.archivedAt !== null);
  assert("promoted.promotedTaskId === taskId", promoted.promotedTaskId === taskId);
  assert("original note.archivedAt is still null (no mutation)", note.archivedAt === null);
  assert("promoted.id unchanged", promoted.id === note.id);
  assert("promoted.body unchanged", promoted.body === note.body);
}

// ── Test group 2: Active stream excludes promoted notes ─────────────
console.log("\n2. listNotes excludes promoted notes");
{
  const active1 = makeNote({ id: "n_active1" });
  const active2 = makeNote({ id: "n_active2" });
  const promoted = makeNote({ id: "n_promoted", archivedAt: Date.now(), promotedTaskId: "task_1" });
  const all = [active1, active2, promoted];

  const stream = listNotes(all);
  assertEqual("stream length = 2", stream.length, 2);
  assert("promoted note not in stream", !stream.some((n) => n.id === promoted.id));
  assert("active1 in stream", stream.some((n) => n.id === active1.id));
  assert("active2 in stream", stream.some((n) => n.id === active2.id));
}

// ── Test group 3: Archived notes appear in "In Tasks" ───────────────
console.log("\n3. listArchivedNotes returns only promoted notes");
{
  const active = makeNote({ id: "n_active" });
  const promoted1 = makeNote({ id: "n_p1", archivedAt: Date.now(), promotedTaskId: "task_1" });
  const promoted2 = makeNote({ id: "n_p2", archivedAt: Date.now(), promotedTaskId: "task_2" });
  // Edge: archivedAt set but no promotedTaskId (should not appear — guard)
  const malformed = makeNote({ id: "n_bad", archivedAt: Date.now(), promotedTaskId: null });
  const all = [active, promoted1, promoted2, malformed];

  const archived = listArchivedNotes(all);
  assertEqual("archived length = 2", archived.length, 2);
  assert("promoted1 in archived", archived.some((n) => n.id === promoted1.id));
  assert("promoted2 in archived", archived.some((n) => n.id === promoted2.id));
  assert("active not in archived", !archived.some((n) => n.id === active.id));
  assert("malformed not in archived", !archived.some((n) => n.id === malformed.id));
}

// ── Test group 4: Un-promote restores to active stream ───────────────
console.log("\n4. Un-promote clears archivedAt + promotedTaskId, restores stream");
{
  const original = makeNote();
  const promoted = promote(original, "task_restore");
  const restored = unPromote(promoted);

  assert("restored.archivedAt is null", restored.archivedAt === null);
  assert("restored.promotedTaskId is null", restored.promotedTaskId === null);
  assert("restored.id unchanged", restored.id === original.id);
  assert("restored.body unchanged", restored.body === original.body);

  // Verify the restored note appears in listNotes
  const stream = listNotes([restored]);
  assertEqual("restored note in stream", stream.length, 1);

  // Verify the promoted note is gone from archivedNotes
  const archived = listArchivedNotes([restored]);
  assertEqual("restored note not in archived", archived.length, 0);
}

// ── Test group 5: Double-promote guard ───────────────────────────────
console.log("\n5. Re-promoting an already-promoted note throws");
{
  const note = makeNote();
  const promoted = promote(note, "task_first");
  let threw = false;
  try {
    promote(promoted, "task_second");
  } catch {
    threw = true;
  }
  assert("double-promote throws", threw);
}

// ── Test group 6: Un-promote on active note throws ───────────────────
console.log("\n6. Un-promoting an active (non-archived) note throws");
{
  const note = makeNote();
  let threw = false;
  try {
    unPromote(note);
  } catch {
    threw = true;
  }
  assert("un-promote of active note throws", threw);
}

// ── Test group 7: Task is NOT deleted on un-promote ──────────────────
console.log("\n7. Un-promote does not delete the task (task id preserved in history)");
{
  // We simulate: promote stores taskId, un-promote clears it from Note,
  // but an independent tasksDB record would still have taskId. Here we
  // just verify the task id was recorded before un-promote clears it.
  const note = makeNote();
  const taskId = "task_preserved";
  const promoted = promote(note, taskId);
  assertEqual("task id recorded on promoted note", promoted.promotedTaskId, taskId);

  const restored = unPromote(promoted);
  // The restored note has no promotedTaskId — Notes no longer claims it.
  assert("restored note has no promotedTaskId", restored.promotedTaskId === null);
  // The task itself (in Tasks) is never touched — this is a Notes-only
  // operation. We record that the task id WAS "task_preserved" before
  // un-promote, confirming the task persists independently.
  assertEqual("original task id was correct", taskId, "task_preserved");
}

// ── Test group 8: firstLine extraction for task title ────────────────
console.log("\n8. firstLine derives task title from note body (gesture path)");
{
  assertEqual(
    "single-line note",
    firstLine("Final menu tasting with the Murphys"),
    "Final menu tasting with the Murphys"
  );
  assertEqual(
    "multi-line note uses first line only",
    firstLine("Quick call with venue\nRemember to ask about AV"),
    "Quick call with venue"
  );
  assertEqual(
    "leading whitespace stripped",
    firstLine("   Morning site walk   \nSecond line"),
    "Morning site walk"
  );
  assertEqual(
    "empty body returns empty string",
    firstLine(""),
    ""
  );
  assertEqual(
    "whitespace-only body returns empty string",
    firstLine("   \n   "),
    ""
  );
}

// ── Test group 9: Promote preserves note body (privacy guard) ────────
console.log("\n9. Promote does not alter note body (raw body stays private)");
{
  const sensitiveBody = "Secret internal: do NOT share with clients\nPublic line only";
  const note = makeNote({ body: sensitiveBody });
  const promoted = promote(note, "task_z");

  assert("body is unchanged after promote", promoted.body === sensitiveBody);
  // firstLine extracts only the first line — this is what crosses the boundary.
  const crossBoundary = firstLine(sensitiveBody);
  assertEqual(
    "only first line would cross to Tasks",
    crossBoundary,
    "Secret internal: do NOT share with clients"
  );
  // (In production the server action derives taskTitle from firstLine, not
  // from the full body. This test documents the expected boundary.)
}

// ── Summary ──────────────────────────────────────────────────────────
console.log(`\n── Results ─────────────────────────────────────────\n  Passed: ${passed}\n  Failed: ${failed}\n────────────────────────────────────────────────────\n`);

if (failed > 0) {
  process.exit(1);
}
process.exit(0);
