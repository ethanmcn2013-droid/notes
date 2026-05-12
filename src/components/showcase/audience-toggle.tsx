"use client";

import { motion, LayoutGroup } from "motion/react";
import { DOMAINS, DOMAIN_ORDER, type DomainId } from "@/lib/domains";

type Props = {
  domain: DomainId;
  onChange: (next: DomainId) => void;
};

/**
 * Audience picker for the Notes cinematic capture demo.
 * Mirrors Roadmap + Analytics's pattern with Notes's warm-stone palette —
 * pill tabs with a sliding active marker via motion's layoutId.
 */
export function AudienceToggle({ domain, onChange }: Props) {
  const active = DOMAINS[domain];

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
            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
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
                  color: isActive ? "white" : "var(--color-ink-soft)",
                }}
              >
                {isActive ? (
                  <motion.span
                    layoutId="notes-audience-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-accent) 0%, color-mix(in srgb, var(--color-accent) 70%, black) 100%)",
                      boxShadow:
                        "0 6px 16px -6px color-mix(in srgb, var(--color-accent) 60%, transparent), inset 0 1px 0 rgba(255,255,255,0.18)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 360,
                      damping: 30,
                    }}
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
