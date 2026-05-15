"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { AudienceToggle } from "./audience-toggle";
import { NotesDemo } from "./notes-demo";
import { type DomainId } from "@/lib/domains";

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
          href="/wedding-planning"
          className="inline-flex min-h-11 items-center rounded-full border px-5 text-[14px] font-medium transition-colors"
          style={{
            borderColor: "var(--color-line-strong)",
            color: "var(--color-ink-soft)",
          }}
        >
          See a worked example
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
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "var(--color-accent)",
            animation: "noteHeroPulse 2.2s ease-in-out infinite",
            display: "inline-block",
          }}
        />
        Demo is live · choose an audience to reseed
      </p>

      <div style={{ marginTop: 56 }}>
        <AudienceToggle domain={domain} onChange={setDomain} />
      </div>

      <div style={{ marginTop: 32, marginBottom: 24 }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={domain}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          >
            <NotesDemo domain={domain} />
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes noteHeroPulse {
          0%, 100% { opacity: 0.65; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.18); }
        }
      `}</style>
    </section>
  );
}
