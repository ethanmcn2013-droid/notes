import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

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
 */

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
