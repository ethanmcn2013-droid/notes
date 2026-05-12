"use client";

import { AnimatePresence, motion } from "motion/react";
import type { Note } from "./types";

type Props = {
  notes: Note[];
};

/**
 * Notes grouped by tag. Each tag heading lists the notes that bear it.
 * Notes with no tags appear under an "Untagged" group.
 *
 * Mounted in place of NoteStream when the view toggles to Tags.
 */
export function TagsView({ notes }: Props) {
  // Group notes by tag
  const byTag = new Map<string, Note[]>();
  const untagged: Note[] = [];

  for (const note of notes) {
    if (!note.tags || note.tags.length === 0) {
      untagged.push(note);
      continue;
    }
    for (const tag of note.tags) {
      const arr = byTag.get(tag) ?? [];
      arr.push(note);
      byTag.set(tag, arr);
    }
  }

  const groups = Array.from(byTag.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <AnimatePresence initial={false}>
        {groups.map(([tag, taggedNotes], i) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{
              duration: 0.34,
              ease: [0.16, 1, 0.3, 1],
              delay: i * 0.06,
            }}
          >
            <div
              className="font-mono"
              style={{
                fontSize: 10.5,
                color: "var(--color-accent)",
                background:
                  "color-mix(in srgb, var(--color-accent) 8%, transparent)",
                borderRadius: 999,
                padding: "2px 8px",
                letterSpacing: "0.02em",
                fontWeight: 600,
                textTransform: "lowercase",
                display: "inline-block",
                marginBottom: 8,
              }}
            >
              #{tag}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {taggedNotes.map((note) => (
                <div
                  key={note.id + tag}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "var(--color-paper)",
                    border: "1px solid var(--color-line)",
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                  }}
                >
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color: "var(--color-accent-2)",
                      letterSpacing: "0.04em",
                      flexShrink: 0,
                      fontWeight: 500,
                      textTransform: "lowercase",
                    }}
                  >
                    {note.stamp}
                  </span>
                  <p
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      color: "var(--color-ink)",
                      margin: 0,
                    }}
                  >
                    {note.body}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {untagged.length > 0 ? (
          <motion.div
            key="untagged"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1], delay: groups.length * 0.06 }}
          >
            <div
              className="font-mono"
              style={{
                fontSize: 10.5,
                color: "var(--color-ink-faint)",
                letterSpacing: "0.12em",
                fontWeight: 600,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Untagged
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {untagged.map((note) => (
                <div
                  key={note.id}
                  style={{
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "var(--color-paper)",
                    border: "1px solid var(--color-line)",
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                  }}
                >
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      color: "var(--color-accent-2)",
                      letterSpacing: "0.04em",
                      flexShrink: 0,
                      fontWeight: 500,
                      textTransform: "lowercase",
                    }}
                  >
                    {note.stamp}
                  </span>
                  <p
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      color: "var(--color-ink)",
                      margin: 0,
                    }}
                  >
                    {note.body}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
