"use client";

import {
  CaptureComposer,
  DetailEditor,
  EmptyState,
  LoadingState,
  SearchControl,
  StateBanner,
  StreamRow,
} from "./lab-components";
import { useNotesLab } from "./lab-store";
import { NotesWordmark } from "./lab-wordmark";
import styles from "./notes-lab.module.css";

export default function OptionA() {
  const { state, notes } = useNotesLab();

  return (
    <main id="main-content" className={styles.optionA} data-option="a">
      <header className={styles.aHeader}>
        <div>
          <NotesWordmark size="md" />
          <span className={styles.directionLabel}>A · Instant Notebook</span>
        </div>
      </header>

      <CaptureComposer compact />
      <StateBanner />
      <div className={styles.aSearchBand}>
        <SearchControl minimal />
      </div>

      <section className={styles.stream} aria-labelledby="option-a-stream-title">
        <header className={styles.streamHeader}>
          <h1 id="option-a-stream-title">Recent notes</h1>
          <span>{notes.length} notes</span>
        </header>
        {state.mode === "loading" ? (
          <>
            <LoadingState />
            {notes.length ? (
              <ol className={styles.flatList}>
                {notes.map((note) => (
                  <li key={note.id}>
                    <StreamRow note={note} selected={state.openNoteId === note.id} />
                  </li>
                ))}
              </ol>
            ) : null}
          </>
        ) : notes.length === 0 ? (
          <EmptyState query={Boolean(state.query)} />
        ) : (
          <ol className={styles.flatList}>
            {notes.map((note) => (
              <li key={note.id}>
                <StreamRow note={note} selected={state.openNoteId === note.id} />
                {state.openNoteId === note.id ? <DetailEditor /> : null}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
