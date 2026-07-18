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
import { LAB_NOW } from "./lab-fixtures";
import { useNotesLab } from "./lab-store";
import { NotesWordmark } from "./lab-wordmark";
import type { LabNote } from "./lab-types";
import styles from "./notes-lab.module.css";

const DAY = 86_400_000;

function groups(notes: LabNote[], searching: boolean) {
  if (searching) return [{ label: "Matches", notes }];
  return [
    { label: "Today", notes: notes.filter((note) => LAB_NOW - note.createdAt < DAY) },
    {
      label: "This week",
      notes: notes.filter(
        (note) => LAB_NOW - note.createdAt >= DAY && LAB_NOW - note.createdAt < 7 * DAY,
      ),
    },
    { label: "Earlier", notes: notes.filter((note) => LAB_NOW - note.createdAt >= 7 * DAY) },
  ].filter((group) => group.notes.length > 0);
}

export default function OptionB() {
  const { state, notes, openNote } = useNotesLab();
  const noteGroups = groups(notes, Boolean(state.query));

  return (
    <main id="main-content" className={styles.optionB} data-option="b">
      <header className={styles.bMasthead}>
        <NotesWordmark size="lg" />
        <div>
          <span className={styles.directionLabel}>B · Quiet Editorial Stream</span>
          <p>Private notes with room to read.</p>
        </div>
      </header>

      <CaptureComposer />
      <StateBanner />
      <SearchControl />

      <section className={styles.editorialStream} aria-labelledby="option-b-stream-title">
        <header className={styles.editorialIntro}>
          <h1 id="option-b-stream-title">{openNote ? "Reading" : "By date"}</h1>
          <p>
            {openNote
              ? "One private note, with its place waiting in the stream."
              : `${notes.length} notes, newest first.`}
          </p>
        </header>
        {openNote ? (
          <div className={styles.editorialReading}>
            <DetailEditor />
          </div>
        ) : state.mode === "loading" ? (
          <>
            <LoadingState />
            {noteGroups.map((group) => (
              <section className={styles.dateGroup} key={group.label} aria-labelledby={`group-${group.label.replace(/\s/g, "-")}`}>
                <h2 id={`group-${group.label.replace(/\s/g, "-")}`}>{group.label}</h2>
                <ol>
                  {group.notes.map((note) => (
                    <li key={note.id}>
                      <StreamRow note={note} editorial selected={false} />
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </>
        ) : notes.length === 0 ? (
          <EmptyState query={Boolean(state.query)} />
        ) : (
          noteGroups.map((group) => (
            <section className={styles.dateGroup} key={group.label} aria-labelledby={`group-${group.label.replace(/\s/g, "-")}`}>
              <h2 id={`group-${group.label.replace(/\s/g, "-")}`}>{group.label}</h2>
              <ol>
                {group.notes.map((note) => (
                  <li key={note.id}>
                    <StreamRow note={note} editorial selected={state.openNoteId === note.id} />
                  </li>
                ))}
              </ol>
            </section>
          ))
        )}
      </section>
    </main>
  );
}
