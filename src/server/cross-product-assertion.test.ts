import assert from "node:assert/strict";
import test from "node:test";
import { createTasksAssertion, assertTasksAssertion } from "./cross-product-assertion";

test("Tasks assertion binds subject and note id", () => {
  const token = createTasksAssertion("user_a", "note_a", "secret", 1_000);
  const claims = assertTasksAssertion(token, "secret", "user_a", "note_a", 1_001);
  assert.equal(claims.sub, "user_a");
  assert.equal(claims.noteId, "note_a");
});

test("Tasks assertion rejects tampering, wrong subject, and expiry", () => {
  const token = createTasksAssertion("user_a", "note_a", "secret", 1_000);
  assert.throws(() => assertTasksAssertion(`${token}x`, "secret", "user_a", "note_a", 1_001));
  assert.throws(() => assertTasksAssertion(token, "secret", "user_b", "note_a", 1_001));
  assert.throws(() => assertTasksAssertion(token, "secret", "user_a", "note_a", 1_301));
});
