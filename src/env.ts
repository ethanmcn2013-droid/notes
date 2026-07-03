import "server-only";
import { isDemoMode } from "@/lib/access-mode";

/**
 * Boot-time environment validation for Signal Notes.
 *
 * Same pattern as the Signal (analytics) repo: enforce the vars the app
 * cannot run without in REAL production (skip demo/review/dev), throwing an
 * aggregated error at boot rather than letting a missing secret surface as a
 * runtime 500 deep in a request. Dependency-free; called once from
 * instrumentation.ts `register()`.
 */

// Notes cannot serve real users without these.
const REQUIRED_IN_PRODUCTION: ReadonlyArray<readonly [string, string]> = [
  ["TURSO_DATABASE_URL", "notes database"],
  ["TURSO_AUTH_TOKEN", "notes database auth token"],
  ["NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "Clerk auth (browser key)"],
  ["CLERK_SECRET_KEY", "Clerk auth (server key)"],
];

// Specific features break without these, but the app still boots.
const RECOMMENDED_IN_PRODUCTION: ReadonlyArray<readonly [string, string]> = [
  ["CRON_SECRET", "calendar-spawn cron authentication"],
  ["NOTES_CAPTURE_INBOUND_SECRET", "inbound capture@ email"],
];

let validated = false;

export function validateEnv(): void {
  if (validated) return;
  validated = true;

  const isProd = process.env.NODE_ENV === "production";
  if (!isProd || isDemoMode()) return; // dev / demo / review: nothing to enforce

  const missingRecommended = RECOMMENDED_IN_PRODUCTION.filter(
    ([key]) => !process.env[key],
  );
  if (missingRecommended.length > 0) {
    console.warn(
      "[env] missing recommended production variables (features degraded):\n" +
        missingRecommended.map(([k, why]) => `  - ${k}, ${why}`).join("\n"),
    );
  }

  const missingRequired = REQUIRED_IN_PRODUCTION.filter(
    ([key]) => !process.env[key],
  );
  if (missingRequired.length > 0) {
    const detail = missingRequired
      .map(([k, why]) => `  - ${k}, ${why}`)
      .join("\n");
    throw new Error(
      `[env] FATAL: missing required production environment variables:\n${detail}\n\n` +
        "Set them in the Vercel project (or run in demo/review mode). Refusing to " +
        "boot a half-configured production environment, this would otherwise 500 " +
        "every authenticated request at runtime instead of failing here, visibly.",
    );
  }
}
