/**
 * clear-demo-notes.mjs — delete all notes for a given DEMO_USER_ID.
 *
 * E4: companion to seed-demo-notes.mjs. Allows a clean recording reset
 * without manual Turso surgery. The seed+clear pair gives a repeatable,
 * auditable demo-state flow.
 *
 * Usage (from repo root):
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... DEMO_USER_ID=user_xxx \
 *     node scripts/clear-demo-notes.mjs
 *
 * The DEMO_USER_ID must be supplied explicitly — no default. This is
 * intentional: a missing env-var must be a loud error, not a silent
 * no-op against whatever ID the environment happens to carry.
 *
 * OPERATOR-ONLY: running this against the production DB permanently
 * deletes data. Only execute on the demo/recording Turso instance or
 * after confirming the target DEMO_USER_ID is a recording-only account.
 * Do NOT execute from an agent without operator confirmation.
 */

import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
const userId = process.env.DEMO_USER_ID;

if (!url) {
  console.error("Error: TURSO_DATABASE_URL is required");
  process.exit(1);
}
if (!userId) {
  console.error("Error: DEMO_USER_ID is required — no default to prevent accidental deletes");
  process.exit(1);
}

const client = createClient({ url, authToken });

// Count before
const beforeResult = await client.execute({
  sql: `SELECT COUNT(*) AS n FROM notes WHERE user_id = ?`,
  args: [userId],
});
const before = Number(beforeResult.rows[0]?.n ?? 0);

console.log(`Target user: ${userId}`);
console.log(`Notes before: ${before}`);

if (before === 0) {
  console.log("Nothing to delete.");
  process.exit(0);
}

await client.execute({
  sql: `DELETE FROM notes WHERE user_id = ?`,
  args: [userId],
});

// Count after to confirm
const afterResult = await client.execute({
  sql: `SELECT COUNT(*) AS n FROM notes WHERE user_id = ?`,
  args: [userId],
});
const after = Number(afterResult.rows[0]?.n ?? 0);

console.log(`Notes after:  ${after}`);
console.log(`Deleted:      ${before - after}`);

if (after !== 0) {
  console.error("Warning: some notes may not have been deleted — check Turso permissions.");
  process.exit(1);
}

console.log("Done.");
process.exit(0);
