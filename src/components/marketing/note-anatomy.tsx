"use client";

import {
  AnimatePresence,
  MotionConfig,
  motion,
  useInView,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";

/**
 * Anatomy of a note, the marketing decomposition.
 *
 * Modelled on Tasks's "Anatomy of a card" pattern (shared state-machine
 * choreography + numbered slot annotations + hover-spotlight + reduced-
 * motion fallback), earns its own quieter register. Tasks loops every
 * ~15s with live-presence beats; Notes loops every ~11s with a long
 * settle pause built in. M·05 *settle* (the slowest motion in the suite
 * by design) is honored, no infinite ticking, no live presence, no
 * typing animation (Notes never simulates typing).
 *
 * Five honest slots, title, preview, stamp, tasks-extract pip, action
 * draft. The title is the first line of the body, NOT a
 * separate field, that is the differentiator and the anatomy makes it
 * visible in the type scale (semibold first line, soft preview after).
 *
 * Reduced-motion: choreography pauses at base state; annotations still
 * legible; no infinite animations fire.
 */

const EASE = {
  outExpo: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  // Notes intentionally avoids back.out, overshoot reads as too playful
  // against the warm paper aesthetic.
  glide: [0.32, 0.72, 0, 1] as const,
};
const SPRING_SNAP = { type: "spring" as const, stiffness: 320, damping: 28 };
const SPRING_SOFT = { type: "spring" as const, stiffness: 200, damping: 26 };

type Slot = "title" | "preview" | "stamp" | "extract" | "promote";

const ANN: { slot: Slot; label: string; note: string }[] = [
  {
    slot: "title",
    label: "Title",
    note: "First line, semibold. No prompt, no required field, the title is the body.",
  },
  {
    slot: "preview",
    label: "Preview",
    note: "Lighter weight, softer colour. What you wrote, untouched.",
  },
  {
    slot: "stamp",
    label: "Stamp",
    note: "Relative until it doesn't matter. Then it's just a date.",
  },
  {
    slot: "extract",
    label: "Tasks indicator",
    note: "Quiet when nothing's sent. Ringed when this note is already in Tasks.",
  },
  {
    slot: "promote",
    label: "Action draft",
    note: "Only appears when you choose it. Notes can send work to Tasks, never the other way.",
  },
];

type ExtractState = "idle" | "drafted" | "sent";

type Stage = {
  // Highlight beats (mirrors hover-spotlight, but driven by the loop)
  hi: Slot | null;
  // Stamp counter, 3m, 4m, 5m … steps once during the beat
  stamp: number;
  // Tasks-extract pip lifecycle
  extract: ExtractState;
  // One-shot promote pulse (incremented to retrigger the scale beat)
  promotePulse: number;
};

const BASE: Stage = {
  hi: null,
  stamp: 3,
  extract: "idle",
  promotePulse: 0,
};

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function useChoreography(active: boolean, reduced: boolean) {
  const [stage, setStage] = useState<Stage>(BASE);

  useEffect(() => {
    // Reduced-motion: hold at BASE. MotionConfig only suppresses
    // motion/react animation durations, the setState loop still fires
    // unless we gate it here. WCAG 2.3.3 spirit.
    if (!active || reduced) {
      setStage(BASE);
      return;
    }
    let cancelled = false;

    const loop = async () => {
      while (!cancelled) {
        // Reset
        setStage(BASE);
        await wait(800);
        if (cancelled) return;

        // Beat 1, title highlights
        setStage((s) => ({ ...s, hi: "title" }));
        await wait(1200);
        if (cancelled) return;

        // Beat 2, preview highlights
        setStage((s) => ({ ...s, hi: "preview" }));
        await wait(1200);
        if (cancelled) return;

        // Beat 3, stamp ticks 3m → 4m, briefly highlights
        setStage((s) => ({ ...s, hi: "stamp", stamp: s.stamp + 1 }));
        await wait(1200);
        if (cancelled) return;

        // Beat 4, extract lifecycle: idle → drafted → sent.
        // Drafted holds 1400ms, long enough for visitor to register that
        // a note can live in a "shaped but not sent" middle state, which
        // is the most pedagogically valuable beat in this loop.
        setStage((s) => ({ ...s, hi: "extract", extract: "drafted" }));
        await wait(1400);
        if (cancelled) return;
        setStage((s) => ({ ...s, extract: "sent" }));
        await wait(800);
        if (cancelled) return;

        // Beat 5, long-press affordance pulses once
        setStage((s) => ({
          ...s,
          hi: "promote",
          promotePulse: s.promotePulse + 1,
        }));
        await wait(1400);
        if (cancelled) return;

        // Long settle, let the visitor read the finished row at rest
        setStage((s) => ({ ...s, hi: null }));
        await wait(2400);
        if (cancelled) return;
      }
    };

    loop();
    return () => {
      cancelled = true;
    };
  }, [active, reduced]);

  return stage;
}

function spotlightAnim(slot: Slot, active: Slot | null, choreoHi: Slot | null) {
  // External hover wins; otherwise follow the choreography highlight.
  const effective = active ?? choreoHi;
  const on = effective === slot;
  const off = !!effective && effective !== slot;
  return {
    boxShadow: on
      ? "0 0 0 2px rgba(79,70,229,0.18), 0 6px 14px -6px rgba(79,70,229,0.30)"
      : "0 0 0 0px rgba(79,70,229,0), 0 0px 0px 0px rgba(79,70,229,0)",
    opacity: off ? 0.45 : 1,
    y: on ? -0.5 : 0,
  };
}

function DemoRow({
  active,
  setActive,
}: {
  active: Slot | null;
  setActive: (s: Slot | null) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapRef, { amount: 0.35 });
  const revealInView = useInView(wrapRef, { amount: 0.35, once: true });
  const reduced = useReducedMotion() ?? false;
  const stage = useChoreography(inView, reduced);

  const hoverProps = (s: Slot) => ({
    onMouseEnter: () => setActive(s),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(s),
    onBlur: () => setActive(null),
    tabIndex: 0,
    // role="group" not "button", these are labelled regions that respond
    // to focus, not controls activated by Enter/Space. Avoids WCAG 2.1.1
    // false-promise of a button role with no key handler.
    role: "group" as const,
    "aria-label": `Highlight ${s}`,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.12 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, ease: EASE.glide },
    },
  };

  return (
    <div
      ref={wrapRef}
      className="relative flex items-center justify-center rounded-3xl px-6 py-16 sm:py-20"
      style={{
        border: "1px solid var(--color-line)",
        background:
          "linear-gradient(180deg, var(--color-paper) 0%, var(--color-bg) 100%)",
      }}
      onMouseLeave={() => setActive(null)}
    >
      {/* Ambient mustard glow, intensifies on focus + on extract beat */}
      <motion.div
        aria-hidden
        className="absolute inset-0 -z-10 rounded-3xl"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(180,130,40,0.07), transparent 55%)",
        }}
        animate={{
          opacity: active || stage.extract !== "idle" ? 1 : 0.55,
        }}
        transition={{ duration: 0.7, ease: EASE.inOut }}
      />

      <motion.div
        className="relative w-full max-w-[340px] rounded-[14px] p-4"
        style={{
          background: "var(--color-paper)",
          border: "1px solid var(--color-line)",
        }}
        animate={{
          y: active ? -2 : 0,
          scale: active ? 1.025 : 1,
          boxShadow: active
            ? "0 22px 48px -16px rgba(20,21,26,0.20), 0 0 0 1px rgba(20,21,26,0.04)"
            : "0 14px 36px -14px rgba(20,21,26,0.16), 0 0 0 1px rgba(20,21,26,0.03)",
        }}
        transition={SPRING_SOFT}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={revealInView ? "visible" : "hidden"}
          className="space-y-2"
        >
          {/* Slot 1, Title (first line, semibold) */}
          <motion.div variants={itemVariants}>
            <motion.div
              {...hoverProps("title")}
              animate={spotlightAnim("title", active, stage.hi)}
              transition={SPRING_SNAP}
              className="cursor-default rounded-md px-2 py-1 -mx-2 -my-1"
              style={{ outline: "none" }}
            >
              <p
                className="text-[15px] leading-[1.35] font-semibold"
                style={{ color: "var(--color-ink)" }}
              >
                Call the band, first dance is non-negotiable
              </p>
            </motion.div>
          </motion.div>

          {/* Slot 2, Preview (rest of body) */}
          <motion.div variants={itemVariants}>
            <motion.div
              {...hoverProps("preview")}
              animate={spotlightAnim("preview", active, stage.hi)}
              transition={SPRING_SNAP}
              className="cursor-default rounded-md px-2 py-1 -mx-2 -my-1"
              style={{ outline: "none" }}
            >
              <p
                className="text-[13px] leading-[1.55]"
                style={{ color: "var(--color-ink-faint)" }}
              >
                M asked if they can do their first dance to "At Last" without the
                full arrangement. Need to confirm with the band before Friday.
              </p>
            </motion.div>
          </motion.div>

          {/* Slot 3+4, Meta row: stamp + extract pip */}
          <motion.div variants={itemVariants}>
            <div className="mt-3 flex items-center justify-between gap-3">
              {/* Stamp */}
              <motion.div
                {...hoverProps("stamp")}
                animate={spotlightAnim("stamp", active, stage.hi)}
                transition={SPRING_SNAP}
                className="cursor-default rounded-md px-2 py-1 -mx-2 -my-1"
                style={{ outline: "none" }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={stage.stamp}
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -6, opacity: 0 }}
                    transition={SPRING_SNAP}
                    className="text-[11.5px] font-medium tabular-nums"
                    style={{ color: "var(--color-ink-faint)" }}
                  >
                    {stage.stamp}m ago
                  </motion.span>
                </AnimatePresence>
              </motion.div>

              {/* Extract pip, quiet, drafted (ring), or sent (filled+ring) */}
              <motion.div
                {...hoverProps("extract")}
                animate={spotlightAnim("extract", active, stage.hi)}
                transition={SPRING_SNAP}
                className="cursor-default rounded-md px-2 py-1 -mx-2 -my-1"
                style={{ outline: "none" }}
              >
                <div className="flex items-center gap-2">
                  <AnimatePresence mode="wait" initial={false}>
                    {stage.extract === "sent" ? (
                      <motion.span
                        key="sent"
                        initial={{ opacity: 0, scale: 0.75 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.75 }}
                        transition={{ duration: 0.32, ease: EASE.glide }}
                        className="text-[11px] uppercase tracking-[0.08em]"
                        style={{ color: "var(--color-signal, #4f46e5)" }}
                      >
                        In Tasks
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                  <div className="relative flex h-3 w-3 items-center justify-center">
                    {/* Idle dot, faint */}
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      animate={{
                        backgroundColor:
                          stage.extract === "idle"
                            ? "rgba(131,139,123,0.55)"
                            : "rgba(131,139,123,0)",
                      }}
                      transition={{ duration: 0.32, ease: EASE.inOut }}
                    />
                    {/* Ring, appears at drafted, persists at sent */}
                    <motion.span
                      aria-hidden
                      className="absolute inset-[-3px] rounded-full"
                      animate={{
                        boxShadow:
                          stage.extract !== "idle"
                            ? "0 0 0 1.5px rgba(79,70,229,0.55)"
                            : "0 0 0 0px rgba(79,70,229,0)",
                      }}
                      transition={{ duration: 0.32, ease: EASE.glide }}
                    />
                    {/* Sent fill */}
                    <motion.span
                      aria-hidden
                      className="absolute inset-[1.5px] rounded-full"
                      animate={{
                        backgroundColor:
                          stage.extract === "sent"
                            ? "rgba(79,70,229,1)"
                            : "rgba(79,70,229,0)",
                      }}
                      transition={{ duration: 0.32, ease: EASE.glide }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Slot 5, chosen action affordance (gentle scale pulse on beat) */}
          <motion.div variants={itemVariants}>
            <motion.div
              {...hoverProps("promote")}
              animate={spotlightAnim("promote", active, stage.hi)}
              transition={SPRING_SNAP}
              className="cursor-default rounded-md px-2 py-1 -mx-2 -my-1 mt-1"
              style={{ outline: "none" }}
            >
              {/* Dalí row 13, "Shape it first" promoted to equal
                  weight with "Send to Tasks". The shaping step is the
                  editorial move that makes Notes' lifecycle honest;
                  the send is the dispatch. Both surfaced, same type,
                  separated by a hairline divider. */}
              <motion.div
                key={`pulse-${stage.promotePulse}`}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.015, 1] }}
                transition={{ duration: 0.9, ease: EASE.inOut }}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-md border px-3 py-2"
                style={{
                  borderColor: "var(--color-line)",
                  background: "var(--color-bg)",
                }}
              >
                <span
                  className="text-[12px] font-medium"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  Shape it first
                </span>
                <span
                  aria-hidden
                  className="text-[10.5px] uppercase tracking-[0.12em]"
                  style={{
                    color: "var(--color-ink-faint)",
                    width: 1,
                    height: 14,
                    background: "var(--color-line)",
                    display: "inline-block",
                  }}
                />
                <span
                  className="text-[12px] font-medium text-right"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  Send to Tasks
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Annotations({
  active,
  setActive,
}: {
  active: Slot | null;
  setActive: (s: Slot | null) => void;
}) {
  return (
    <ol className="space-y-1">
      {ANN.map((a, i) => {
        const isOn = active === a.slot;
        const isOff = !!active && active !== a.slot;
        return (
          <li key={a.slot}>
            <motion.button
              type="button"
              onMouseEnter={() => setActive(a.slot)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(a.slot)}
              onBlur={() => setActive(null)}
              animate={{
                background: isOn
                  ? "rgba(79,70,229,0.05)"
                  : "rgba(79,70,229,0)",
                opacity: isOff ? 0.55 : 1,
              }}
              transition={{ duration: 0.22, ease: EASE.inOut }}
              className="group grid w-full grid-cols-[auto_1fr] items-start gap-3 rounded-xl px-3 py-3 text-left outline-none"
            >
              <motion.span
                className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums"
                animate={{
                  borderColor: isOn
                    ? "rgba(79,70,229,0.55)"
                    : "rgba(20,21,26,0.12)",
                  backgroundColor: isOn
                    ? "rgba(79,70,229,0.95)"
                    : "var(--color-paper)",
                  color: isOn ? "#fff" : "var(--color-ink-soft)",
                  scale: isOn ? 1.05 : 1,
                }}
                transition={SPRING_SNAP}
              >
                {i + 1}
              </motion.span>
              <div>
                <div
                  className="text-[13.5px] font-medium"
                  style={{ color: "var(--color-ink)" }}
                >
                  {a.label}
                </div>
                <div
                  className="mt-0.5 text-[13px] leading-[1.55]"
                  style={{ color: "var(--color-ink-soft)" }}
                >
                  {a.note}
                </div>
              </div>
            </motion.button>
          </li>
        );
      })}
    </ol>
  );
}

export function NoteAnatomy() {
  const [active, setActive] = useState<Slot | null>(null);

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="anatomy"
        className="reveal mt-28 scroll-mt-24 sm:mt-32"
        aria-label="Anatomy of a note"
      >
        <div className="max-w-[860px]">
          <p
            className="font-mono text-[11px] uppercase"
            style={{
              color: "var(--color-ink-faint)",
              letterSpacing: "0.14em",
            }}
          >
            Anatomy of a note
          </p>
          <h2
            className="mt-4 text-[clamp(1.75rem,1rem+2.4vw,2.5rem)] font-semibold leading-[1.05]"
            style={{
              color: "var(--color-ink)",
              letterSpacing: "-0.02em",
            }}
          >
            Five things,{" "}
            <span style={{ color: "var(--color-ink-faint)" }}>
              in one quiet row.
            </span>
          </h2>
          <p
            className="mt-5 max-w-[58ch] text-[15.5px] leading-[1.55]"
            style={{ color: "var(--color-ink-soft)" }}
          >
            A note is the body. The title is its first line, the same string,
            no prompt. The stamp stays relative. The pip on the right says
            whether the note has crossed into Tasks. Sending work is one-way,
            and always chosen by you.
          </p>
          <p
            className="mt-3 max-w-[58ch] text-[13px] leading-[1.55]"
            style={{ color: "var(--color-ink-faint)" }}
          >
            Watch the row settle, or hover a number, on the row or in the
            list, to see them speak.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          <DemoRow active={active} setActive={setActive} />
          <Annotations active={active} setActive={setActive} />
        </div>
      </section>
    </MotionConfig>
  );
}
