/**
 * Sister-product URLs for Signal Notes.
 *
 * Defaults to canonical custom-domain URLs. Override per environment via
 * NEXT_PUBLIC_*_URL on Vercel if a domain is not yet wired.
 *
 * dig results 2026-05-12: tasks/roadmap/analytics.signalstudio.ie all resolve
 * to Vercel IPs — safe to use as defaults.
 */
export const STUDIO_URL =
  process.env.NEXT_PUBLIC_STUDIO_URL ?? "https://signalstudio.ie";

export const TASKS_URL =
  process.env.NEXT_PUBLIC_TASKS_URL ?? "https://tasks.signalstudio.ie";

export const ROADMAP_URL =
  process.env.NEXT_PUBLIC_ROADMAP_URL ?? "https://roadmap.signalstudio.ie";

export const ANALYTICS_URL =
  process.env.NEXT_PUBLIC_ANALYTICS_URL ?? "https://analytics.signalstudio.ie";

export const NOTES_URL =
  process.env.NEXT_PUBLIC_NOTES_URL ?? "https://notes.signalstudio.ie";
