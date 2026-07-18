"use client";

import { useEffect, useRef, useState } from "react";
import {
  CaptureComposer,
  DetailEditor,
  EmptyState,
  LoadingState,
  SearchControl,
  StateBanner,
  StreamRow,
} from "./lab-components";
import { hasProtectedDetailWork } from "./lab-model";
import { useNotesLab } from "./lab-store";
import { NotesWordmark } from "./lab-wordmark";
import styles from "./notes-lab.module.css";

export default function OptionC() {
  const { state, notes, actions } = useNotesLab();
  const [searchOpen, setSearchOpen] = useState(
    state.scenario === "search" || Boolean(state.query),
  );
  const previousScenario = useRef(state.scenario);

  useEffect(() => {
    if (previousScenario.current === state.scenario) return;
    previousScenario.current = state.scenario;
    setSearchOpen(state.scenario === "search" || Boolean(state.query));
  }, [state.query, state.scenario]);

  useEffect(() => {
    function openSearch(event: globalThis.KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLocaleLowerCase() !== "k") return;
      event.preventDefault();
      if (hasProtectedDetailWork(state)) {
        actions.closeNote();
        return;
      }
      if (state.openNoteId) actions.closeNote();
      setSearchOpen(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.querySelector<HTMLInputElement>("[data-lab-search]")?.focus();
        });
      });
    }
    document.addEventListener("keydown", openSearch);
    return () => document.removeEventListener("keydown", openSearch);
  }, [actions, state]);

  return (
    <main
      id="main-content"
      className={`${styles.optionC} ${state.openNoteId ? styles.optionCOpen : ""}`}
      data-option="c"
    >
      <header className={styles.cHeader}>
        <div>
          <NotesWordmark size="md" />
          <span className={styles.directionLabel}>C · Capture Field</span>
        </div>
        <button
          type="button"
          className={styles.quietButton}
          data-open-search="true"
          aria-expanded={searchOpen}
          onClick={() => {
            if (searchOpen) actions.setQuery("");
            setSearchOpen((open) => !open);
          }}
        >
          {searchOpen ? "Close search" : "Open search"}
        </button>
      </header>

      <div className={styles.cCaptureBand}>
        <CaptureComposer />
      </div>
      <div className={styles.cStateBand}><StateBanner /></div>

      <div className={styles.cWorkspace}>
        {searchOpen ? (
          <aside className={styles.cSearchRail}>
            <SearchControl />
            <p>Search filters this private notebook. Clear it to return to newest-first order.</p>
          </aside>
        ) : null}

        <section className={styles.cStream} aria-labelledby="option-c-stream-title">
          <header className={styles.streamHeader}>
            <h1 id="option-c-stream-title">Latest captures</h1>
            <span>{notes.length} notes, newest first</span>
          </header>
          {state.mode === "loading" ? (
            <>
              <LoadingState />
              {notes.length ? (
                <ol className={styles.cList}>
                  {notes.map((note) => (
                    <li key={note.id}>
                      <StreamRow note={note} selected={false} />
                    </li>
                  ))}
                </ol>
              ) : null}
            </>
          ) : notes.length === 0 ? (
            <EmptyState query={Boolean(state.query)} />
          ) : (
            <ol className={styles.cList}>
              {notes.map((note) => (
                <li key={note.id}>
                  <StreamRow note={note} selected={state.openNoteId === note.id} />
                </li>
              ))}
            </ol>
          )}
        </section>

        {state.openNoteId ? (
          <div className={styles.cDetail}>
            <h1 className={styles.mobileDetailHeading}>Private note detail</h1>
            <DetailEditor pane />
          </div>
        ) : null}
      </div>
    </main>
  );
}
