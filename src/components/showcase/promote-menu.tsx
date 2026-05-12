"use client";

import { AnimatePresence, motion } from "motion/react";

type Props = {
  /** When set, menu renders at this position over the note. */
  visible: boolean;
  /** When true, the "Promote to Tasks" item is hover-pressed. */
  pressed?: boolean;
};

/**
 * Inline context menu that appears beside a long-pressed note.
 * Only one menu item — the locked Notes→Tasks promotion. No auto-detect,
 * no other actions; the discipline is the differentiator.
 */
export function PromoteMenu({ visible, pressed }: Props) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-30%)",
            marginTop: 6,
            zIndex: 20,
            background: "var(--color-paper)",
            border: "1px solid var(--color-line-strong)",
            borderRadius: 10,
            boxShadow: "0 8px 24px -8px rgba(0,0,0,0.18)",
            padding: 4,
            minWidth: 180,
          }}
        >
          <motion.div
            animate={{
              background: pressed
                ? "color-mix(in srgb, var(--color-accent) 12%, transparent)"
                : "transparent",
            }}
            transition={{ duration: 0.18 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              borderRadius: 6,
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              style={{ color: "var(--color-accent)" }}
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-ink)",
              }}
            >
              Promote to Tasks
            </span>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
