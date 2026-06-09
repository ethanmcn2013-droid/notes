import "server-only";

/**
 * N·24 (Pattern 4) — operator kill-switch for the calendar-spawn surface.
 *
 * Two gates protect the calendar pattern:
 *   1. `NOTES_CALENDAR_SPAWN_ENABLED=1` (this file) — operator-level
 *      env flag, OFF by default. Until the operator flips this on,
 *      all calendar routes return 404 and the account-UI section
 *      hides. This is the "operator allow-list" half of the handoff
 *      §6 recommendation.
 *   2. Per-user opt-in — the user must land on the connect endpoint
 *      intentionally (via the account-UI button). We do not surface
 *      a passive prompt or banner; per PRODUCT.md §9 the product is
 *      silent. This is the "per-user opt-in" half.
 *
 * Both gates must be passed: the operator must enable the surface,
 * AND the user must opt in. Either alone is insufficient.
 */
export function calendarSpawnEnabled(): boolean {
  return process.env.NOTES_CALENDAR_SPAWN_ENABLED === "1";
}
