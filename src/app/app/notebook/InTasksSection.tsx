"use client";

import type { ExtractSendResult } from "@/server/actions/notes";

import { firstLine, type NoteRead } from "./utils";

interface InTasksSectionProps {
  archivedNotes: NoteRead[];
  archivedOpen: boolean;
  unpromotingIds: Set<string>;
  sentResults: Map<string, ExtractSendResult>;
  onToggleOpen: () => void;
  onUnpromote: (noteId: string) => void;
}

export function InTasksSection({
  archivedNotes,
  archivedOpen,
  unpromotingIds,
  sentResults,
  onToggleOpen,
  onUnpromote,
}: InTasksSectionProps) {
  if (archivedNotes.length === 0) return null;
  return (
    <div className="in-tasks-section">
      <button
        type="button"
        className="in-tasks-toggle"
        aria-expanded={archivedOpen}
        onClick={onToggleOpen}
      >
        <span>In Tasks ({archivedNotes.length})</span>
        <span className={`in-tasks-chevron${archivedOpen ? " is-open" : ""}`} aria-hidden>
          ▾
        </span>
      </button>

      {archivedOpen && (
        <ol className="in-tasks-list" aria-label="Promoted notes in Tasks">
          {archivedNotes.map((note) => {
            const sent = sentResults.get(note.id);
            const isUnpromoting = unpromotingIds.has(note.id);
            return (
              <li key={note.id} className="in-tasks-row">
                <span className="in-tasks-title">{firstLine(note.body)}</span>
                <span className="in-tasks-meta">
                  {note.extractBody && (
                    <span className="in-tasks-extract">{note.extractBody}</span>
                  )}
                  {sent?.taskUrl && (
                    <a
                      href={sent.taskUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="in-tasks-link"
                    >
                      Open in Tasks
                    </a>
                  )}
                </span>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => onUnpromote(note.id)}
                  disabled={isUnpromoting}
                  aria-label={`Remove from Tasks: ${firstLine(note.body)}`}
                >
                  {isUnpromoting ? "Removing…" : "Remove from Tasks"}
                </button>
              </li>
            );
          })}
          <li className="in-tasks-footer">
            Note returned here. The task stays in Tasks.
          </li>
        </ol>
      )}
    </div>
  );
}
