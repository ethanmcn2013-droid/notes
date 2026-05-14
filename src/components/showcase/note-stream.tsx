"use client";

import { AnimatePresence, motion } from "motion/react";
import { forwardRef } from "react";
import type { Note } from "./types";
import { NotePip } from "./note-pip";

type Props = {
  notes: Note[];
  highlightId: string | null;
  /** Substring to highlight inside a hit note's body, or null. */
  highlightQuery?: string;
  /** Callback to register each note's DOM element for animation targeting. */
  onRegister?: (id: string, el: HTMLDivElement | null) => void;
};

/**
 * The stream of captured notes. Newest first.
 *
 * Search highlights wrap matched substrings in a soft accent background.
 *
 * The previous version of this component rendered #tag chips and a
 * long-press → "Promote to Tasks" menu — both of which contradicted
 * PRODUCT.md (§7 "no taxonomy, no required tagging"; §11 deliberate
 * two-step extraction). Removed 2026-05-13 as part of the suite review
 * pass. The extract-to-Tasks beat needs to be reintroduced with the
 * shipped Draft-action → Send pattern; left out for now rather than
 * mis-represent it.
 */
export const NoteStream = forwardRef<HTMLDivElement, Props>(function NoteStream(
  { notes, highlightId, highlightQuery, onRegister },
  _ref,
) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <AnimatePresence initial={false}>
        {notes.map((note) => {
          const isHighlight = highlightId === note.id;
          const isDimmed = highlightId !== null && highlightId !== note.id;
          return (
            <motion.div
              key={note.id}
              ref={(el) => {
                onRegister?.(note.id, el);
              }}
              layout
              initial={note.fresh ? { opacity: 0, y: -8, scale: 0.985 } : false}
              animate={{
                opacity: isDimmed ? 0.42 : 1,
                y: 0,
                scale: 1,
              }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                opacity: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                y: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
                scale: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
                layout: { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
              }}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: "12px 16px",
                borderRadius: 10,
                background: "var(--color-paper)",
                border: "1px solid var(--color-line)",
                boxShadow: isHighlight
                  ? "0 0 0 2px color-mix(in srgb, var(--color-accent) 32%, transparent)"
                  : "none",
                transition: "box-shadow 220ms cubic-bezier(.16,1,.3,1)",
              }}
            >
              <div className="flex items-start gap-3">
                <NotePip stamp={note.stamp} />
                <p
                  style={{
                    fontFamily: "var(--font-inter)",
                    fontSize: 14.5,
                    lineHeight: 1.5,
                    color: "var(--color-ink)",
                    margin: 0,
                    fontWeight: 400,
                    flex: 1,
                  }}
                >
                  {isHighlight && highlightQuery
                    ? renderWithHighlight(note.body, highlightQuery)
                    : note.body}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
});

/** Render body with the query substring wrapped in a highlight. */
function renderWithHighlight(body: string, query: string) {
  if (!query) return body;
  const lower = body.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx < 0) return body;
  return (
    <>
      {body.slice(0, idx)}
      <span
        style={{
          background:
            "color-mix(in srgb, var(--color-accent) 18%, transparent)",
          borderRadius: 4,
          padding: "0 2px",
          margin: "0 -2px",
        }}
      >
        {body.slice(idx, idx + q.length)}
      </span>
      {body.slice(idx + q.length)}
    </>
  );
}
