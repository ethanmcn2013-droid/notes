"use client";

import { useEffect, useState } from "react";

const PRIVATE_NOTES_EMPTY_LINES = [
  "Writings you can’t say out loud.",
  "For things not ready for the room yet.",
  "Ideas before they become decisions.",
  "Not everything needs to be shared.",
  "A place to think before you speak.",
  "For thoughts still forming.",
  "Some things are only for you.",
] as const;

// E7(b) — settled placeholder shown to users with ≥ this many notes.
// At this point the user knows the app; the rotating poem is first-touch
// guidance, not a permanent feature. The settled string is calm, not a CTA.
const SETTLED_NOTE_THRESHOLD = 8;
const SETTLED_LINE = "A place to think before you speak.";

// Typewriter rotation tuning. Total cycle ≈ 30s per line, composed of:
//   - Type-in:  N chars × TYPE_INTERVAL_MS  (e.g. 40 chars × 50ms = 2000ms)
//   - Settled hold: TOTAL_CYCLE_MS − type-in − fade-out  (≈ 27s)
//   - Fade-out: FADE_OUT_MS                              (≈ 800ms)
// Settled hold is computed dynamically per-line so longer/shorter lines
// stay on-screen for the same total rotation cadence.
const TYPE_INTERVAL_MS = 50;
const FADE_OUT_MS = 800;
const TOTAL_CYCLE_MS = 30_000;

interface PrivateNotesEmptyStateProps {
  visible: boolean;
  /**
   * Total number of notes the user has saved. When this reaches
   * SETTLED_NOTE_THRESHOLD the placeholder poem stops rotating and
   * shows one quiet stable string instead.
   */
  noteCount?: number;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}

type Phase = "typing" | "settled" | "fading";

export function PrivateNotesEmptyState({ visible, noteCount = 0 }: PrivateNotesEmptyStateProps) {
  const [index, setIndex] = useState(0);
  const [typedChars, setTypedChars] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const reducedMotion = usePrefersReducedMotion();

  // E7(b): settled users get a stable string, no rotation.
  const settled = noteCount >= SETTLED_NOTE_THRESHOLD;
  const fullText = settled ? SETTLED_LINE : PRIVATE_NOTES_EMPTY_LINES[index];

  // Reduced-motion + settled-state short-circuit: skip the typewriter entirely
  // and render the full line. The caret still renders but its blink is killed
  // by the prefers-reduced-motion media query below.
  const animateTypewriter = !reducedMotion && !settled;

  // Type-in tick. Adds one character per TYPE_INTERVAL_MS until the line is
  // fully revealed, then flips to the settled phase. Skipped entirely when
  // typewriter is disabled (reduced motion / settled / hidden).
  useEffect(() => {
    if (!animateTypewriter || !visible) return;
    if (phase !== "typing") return;
    if (typedChars >= fullText.length) {
      setPhase("settled");
      return;
    }
    const t = window.setTimeout(() => setTypedChars((c) => c + 1), TYPE_INTERVAL_MS);
    return () => window.clearTimeout(t);
  }, [animateTypewriter, visible, phase, typedChars, fullText.length]);

  // Settled-hold timer. Once the full line is on screen, hold for the
  // remainder of the 30s cycle, then start fading out. The hold duration is
  // computed so that (type-in + hold + fade-out) ≈ TOTAL_CYCLE_MS regardless
  // of line length.
  useEffect(() => {
    if (!animateTypewriter || !visible) return;
    if (phase !== "settled") return;
    const typeInMs = fullText.length * TYPE_INTERVAL_MS;
    const hold = Math.max(2000, TOTAL_CYCLE_MS - typeInMs - FADE_OUT_MS);
    const t = window.setTimeout(() => setPhase("fading"), hold);
    return () => window.clearTimeout(t);
  }, [animateTypewriter, visible, phase, fullText.length]);

  // Fade-out → advance index → reset to typing for the next line.
  useEffect(() => {
    if (!animateTypewriter || !visible) return;
    if (phase !== "fading") return;
    const t = window.setTimeout(() => {
      setIndex((i) => (i + 1) % PRIVATE_NOTES_EMPTY_LINES.length);
      setTypedChars(0);
      setPhase("typing");
    }, FADE_OUT_MS);
    return () => window.clearTimeout(t);
  }, [animateTypewriter, visible, phase]);

  // When the user transitions into the settled state mid-cycle (note count
  // crosses the threshold) or reduced-motion turns on, snap to the fully-
  // shown stable string so we don't leave a half-typed line on screen.
  useEffect(() => {
    if (!animateTypewriter) {
      setTypedChars(fullText.length);
      setPhase("settled");
    }
  }, [animateTypewriter, fullText.length]);

  const displayText = animateTypewriter ? fullText.slice(0, typedChars) : fullText;
  const isFading = phase === "fading";

  return (
    <span
      aria-hidden="true"
      className={[
        "private-notes-empty-state",
        visible ? "" : "is-hidden",
        isFading ? "is-changing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span>{displayText}</span>
      <span className="private-notes-empty-caret" />
    </span>
  );
}
