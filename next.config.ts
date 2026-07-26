import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Clerk CSP allowlist (Clerk's documented requirements + a
// robustness move). Clerk's prod Frontend API is a CNAME under our
// own domain — the exact label is set in the Clerk dashboard and is
// NOT visible to this build (no publishable key in the repo). Rather
// than guess `clerk.signalstudio.ie`, allow `https://*.signalstudio.ie`:
// per CSP3 a leading `*` matches any subdomain depth, so whatever
// label Clerk's prod instance uses (clerk., accounts., or a nested
// one) is covered without a deploy-time guess. Dev instances live on
// *.clerk.accounts.dev; Clerk infra/telemetry on *.clerk.com +
// clerk-telemetry.com; bot-protection (Turnstile) on Cloudflare.
const clerkHosts =
  "https://*.signalstudio.ie https://*.clerk.accounts.dev https://*.clerk.com https://clerk-telemetry.com";
const turnstile = "https://challenges.cloudflare.com";

// N·24 (Pattern 4) — Google OAuth handshake hosts. The /connect route
// 302s to accounts.google.com; CSP form-action must allow it or the
// browser blocks the redirect on strict UAs.
const googleOauth = "https://accounts.google.com";

const googleTag = "https://www.googletagmanager.com";
const googleAnalytics =
  "https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com";

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com ${clerkHosts} ${turnstile} https://*.sentry.io ${googleTag}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  `connect-src 'self' https://va.vercel-scripts.com ${clerkHosts} https://*.ingest.sentry.io https://*.ingest.us.sentry.io ${googleTag} ${googleAnalytics}`,
  `frame-src 'self' ${turnstile}`,
  `worker-src 'self' blob:`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self' ${googleOauth}`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
  // CSP violation reporting — collected at /api/csp-report. Notes ENFORCES
  // CSP, so this catches real blocks affecting users, not just would-be ones.
  `report-uri /api/csp-report`,
  `report-to csp`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Reporting-Endpoints", value: 'csp="/api/csp-report"' },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  // `VERCEL_ENV` is server-only, but access-mode safety must make the same
  // production/preview decision in client components. Expose only the coarse
  // deployment posture, never credentials or provider configuration.
  env: {
    NEXT_PUBLIC_SIGNAL_DEPLOYMENT_ENV:
      process.env.VERCEL_ENV ?? (isDev ? "development" : "production"),
  },
  experimental: {
    // Tree-shake heavy barrel imports — Clerk is used in 13 files across
    // the notebook + marketing; the full barrel ships ~6× what we call.
    // Roadmap/Tasks carry the same shape (Phase 6.2).
    optimizePackageImports: ["@clerk/nextjs", "motion"],
  },
  // Consolidation — this domain is being retired. The authed Notes surface
  // moved to /app/notes in the unified app; marketing moved to the umbrella
  // (signalstudio.ie). Redirecting here means visitors never load this app's
  // heavy bundle. Query strings are preserved for attribution (Next forwards
  // them by default). NOT redirected: /sign-in, /sign-up, /api/*, and
  // /app/account (kept until the unified data export/delete ships — P08-007).
  async redirects() {
    return [
      {
        source: "/app",
        destination: "https://app.signalstudio.ie/app/notes",
        permanent: true,
      },
      // Marketing → umbrella (1:1 where it exists, else the umbrella home).
      { source: "/", destination: "https://signalstudio.ie/", permanent: true },
      { source: "/waitlist", destination: "https://signalstudio.ie/waitlist", permanent: true },
      { source: "/anatomy", destination: "https://signalstudio.ie/", permanent: true },
      { source: "/building-project", destination: "https://signalstudio.ie/", permanent: true },
      { source: "/freelance-studio", destination: "https://signalstudio.ie/", permanent: true },
      { source: "/teaching-week", destination: "https://signalstudio.ie/", permanent: true },
      { source: "/wedding-planning", destination: "https://signalstudio.ie/", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      {
        source: "/__design-lab/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
        ],
      },
    ];
  },
};

export default nextConfig;
