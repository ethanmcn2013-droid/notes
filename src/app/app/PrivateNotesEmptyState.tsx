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

interface PrivateNotesEmptyStateProps {
  visible: boolean;
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

export function PrivateNotesEmptyState({ visible }: PrivateNotesEmptyStateProps) {
  const [index, setIndex] = useState(0);
  const [changing, setChanging] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (!visible || reducedMotion) setChanging(false);
  }, [visible, reducedMotion]);

  useEffect(() => {
    if (!visible || reducedMotion) return;

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
  }, [visible, reducedMotion]);

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
      <span>{PRIVATE_NOTES_EMPTY_LINES[index]}</span>
      <span className="private-notes-empty-caret" />
    </span>
  );
}
