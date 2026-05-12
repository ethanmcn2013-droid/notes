"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  CAPTURE_SCRIPT,
  type DemoState,
  type Field,
  type Note,
  type Scene,
  SEARCH_QUERY,
} from "./types";
import { CaptureField } from "./capture-field";
import { NoteStream } from "./note-stream";
import { Caret } from "./caret";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Time per keystroke in milliseconds — varied slightly for human rhythm. */
const TYPE_INTERVAL_MS = 45;
const TYPE_JITTER_MS = 30;

const SEARCH_TYPE_MS = 80;

/** Reduced-motion fallback: a fully populated stream + empty capture field. */
const REDUCED_NOTES: Note[] = CAPTURE_SCRIPT.map((entry, i) => ({
  id: `note-${i}`,
  body: entry.text,
  stamp: entry.stamp,
}));

export function NotesDemo() {
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState<DemoState>({
    notes: [],
    scene: "boot",
    field: "capture",
    captureText: "",
    searchText: "",
    searchHit: null,
    placeholderIndex: 0,
  });
  const aliveRef = useRef(true);

  const setScene = useCallback((scene: Scene) => {
    setState((s) => ({ ...s, scene }));
  }, []);

  const setField = useCallback((field: Field) => {
    setState((s) => ({ ...s, field }));
  }, []);

  /** Type out a string into the capture field, char by char. Bails on unmount. */
  const typeCapture = useCallback(
    async (text: string) => {
      for (let i = 1; i <= text.length; i++) {
        if (!aliveRef.current) return;
        setState((s) => ({ ...s, captureText: text.slice(0, i) }));
        const jitter = Math.random() * TYPE_JITTER_MS;
        await wait(TYPE_INTERVAL_MS + jitter);
      }
    },
    []
  );

  const typeSearch = useCallback(async (text: string) => {
    for (let i = 1; i <= text.length; i++) {
      if (!aliveRef.current) return;
      setState((s) => ({ ...s, searchText: text.slice(0, i) }));
      await wait(SEARCH_TYPE_MS);
    }
  }, []);

  /** Commit current capture to the note stream and clear the field. */
  const commit = useCallback((index: number) => {
    const entry = CAPTURE_SCRIPT[index];
    if (!entry) return;
    const newNote: Note = {
      id: `note-${index}`,
      body: entry.text,
      stamp: entry.stamp,
      fresh: true,
    };
    setState((s) => ({
      ...s,
      // Newest at top — prepend.
      notes: [
        newNote,
        ...s.notes.map((n) => ({ ...n, fresh: false })),
      ],
      captureText: "",
      placeholderIndex: (index + 1) % CAPTURE_SCRIPT.length,
    }));
  }, []);

  const setSearchHit = useCallback((id: string | null) => {
    setState((s) => ({ ...s, searchHit: id }));
  }, []);

  const reset = useCallback(() => {
    setState({
      notes: [],
      scene: "boot",
      field: "capture",
      captureText: "",
      searchText: "",
      searchHit: null,
      placeholderIndex: 0,
    });
  }, []);

  /** The main timeline. */
  useEffect(() => {
    if (reducedMotion) return;
    aliveRef.current = true;

    async function runLoop() {
      reset();
      await wait(900);
      if (!aliveRef.current) return;

      // Capture 1.
      setScene("capture-1-type");
      await wait(400);
      await typeCapture(CAPTURE_SCRIPT[0].text);
      if (!aliveRef.current) return;
      await wait(380);
      setScene("capture-1-commit");
      commit(0);
      await wait(900);
      if (!aliveRef.current) return;

      // Capture 2.
      setScene("capture-2-type");
      await wait(560);
      await typeCapture(CAPTURE_SCRIPT[1].text);
      if (!aliveRef.current) return;
      await wait(380);
      setScene("capture-2-commit");
      commit(1);
      await wait(900);
      if (!aliveRef.current) return;

      // Capture 3.
      setScene("capture-3-type");
      await wait(420);
      await typeCapture(CAPTURE_SCRIPT[2].text);
      if (!aliveRef.current) return;
      await wait(360);
      setScene("capture-3-commit");
      commit(2);
      await wait(1100);
      if (!aliveRef.current) return;

      // Search.
      setScene("search-type");
      setField("search");
      await wait(600);
      await typeSearch(SEARCH_QUERY);
      if (!aliveRef.current) return;
      await wait(220);
      setScene("search-result");
      setSearchHit("note-0"); // Lamb's Hill — the note with "contract".
      await wait(2400);
      if (!aliveRef.current) return;

      // Quiet hold then loop.
      setScene("reset");
      setSearchHit(null);
      setState((s) => ({ ...s, searchText: "" }));
      setField("capture");
      await wait(900);
      if (!aliveRef.current) return;
    }

    let cancelled = false;
    (async function loop() {
      while (!cancelled && aliveRef.current) {
        await runLoop();
      }
    })();

    return () => {
      cancelled = true;
      aliveRef.current = false;
    };
  }, [reducedMotion, reset, setScene, setField, typeCapture, typeSearch, commit, setSearchHit]);

  const placeholder =
    CAPTURE_SCRIPT[state.placeholderIndex]?.placeholder ?? "What just came up?";

  const renderNotes = reducedMotion ? REDUCED_NOTES : state.notes;

  return (
    <section
      style={{
        display: "flex",
        justifyContent: "center",
        paddingTop: 40,
        paddingBottom: 24,
      }}
    >
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          maxWidth: 520,
          background: "var(--color-bg)",
          border: "1px solid var(--color-line)",
          borderRadius: 18,
          padding: "26px 24px 24px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
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
            Notebook
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
            today
          </span>
        </div>

        {/* Capture field */}
        <CaptureField
          text={state.captureText}
          active={state.field === "capture" && !reducedMotion}
          placeholder={placeholder}
        />

        {/* Stream */}
        <div style={{ marginTop: 18 }}>
          <NoteStream notes={renderNotes} highlightId={state.searchHit} />
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
