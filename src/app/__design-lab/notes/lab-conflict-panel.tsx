"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { useNotesLab } from "./lab-store";
import styles from "./notes-lab.module.css";

const dateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/London",
});

function Version({
  label,
  body,
  updatedAt,
}: {
  label: string;
  body: string;
  updatedAt: number;
}) {
  return (
    <article className={styles.conflictVersion}>
      <header>
        <h3>{label}</h3>
        <time dateTime={new Date(updatedAt).toISOString()}>
          {dateTime.format(updatedAt)}
        </time>
      </header>
      <pre>{body}</pre>
    </article>
  );
}

export function ConflictPanel() {
  const { state, actions } = useNotesLab();
  const headingId = useId();
  const panelRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (state.lastConflictResolution) {
      panelRef.current?.focus({ preventScroll: true });
    }
  }, [state.lastConflictResolution]);

  if (state.conflict) {
    const { conflict } = state;
    return (
      <section
        ref={panelRef}
        className={styles.conflictPanel}
        aria-labelledby={headingId}
        data-lab-conflict="unresolved"
      >
        <header className={styles.conflictHeader}>
          <div>
            <p>Edit conflict</p>
            <h2 id={headingId}>Both exact versions are safe</h2>
          </div>
          <span>Nothing is overwritten until you choose</span>
        </header>
        <div className={styles.conflictVersions}>
          <Version
            label="This device"
            body={conflict.local.body}
            updatedAt={conflict.local.updatedAt}
          />
          <Version
            label="Other device"
            body={conflict.remote.body}
            updatedAt={conflict.remote.updatedAt}
          />
        </div>
        <div className={styles.conflictActions} role="group" aria-label="Resolve edit conflict">
          <button type="button" onClick={() => actions.resolveConflict("keep-local")}>
            Keep this device
          </button>
          <button type="button" onClick={() => actions.resolveConflict("use-remote")}>
            Use other device
          </button>
          <button type="button" onClick={() => actions.resolveConflict("keep-both")}>
            Keep both as notes
          </button>
        </div>
      </section>
    );
  }

  const receipt = state.lastConflictResolution;
  if (!receipt) return null;

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className={styles.conflictPanel}
      aria-labelledby={headingId}
      data-lab-conflict="resolved"
    >
      <header className={styles.conflictHeader}>
        <div>
          <p>Resolution receipt</p>
          <h2 id={headingId}>Conflict resolved without losing either original</h2>
        </div>
        <span>{receipt.resultingNoteIds.length} resulting note{receipt.resultingNoteIds.length === 1 ? "" : "s"}</span>
      </header>
      <details>
        <summary>Review the two retained originals</summary>
        <div className={styles.conflictVersions}>
          <Version
            label="Original from this device"
            body={receipt.local.body}
            updatedAt={receipt.local.updatedAt}
          />
          <Version
            label="Original from other device"
            body={receipt.remote.body}
            updatedAt={receipt.remote.updatedAt}
          />
        </div>
      </details>
    </section>
  );
}
