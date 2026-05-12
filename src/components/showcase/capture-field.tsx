"use client";

import { AnimatePresence, motion } from "motion/react";
import { Caret } from "./caret";

type Props = {
  /** The text being typed (animation source). Empty string means show placeholder. */
  text: string;
  /** Whether the caret is active in this field. */
  active: boolean;
  /** Placeholder text to show when text is empty. */
  placeholder: string;
};

/**
 * The capture field. Looks like a notebook line. Caret blinks at the end
 * of the current text, or after the placeholder when empty.
 */
export function CaptureField({ text, active, placeholder }: Props) {
  const isEmpty = text.length === 0;

  return (
    <div
      style={{
        background: "var(--color-paper)",
        border: "1px solid var(--color-line)",
        borderRadius: 14,
        padding: "18px 20px",
        minHeight: 64,
        display: "flex",
        alignItems: "center",
        boxShadow: active
          ? "0 0 0 3px color-mix(in srgb, var(--color-accent) 14%, transparent)"
          : "0 1px 0 rgba(0,0,0,0.02)",
        transition: "box-shadow 220ms cubic-bezier(.16,1,.3,1)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-inter)",
          fontSize: 16.5,
          lineHeight: 1.5,
          letterSpacing: "-0.005em",
          color: isEmpty ? "var(--color-ink-faint)" : "var(--color-ink)",
          fontWeight: isEmpty ? 400 : 500,
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <AnimatePresence mode="wait">
          {isEmpty ? (
            <motion.span
              key={`placeholder-${placeholder}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              {placeholder}
            </motion.span>
          ) : (
            <motion.span
              key="text"
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {text}
            </motion.span>
          )}
        </AnimatePresence>
        <Caret active={active} height={20} />
      </div>
    </div>
  );
}
