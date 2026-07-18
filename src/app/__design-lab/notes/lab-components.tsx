"use client";

import {
  Fragment,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  displayTitle,
  formatRelative,
  hasPendingExtraction,
  hasProtectedDetailWork,
  isDetailDirty,
  searchPresentation,
} from "./lab-model";
import { ConflictPanel } from "./lab-conflict-panel";
import { useNotesLab, useNotesLabDraft } from "./lab-store";
import type { SearchHighlightRange } from "./lab-model";
import type { LabMode, LabNote } from "./lab-types";
import styles from "./notes-lab.module.css";

declare global {
  interface Window {
    __signalNotesLabClaimEarlyDraft?: () => {
      value: string;
      pendingSave: boolean;
    };
    __signalNotesLabEarlyDraftInstalled?: boolean;
  }
}

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function detailPanelId(noteId: LabNote["id"]) {
  return `lab-note-detail-${noteId}`;
}

function focusDetailPanel(noteId: LabNote["id"]) {
  requestAnimationFrame(() => {
    const panel = document.getElementById(detailPanelId(noteId));
    panel?.focus();
    panel?.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
}

function focusNoteOpener(noteId: LabNote["id"]) {
  requestAnimationFrame(() => {
    const opener = document.querySelector<HTMLElement>(
      `[data-note-id="${noteId}"] [data-open-note]`,
    );
    opener?.focus();
    opener?.scrollIntoView({ block: "nearest", inline: "nearest" });
  });
}

function selectionFromTextarea(element: HTMLTextAreaElement) {
  return element.value.slice(element.selectionStart, element.selectionEnd);
}

function insertNewLine(element: HTMLTextAreaElement, value: string) {
  const start = element.selectionStart;
  const end = element.selectionEnd;
  return {
    value: `${value.slice(0, start)}\n${value.slice(end)}`,
    caret: start + 1,
  };
}

export function CaptureComposer({ compact = false }: { compact?: boolean }) {
  const { state, actions } = useNotesLab();
  const { draft, setDraft } = useNotesLabDraft();
  const inputId = useId();
  const helpId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const promptWasOpen = useRef(false);
  const adoptedPreHydrationValue = useRef(false);
  const readOnly = state.mode === "read-only";

  useEffect(() => {
    const input = textareaRef.current;
    if (!input || state.metrics.focusReadyMs !== null) return;
    if (document.activeElement === input) {
      actions.setMetric("focusReadyMs", performance.now());
    }
  }, [actions, state.metrics.focusReadyMs]);

  useLayoutEffect(() => {
    const input = textareaRef.current;
    if (!input) return;
    if (!adoptedPreHydrationValue.current) {
      adoptedPreHydrationValue.current = true;
      const early = window.__signalNotesLabClaimEarlyDraft?.();
      const earlyDraft = early?.value ?? "";
      input.removeAttribute("data-early-save");
      if (earlyDraft) {
        input.value = earlyDraft;
        setDraft(earlyDraft);
        if (early?.pendingSave) {
          queueMicrotask(() => actions.capture(earlyDraft));
        }
      } else if (input.value && input.value !== draft) {
        setDraft(input.value);
      } else if (!input.value && draft) {
        input.value = draft;
      }
      return;
    }
    if (!draft && input.value && state.discardPrompt === null) {
      input.value = "";
    }
  }, [actions, draft, setDraft, state.discardPrompt]);

  useEffect(() => {
    if (state.discardPrompt === "capture") {
      promptWasOpen.current = true;
      return;
    }
    if (promptWasOpen.current) {
      promptWasOpen.current = false;
      textareaRef.current?.focus();
    }
  }, [state.discardPrompt]);

  function saveFromKeyboard(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      if (event.currentTarget.value) {
        event.preventDefault();
        actions.requestCaptureDiscard();
      }
      return;
    }
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    const value = event.currentTarget.value;
    actions.capture(value);
    if (value.trim() && !readOnly) event.currentTarget.value = "";
  }

  function addNewLine() {
    const input = textareaRef.current;
    if (!input) return;
    const next = insertNewLine(input, input.value);
    input.value = next.value;
    setDraft(next.value);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(next.caret, next.caret);
    });
  }

  return (
    <section
      className={classNames(styles.capture, compact && styles.captureCompact)}
      aria-labelledby={`${inputId}-label`}
      data-capture-ready="true"
    >
      <div className={styles.captureHeading}>
        <label id={`${inputId}-label`} htmlFor={inputId}>
          Capture a private note
        </label>
        <span aria-hidden="true">private by default</span>
      </div>
      <textarea
        ref={textareaRef}
        id={inputId}
        data-lab-capture="true"
        data-1p-ignore="true"
        autoFocus={state.metrics.focusReadyMs === null}
        rows={compact ? 2 : 3}
        readOnly={readOnly}
        aria-describedby={helpId}
        placeholder={
          readOnly ? "Capture is paused in read-only mode" : "Write it before it fades"
        }
        onChange={(event) => setDraft(event.target.value)}
        onFocus={() => {
          if (state.metrics.focusReadyMs === null) {
            actions.setMetric("focusReadyMs", performance.now());
          }
        }}
        onKeyDown={saveFromKeyboard}
      />
      <div className={styles.captureFooter}>
        <p id={helpId}>
          Enter saves. Shift+Enter adds a line. Nothing becomes a task here.
        </p>
        <div className={styles.captureActions}>
          <button type="button" className={styles.quietButton} onClick={addNewLine} disabled={readOnly}>
            New line
          </button>
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => {
              const value = textareaRef.current?.value ?? draft;
              actions.capture(value);
              if (value.trim() && !readOnly && textareaRef.current) {
                textareaRef.current.value = "";
              }
            }}
            disabled={readOnly || !draft.trim()}
          >
            Save note
          </button>
        </div>
      </div>
      {state.discardPrompt === "capture" ? <DiscardPrompt target="capture" /> : null}
    </section>
  );
}

export function SearchControl({ minimal = false }: { minimal?: boolean }) {
  const { state, notes, actions } = useNotesLab();
  const searchId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!state.query.trim()) return;
    const timer = window.setTimeout(() => {
      actions.announce(
        `${notes.length} ${notes.length === 1 ? "result" : "results"} for ${state.query.trim()}.`,
      );
    }, 320);
    return () => window.clearTimeout(timer);
  }, [actions, notes.length, state.query]);

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      event.preventDefault();
      actions.setQuery("");
      inputRef.current?.focus();
    }
    if (event.key === "ArrowDown" && state.query) {
      event.preventDefault();
      actions.moveSearch(1);
    }
    if (event.key === "ArrowUp" && state.query) {
      event.preventDefault();
      actions.moveSearch(-1);
    }
  }

  return (
    <search className={classNames(styles.search, minimal && styles.searchMinimal)}>
      <label htmlFor={searchId}>Search notes</label>
      <div className={styles.searchField}>
        <input
          ref={inputRef}
          id={searchId}
          data-lab-search="true"
          type="search"
          autoComplete="off"
          spellCheck="false"
          value={state.query}
          placeholder="Search private notes"
          onChange={(event) => actions.setQuery(event.target.value)}
          onKeyDown={onKeyDown}
        />
        {state.query ? (
          <button
            type="button"
            className={styles.textButton}
            onClick={() => {
              actions.setQuery("");
              inputRef.current?.focus();
            }}
          >
            Clear
          </button>
        ) : (
          <kbd>Ctrl K</kbd>
        )}
      </div>
      {state.query ? (
        <div className={styles.searchMeta}>
          <span>
            {notes.length} {notes.length === 1 ? "result" : "results"}
          </span>
          <div>
            <button type="button" onClick={() => {
              actions.moveSearch(-1);
            }} disabled={!notes.length}>
              Previous
            </button>
            <button type="button" onClick={() => {
              actions.moveSearch(1);
            }} disabled={!notes.length}>
              Next
            </button>
          </div>
        </div>
      ) : null}
    </search>
  );
}

function HighlightRanges({
  children,
  ranges,
}: {
  children: string;
  ranges: SearchHighlightRange[];
}) {
  if (ranges.length === 0) return children;
  let cursor = 0;
  return (
    <>
      {ranges.map((range, index) => {
        const before = children.slice(cursor, range.start);
        const match = children.slice(range.start, range.end);
        cursor = range.end;
        return (
          <Fragment key={`${range.start}-${range.end}-${index}`}>
            {before}
            <mark>{match}</mark>
          </Fragment>
        );
      })}
      {children.slice(cursor)}
    </>
  );
}

export function StreamRow({
  note,
  editorial = false,
  selected = false,
}: {
  note: LabNote;
  editorial?: boolean;
  selected?: boolean;
}) {
  const { state, actions } = useNotesLab();
  const presentation = searchPresentation(note, state.query);
  const { title, snippet } = presentation;

  return (
    <article
      className={classNames(
        styles.streamRow,
        editorial && styles.streamRowEditorial,
        selected && styles.streamRowSelected,
      )}
      data-note-id={note.id}
      data-sync-state={note.syncState}
    >
      <button
        type="button"
        data-open-note="true"
        className={styles.rowOpen}
        aria-expanded={selected}
        aria-controls={selected ? detailPanelId(note.id) : undefined}
        onClick={() => {
          actions.openNote(note.id);
          focusDetailPanel(note.id);
        }}
      >
        <span className={styles.rowCopy}>
          <strong>
            <HighlightRanges ranges={presentation.titleHighlights}>{title}</HighlightRanges>
          </strong>
          {snippet && (snippet !== title || presentation.snippetSource === "approved-extract") ? (
            <span>
              {presentation.snippetSource === "approved-extract" ? "Approved extract: " : null}
              <HighlightRanges ranges={presentation.snippetHighlights}>{snippet}</HighlightRanges>
            </span>
          ) : null}
        </span>
        <span className={styles.rowMeta}>
          <time dateTime={new Date(note.createdAt).toISOString()}>
            {formatRelative(note.createdAt)}
          </time>
          {note.approvedExtract ? <span>extract sent</span> : null}
          {note.syncState === "pending" ? <span>saving</span> : null}
          {note.syncState === "failed" ? <span className={styles.errorText}>not synced</span> : null}
        </span>
      </button>
      {note.syncState === "failed" ? (
        <div className={styles.rowRecovery}>
          <span>Your exact writing is retained.</span>
          <button type="button" onClick={() => actions.retrySync(note.id)}>
            Retry same note
          </button>
        </div>
      ) : null}
    </article>
  );
}

export function DetailEditor({ pane = false }: { pane?: boolean }) {
  const { state, openNote, actions } = useNotesLab();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleId = useId();
  const helpId = useId();
  const extractionPanelId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);
  const confirmDeleteRef = useRef<HTMLButtonElement>(null);
  const useSelectionRef = useRef<HTMLButtonElement>(null);
  const discardReturnFocusRef = useRef<HTMLElement | null>(null);
  const promptWasOpen = useRef(false);

  useEffect(() => {
    setConfirmDelete(false);
  }, [openNote?.id]);

  useLayoutEffect(() => {
    if (confirmDelete) confirmDeleteRef.current?.focus({ preventScroll: true });
  }, [confirmDelete]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    editor.style.height = "auto";
    editor.style.height = `${editor.scrollHeight}px`;
  }, [state.detailDraft]);

  useEffect(() => {
    if (state.discardPrompt === "detail") {
      promptWasOpen.current = true;
      return;
    }
    if (promptWasOpen.current && openNote) {
      promptWasOpen.current = false;
      const returnTarget = discardReturnFocusRef.current;
      discardReturnFocusRef.current = null;
      if (returnTarget?.isConnected) {
        returnTarget.focus({ preventScroll: true });
      } else {
        editorRef.current?.focus({ preventScroll: true });
      }
    }
  }, [openNote, state.discardPrompt]);

  if (!openNote) return null;
  const openNoteId = openNote.id;
  const conflictLocked = state.conflict?.noteId === openNote.id;
  const readOnly = state.mode === "read-only" || conflictLocked;
  const dirty = isDetailDirty(state);
  const protectedWork = hasProtectedDetailWork(state);
  const selectionLength = state.selectedText.length;
  const alreadySent = Boolean(openNote.promotedTaskId && openNote.approvedExtract);
  const extractionOpen = state.extraction.noteId === openNote.id;

  function closeAndRestore(returnFocus: HTMLElement | null) {
    if (protectedWork) discardReturnFocusRef.current = returnFocus;
    actions.closeNote();
    if (!protectedWork) focusNoteOpener(openNoteId);
  }

  function discardAndRestoreOpener() {
    actions.confirmDiscard();
    focusNoteOpener(openNoteId);
  }

  function cancelDelete() {
    setConfirmDelete(false);
    requestAnimationFrame(() => deleteButtonRef.current?.focus({ preventScroll: true }));
  }

  function onEditorKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) return;
    if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "s") {
      event.preventDefault();
      actions.saveDetail();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      closeAndRestore(event.currentTarget);
    }
  }

  function rememberSelection(element: HTMLTextAreaElement) {
    actions.selectText(selectionFromTextarea(element));
  }

  function prepareSelectionAndFocus() {
    actions.prepareExtract(
      alreadySent
        ? openNote?.approvedExtract ?? ""
        : selectionFromTextarea(editorRef.current!),
    );
    // Existing receipts own their own close-button focus in ExtractionPanel.
    // Do not race that layout effect by forcing focus into its read-only copy.
    if (alreadySent) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLTextAreaElement>("[data-approved-extract]")
          ?.focus({ preventScroll: false });
      });
    });
  }

  return (
    <section
      ref={panelRef}
      id={detailPanelId(openNote.id)}
      tabIndex={-1}
      className={classNames(styles.detail, pane && styles.detailPane)}
      aria-labelledby={titleId}
      data-lab-detail="true"
      data-lab-detail-note={openNote.id}
      onKeyDown={(event) => {
        if (
          event.key !== "Escape" ||
          event.defaultPrevented ||
          state.discardPrompt === "detail" ||
          extractionOpen ||
          confirmDelete
        ) {
          return;
        }
        event.preventDefault();
        closeAndRestore(document.activeElement instanceof HTMLElement ? document.activeElement : null);
      }}
    >
      <header className={styles.detailHeader}>
        <div>
          <p>Private note</p>
          <h2 id={titleId}>{displayTitle(openNote.body)}</h2>
          <time dateTime={new Date(openNote.createdAt).toISOString()}>
            Created {new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" }).format(openNote.createdAt)}
          </time>
        </div>
        <button
          type="button"
          className={styles.quietButton}
          onClick={(event) => closeAndRestore(event.currentTarget)}
        >
          Back to stream
        </button>
      </header>

      <label htmlFor={`${titleId}-editor`}>Note body</label>
      <textarea
        ref={editorRef}
        id={`${titleId}-editor`}
        data-private-note-body="true"
        data-1p-ignore="true"
        data-sentry-mask="true"
        data-clarity-mask="true"
        data-dd-privacy="mask"
        rows={12}
        value={state.detailDraft}
        readOnly={readOnly}
        aria-describedby={helpId}
        onChange={(event) => actions.setDetailDraft(event.target.value)}
        onSelect={(event) => rememberSelection(event.currentTarget)}
        onMouseUp={(event) => rememberSelection(event.currentTarget)}
        onKeyUp={(event) => rememberSelection(event.currentTarget)}
        onKeyDown={onEditorKeyDown}
      />
      <p id={helpId} className={styles.detailHelp}>
        Select exact wording to prepare an approved extract. The private note never moves.
      </p>

      <div className={styles.detailToolbar}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={actions.saveDetail}
          disabled={readOnly || !dirty}
        >
          Save changes
        </button>
        <button type="button" className={styles.quietButton} onClick={actions.copyOpenNote}>
          Copy note
        </button>
        <button
          ref={useSelectionRef}
          type="button"
          className={styles.quietButton}
          data-use-selection="true"
          aria-expanded={extractionOpen}
          aria-controls={extractionOpen ? extractionPanelId : undefined}
          disabled={
            (readOnly && !alreadySent) ||
            conflictLocked ||
            (!alreadySent && selectionLength === 0)
          }
          onClick={prepareSelectionAndFocus}
        >
          {alreadySent ? "View sent receipt" : "Use selection"}
        </button>
        {!confirmDelete ? (
          <button
            ref={deleteButtonRef}
            type="button"
            className={styles.dangerButton}
            disabled={readOnly}
            onClick={() => setConfirmDelete(true)}
          >
            Delete note
          </button>
        ) : (
          <span
            className={styles.deleteConfirm}
            onKeyDown={(event) => {
              if (event.key !== "Escape") return;
              event.preventDefault();
              event.stopPropagation();
              cancelDelete();
            }}
          >
            Delete this note?
            <button
              ref={confirmDeleteRef}
              type="button"
              className={styles.dangerButton}
              onClick={() => {
                actions.deleteOpenNote();
                setConfirmDelete(false);
              }}
            >
              Confirm delete
            </button>
            <button type="button" onClick={cancelDelete}>
              Cancel
            </button>
          </span>
        )}
      </div>

      <p className={styles.selectionStatus}>
        {conflictLocked
          ? "Resolve the retained versions before editing, deleting, or preparing an extract."
          : readOnly && !alreadySent
          ? "Read-only review. Preparing and sending extracts is paused."
          : alreadySent
            ? "This note already has an approved Tasks receipt."
            : selectionLength
          ? `${selectionLength} characters selected. Nothing has been sent.`
          : "Select text in the note to make an approved extract."}
      </p>

      {state.discardPrompt === "detail" ? (
        <DiscardPrompt target="detail" onConfirm={discardAndRestoreOpener} />
      ) : null}
      {extractionOpen ? (
        <ExtractionPanel id={extractionPanelId} returnFocusRef={useSelectionRef} />
      ) : null}
    </section>
  );
}

function ExtractionPanel({
  id,
  returnFocusRef,
}: {
  id: string;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
}) {
  const { state, openNote, actions } = useNotesLab();
  const extraction = state.extraction;
  const labelId = useId();
  const descriptionId = useId();
  const receiptId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const sendButtonRef = useRef<HTMLButtonElement>(null);
  const closeReceiptRef = useRef<HTMLButtonElement>(null);
  const acceptedPending = Boolean(
    extraction.noteId && state.taskLedger[extraction.noteId],
  );
  const readOnly = state.mode === "read-only";
  const alreadySent = Boolean(openNote?.promotedTaskId && openNote.approvedExtract);
  const showReceipt = alreadySent || (extraction.state === "sent" && extraction.receipt);
  const receiptTaskId = extraction.receipt?.taskId ?? openNote?.promotedTaskId;
  const payloadCopy = alreadySent
    ? "This approved wording is locked to its existing Tasks receipt."
    : readOnly
      ? "Read-only review. The approved wording is visible, but sending is disabled."
      : acceptedPending
        ? "Accepted wording is frozen until its original receipt is reconciled."
        : "Payload fields: noteId, approved body, workspaceId. The raw note body is excluded.";

  useLayoutEffect(() => {
    if (showReceipt) {
      closeReceiptRef.current?.focus({ preventScroll: true });
      return;
    }
    if (extraction.state === "failed") {
      sendButtonRef.current?.focus({ preventScroll: true });
    }
  }, [extraction.state, showReceipt]);

  function cancelAndRestoreFocus() {
    actions.cancelExtract();
    requestAnimationFrame(() => {
      returnFocusRef.current?.focus({ preventScroll: true });
    });
  }

  function sendAndHoldFocus() {
    if (readOnly || alreadySent || extraction.state === "sending") return;
    actions.sendExtract();
    requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
  }

  return (
    <section
      ref={panelRef}
      id={id}
      tabIndex={-1}
      className={styles.extraction}
      aria-labelledby={labelId}
      aria-describedby={descriptionId}
      aria-busy={extraction.state === "sending"}
      data-extraction-state={showReceipt ? "sent" : extraction.state}
      onKeyDown={(event) => {
        if (event.key === "Escape" && extraction.state !== "sending") {
          event.preventDefault();
          event.stopPropagation();
          cancelAndRestoreFocus();
        }
      }}
    >
      <div className={styles.privacyBoundary}>
        <span>Private note</span>
        <span aria-hidden="true">→</span>
        <strong>Approved extract</strong>
      </div>
      <div className={styles.extractHeader}>
        <div>
          <p>Tasks handoff simulation</p>
          <h3 id={labelId}>Review the only wording that may leave Notes</h3>
        </div>
        <span>Nothing sends without approval</span>
      </div>
      <label htmlFor={`${labelId}-approved`}>Approved wording</label>
      <textarea
        id={`${labelId}-approved`}
        data-approved-extract="true"
        data-1p-ignore="true"
        rows={4}
        value={extraction.approvedText}
        aria-describedby={descriptionId}
        readOnly={
          readOnly ||
          alreadySent ||
          extraction.state === "sending" ||
          extraction.state === "sent" ||
          acceptedPending
        }
        onChange={(event) => actions.setApprovedText(event.target.value)}
      />
      <p id={descriptionId} className={styles.payloadReceipt}>
        {payloadCopy}
      </p>

      {extraction.state === "failed" ? (
        <p data-extraction-message="failure" className={styles.failureMessage}>
          {extraction.error}
        </p>
      ) : null}
      {showReceipt ? (
        <div id={receiptId} className={styles.successMessage} data-extraction-message="receipt">
          <strong>
            {extraction.state === "sent" && extraction.receipt
              ? extraction.receipt.created
                ? "Approved extract sent."
                : "Already accepted. No duplicate created."
              : "Approved extract already sent."}
          </strong>
          <span>Receipt {receiptTaskId}. The note remains in this stream.</span>
        </div>
      ) : null}

      <div className={styles.extractActions}>
        {!showReceipt ? (
          <>
            <button type="button" className={styles.quietButton} onClick={cancelAndRestoreFocus} disabled={extraction.state === "sending"}>
              Cancel
            </button>
            <button
              ref={sendButtonRef}
              type="button"
              className={styles.primaryButton}
              onClick={sendAndHoldFocus}
              disabled={
                readOnly ||
                alreadySent ||
                !extraction.approvedText.trim() ||
                extraction.state === "sending"
              }
            >
              {extraction.state === "sending"
                ? "Sending approved wording"
                : extraction.state === "failed"
                  ? "Retry safely"
                  : "Send approved extract to Tasks"}
            </button>
          </>
        ) : (
          <button
            ref={closeReceiptRef}
            type="button"
            className={styles.quietButton}
            aria-describedby={receiptId}
            onClick={cancelAndRestoreFocus}
          >
            Close receipt
          </button>
        )}
      </div>
    </section>
  );
}

function DiscardPrompt({
  target,
  onConfirm,
}: {
  target: "capture" | "detail";
  onConfirm?: () => void;
}) {
  const { state, actions } = useNotesLab();
  const descriptionId = useId();
  const pendingExtraction = target === "detail" && hasPendingExtraction(state);
  const pendingNoteEdit = target === "detail" && isDetailDirty(state);
  const detailCopy = pendingExtraction && pendingNoteEdit
    ? "Keep your unsaved note edits and approved wording? Neither is discarded silently."
    : pendingExtraction
      ? "Keep this approved wording? Nothing has been sent, and leaving would discard this review."
      : "Keep your unsaved edits? Escape never deletes writing silently.";
  return (
    <div
      className={styles.discardPrompt}
      role="alertdialog"
      aria-modal="false"
      aria-label="Protect unsaved writing"
      aria-describedby={descriptionId}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        actions.cancelDiscard();
      }}
    >
      <p id={descriptionId}>
        {target === "capture"
          ? "Keep this capture draft? Escape never deletes writing silently."
          : detailCopy}
      </p>
      <div>
        <button type="button" className={styles.primaryButton} autoFocus onClick={actions.cancelDiscard}>
          Keep writing
        </button>
        <button type="button" className={styles.dangerButton} onClick={onConfirm ?? actions.confirmDiscard}>
          {target === "capture"
            ? "Discard draft"
            : pendingExtraction
              ? "Discard unsent work"
              : "Discard changes"}
        </button>
      </div>
    </div>
  );
}

export function StateBanner() {
  const { state } = useNotesLab();
  const content: Partial<Record<LabMode, ReactNode>> = {
    saving: <><strong>Saving locally</strong><span>The note is already visible in the stream.</span></>,
    saved: <><strong>Saved</strong><span>Your exact writing is safely in the stream.</span></>,
    offline: <><strong>Offline</strong><span>New writing stays queued here until reconnection.</span></>,
    error: <><strong>Failure rehearsal</strong><span>Save and Tasks replies fail once so recovery can be tested.</span></>,
    conflict: <><strong>Edit conflict</strong><span>Both exact versions are retained until you choose.</span></>,
    "read-only": <><strong>Read-only review</strong><span>Search and reading work. Writing and sending are paused.</span></>,
  };
  const message = content[state.mode];
  if (!message && !state.conflict && !state.lastConflictResolution) return null;
  return (
    <>
      {message ? <aside className={styles.stateBanner} data-mode={state.mode}>{message}</aside> : null}
      <ConflictPanel />
    </>
  );
}

export function LoadingState() {
  return (
    <div className={styles.loadingState} aria-busy="true" aria-label="Loading private notes">
      <span />
      <span />
      <span />
      <p>Capture is ready while recent notes load.</p>
    </div>
  );
}

export function EmptyState({ query = false }: { query?: boolean }) {
  return (
    <div className={styles.emptyState}>
      <p>{query ? "No private notes match this search." : "Your next note starts here."}</p>
      <span>{query ? "Clear search to return to recency." : "Capture stays ready. Structure can wait."}</span>
    </div>
  );
}

export function UndoToast() {
  const { state, actions } = useNotesLab();
  const undoRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (state.undo) undoRef.current?.focus({ preventScroll: true });
  }, [state.undo]);
  if (!state.undo) return null;
  const noteId = state.undo.note.id;
  return (
    <aside className={styles.undoToast} aria-label="Deleted note recovery">
      <span>Note deleted. Recovery remains available.</span>
      <button
        ref={undoRef}
        type="button"
        onClick={() => {
          actions.undoDelete();
          focusNoteOpener(noteId);
        }}
      >
        Undo delete
      </button>
    </aside>
  );
}

export function LabAnnouncement() {
  const { state } = useNotesLab();
  return <p className={styles.srOnly} aria-live="polite" aria-atomic="true">{state.announcement}</p>;
}

export function MetricsStrip() {
  const { state, notes } = useNotesLab();
  const metric = (value: number | null) => (value === null ? "not measured" : `${value} ms`);
  return (
    <dl className={styles.metrics} aria-label="Privacy-safe interaction timings">
      <div><dt>Interactive ready</dt><dd>{metric(state.metrics.focusReadyMs)}</dd></div>
      <div><dt>Save to stream</dt><dd>{metric(state.metrics.saveToStreamMs)}</dd></div>
      <div><dt>Search to result</dt><dd>{metric(state.metrics.searchToResultMs)}</dd></div>
      <div><dt>Visible notes</dt><dd>{notes.length}</dd></div>
    </dl>
  );
}
