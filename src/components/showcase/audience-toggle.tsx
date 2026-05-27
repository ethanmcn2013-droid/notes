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
 * Previous design (N·13): iOS-style segmented control — thick rounded
 * container border + solid black filled pill. Off-brand for Notes: too
 * much chrome, too many competing shapes, the heavy black read "control"
 * not "thought". DESIGN.md §10 refuses glow and heavy shadow elevation;
 * the spirit extends to loud selection states.
 *
 * New design: plain text tabs in a horizontal row. Active state is a
 * hairline underline that slides between labels using a shared-element
 * layout animation. No container border, no filled pill, no shadow.
 * Ink colour shifts slightly on active; otherwise the labels stay quiet.
 * This is the Notes register: the smallest gesture that communicates.
 */
export function AudienceToggle({ domain, onChange }: Props) {
  const active = DOMAINS[domain];
  const reducedMotion = useReducedMotion();

  return (
    <div className="flex flex-col items-start gap-3">
      {/* Description line — changes with audience */}
      <p
        style={{
          fontSize: 13.5,
          lineHeight: 1.5,
          color: "var(--color-ink-faint)",
          letterSpacing: "0.01em",
          margin: 0,
        }}
      >
        <span
          className="font-mono text-[11px] font-semibold uppercase"
          style={{
            color: "var(--color-ink-faint)",
            letterSpacing: "0.12em",
            marginRight: 8,
          }}
        >
          Built for
        </span>
        {active.description}
      </p>

      {/* Tab row — no container border, underline-only active state */}
      <LayoutGroup id="notes-audience-toggle">
        <div
          role="tablist"
          aria-label="Choose an audience"
          className="flex items-end gap-0"
        >
          {DOMAIN_ORDER.map((id, index) => {
            const pack    = DOMAINS[id];
            const isActive = id === domain;
            return (
              <button
                key={id}
                role="tab"
                aria-selected={isActive}
                onClick={() => onChange(id)}
                className="relative pb-2 text-[13px] transition-colors"
                style={{
                  paddingLeft:  index === 0 ? 0 : 16,
                  paddingRight: 16,
                  fontWeight: isActive ? 500 : 400,
                  color: isActive
                    ? "var(--color-ink)"
                    : "var(--color-ink-faint)",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  cursor: "pointer",
                  letterSpacing: "0.005em",
                }}
              >
                {pack.label}

                {/* Sliding underline — shared layout element */}
                {isActive && (
                  <motion.span
                    layoutId="notes-audience-underline"
                    className="absolute bottom-0 left-0 right-0"
                    style={{
                      height: 1.5,
                      background: "var(--color-ink)",
                      borderRadius: 1,
                      marginLeft: index === 0 ? 0 : 16,
                    }}
                    transition={
                      reducedMotion
                        ? { duration: 0 }
                        : { type: "spring", stiffness: 400, damping: 32 }
                    }
                  />
                )}
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
