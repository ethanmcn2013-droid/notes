import assert from "node:assert/strict";
import test from "node:test";
import {
  createTasksAssertion,
  createTasksPersonalizationAssertion,
  assertTasksAssertion,
} from "./cross-product-assertion";

test("Tasks assertion binds subject and note id", () => {
  const token = createTasksAssertion("user_a", "note_a", "ws_a", "secret", 1_000);
  const claims = assertTasksAssertion(token, "secret", "user_a", "note_a", "ws_a", 1_001);
  assert.equal(claims.sub, "user_a");
  assert.equal(claims.noteId, "note_a");
});

test("Tasks assertion rejects tampering, wrong subject, and expiry", () => {
  const token = createTasksAssertion("user_a", "note_a", "ws_a", "secret", 1_000);
  assert.throws(() => assertTasksAssertion(`${token}x`, "secret", "user_a", "note_a", "ws_a", 1_001));
  assert.throws(() => assertTasksAssertion(token, "secret", "user_b", "note_a", "ws_a", 1_001));
  assert.throws(() => assertTasksAssertion(token, "secret", "user_a", "note_a", "ws_b", 1_001));
  assert.throws(() => assertTasksAssertion(token, "secret", "user_a", "note_a", "ws_a", 1_301));
});

test("personalization assertion is audience-bound and subject-bound", () => {
  const token = createTasksPersonalizationAssertion("user_a", "secret", 1_000);
  const [encoded] = token.split(".");
  const claims = JSON.parse(Buffer.from(encoded!, "base64url").toString("utf8")) as Record<string, unknown>;
  assert.equal(claims.iss, "signal-notes");
  assert.equal(claims.aud, "signal-tasks.workspace-personalization");
  assert.equal(claims.sub, "user_a");
  assert.equal(typeof claims.jti, "string");
});
