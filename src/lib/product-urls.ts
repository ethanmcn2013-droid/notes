import suiteContracts from "./suite-contracts.v1.json";

const suiteProducts = suiteContracts.products;

/**
 * Sister-product URLs for Signal Notes.
 *
 * Defaults to canonical custom-domain URLs. Override per environment via
 * NEXT_PUBLIC_*_URL on Vercel if a domain is not yet wired.
 *
 * dig results 2026-05-12: tasks/roadmap/signal.signalstudio.ie all resolve
 * to Vercel IPs, safe to use as defaults.
 */
export const STUDIO_URL =
  process.env.NEXT_PUBLIC_STUDIO_URL ?? suiteProducts.studio.canonicalUrl;

export const TASKS_URL =
  process.env.NEXT_PUBLIC_TASKS_URL ?? suiteProducts.tasks.canonicalUrl;

export const TIMELINE_URL =
  process.env.NEXT_PUBLIC_TIMELINE_URL ?? suiteProducts.timeline.canonicalUrl;

export const SIGNAL_URL =
  process.env.NEXT_PUBLIC_SIGNAL_URL ?? suiteProducts.signal.canonicalUrl;

export const NOTES_URL =
  process.env.NEXT_PUBLIC_NOTES_URL ?? suiteProducts.notes.canonicalUrl;

export const IOS_APP_URL =
  process.env.NEXT_PUBLIC_IOS_APP_URL ?? "https://signalstudio.ie/ios";
