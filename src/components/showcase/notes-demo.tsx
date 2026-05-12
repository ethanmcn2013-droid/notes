"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DOMAINS, type DomainId } from "@/lib/domains";
import {
  type DemoState,
  type Field,
  type Note,
  type Scene,
  type ViewMode,
} from "./types";
import { CaptureField } from "./capture-field";
import { NoteStream } from "./note-stream";
import { TagsView } from "./tags-view";
import { Caret } from "./caret";
import { ViewToggle } from "./view-toggle";
import { TasksEdge } from "./tasks-edge";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const TYPE_INTERVAL_MS = 36;
const TYPE_JITTER_MS = 24;
const SEARCH_TYPE_MS = 76;

function buildReducedNotes(domain: DomainId): Note[] {
  return DOMAINS[domain].captures.map((entry, i) => ({
    id: `note-${i}`,
    body: entry.text,
    stamp: entry.stamp,
    tags: entry.tags,
  }));
}

function buildInitialState(domain: DomainId): DemoState {
  return {
    notes: [],
    scene: "boot",
    view: "stream",
    field: "capture",
    captureText: "",
    searchText: "",
    searchHit: null,
    placeholderIndex: 0,
    pressedNoteId: null,
    promotePressed: false,
    promotingNoteId: null,
    flightFrom: null,
    tasksEdgeActive: false,
    domain,
  };
}

type Props = {
  domain?: DomainId;
};

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
    []
  );

  const getNoteRect = useCallback((id: string) => {
    const surface = surfaceRef.current;
    const el = noteRefsRef.current.get(id);
    if (!surface || !el) return null;
    const sr = surface.getBoundingClientRect();
    const er = el.getBoundingClientRect();
    return {
      x: er.left - sr.left,
      y: er.top - sr.top,
      width: er.width,
      height: er.height,
    };
  }, []);

  const setScene = useCallback((scene: Scene) => {
    setState((s) => ({ ...s, scene }));
  }, []);

  const setView = useCallback((view: ViewMode) => {
    setState((s) => ({ ...s, view }));
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
        tags: entry.tags,
        fresh: true,
      };
      setState((s) => ({
        ...s,
        notes: [newNote, ...s.notes.map((n) => ({ ...n, fresh: false }))],
        captureText: "",
        placeholderIndex: (index + 1) % pack.captures.length,
      }));
    },
    [pack]
  );

  const setSearchHit = useCallback((id: string | null) => {
    setState((s) => ({ ...s, searchHit: id }));
  }, []);

  const setPressed = useCallback((id: string | null) => {
    setState((s) => ({ ...s, pressedNoteId: id }));
  }, []);

  const setPromotePressed = useCallback((pressed: boolean) => {
    setState((s) => ({ ...s, promotePressed: pressed }));
  }, []);

  const setPromoting = useCallback(
    (id: string | null, from: { x: number; y: number } | null = null) => {
      setState((s) => ({ ...s, promotingNoteId: id, flightFrom: from }));
    },
    []
  );

  const setTasksEdgeActive = useCallback((active: boolean) => {
    setState((s) => ({ ...s, tasksEdgeActive: active }));
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

      // Search beat — with character-by-character match highlighting
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
      await wait(2400);
      if (!isCurrent()) return;
      setSearchHit(null);
      setState((s) => ({ ...s, searchText: "" }));
      setField("capture");
      await wait(400);

      // View morph to Tags — notes regroup by tag
      setScene("view-morph-tags");
      setView("tags");
      await wait(2200);
      if (!isCurrent()) return;

      setScene("tags-hold");
      await wait(1800);
      if (!isCurrent()) return;

      // Morph back to Stream
      setScene("view-morph-stream");
      setView("stream");
      await wait(900);
      if (!isCurrent()) return;

      // Long-press a note (the search-hit one) → promote menu opens
      const targetId = `note-${pack.searchHitIndex}`;
      setScene("long-press");
      setPressed(targetId);
      await wait(900);
      if (!isCurrent()) return;
      setScene("promote-menu");
      await wait(1000);
      if (!isCurrent()) return;

      // Press the Promote item
      setScene("promote-press");
      setPromotePressed(true);
      await wait(280);
      setPromotePressed(false);
      if (!isCurrent()) return;

      // Flight — record from-rect, then transition to promoting state
      setScene("promote-flight");
      const rect = getNoteRect(targetId);
      setPromoting(targetId, rect ? { x: rect.x, y: rect.y } : null);
      setPressed(null);
      setTasksEdgeActive(true);
      await wait(1200);
      if (!isCurrent()) return;

      setScene("promote-done");
      setTasksEdgeActive(false);
      setPromoting(null);
      await wait(900);
      if (!isCurrent()) return;

      setScene("reset");
      await wait(700);
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
    setView,
    setField,
    typeCapture,
    typeSearch,
    commit,
    setSearchHit,
    setPressed,
    setPromotePressed,
    setPromoting,
    setTasksEdgeActive,
    getNoteRect,
  ]);

  const placeholder =
    pack.captures[state.placeholderIndex]?.placeholder ?? "What just came up?";

  const renderNotes = useMemo<Note[]>(
    () => (reducedMotion ? buildReducedNotes(domain) : state.notes),
    [reducedMotion, domain, state.notes]
  );

  // Find the flying note body (rendered as silhouette during flight)
  const flyingNote = useMemo(() => {
    if (!state.promotingNoteId) return null;
    return renderNotes.find((n) => n.id === state.promotingNoteId) ?? null;
  }, [state.promotingNoteId, renderNotes]);

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
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <ViewToggle view={state.view} onChange={setView} />
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
        </div>

        {/* Capture field (only in Stream view) */}
        {state.view === "stream" ? (
          <CaptureField
            text={state.captureText}
            active={state.field === "capture" && !reducedMotion}
            placeholder={placeholder}
          />
        ) : null}

        {/* View body */}
        <div style={{ marginTop: state.view === "stream" ? 18 : 4 }}>
          <AnimatePresence mode="wait">
            {state.view === "stream" ? (
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
                  pressedNoteId={state.pressedNoteId}
                  promotePressed={state.promotePressed}
                  promotingNoteId={state.promotingNoteId}
                  onRegister={onRegisterNote}
                />
              </motion.div>
            ) : (
              <motion.div
                key="tags"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
              >
                <TagsView notes={renderNotes} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search row (only in Stream view) */}
        {!reducedMotion && state.view === "stream" && state.notes.length >= 3 ? (
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

        {/* Flying silhouette — the promoted note's "card on its way" */}
        <AnimatePresence>
          {flyingNote && state.flightFrom ? (
            <motion.div
              key="flight"
              initial={{
                opacity: 0.9,
                x: state.flightFrom.x,
                y: state.flightFrom.y,
                scale: 1,
              }}
              animate={{
                opacity: 0,
                x: state.flightFrom.x + 520,
                y: state.flightFrom.y + 40,
                scale: 0.6,
              }}
              transition={{
                duration: 1.05,
                ease: [0.4, 0, 0.2, 1],
              }}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 320,
                pointerEvents: "none",
                zIndex: 15,
                borderRadius: 10,
                background: "var(--color-paper)",
                border: "1px solid var(--color-accent)",
                boxShadow:
                  "0 12px 28px -12px color-mix(in srgb, var(--color-accent) 50%, transparent)",
                padding: "10px 14px",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-inter)",
                  fontSize: 13,
                  lineHeight: 1.45,
                  color: "var(--color-ink)",
                  margin: 0,
                }}
              >
                {flyingNote.body}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Tasks edge indicator */}
        {state.view === "stream" ? (
          <TasksEdge active={state.tasksEdgeActive} />
        ) : null}
      </motion.div>
    </section>
  );
}
