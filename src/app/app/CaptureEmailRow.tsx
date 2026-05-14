"use client";

import { useState } from "react";

type CaptureState =
  | { tier: "pro"; address: string }
  | { tier: "free" };

const PRICING_URL = "https://signalstudio.ie/pricing";

/**
 * Inline footer-row beneath the stream surface. Reveals the user's
 * capture-by-email address (workspace+ tier) or the upgrade pitch
 * (free tier). Deliberately quiet — capture-by-email is a power-
 * user surface and shouldn't compete with the capture field.
 *
 * Click-to-copy mirrors the PRODUCT.md §5 budget: power users
 * already in muscle memory shouldn't need a modal.
 */
export function CaptureEmailRow({ state }: { state: CaptureState }) {
  const [copied, setCopied] = useState(false);

  if (state.tier === "free") {
    return (
      <p className="capture-email capture-email--free">
        <span aria-hidden>✉</span>
        <span>Capture by email — <a href={PRICING_URL} target="_blank" rel="noopener noreferrer">Workspace tier</a>.</span>
      </p>
    );
  }

  const address = state.address;
  function onCopy() {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    });
  }

  return (
    <p className="capture-email capture-email--pro">
      <span aria-hidden>✉</span>
      <span>Email a note: </span>
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy capture email address"
        className="capture-email__address"
      >
        <code>{address}</code>
        <span className="capture-email__hint">{copied ? "copied" : "copy"}</span>
      </button>
    </p>
  );
}
