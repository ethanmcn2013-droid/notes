"use client";

import type React from "react";

import { RelativeTime } from "./RelativeTime";
import { firstLine, preview, type NoteRead } from "./utils";

interface NoteRowProps {
  note: NoteRead;
  isOpen: boolean;
  isFresh: boolean;
  isPromoting: boolean;
  hasFeedback: boolean;
  hasTray: boolean;
  onRowClick: (e: React.MouseEvent) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
  onGhostPromote: (e: React.MouseEvent) => void;
  onTrayPromote: () => void;
  onTrayCancel: () => void;
}

export function NoteRow({
  note,
  isOpen,
  isFresh,
  isPromoting,
  hasFeedback,
  hasTray,
  onRowClick,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onGhostPromote,
  onTrayPromote,
  onTrayCancel,
}: NoteRowProps) {
  const title = firstLine(note.body);
  const previewText = preview(note.body);
  return (
    <li className="note-list-item">
      <div className="note-row-wrapper">
        <button
          type="button"
          className={[
            "note-row",
            isFresh ? "is-fresh" : "",
            isPromoting ? "is-promoted" : "",
            hasFeedback ? "is-longpress-feedback" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onClick={onRowClick}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
          data-note-row={note.id}
          aria-expanded={isOpen}
          aria-controls={`note-panel-${note.id}`}
        >
          <span>
            <span className="note-title">{title}</span>
            {previewText && !isOpen && (
              <span className="note-preview">{previewText}</span>
            )}
          </span>
          <span className="note-meta">
            {isPromoting && (
              <span className="note-tasks-label" aria-label="In Tasks">
                In Tasks
              </span>
            )}
            {!isPromoting && note.promotedTaskId && (
              <span aria-label="In Tasks" className="note-dot--sent" />
            )}
            {!isPromoting && note.extractBody && !note.promotedTaskId && (
              <span aria-label="Extract drafted — not yet in Tasks" className="note-dot" />
            )}
            {!isPromoting && (
              <span>
                <RelativeTime ts={note.createdAt} />
              </span>
            )}
          </span>
        </button>

        {/* Pointer hover ghost button — "→ Tasks". Hidden on touch via CSS. */}
        {!isPromoting && (
          <button
            type="button"
            className="note-ghost-promote"
            onClick={onGhostPromote}
            title={`Will add: ${title.slice(0, 40)}${title.length > 40 ? "…" : ""}`}
            aria-label={`Send to Tasks: ${title}`}
          >
            → Tasks
          </button>
        )}
      </div>

      {hasTray && (
        <div
          className="note-promote-tray"
          role="group"
          aria-label="Promote note"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="note-tray-promote"
            disabled={isPromoting}
            onClick={onTrayPromote}
          >
            Send to Tasks
          </button>
          <button
            type="button"
            className="note-tray-cancel"
            onClick={onTrayCancel}
          >
            Cancel
          </button>
        </div>
      )}
    </li>
  );
}
