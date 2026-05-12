"use client";

import { motion } from "motion/react";

type Props = {
  /** When true, the caret is visible and blinks. */
  active: boolean;
  /** Vertical size in pixels (matches the font's cap height of the field). */
  height?: number;
};

/**
 * The caret. Notes's temporality gesture per the brand-guide handoff:
 * sharp 1.1s on/off, awaiting input. Not a smooth pulse — a held cursor.
 */
export function Caret({ active, height = 18 }: Props) {
  return (
    <motion.span
      aria-hidden
      animate={
        active
          ? { opacity: [1, 1, 0, 0] }
          : { opacity: 0 }
      }
      transition={
        active
          ? {
              duration: 1.1,
              times: [0, 0.5, 0.5, 1],
              repeat: Infinity,
              ease: "linear",
            }
          : { duration: 0.16 }
      }
      style={{
        display: "inline-block",
        width: 2,
        height,
        background: "var(--color-ink)",
        verticalAlign: "text-bottom",
        marginLeft: 1,
        marginBottom: 2,
        borderRadius: 0.5,
      }}
    />
  );
}
