"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AudienceToggle } from "./audience-toggle";
import { NotesDemo } from "./notes-demo";
import { type DomainId } from "@/lib/domains";

/**
 * Notes live-demo section.
 *
 * The animated wordmark above is the hero; this section begins the product
 * proof immediately afterward: promise copy, audience toggle, and the live
 * notebook surface. CTAs live only in the closing section.
 */
export function Hero() {
  const [domain, setDomain] = useState<DomainId>("wedding");

  return (
    <section
      style={{
        paddingTop: 48,
        paddingBottom: 0,
      }}
    >
      <p
        className="font-mono"
        style={{
          marginBottom: 18,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--color-ink-faint)",
        }}
      >
        Signal Notes <span style={{ color: "var(--color-accent-2)" }}>·</span>{" "}
        capture clarity
      </p>

      <h1
        style={{
          fontSize: "clamp(2.6rem, 1.6rem + 4vw, 5rem)",
          fontWeight: 600,
          lineHeight: 0.98,
          letterSpacing: "-0.045em",
          color: "var(--color-ink)",
          margin: 0,
          marginBottom: 0,
        }}
      >
        Not everything is
        <br />
        ready for the room.
        <br />
        Write it here first.
      </h1>

      <p
        style={{
          marginTop: 28,
          maxWidth: "36rem",
          fontSize: 17,
          lineHeight: 1.6,
          color: "var(--color-ink-soft)",
        }}
      >
        The half-formed thought. The thing said in passing. Write it down in
        three seconds. Decide later what becomes work.
      </p>

      <p
        className="font-mono"
        style={{
          marginTop: 24,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: "var(--color-ink-faint)",
          letterSpacing: "0.02em",
          textTransform: "lowercase",
        }}
      >
        <span
          className="note-hero-pip"
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--color-accent)",
            display: "inline-block",
          }}
        />
        A real notebook · choose whose week
      </p>

      <div id="demo" style={{ marginTop: 48, scrollMarginTop: 80 }}>
        <AudienceToggle domain={domain} onChange={setDomain} />
      </div>

      <div style={{ marginTop: 16, marginBottom: 24 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={domain}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.32, ease: [0.0, 0.0, 0.2, 1] }}
          >
            <NotesDemo domain={domain} />
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        /* The pip blinks on the product's own caret rhythm
           (notes-dot-caret, defined globally for the wordmark dot) — not
           an invented pulse. Same gesture, same timing. */
        .note-hero-pip {
          animation: notes-dot-caret 1.1s steps(1, end) infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .note-hero-pip { animation: none; opacity: 1; transform: none; }
        }
      `}</style>
    </section>
  );
}
