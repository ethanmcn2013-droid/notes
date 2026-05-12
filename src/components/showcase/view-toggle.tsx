"use client";

import { motion, LayoutGroup } from "motion/react";

export type ViewMode = "stream" | "tags";

type Props = {
  view: ViewMode;
  onChange?: (next: ViewMode) => void;
};

const ITEMS: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
  {
    id: "stream",
    label: "Stream",
    icon: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 6h18M3 12h18M3 18h12" />
      </svg>
    ),
  },
  {
    id: "tags",
    label: "Tags",
    icon: (
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
];

export function ViewToggle({ view, onChange }: Props) {
  return (
    <LayoutGroup id="notes-view-toggle">
      <div
        role="tablist"
        aria-label="View"
        className="relative inline-flex items-center gap-0.5 rounded-full border p-0.5"
        style={{
          borderColor: "var(--color-line)",
          background: "var(--color-paper)",
        }}
      >
        {ITEMS.map((item) => {
          const isActive = item.id === view;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange?.(item.id)}
              className="relative inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
              style={{
                color: isActive ? "var(--color-ink)" : "var(--color-ink-faint)",
              }}
            >
              {isActive ? (
                <motion.span
                  layoutId="notes-view-pill"
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "var(--color-field)",
                    boxShadow: "inset 0 0 0 1px var(--color-line)",
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {item.icon}
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
