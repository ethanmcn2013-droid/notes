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

export function PrivateNotesEmptyState({ visible, noteCount = 0 }: PrivateNotesEmptyStateProps) {
  const [index, setIndex] = useState(0);
  const [changing, setChanging] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // E7(b): settled users get a stable string, no rotation.
  const settled = noteCount >= SETTLED_NOTE_THRESHOLD;

  useEffect(() => {
    if (!visible || reducedMotion || settled) setChanging(false);
  }, [visible, reducedMotion, settled]);

  useEffect(() => {
    // No rotation: reduced-motion users, settled users, or hidden state.
    if (!visible || reducedMotion || settled) return;

    let transitionTimer: number | undefined;
    const rotationTimer = window.setInterval(() => {
      setChanging(true);
      transitionTimer = window.setTimeout(() => {
        setIndex((current) => (current + 1) % PRIVATE_NOTES_EMPTY_LINES.length);
        setChanging(false);
      }, 420);
    }, 5200);

    return () => {
      window.clearInterval(rotationTimer);
      if (transitionTimer) window.clearTimeout(transitionTimer);
    };
  }, [visible, reducedMotion, settled]);

  const displayText = settled ? SETTLED_LINE : PRIVATE_NOTES_EMPTY_LINES[index];

  return (
    <span
      aria-hidden="true"
      className={[
        "private-notes-empty-state",
        visible ? "" : "is-hidden",
        changing ? "is-changing" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span>{displayText}</span>
      <span className="private-notes-empty-caret" />
    </span>
  );
}
