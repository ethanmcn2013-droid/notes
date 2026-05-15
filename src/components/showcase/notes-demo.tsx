"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DOMAINS, type DomainId } from "@/lib/domains";
import {
  type DemoState,
  type Field,
  type Note,
  type Scene,
} from "./types";
import { CaptureField } from "./capture-field";
import { NoteStream } from "./note-stream";
import { Caret } from "./caret";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const SEARCH_TYPE_MS = 76;

function buildNotes(domain: DomainId): Note[] {
  return DOMAINS[domain].captures.map((entry, i) => ({
    id: `note-${i}`,
    body: entry.text,
    stamp: entry.stamp,
  }));
}

// The notebook starts populated. This is the base, server-rendered
// state every visitor — including a crawler or a no-JS browser —
// sees: a real notebook with real notes for the chosen audience.
// The motion (the calm search-highlight beat) is layered on top as
// progressive enhancement, never a precondition for seeing content.
function buildInitialState(domain: DomainId): DemoState {
  return {
    notes: buildNotes(domain),
    scene: "search-focus",
    field: "capture",
    captureText: "",
    searchText: "",
    searchHit: null,
    placeholderIndex: 0,
    domain,
  };
}

type Props = {
  domain?: DomainId;
};

/**
 * Marketing demo for Notes: a populated notebook for the chosen
 * audience, with a calm repeating search-highlight beat.
 *
 * N·11b (2026-05-15): the auto-typing capture story was removed. It
 * re-staged itself every ~12s (collapsing the stream to empty and
 * reflowing the page) and, being JS-timeline-built, left crawlers
 * and no-JS visitors looking at an empty card — content hidden
 * behind motion, which the brand bar forbids. The notebook now
 * server-renders populated (real information first); the search
 * beat is progressive enhancement on top. Simpler, crawler-safe,
 * zero layout shift, and more on-brand: Notes does not need an
 * animation performing capture at the visitor.
 *
 * (Earlier note, kept: a prior version morphed to a Tags view +
 * long-press "Promote to Tasks" menu — contradicted PRODUCT.md §4
 * no views / §7 no taxonomy / §11 deliberate extraction. Removed
 * 2026-05-13.)
 */
export function NotesDemo({ domain = "wedding" }: Props = {}) {
  const reducedMotion = useReducedMotion();
  const pack = DOMAINS[domain];
  const [state, setState] = useState<DemoState>(() => buildInitialState(domain));
  const aliveRef = useRef(true);
  const loopKeyRef = useRef(0);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const noteRefsRef = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    setState(buildInitialState(domain));
    loopKeyRef.current += 1;
  }, [domain]);

  const onRegisterNote = useCallback(
    (id: string, el: HTMLDivElement | null) => {
      if (el) noteRefsRef.current.set(id, el);
      else noteRefsRef.current.delete(id);
    },
    [],
  );

  const setScene = useCallback((scene: Scene) => {
    setState((s) => ({ ...s, scene }));
  }, []);

  const setField = useCallback((field: Field) => {
    setState((s) => ({ ...s, field }));
  }, []);

  const typeSearch = useCallback(async (text: string) => {
    for (let i = 1; i <= text.length; i++) {
      if (!aliveRef.current) return;
      setState((s) => ({ ...s, searchText: text.slice(0, i) }));
      await wait(SEARCH_TYPE_MS);
    }
  }, []);

  const setSearchHit = useCallback((id: string | null) => {
    setState((s) => ({ ...s, searchHit: id }));
  }, []);

  // Progressive enhancement only. The notebook is already populated
  // and on screen (server-rendered base state) before this runs and
  // whether or not it ever runs — no-JS, crawler, and reduced-motion
  // visitors keep the full content. This adds one thing: a calm
  // search-highlight that shows search finding a note, then rests a
  // long quiet while. No typing-at-you, no collapse, no reflow.
  useEffect(() => {
    if (reducedMotion) return;
    aliveRef.current = true;
    const myLoopKey = loopKeyRef.current;
    const isCurrent = () =>
      aliveRef.current && myLoopKey === loopKeyRef.current;

    async function runSearchBeat() {
      // Open on stillness — the notebook just sits there, populated.
      await wait(3200);
      if (!isCurrent()) return;
      setScene("search-focus");
      setField("search");
      await wait(540);
      if (!isCurrent()) return;
      setScene("search-type");
      await typeSearch(pack.searchQuery);
      if (!isCurrent()) return;
      await wait(200);
      setScene("search-result");
      setSearchHit(`note-${pack.searchHitIndex}`);
      await wait(2800);
      if (!isCurrent()) return;
      setSearchHit(null);
      setState((s) => ({ ...s, searchText: "" }));
      setField("capture");
      // A long, quiet rest before it happens again.
      await wait(4600);
    }

    let cancelled = false;
    (async function loop() {
      while (!cancelled && isCurrent()) {
        await runSearchBeat();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    reducedMotion,
    domain,
    pack,
    setScene,
    setField,
    typeSearch,
    setSearchHit,
  ]);

  const placeholder =
    pack.captures[state.placeholderIndex]?.placeholder ?? "What just came up?";

  const renderNotes = useMemo<Note[]>(
    () => (reducedMotion ? buildNotes(domain) : state.notes),
    [reducedMotion, domain, state.notes],
  );

  return (
    <section style={{ display: "flex", justifyContent: "center" }}>
      <motion.div
        ref={surfaceRef}
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 560,
          // Reserve the height of the fullest loop state (3 notes +
          // search row) so the demo animates *inside* a stable frame.
          // Without this the card grows boot→3-notes→collapses every
          // ~12s loop and reflows the anti-feature section + footer
          // below it — cumulative layout shift, fails the "motion is
          // physical / no jank" bar. The box no longer moves the
          // document; only its own contents animate.
          minHeight: 472,
          background: "var(--color-bg)",
          border: "1px solid var(--color-line)",
          borderRadius: 18,
          padding: "26px 26px 26px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        }}
      >
        {/* Eyebrow row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            gap: 12,
          }}
        >
          <span
            className="font-mono"
            style={{
              fontSize: 10.5,
              color: "var(--color-ink-faint)",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontWeight: 600,
            }}
          >
            {pack.notebookEyebrow}
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: 10.5,
              color: "var(--color-ink-faint)",
              textTransform: "lowercase",
              letterSpacing: "0.02em",
            }}
          >
            private
          </span>
        </div>

        {/* Capture field */}
        <CaptureField
          text={state.captureText}
          active={state.field === "capture" && !reducedMotion}
          placeholder={placeholder}
        />

        {/* Note stream */}
        <div style={{ marginTop: 18 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key="stream"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            >
              <NoteStream
                notes={renderNotes}
                highlightId={state.searchHit}
                highlightQuery={state.searchHit ? pack.searchQuery : undefined}
                onRegister={onRegisterNote}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Search row */}
        {!reducedMotion && state.notes.length >= 3 ? (
          <div
            style={{
              marginTop: 18,
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 10,
              background: "var(--color-field)",
              border: "1px solid var(--color-line)",
            }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
              style={{
                color: "var(--color-ink-faint)",
                flexShrink: 0,
              }}
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span
              style={{
                fontFamily: "var(--font-inter)",
                fontSize: 14,
                color: "var(--color-ink)",
                fontWeight: 400,
                display: "flex",
                alignItems: "center",
                minHeight: 18,
              }}
            >
              {state.searchText || (
                <span
                  style={{
                    color: "var(--color-ink-faint)",
                    fontStyle: "italic",
                  }}
                >
                  Search what you wrote.
                </span>
              )}
              <Caret active={state.field === "search"} height={14} />
            </span>
          </div>
        ) : null}
      </motion.div>
    </section>
  );
}
