#!/usr/bin/env node

/**
 * Calendar cron auth contract.
 *
 * The operator kill-switch may leave calendar spawning disabled for long
 * periods. The cron endpoint must still reject unauthenticated traffic before
 * returning the quiet `{ disabled: true }` response used by Vercel Cron.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

const routePath = path.join(
  process.cwd(),
  "src",
  "app",
  "api",
  "calendar",
  "cron",
  "route.ts",
);
const source = readFileSync(routePath, "utf8");
const authGuard = source.indexOf("if (!authOk(req))");
const featureGate = source.indexOf("if (!calendarSpawnEnabled())");

assert.notEqual(authGuard, -1, "calendar cron must retain its bearer-auth guard");
assert.notEqual(
  featureGate,
  -1,
  "calendar cron must retain its operator feature gate",
);
assert.ok(
  authGuard < featureGate,
  "calendar cron must authenticate before the disabled feature response",
);
assert.match(
  source.slice(authGuard, featureGate),
  /error:\s*"unauthorized"[\s\S]*status:\s*401/,
  "calendar cron auth refusal must remain an HTTP 401",
);

console.log("[calendar-cron-auth-contract] ok");
