"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Note } from "./types";
import { NotePip } from "./note-pip";

type Props = {
  notes: Note[];
  highlightId: string | null;
};

/**
 * The stream of captured notes. Newest first. Items animate in on commit.
 * Search hits get a subtle ring; misses dim slightly so the eye lands on
 * the match without any "result count" UI fanfare.
 *
 * Tag chips render next to the timestamp pip when a note has tags.
 */
export function NoteStream({ notes, highlightId }: Props) {
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
                  {note.body}
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
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
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
                    </span>
                  ))}
                </div>
              ) : null}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
