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

const csp = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://va.vercel-scripts.com ${clerkHosts} ${turnstile} https://*.sentry.io`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' data:`,
  `connect-src 'self' https://va.vercel-scripts.com ${clerkHosts} https://*.ingest.sentry.io https://*.ingest.us.sentry.io`,
  `frame-src 'self' ${turnstile}`,
  `worker-src 'self' blob:`,
  `frame-ancestors 'none'`,
  `base-uri 'self'`,
  `form-action 'self' ${googleOauth}`,
  `object-src 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  experimental: {
    // Tree-shake heavy barrel imports — Clerk is used in 13 files across
    // the notebook + marketing; the full barrel ships ~6× what we call.
    // Roadmap/Tasks carry the same shape (Phase 6.2).
    optimizePackageImports: ["@clerk/nextjs", "motion"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
