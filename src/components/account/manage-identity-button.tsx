"use client";

import { useClerk } from "@clerk/nextjs";

/**
 * A quiet, hosted path into Clerk's account portal so the "password and
 * sign-in methods live in your account" line isn't a dead end. Opens the
 * Clerk user profile in place. Rendered in the Notes green register with the
 * suite's crafted chevron.
 */
export function ManageIdentityButton() {
  const { openUserProfile } = useClerk();
  return (
    <button
      type="button"
      onClick={() => openUserProfile()}
      className="notes-manage-identity"
    >
      Manage sign-in &amp; profile
      <svg
        className="notes-manage-identity-arrow"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M9 6l6 6-6 6" />
      </svg>
    </button>
  );
}
