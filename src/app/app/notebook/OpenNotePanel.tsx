"use client";

import type React from "react";
import type { RefObject } from "react";

import type { ExtractSendResult } from "@/server/actions/notes";

import { RelativeTime } from "./RelativeTime";
import type { NoteRead } from "./utils";

interface OpenNotePanelProps {
  openNote: NoteRead;
  srConfirm: string;
  openNoteConfirmId: string | null;
  editingExtractFor: string | null;
  draftAction: string;
  setDraftAction: (v: string) => void;
  extractInputRef: RefObject<HTMLInputElement | null>;
  extractError: string | null;
  sendingExtractFor: string | null;
  sentResults: Map<string, ExtractSendResult>;
  onPromoteFromOpenNote: (noteId: string) => void;
  onStartEditingExtract: (note: NoteRead) => void;
  onCancelEditingExtract: () => void;
  onCommitExtract: (noteId: string) => void;
  onExtractKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, noteId: string) => void;
  onRemoveExtract: (noteId: string) => void;
  onSendToTasks: (noteId: string) => void;
  onClearExtractError: () => void;
}

export function OpenNotePanel({
  openNote,
  srConfirm,
  openNoteConfirmId,
  editingExtractFor,
  draftAction,
  setDraftAction,
  extractInputRef,
  extractError,
  sendingExtractFor,
  sentResults,
  onPromoteFromOpenNote,
  onStartEditingExtract,
  onCancelEditingExtract,
  onCommitExtract,
  onExtractKeyDown,
  onRemoveExtract,
  onSendToTasks,
  onClearExtractError,
}: OpenNotePanelProps) {
  return (
    <article className="open-note" aria-label="Open note" id={`note-panel-${openNote.id}`}>
      {/* Always-mounted polite announcer — empty until success so the
          screen reader reliably announces the change (NVDA/TalkBack
          ignore live regions that mount already-populated). */}
      <span className="sr-only" aria-live="polite" aria-atomic="true">
        {srConfirm}
      </span>
      <div className="open-note-head">
        <span>
          Captured <RelativeTime ts={openNote.createdAt} />
        </span>
        <div className="open-note-head-controls">
          {openNote.promotedTaskId ? (
            <span className="open-note-promoted-label">In Tasks</span>
          ) : !openNote.extractBody && editingExtractFor !== openNote.id ? (
            <button
              type="button"
              className="open-note-corner-send"
              onClick={() => onPromoteFromOpenNote(openNote.id)}
              aria-label="Send note to Tasks"
              title="Send to Tasks"
            >
              <svg
                aria-hidden
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M2 7h9" />
                <path d="m7.5 3 4 4-4 4" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
      <p className="open-note-body">{openNote.body}</p>

      {!openNote.promotedTaskId &&
        !openNote.extractBody &&
        editingExtractFor !== openNote.id && (
          <div
            className="open-note-action-pair"
            role="group"
            aria-label="Send or shape this note"
          >
            <button
              type="button"
              className="btn-draft-action btn-draft-action--primary"
              onClick={() => onPromoteFromOpenNote(openNote.id)}
              aria-label="Send note to Tasks as written"
            >
              Send as-is
            </button>
            <button
              type="button"
              className="btn-draft-action btn-draft-action--equal"
              onClick={() => onStartEditingExtract(openNote)}
              aria-label="Shape the wording before sending to Tasks"
            >
              Shape &amp; send
            </button>
          </div>
        )}

      {openNoteConfirmId === openNote.id && (
        <p className="open-note-promote-confirm" aria-hidden="true">
          Added to your Tasks workspace.
        </p>
      )}

      {editingExtractFor === openNote.id && (
        <div className="extract-input" role="group" aria-label="Draft action">
          {(() => {
            // Offer the note's own lines as one-tap prefills — pick which
            // line becomes the task instead of retyping it. Only when there
            // is more than one distinct line worth choosing between.
            const pickable = Array.from(
              new Set(
                openNote.body
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean),
              ),
            ).slice(0, 6);
            if (pickable.length < 2) return null;
            return (
              <div
                className="extract-line-picker"
                role="group"
                aria-label="Pick a line from the note"
              >
                <span className="extract-line-picker-label">Pick a line</span>
                <div className="extract-line-picker-options">
                  {pickable.map((line, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="extract-line-chip"
                      onClick={() => {
                        setDraftAction(line);
                        extractInputRef.current?.focus();
                      }}
                    >
                      {line}
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}
          <label className="sr-only" htmlFor="extract-input-field">
            Action wording
          </label>
          <input
            ref={extractInputRef}
            id="extract-input-field"
            type="text"
            value={draftAction}
            onChange={(event) => setDraftAction(event.target.value)}
            onKeyDown={(event) => onExtractKeyDown(event, openNote.id)}
            placeholder="Type the action wording — be deliberate."
            maxLength={280}
            spellCheck
            autoComplete="off"
          />
          <div className="extract-input-controls">
            <button
              type="button"
              className="btn-delete"
              onClick={onCancelEditingExtract}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-draft-action"
              onClick={() => onCommitExtract(openNote.id)}
              disabled={draftAction.trim().length === 0}
            >
              Save
            </button>
          </div>
          <p className="extract-hint">
            A date or #tag carries into Tasks. <kbd>Enter</kbd> saves ·{" "}
            <kbd>Esc</kbd> cancels
          </p>
        </div>
      )}

      {openNote.extractBody && editingExtractFor !== openNote.id && (
        <div className="extract-drafted" aria-label="Action drafted">
          {openNote.promotedTaskId ? (
            <p className="extract-drafted-meta">
              Sent to {sentResults.get(openNote.id)?.workspaceName ?? "Tasks"}
            </p>
          ) : (
            <p className="extract-drafted-meta">
              Saved. Ready to send to Signal Tasks.
            </p>
          )}
          <p className="extract-drafted-body">{openNote.extractBody}</p>
          <div className="extract-drafted-controls">
            {openNote.promotedTaskId ? (
              (() => {
                const sent = sentResults.get(openNote.id);
                return sent?.taskUrl ? (
                  <a
                    className="btn-delete"
                    href={sent.taskUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Tasks
                  </a>
                ) : null;
              })()
            ) : (
              <button
                type="button"
                className="btn-draft-action"
                onClick={() => onSendToTasks(openNote.id)}
                disabled={sendingExtractFor === openNote.id}
              >
                {sendingExtractFor === openNote.id ? "Sending…" : "Send to Tasks"}
              </button>
            )}
            {!openNote.promotedTaskId && (
              <div
                className="extract-overflow"
                data-state={
                  sendingExtractFor === openNote.id ? "disabled" : "ready"
                }
              >
                <button
                  type="button"
                  className="extract-overflow-trigger"
                  aria-label="More actions for drafted extract"
                  aria-haspopup="menu"
                  disabled={sendingExtractFor === openNote.id}
                >
                  <span aria-hidden>···</span>
                </button>
                <div className="extract-overflow-menu" role="menu">
                  <button
                    type="button"
                    role="menuitem"
                    className="btn-delete"
                    onClick={() => onStartEditingExtract(openNote)}
                    disabled={sendingExtractFor === openNote.id}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="btn-delete"
                    onClick={() => onRemoveExtract(openNote.id)}
                    disabled={sendingExtractFor === openNote.id}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {extractError && (
        <div role="alert" className="extract-error">
          <span>{extractError}</span>
          <button
            type="button"
            className="undo-toast-btn"
            style={{ marginLeft: 8 }}
            onClick={() => {
              onClearExtractError();
              onSendToTasks(openNote.id);
            }}
          >
            Retry
          </button>
        </div>
      )}
    </article>
  );
}
