/**
 * Notes-register appearance for Clerk's hosted auth widgets.
 *
 * The shared Signal Studio account is one identity across the suite, but each
 * product's *sign-in moment* is rendered in that product's own register
 * (sanctioned by DESIGN.md §14 — "Notes renders the affordance in its own
 * register, protected aesthetic §11"). So the Notes auth surface speaks green,
 * not the suite indigo it would otherwise inherit from the root ClerkProvider.
 *
 * Driven by the `variables` API (the stable, documented surface) so it stays
 * resilient across Clerk versions; `elements` overrides are kept light and
 * additive.
 */
export const notesClerkAppearance = {
  variables: {
    colorPrimary: "#335f54", // --color-accent (Notes green)
    colorText: "#161815", // --color-ink
    colorTextSecondary: "#4c5148", // --color-ink-soft
    colorBackground: "#fffefa", // --color-paper (warm white)
    colorInputBackground: "#ffffff",
    colorInputText: "#161815",
    colorDanger: "#b04848", // --color-error
    fontFamily:
      'var(--font-inter), Inter, system-ui, -apple-system, "Segoe UI", sans-serif',
    borderRadius: "10px",
  },
  elements: {
    // Quiet, warm card — a hairline + a soft lift, not a heavy popover.
    card: {
      border: "1px solid #e3e6da",
      boxShadow:
        "0 1px 2px rgba(22,24,21,0.04), 0 18px 48px rgba(22,24,21,0.06)",
    },
    // Plain-language button — no shouting caps, calm weight.
    formButtonPrimary: {
      textTransform: "none",
      fontWeight: 550,
      letterSpacing: "-0.01em",
    },
    footerActionLink: {
      color: "#335f54",
      fontWeight: 500,
    },
  },
} as const;
