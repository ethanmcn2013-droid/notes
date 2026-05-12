"use client";

import { motion } from "motion/react";

type Props = {
  /** True during the promote → flight beat — pulse to draw the eye. */
  active: boolean;
};

/**
 * The "Tasks" edge indicator on the right side of the demo surface.
 * The promote-to-Tasks gesture flies a card silhouette toward this
 * target — makes the one-way Notes → Tasks promotion legible.
 */
export function TasksEdge({ active }: Props) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        right: 0,
        top: "50%",
        transform: "translate(50%, -50%)",
        zIndex: 5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <motion.div
        animate={{
          background: active
            ? "color-mix(in srgb, var(--color-accent) 28%, var(--color-paper))"
            : "var(--color-paper)",
          borderColor: active ? "var(--color-accent)" : "var(--color-line)",
          scale: active ? 1.06 : 1,
        }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          border: "1px solid",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 14px -4px rgba(0,0,0,0.12)",
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: active ? "var(--color-accent)" : "var(--color-ink-soft)",
          }}
        >
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </motion.div>
      <span
        className="font-mono"
        style={{
          fontSize: 9.5,
          fontWeight: 600,
          color: active ? "var(--color-accent)" : "var(--color-ink-faint)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          transition: "color 220ms ease",
        }}
      >
        Tasks
      </span>
    </div>
  );
}
