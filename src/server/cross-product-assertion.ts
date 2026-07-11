import {
  createHmac,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";

/**
 * Short-lived, audience-bound assertion used for server-to-server calls.
 *
 * The assertion carries the already-authenticated subject, so the receiving
 * product never has to trust a user id supplied in a mutable request body.
 * This is intentionally a small HMAC envelope rather than a general JWT
 * dependency: both products already share a secret and need one narrow seam.
 */
export type CrossProductAssertion = {
  v: 1;
  iss: "signal-notes";
  aud: "signal-tasks.notes-extract";
  sub: string;
  noteId: string;
  workspaceId: string;
  iat: number;
  exp: number;
  jti: string;
  traceId: string;
};

const MAX_TTL_SECONDS = 300;

function encode(value: unknown): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

export function createTasksAssertion(
  subject: string,
  noteId: string,
  workspaceId: string,
  secret: string,
  now = Math.floor(Date.now() / 1000),
): string {
  const claims: CrossProductAssertion = {
    v: 1,
    iss: "signal-notes",
    aud: "signal-tasks.notes-extract",
    sub: subject,
    noteId,
    workspaceId,
    iat: now,
    exp: now + MAX_TTL_SECONDS,
    jti: randomUUID(),
    traceId: randomUUID(),
  };
  const encoded = encode(claims);
  const signature = createHmac("sha256", secret)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

export function createTasksPersonalizationAssertion(
  subject: string,
  secret: string,
  now = Math.floor(Date.now() / 1000),
): string {
  const claims = {
    v: 1 as const,
    iss: "signal-notes" as const,
    aud: "signal-tasks.workspace-personalization" as const,
    sub: subject,
    iat: now,
    exp: now + MAX_TTL_SECONDS,
    jti: randomUUID(),
    traceId: randomUUID(),
  };
  const encoded = encode(claims);
  return `${encoded}.${createHmac("sha256", secret).update(encoded).digest("base64url")}`;
}

/** Verify shape and signature locally before sending the assertion onward. */
export function assertTasksAssertion(
  assertion: string,
  secret: string,
  expectedSubject: string,
  expectedNoteId: string,
  expectedWorkspaceId: string,
  now = Math.floor(Date.now() / 1000),
): CrossProductAssertion {
  const [encoded, presented] = assertion.split(".");
  if (!encoded || !presented || presented.length < 32) {
    throw new Error("invalid assertion");
  }
  const expected = createHmac("sha256", secret)
    .update(encoded)
    .digest();
  const received = Buffer.from(presented, "base64url");
  if (received.length !== expected.length || !timingSafeEqual(expected, received)) {
    throw new Error("invalid assertion");
  }
  let claims: Partial<CrossProductAssertion>;
  try {
    claims = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as Partial<CrossProductAssertion>;
  } catch {
    throw new Error("invalid assertion");
  }
  if (
    claims.v !== 1 ||
    claims.iss !== "signal-notes" ||
    claims.aud !== "signal-tasks.notes-extract" ||
    typeof claims.sub !== "string" ||
    claims.sub !== expectedSubject ||
    typeof claims.noteId !== "string" ||
    claims.noteId !== expectedNoteId ||
    typeof claims.workspaceId !== "string" ||
    claims.workspaceId !== expectedWorkspaceId ||
    typeof claims.iat !== "number" ||
    typeof claims.exp !== "number" ||
    typeof claims.jti !== "string" ||
    typeof claims.traceId !== "string" ||
    claims.exp <= now ||
    claims.iat > now + 30 ||
    claims.exp - claims.iat > MAX_TTL_SECONDS
  ) {
    throw new Error("invalid assertion");
  }
  return claims as CrossProductAssertion;
}
