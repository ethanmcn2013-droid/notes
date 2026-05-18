"use client";

import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import {
  ANALYTICS_URL,
  NOTES_URL,
  ROADMAP_URL,
  TASKS_URL,
} from "@/lib/product-urls";

type ProductSlug = "tasks" | "roadmap" | "notes" | "analytics";

/**
 * App-entry deep-links. Labels are the canonical cross-product set per
 * IA_COHERENCE.md §1C and §4B: lowercase product noun, plain "Open [product]".
 *
 * Product order (operator-directed 2026-05-18): notes → tasks → roadmap → analytics.
 * Current product is excluded at render.
 *
 * Retired variants (do not restore):
 *   "Open the workspace" → "Open tasks"
 *   "Open the roadmap"   → "Open roadmap"
 *   "Open the notebook"  → "Open notes"
 *   "Open the briefing"  → "Open analytics"
 */
const PRODUCTS: { slug: ProductSlug; label: string; url: string }[] = [
  { slug: "notes",     label: "Open notes",      url: `${NOTES_URL}/app` },
  { slug: "tasks",     label: "Open tasks",      url: `${TASKS_URL}/app` },
  { slug: "roadmap",   label: "Open roadmap",    url: `${ROADMAP_URL}/app` },
  { slug: "analytics", label: "Open analytics",  url: `${ANALYTICS_URL}/app` },
];

/** Cookie name per DESIGN.md §14 escape hatch spec. */
const PREVIEW_COOKIE = "signal_preview_public";

function readPreviewCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie
    .split(";")
    .some((c) => c.trim() === `${PREVIEW_COOKIE}=1`);
}

/**
 * Sets the short-lived same-site cookie that suppresses the M→app
 * redirect so the operator can demo the marketing page while signed in.
 * Per DESIGN.md §14: "max-age=86400; SameSite=Strict".
 */
function setPreviewCookie() {
  document.cookie = `${PREVIEW_COOKIE}=1; path=/; max-age=86400; SameSite=Strict`;
}

/** Clears the preview cookie so the redirect is restored. */
function clearPreviewCookie() {
  document.cookie = `${PREVIEW_COOKIE}=; path=/; max-age=0; SameSite=Strict`;
}

function ArrowIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17L17 7M17 7H8M17 7v9" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function ExitIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

/**
 * Notes-flavoured Clerk UserButton — h-7 avatar (matching the smaller
 * Notes suitebar register) plus:
 *   - "Open [Sibling]" links to each product's /app entry (§14 authed spec)
 *   - "View public site" / "Exit preview" escape hatch (§14 operator feature)
 *
 * The escape hatch sets/clears a short-lived cookie that suppresses the
 * M→app redirect, enabling the operator to demo the marketing surface
 * while signed in (venue sales motion, screen recordings).
 * Security note: this only suppresses a convenience redirect — it does
 * not alter auth state or expose private data.
 */
export function UserButtonWithSuite({ current }: { current: ProductSlug }) {
  const [isPreview, setIsPreview] = useState(false);
  // Item 4: detect whether user has uploaded a custom avatar.
  // Clerk API: useUser() → user.hasImage; useClerk() → openUserProfile().
  const { user } = useUser();
  const { openUserProfile } = useClerk();
  const hasPhoto = user?.hasImage ?? true; // default true → no flicker on load

  useEffect(() => {
    setIsPreview(readPreviewCookie());
  }, []);

  function handleViewPublic() {
    setPreviewCookie();
    setIsPreview(true);
    // Reload so the middleware sees the cookie and passes through.
    window.location.reload();
  }

  function handleExitPreview() {
    clearPreviewCookie();
    setIsPreview(false);
    window.location.reload();
  }

  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "h-7 w-7",
        },
      }}
    >
      <UserButton.MenuItems>
        {/* Item 4: surface avatar upload when user hasn't added a photo yet.
            Opens Clerk's built-in <UserProfile> modal (avatar is on tab 1).
            manageAccount is always available as the full profile entry. */}
        {!hasPhoto ? (
          <UserButton.Action
            label="Add a photo"
            labelIcon={<CameraIcon />}
            onClick={() => openUserProfile()}
          />
        ) : null}
        <UserButton.Action label="manageAccount" />
        {/* Sibling product links — deep-link to /app entry, not marketing */}
        {PRODUCTS.filter((p) => p.slug !== current).map((p) => (
          <UserButton.Link
            key={p.slug}
            label={p.label}
            href={p.url}
            labelIcon={<ArrowIcon />}
          />
        ))}
        {/* Owner-only escape hatch: view marketing while signed in.
            Per DESIGN.md §14: "visible only when authed". This entire
            component only renders inside authed surfaces, so no guard needed. */}
        {isPreview ? (
          <UserButton.Action
            label="Exit preview"
            labelIcon={<ExitIcon />}
            onClick={handleExitPreview}
          />
        ) : (
          <UserButton.Action
            label="View public site"
            labelIcon={<EyeIcon />}
            onClick={handleViewPublic}
          />
        )}
      </UserButton.MenuItems>
    </UserButton>
  );
}
