"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { PrivateNotesEmptyState } from "@/app/app/PrivateNotesEmptyState";
import { DOMAINS, type DomainId } from "@/lib/domains";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type DemoNote = { id: string; body: string; stamp: string };

/**
 * Stream order matches the real product: newest first (PRODUCT.md §4,
 * "Recent notes, newest first"). domains.ts authors captures
 * chronologically, so the newest capture is the last entry — reverse
 * for display. searchHitIndex still indexes captures[]; we resolve it
 * to a stable id so display order is free to differ.
 */
function buildNotes(domain: DomainId): DemoNote[] {
  return DOMAINS[domain].captures
    .map((entry, i) => ({
      id: `note-${i}`,
      body: entry.text,
      stamp: entry.stamp,
    }))
    .slice()
    .reverse();
}

type Props = {
  domain?: DomainId;
};

/**
 * Marketing demo for Notes.
 *
 * N·13 (2026-05-16): the demo now performs the product's core act —
 * capture — instead of sitting there populated and still. The prior
 * file (N·12) correctly fixed the chrome: it reuses the exact
 * `.notebook` classes the app ships, so it is the real surface, not a
 * lookalike. What it lacked was the act. Every other Signal demo
 * performs (Tasks runs a cinematic; Roadmap advances a dot). This one
 * showed a search-dim loop and never once showed a thought being
 * caught — the one thing Notes is. The product's signature gesture is
 * M·05 *settle* (the slowest motion in the suite by design); it was
 * absent from the product's own demo.
 *
 * It now plays, slowly and quietly: the notebook sits at rest, a
 * thought arrives whole into the capture field (settled, never
 * typed-at-you — "never simulate typing", BRAND/PRODUCT), it commits,
 * and the matching row in the stream replays the product's real
 * `note-row-arrive` gesture. Then one calm search beat. Then a long
 * rest. This is Notes's register: the quietest demo in the suite and
 * the most considered. That contrast is the moat, not a violation of
 * it — a busy collaborator-cursor cinematic (Tasks's shape) would
 * betray "not everything needs to be shared".
 *
 * Hard-won properties carried forward (do not regress):
 *  · SSR / no-JS / reduced-motion render the FULL stream at rest,
 *    search empty, count at rest, placeholder static — exactly the app
 *    at rest. The loop is progressive enhancement layered on top.
 *  · The stage is fixed: the stream's DOM length NEVER changes. The
 *    "arrival" is the product's own `.is-fresh` replay on an existing
 *    row, not a DOM insert. Nothing below the notebook ever reflows.
 *    This is the "stop twitching the page" bar (N·11) — the autoplay
 *    loop that collapsed/expanded the stream every ~11s was the exact
 *    jank N·11 removed. Causality reads from capture-field → top row;
 *    no row is added or removed to depict it.
 *  · No views, no taxonomy, no auto-promote (PRODUCT.md §4/§7/§11) —
 *    earlier versions that morphed to a Tags view / long-press
 *    "Promote to Tasks" were removed 2026-05-13. Don't bring them back.
 */
export function NotesDemo({ domain = "wedding" }: Props = {}) {
  const reducedMotion = useReducedMotion();
  const pack = DOMAINS[domain];
  const notes = useMemo(() => buildNotes(domain), [domain]);
  const hitId = `note-${pack.searchHitIndex}`;

  // Capture-beat state. Empty captureText + captureShown=false is the
  // resting state where PrivateNotesEmptyState owns the field.
  const [captureText, setCaptureText] = useState("");
  const [captureShown, setCaptureShown] = useState(false);
  const [freshId, setFreshId] = useState<string | null>(null);
  const [freshKey, setFreshKey] = useState(0);

  // Search-beat state.
  const [searchText, setSearchText] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  const loopKeyRef = useRef(0);

  // Reset the whole performance whenever the audience changes.
  useEffect(() => {
    setCaptureText("");
    setCaptureShown(false);
    setFreshId(null);
    setSearchText("");
    setSearchActive(false);
    loopKeyRef.current += 1;
  }, [domain]);

  useEffect(() => {
    if (reducedMotion) return;

    const myLoopKey = loopKeyRef.current;
    let cancelled = false;
    // The full performance plays only when the tab is visible — never
    // animate to an empty room (perf + restraint).
    const live = () =>
      !cancelled &&
      myLoopKey === loopKeyRef.current &&
      typeof document !== "undefined" &&
      !document.hidden;

    // captures[] is chronological; play oldest → newest so the newest
    // lands at the top of the (newest-first) stream and the eye
    // completes the causality from field → top row.
    const captures = pack.captures;

    async function captureBeat(i: number) {
      const cap = captures[i];
      // The thought arrives whole. Placeholder yields (handled by
      // captureShown gating PrivateNotesEmptyState), text settles in:
      // opacity + translateY only, ~340ms ease-out. Not typed.
      setCaptureText(cap.text);
      setCaptureShown(true);
      await wait(340);
      if (!live()) return;
      // Read it.
      await wait(1200);
      if (!live()) return;
      // Commit: the field releases the thought (180ms fade/rise out)
      // and, in the same instant, the matching row in the stream
      // replays the product's real arrival gesture.
      setCaptureShown(false);
      const arrivedId = `note-${i}`;
      setFreshId(arrivedId);
      setFreshKey((k) => k + 1);
      await wait(200);
      if (!live()) return;
      setCaptureText("");
      // note-row-arrive is 450ms; let it finish, then settle.
      await wait(620);
      if (!live()) return;
      setFreshId(null);
      await wait(1600);
    }

    async function searchBeat() {
      setSearchActive(true);
      await wait(420);
      if (!live()) return;
      // The query settles in whole — consistent with capture, and
      // honours "never simulate typing".
      setSearchText(pack.searchQuery);
      await wait(2800);
      if (!live()) return;
      setSearchText("");
      setSearchActive(false);
      await wait(420);
    }

    (async function run() {
      while (live()) {
        // Open on stillness — the notebook just sits there, populated,
        // placeholder breathing.
        await wait(3400);
        if (!live()) {
          // If we paused (tab hidden) wait a touch and re-check rather
          // than spinning.
          await wait(1200);
          continue;
        }
        for (let i = 0; i < captures.length; i++) {
          await captureBeat(i);
          if (!live()) break;
        }
        if (!live()) continue;
        await searchBeat();
        if (!live()) continue;
        // A long, quiet rest before the whole thing happens again.
        await wait(4200);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reducedMotion, domain, pack]);

  const query = searchText.trim().toLowerCase();
  const searching = query.length > 0;
  const matchCount = searching
    ? notes.filter((n) => n.body.toLowerCase().includes(query)).length
    : notes.length;
  const placeholderVisible = !captureShown && captureText.length === 0;

  return (
    <div className="notebook-demo">
      {/* The real product surface — same .notebook chrome the app
          renders at /app. minHeight override: the app sets a tall
          full-screen min-height; the hero artifact sizes to content
          but reserves the resting height so the stage never reflows. */}
      <section
        className="notebook"
        aria-label="Signal Notes — a look at the notebook"
        style={{ minHeight: 0 }}
      >
        <div className="notebook-top">
          <span className="wordmark" aria-hidden>
            <span className="word">notes</span>
            <span className="dot" />
          </span>
          <span className="search">
            <span>Search</span>
            <input
              type="text"
              value={searchText}
              placeholder="anything"
              readOnly
              tabIndex={-1}
              aria-hidden
              spellCheck={false}
              style={{
                borderBottomColor: searchActive
                  ? "var(--color-accent)"
                  : undefined,
              }}
            />
          </span>
        </div>

        <div className="capture">
          <div className="sr-only">Capture a private note</div>
          {/* Read-only replica of the app's capture textarea — the
              signature giant type. The thought settles into it whole
              (opacity + translateY), then releases on commit. Non-
              interactive: the live product is one click away via the
              hero CTA. */}
          <textarea
            rows={3}
            placeholder=""
            value={captureText}
            readOnly
            tabIndex={-1}
            aria-hidden
            data-shown={captureShown ? "true" : "false"}
          />
          <PrivateNotesEmptyState visible={placeholderVisible} />
          <p className="capture-hint">
            <kbd>Enter</kbd> saves · <kbd>Shift</kbd>+<kbd>Enter</kbd> new line ·{" "}
            <kbd>Esc</kbd> clears
          </p>
        </div>

        <div className="stream-head">
          <span>Stream</span>
          <span>
            {searching
              ? `${matchCount} of ${notes.length}`
              : `${notes.length} ${notes.length === 1 ? "note" : "notes"}`}
          </span>
        </div>

        <ol className="stream" aria-label="Recent notes">
          {notes.map((note) => {
            const isHit = note.id === hitId;
            const dimmed = searching && !isHit;
            const isFresh = note.id === freshId;
            return (
              <li key={note.id}>
                <div
                  // Remounting on freshKey replays the product's real
                  // note-row-arrive CSS animation without a DOM
                  // insert — the stream length never changes.
                  key={isFresh ? `${note.id}-${freshKey}` : note.id}
                  className={`note-row${isFresh ? " is-fresh" : ""}`}
                  style={{
                    cursor: "default",
                    opacity: dimmed ? 0.42 : 1,
                    transition: "opacity var(--motion-moderate) var(--ease-out)",
                  }}
                >
                  <span>
                    <span className="note-title">
                      {searching && isHit
                        ? renderWithHighlight(note.body, pack.searchQuery)
                        : note.body}
                    </span>
                  </span>
                  <span className="note-meta">
                    <span>{note.stamp}</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <style>{`
        .notebook-demo {
          display: flex;
          justify-content: center;
          width: 100%;
        }
        .notebook-demo .notebook {
          width: 100%;
          max-width: 620px;
        }
        /* The hero artifact wants a calmer capture height than the
           full-bleed in-product field; keep the signature scale, trim
           the dead space. The settle is opacity + translateY only —
           hardware-accelerated, contract-timed, ease-out. */
        .notebook-demo .capture {
          position: relative;
        }
        .notebook-demo .capture textarea {
          min-height: 96px;
          pointer-events: none;
          opacity: 0;
          transform: translateY(8px);
          transition:
            opacity var(--motion-moderate) var(--ease-out),
            transform var(--motion-moderate) var(--ease-out);
        }
        .notebook-demo .capture textarea[data-shown="true"] {
          opacity: 1;
          transform: translateY(0);
        }
        .notebook-demo .note-row:hover {
          background: transparent;
        }
        @media (prefers-reduced-motion: reduce) {
          .notebook-demo .capture textarea {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

/** Render body with the query substring wrapped in a soft highlight. */
function renderWithHighlight(body: string, query: string) {
  if (!query) return body;
  const lower = body.toLowerCase();
  const idx = lower.indexOf(query.toLowerCase());
  if (idx < 0) return body;
  return (
    <>
      {body.slice(0, idx)}
      <span
        style={{
          background:
            "color-mix(in srgb, var(--color-accent) 18%, transparent)",
          borderRadius: 4,
          padding: "0 2px",
          margin: "0 -2px",
        }}
      >
        {body.slice(idx, idx + query.length)}
      </span>
      {body.slice(idx + query.length)}
    </>
  );
}
