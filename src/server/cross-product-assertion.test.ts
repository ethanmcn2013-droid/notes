import assert from "node:assert/strict";
import test from "node:test";
import {
  createTasksAssertion,
  createTasksExtractAssertionV2,
  createTasksPersonalizationAssertion,
  assertTasksAssertion,
  assertTasksExtractAssertionV2,
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

test("Tasks extract assertion v2 binds the exact approved body fingerprint", () => {
  const approvedBodySha256 = "a".repeat(64);
  const token = createTasksExtractAssertionV2(
    "user_a",
    "note_a",
    "ws_a",
    approvedBodySha256,
    "secret",
    1_000,
  );
  const claims = assertTasksExtractAssertionV2(
    token,
    "secret",
    "user_a",
    "note_a",
    "ws_a",
    approvedBodySha256,
    1_001,
  );
  assert.equal(claims.v, 2);
  assert.equal(claims.approvedBodySha256, approvedBodySha256);
  assert.throws(() =>
    assertTasksExtractAssertionV2(
      token,
      "secret",
      "user_a",
      "note_a",
      "ws_a",
      "b".repeat(64),
      1_001,
    ),
  );
  assert.throws(() =>
    assertTasksExtractAssertionV2(
      `${token}.extra`,
      "secret",
      "user_a",
      "note_a",
      "ws_a",
      approvedBodySha256,
      1_001,
    ),
  );
});

test("Tasks extract endpoint verifier fails closed for v1 assertions", () => {
  const legacy = createTasksAssertion(
    "user_a",
    "note_a",
    "ws_a",
    "secret",
    1_000,
  );
  assert.throws(() =>
    assertTasksExtractAssertionV2(
      legacy,
      "secret",
      "user_a",
      "note_a",
      "ws_a",
      "a".repeat(64),
      1_001,
    ),
  );
  assert.throws(() =>
    createTasksExtractAssertionV2(
      "user_a",
      "note_a",
      "ws_a",
      "A".repeat(64),
      "secret",
      1_000,
    ),
  );
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
