"use client";

import { AnimatePresence, motion } from "motion/react";
import { forwardRef } from "react";
import type { Note } from "./types";
import { NotePip } from "./note-pip";
import { PromoteMenu } from "./promote-menu";

type Props = {
  notes: Note[];
  highlightId: string | null;
  /** Substring to highlight inside a hit note's body, or null. */
  highlightQuery?: string;
  /** Note id currently being "long-pressed" — shows the press ring + menu. */
  pressedNoteId?: string | null;
  /** True when the promote-menu's "Promote to Tasks" item is being clicked. */
  promotePressed?: boolean;
  /** Note id currently flying off to Tasks — render it ghosted/hidden. */
  promotingNoteId?: string | null;
  /** Callback to register each note's DOM element for animation targeting. */
  onRegister?: (id: string, el: HTMLDivElement | null) => void;
};

/**
 * The stream of captured notes. Newest first.
 *
 * Tag chips animate in with a staggered landing after the note commits.
 * Search highlights wrap matched substrings in a soft accent background.
 * Long-press ring + promote menu appear when pressedNoteId is set.
 * Promoted notes hide (the flying silhouette is rendered separately).
 */
export const NoteStream = forwardRef<HTMLDivElement, Props>(function NoteStream(
  {
    notes,
    highlightId,
    highlightQuery,
    pressedNoteId,
    promotePressed,
    promotingNoteId,
    onRegister,
  },
  _ref
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
          if (promotingNoteId === note.id) return null;
          const isHighlight = highlightId === note.id;
          const isDimmed = highlightId !== null && highlightId !== note.id;
          const isPressed = pressedNoteId === note.id;
          return (
            <motion.div
              key={note.id}
              ref={(el) => {
                onRegister?.(note.id, el);
              }}
              layout
              initial={
                note.fresh
                  ? { opacity: 0, y: -8, scale: 0.985 }
                  : false
              }
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
                  : isPressed
                  ? "0 0 0 2px color-mix(in srgb, var(--color-accent) 22%, transparent)"
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

              {note.tags && note.tags.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 4,
                    marginLeft: 60,
                  }}
                >
                  {note.tags.map((tag, i) => (
                    <motion.span
                      key={tag}
                      initial={
                        note.fresh
                          ? { opacity: 0, scale: 0.7, y: -4 }
                          : false
                      }
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{
                        duration: 0.36,
                        ease: [0.16, 1, 0.3, 1],
                        delay: note.fresh ? 0.18 + i * 0.12 : 0,
                      }}
                      className="font-mono"
                      style={{
                        fontSize: 9.5,
                        color: "var(--color-accent)",
                        background:
                          "color-mix(in srgb, var(--color-accent) 8%, transparent)",
                        borderRadius: 999,
                        padding: "1px 6px",
                        letterSpacing: "0.02em",
                        fontWeight: 600,
                        textTransform: "lowercase",
                      }}
                    >
                      #{tag}
                    </motion.span>
                  ))}
                </div>
              ) : null}

              {/* Long-press ring */}
              {isPressed ? (
                <motion.span
                  aria-hidden
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 0.32, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    position: "absolute",
                    inset: -4,
                    borderRadius: 12,
                    background:
                      "radial-gradient(circle at center, color-mix(in srgb, var(--color-accent) 28%, transparent), transparent 70%)",
                    pointerEvents: "none",
                  }}
                />
              ) : null}

              <PromoteMenu visible={isPressed} pressed={promotePressed} />
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
  const idx = lower.indexOf(query.toLowerCase());
  if (idx === -1) return body;
  const before = body.slice(0, idx);
  const match = body.slice(idx, idx + query.length);
  const after = body.slice(idx + query.length);
  return (
    <>
      {before}
      <mark
        style={{
          background:
            "color-mix(in srgb, var(--color-accent-2) 30%, transparent)",
          color: "var(--color-ink)",
          padding: "1px 3px",
          borderRadius: 3,
        }}
      >
        {match}
      </mark>
      {after}
    </>
  );
}
