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

const TYPE_INTERVAL_MS = 36;
const TYPE_JITTER_MS = 24;
const SEARCH_TYPE_MS = 76;

function buildReducedNotes(domain: DomainId): Note[] {
  return DOMAINS[domain].captures.map((entry, i) => ({
    id: `note-${i}`,
    body: entry.text,
    stamp: entry.stamp,
  }));
}

function buildInitialState(domain: DomainId): DemoState {
  return {
    notes: [],
    scene: "boot",
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
 * Marketing demo for Notes. Capture × 3 → search.
 *
 * The previous version of this demo morphed to a Tags view and ran a
 * long-press → "Promote to Tasks" menu beat. Both directly contradicted
 * PRODUCT.md (§4 no views, §7 no taxonomy, §11 deliberate two-step
 * extraction). Removed 2026-05-13 — the extract-to-Tasks beat will
 * return in a follow-up cycle using the shipped Draft-action → Send
 * pattern, designed deliberately rather than carried over from a
 * mismatched scaffold.
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

  const typeCapture = useCallback(async (text: string) => {
    for (let i = 1; i <= text.length; i++) {
      if (!aliveRef.current) return;
      setState((s) => ({ ...s, captureText: text.slice(0, i) }));
      const jitter = Math.random() * TYPE_JITTER_MS;
      await wait(TYPE_INTERVAL_MS + jitter);
    }
  }, []);

  const typeSearch = useCallback(async (text: string) => {
    for (let i = 1; i <= text.length; i++) {
      if (!aliveRef.current) return;
      setState((s) => ({ ...s, searchText: text.slice(0, i) }));
      await wait(SEARCH_TYPE_MS);
    }
  }, []);

  const commit = useCallback(
    (index: number) => {
      const entry = pack.captures[index];
      if (!entry) return;
      const newNote: Note = {
        id: `note-${index}`,
        body: entry.text,
        stamp: entry.stamp,
        fresh: true,
      };
      setState((s) => ({
        ...s,
        notes: [newNote, ...s.notes.map((n) => ({ ...n, fresh: false }))],
        captureText: "",
        placeholderIndex: (index + 1) % pack.captures.length,
      }));
    },
    [pack],
  );

  const setSearchHit = useCallback((id: string | null) => {
    setState((s) => ({ ...s, searchHit: id }));
  }, []);

  /** Main timeline. */
  useEffect(() => {
    if (reducedMotion) return;
    aliveRef.current = true;
    const myLoopKey = loopKeyRef.current;
    const isCurrent = () =>
      aliveRef.current && myLoopKey === loopKeyRef.current;

    async function runLoop() {
      setState(buildInitialState(domain));
      await wait(900);
      if (!isCurrent()) return;

      // Capture 1
      setScene("capture-1-type");
      await wait(420);
      await typeCapture(pack.captures[0].text);
      if (!isCurrent()) return;
      await wait(340);
      setScene("capture-1-commit");
      commit(0);
      await wait(900);
      if (!isCurrent()) return;

      // Capture 2
      setScene("capture-2-type");
      await wait(520);
      await typeCapture(pack.captures[1].text);
      if (!isCurrent()) return;
      await wait(340);
      setScene("capture-2-commit");
      commit(1);
      await wait(900);
      if (!isCurrent()) return;

      // Capture 3
      setScene("capture-3-type");
      await wait(420);
      await typeCapture(pack.captures[2].text);
      if (!isCurrent()) return;
      await wait(320);
      setScene("capture-3-commit");
      commit(2);
      await wait(1100);
      if (!isCurrent()) return;

      // Search beat — character-by-character match highlighting
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
      await wait(600);

      setScene("reset");
      await wait(900);
    }

    let cancelled = false;
    (async function loop() {
      while (!cancelled && isCurrent()) {
        await runLoop();
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
    typeCapture,
    typeSearch,
    commit,
    setSearchHit,
  ]);

  const placeholder =
    pack.captures[state.placeholderIndex]?.placeholder ?? "What just came up?";

  const renderNotes = useMemo<Note[]>(
    () => (reducedMotion ? buildReducedNotes(domain) : state.notes),
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
