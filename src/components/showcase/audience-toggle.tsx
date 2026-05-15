"use client";

import { motion, LayoutGroup, useReducedMotion } from "motion/react";
import { DOMAINS, DOMAIN_ORDER, type DomainId } from "@/lib/domains";

type Props = {
  domain: DomainId;
  onChange: (next: DomainId) => void;
};

/**
 * Audience picker for the Notes capture demo.
 *
 * N·13 (2026-05-16): the prior pill was a gradient-bevel-glow chip
 * (linear-gradient + inset white highlight + coloured drop-shadow).
 * That is the YC-SaaS aesthetic the suite refuses (DESIGN.md §10:
 * "glow blooms", "drop-shadows over hairlines as default elevation").
 * It read as a control lifted from a different app — the exact "this
 * doesn't belong" complaint. Re-skinned to the product's own flat
 * language: hairline container, no shadow, a solid ink active pill
 * (same quiet high-contrast register as the hero CTA, so the page now
 * ties together). The sliding marker stays — a shared-element move is
 * honest motion — but it respects reduced-motion.
 */
export function AudienceToggle({ domain, onChange }: Props) {
  const active = DOMAINS[domain];
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span
          className="font-mono text-[11px] font-semibold uppercase"
          style={{
            color: "var(--color-ink-faint)",
            letterSpacing: "0.14em",
          }}
        >
          Built for
        </span>
        <span
          className="text-[12.5px]"
          style={{ color: "var(--color-ink-soft)" }}
        >
          {active.description}
        </span>
      </div>

      <LayoutGroup id="notes-audience-toggle">
        <div
          role="tablist"
          aria-label="Choose an audience"
          className="relative inline-flex flex-wrap items-center gap-0.5 rounded-full border p-1"
          style={{
            borderColor: "var(--color-line)",
            background: "var(--color-paper)",
          }}
        >
          {DOMAIN_ORDER.map((id) => {
            const pack = DOMAINS[id];
            const isActive = id === domain;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(id)}
                className="relative inline-flex items-center rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors"
                style={{
                  color: isActive
                    ? "var(--color-paper)"
                    : "var(--color-ink-soft)",
                }}
              >
                {isActive ? (
                  <motion.span
                    layoutId="notes-audience-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: "var(--color-ink)" }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 360, damping: 30 }
                    }
                  />
                ) : null}
                <span className="relative z-10">{pack.label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
