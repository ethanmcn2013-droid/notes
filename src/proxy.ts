import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Next.js 16 renamed middleware → proxy. File lives at src/proxy.ts
 * and the exported function must be named `proxy` (or default export).
 *
 * Public surface: the marketing homepage + sign-in / sign-up + the
 * worked-example pages. Everything under /app requires a real Clerk
 * session.
 *
 * NOTE: every new public marketing/example route MUST be added here.
 * Build + typecheck pass regardless; the gate only shows as a 307 to
 * /sign-in on the live URL. Verify new public pages against prod.
 *
 * Graceful dev bypass: when Clerk env keys are unset the handler
 * returns early so the app runs locally before keys are provisioned.
 * Server actions in /server/actions/notes.ts still call requireUser()
 * so they'll fail closed in that case.
 *
 * ── Layer 2 · Seamless ecosystem redirect (DESIGN.md §14) ────────────
 * Authed visitors landing on M routes are redirected to /app (the
 * notebook). This is routing + nav presentation only — session infra
 * is unchanged.
 *
 * M routes (notes.signalstudio.ie): / (+ /method /pricing /about if
 * they ever exist). Per Layer 0 allowlist.
 *
 * NOT redirected (pass-through):
 *   A = /app, /app/*        — the authed destination itself
 *   X = /sign-in, /sign-up, /api/*, /og/*, static assets
 *   C = /wedding-planning, /building-project, /teaching-week,
 *       /freelance-studio   — audience showcase pages, publicly linked
 *
 * Preview escape hatch (DESIGN.md §14):
 *   cookie signal_preview_public=1  OR  ?preview=public suppresses
 *   the redirect so the operator can demo the marketing page while
 *   signed in (venue sales motion, screen recordings).
 *   This is perceived continuity, not a true SPA.
 */

/** Marketing routes: authed user → 307 /app */
const MARKETING_PATHS = new Set(["/", "/method", "/pricing", "/about"]);

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/wedding-planning",
  "/wedding-planning/(.*)",
  "/building-project",
  "/building-project/(.*)",
  "/teaching-week",
  "/teaching-week/(.*)",
  "/freelance-studio",
  "/freelance-studio/(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/opengraph-image",
  "/opengraph-image/(.*)",
  // Inbound webhooks bring their own bearer auth and have no Clerk
  // session. They must bypass clerkMiddleware or Resend's POST gets
  // 307-redirected to /sign-in and the mail loop silently fails.
  "/api/capture/email",
]);

const clerkConfigured = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.CLERK_SECRET_KEY
);

export default clerkMiddleware(async (auth, req) => {
  if (!clerkConfigured) return;

  const { pathname, searchParams } = req.nextUrl;

  // ── Layer 2: M → /app redirect ──────────────────────────────────
  // Only fires on M routes. A/C/X routes are never touched.
  if (MARKETING_PATHS.has(pathname)) {
    // Read auth state from the __session cookie directly (fast path,
    // no Clerk round-trip). The shared Clerk PROD instance sets
    // __session across *.signalstudio.ie; we rely on its presence.
    const isAuthed = Boolean(req.cookies.get("__session")?.value);
    const isPreview =
      req.cookies.get("signal_preview_public")?.value === "1" ||
      searchParams.get("preview") === "public";

    if (isAuthed && !isPreview) {
      // Authed on a marketing route → send to the notebook.
      // 307 (Temporary Redirect) preserves the method and signals this
      // is not a permanent move (the public page still exists).
      return NextResponse.redirect(new URL("/app", req.url), 307);
    }
  }
  // ── End Layer 2 ─────────────────────────────────────────────────

  // Clerk auth protection: non-public routes require a session.
  if (!isPublicRoute(req)) {
    await auth.protect({
      unauthenticatedUrl: new URL("/sign-in", req.url).toString(),
    });
  }
});

export const config = {
  matcher: [
    // Skip Next internals + static assets.
    "/((?!_next|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ttf|eot|ico|css|js|html)$).*)",
    "/(api|trpc)(.*)",
  ],
};
