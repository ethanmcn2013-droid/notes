/**
 * Sister-product URLs for Signal Notes.
 *
 * Defaults to canonical custom-domain URLs. Override per environment via
 * NEXT_PUBLIC_*_URL on Vercel if a domain is not yet wired.
 *
 * dig results 2026-05-12: tasks/roadmap/signal.signalstudio.ie all resolve
 * to Vercel IPs — safe to use as defaults.
 */
export const STUDIO_URL =
  process.env.NEXT_PUBLIC_STUDIO_URL ?? "https://signalstudio.ie";

export const TASKS_URL =
  process.env.NEXT_PUBLIC_TASKS_URL ?? "https://tasks.signalstudio.ie";

export const TIMELINE_URL =
  process.env.NEXT_PUBLIC_TIMELINE_URL ?? "https://timeline.signalstudio.ie";

export const SIGNAL_URL =
  process.env.NEXT_PUBLIC_SIGNAL_URL ?? "https://signal.signalstudio.ie";

export const NOTES_URL =
  process.env.NEXT_PUBLIC_NOTES_URL ?? "https://notes.signalstudio.ie";
