"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { AudienceToggle } from "./audience-toggle";
import { NotesDemo } from "./notes-demo";
import { type DomainId } from "@/lib/domains";
import { WORKED_EXAMPLE_BY_DOMAIN } from "@/components/worked-examples";

/**
 * Notes homepage hero — modelled on Tasks's hero pattern.
 * Eyebrow + H1 + body + CTAs + status pip + audience toggle, with the
 * notebook demo as the dominant artifact below.
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

      <div
        style={{
          marginTop: 32,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link
          href="/app"
          className="inline-flex min-h-11 items-center rounded-full px-5 text-[14px] font-medium transition-opacity hover:opacity-90"
          style={{
            background: "var(--color-ink)",
            color: "var(--color-paper)",
          }}
        >
          Open the notebook
        </Link>
        <Link
          href={WORKED_EXAMPLE_BY_DOMAIN[domain].href}
          className="inline-flex min-h-11 items-center rounded-full border px-5 text-[14px] font-medium transition-colors"
          style={{
            borderColor: "var(--color-line-strong)",
            color: "var(--color-ink-soft)",
          }}
        >
          {WORKED_EXAMPLE_BY_DOMAIN[domain].label}
        </Link>
      </div>

      <p
        className="font-mono"
        style={{
          marginTop: 14,
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

      {/* The toggle controls the demo below it — group the two as one
          unit and open a clear break from the hero CTA cluster so the
          toggle stops reading as a second row of CTA buttons. */}
      <div style={{ marginTop: 88 }}>
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
