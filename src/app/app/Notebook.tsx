"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { PrivateNotesEmptyState } from "@/app/app/PrivateNotesEmptyState";
import {
  clearNoteExtract,
  createNote,
  deleteNote,
  searchNotes,
  sendExtractToTasks,
  setNoteExtract,
  type ExtractSendResult,
  type NoteRead,
} from "@/server/actions/notes";

function makeOptimisticId() {
  return `opt_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

function normalizeForSearch(s: string) {
  // Mirror the FTS5 tokenizer's remove_diacritics=2 so the client-side
  // substring fallback (used while the first FTS round-trip is in
  // flight) doesn't diverge from the eventual server result. NFD
  // splits combining marks off the base character; the strip range
  // catches the entire Combining Diacritical Marks block.
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function friendlyError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  if (err.name === "UnauthorizedError" || /not authenticated/i.test(err.message)) {
    return "Your session expired — sign in again.";
  }
  return err.message || fallback;
}

function RelativeTime({ ts }: { ts: number }) {
  // Self-contained tick so the whole notebook doesn't re-render once
  // a minute just to refresh a timestamp. Only the timestamp updates.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  return <>{relativeTime(ts, now)}</>;
}

function firstLine(body: string) {
  const trimmed = body.trim();
  if (!trimmed) return "Untitled";
  const lines = trimmed.split(/\r?\n/);
  return lines[0]?.trim() || "Untitled";
}

function preview(body: string) {
  const lines = body.trim().split(/\r?\n/).slice(1).join(" ").trim();
  if (lines) return lines.length > 120 ? lines.slice(0, 117) + "…" : lines;
  return "";
}

function relativeTime(ts: number, now = Date.now()) {
  const diff = Math.max(0, now - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const date = new Date(ts);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface NotebookProps {
  initialNotes: NoteRead[];
}

export function Notebook({ initialNotes }: NotebookProps) {
  const [notes, setNotes] = useState<NoteRead[]>(initialNotes);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const [editingExtractFor, setEditingExtractFor] = useState<string | null>(null);
  const [draftAction, setDraftAction] = useState("");
  const [extractError, setExtractError] = useState<string | null>(null);
  const [sendingExtractFor, setSendingExtractFor] = useState<string | null>(null);
  const [sentResults, setSentResults] = useState<Map<string, ExtractSendResult>>(
    new Map()
  );
  const [undoTarget, setUndoTarget] = useState<NoteRead | null>(null);
  const [, startTransition] = useTransition();
  const captureRef = useRef<HTMLTextAreaElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const extractInputRef = useRef<HTMLInputElement | null>(null);
  // Pending fresh-marker timers keyed by note id; cleared on unmount.
  const freshTimersRef = useRef<Map<string, number>>(new Map());
  // Pending-delete timers per note. Each entry owns its own 4s
  // commit window so a fast second delete no longer force-commits
  // the first; both can independently undo until their own timer
  // fires. The visible toast still only tracks the latest.
  const pendingDeletesRef = useRef<Map<string, { note: NoteRead; timer: number }>>(
    new Map(),
  );

  // Refocus capture when the tab returns to foreground (PRODUCT.md §5 budget)
  useEffect(() => {
    const refocus = () => {
      if (document.visibilityState === "visible" && document.activeElement !== searchRef.current) {
        captureRef.current?.focus();
      }
    };
    document.addEventListener("visibilitychange", refocus);
    return () => document.removeEventListener("visibilitychange", refocus);
  }, []);

  // Cancel all pending timers on unmount to avoid calling setState on an
  // unmounted component.
  useEffect(() => {
    return () => {
      freshTimersRef.current.forEach((id) => window.clearTimeout(id));
      pendingDeletesRef.current.forEach(({ timer }) => window.clearTimeout(timer));
      if (extractFocusTimerRef.current !== null) window.clearTimeout(extractFocusTimerRef.current);
    };
  }, []);

  // ⌘K / Ctrl+K focuses search inline. Universal pattern — no jargon.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Server-side FTS5 search (N-2, 2026-05-14). Debounced 180ms so
  // each keystroke doesn't fire a round-trip. Empty query bypasses
  // the server and renders the full stream. Stale-result guarding via
  // a sequence counter — fast typing where an earlier query resolves
  // after a later one would otherwise stomp the visible state.
  const [searchResults, setSearchResults] = useState<NoteRead[] | null>(null);
  const searchSeq = useRef(0);
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    const mySeq = ++searchSeq.current;
    const handle = setTimeout(() => {
      void searchNotes(q).then((rows) => {
        if (mySeq === searchSeq.current) setSearchResults(rows);
      });
    }, 180);
    return () => clearTimeout(handle);
  }, [query]);

  const filteredNotes = useMemo(() => {
    if (!query.trim()) return notes;
    // While the first round-trip is still in flight, fall back to the
    // client-side filter on the already-loaded stream so the UI feels
    // responsive. FTS5 ranking takes over the moment results arrive.
    // Normalize both sides to match the server's remove_diacritics=2
    // tokenizer so accented input doesn't flicker between fallback
    // and server result.
    if (searchResults === null) {
      const q = normalizeForSearch(query.trim());
      return notes.filter((n) => normalizeForSearch(n.body).includes(q));
    }
    return searchResults;
  }, [notes, query, searchResults]);

  const lastSavedTs = notes[0]?.createdAt ?? null;
  const draftIsEmpty = draft.trim().length === 0;

  const commit = useCallback(() => {
    const body = draft.trim();
    if (!body) return;

    const tempId = makeOptimisticId();
    const now = Date.now();
    const optimistic: NoteRead = {
      id: tempId,
      body,
      createdAt: now,
      updatedAt: now,
      extractBody: null,
      promotedTaskId: null,
    };
    setNotes((prev) => [optimistic, ...prev]);
    setFreshIds((prev) => new Set(prev).add(tempId));
    setDraft("");
    setError(null);

    // Clear the "fresh" marker after the entry animation finishes.
    // Cancel any prior timer for this id before registering a new one.
    window.clearTimeout(freshTimersRef.current.get(tempId));
    freshTimersRef.current.set(
      tempId,
      window.setTimeout(() => {
        freshTimersRef.current.delete(tempId);
        setFreshIds((prev) => {
          const next = new Set(prev);
          next.delete(tempId);
          return next;
        });
      }, 500)
    );

    startTransition(async () => {
      try {
        const saved = await createNote(body);
        setNotes((prev) => prev.map((n) => (n.id === tempId ? saved : n)));
        // Carry the fresh marker over to the real id briefly.
        setFreshIds((prev) => {
          const next = new Set(prev);
          next.add(saved.id);
          window.clearTimeout(freshTimersRef.current.get(saved.id));
          freshTimersRef.current.set(
            saved.id,
            window.setTimeout(() => {
              freshTimersRef.current.delete(saved.id);
              setFreshIds((p) => {
                const n2 = new Set(p);
                n2.delete(saved.id);
                return n2;
              });
            }, 500)
          );
          return next;
        });
      } catch (err) {
        setNotes((prev) => prev.filter((n) => n.id !== tempId));
        setError(friendlyError(err, "Could not save"));
      }
    });
  }, [draft]);

  const commitDelete = useCallback((noteToDelete: NoteRead) => {
    startTransition(async () => {
      try {
        await deleteNote(noteToDelete.id);
      } catch (err) {
        // Restore the note if the server delete failed.
        setNotes((prev) => {
          // Re-insert in original position (sorted newest-first by createdAt).
          const next = [...prev, noteToDelete].sort((a, b) => b.createdAt - a.createdAt);
          return next;
        });
        setError(friendlyError(err, "Could not delete"));
      }
    });
  }, []);

  const undoDelete = useCallback(() => {
    // Restore the note currently shown in the toast (the latest
    // delete). Older deletes already in their own undo window keep
    // ticking — they commit when their timers fire.
    setUndoTarget((current) => {
      if (!current) return null;
      const entry = pendingDeletesRef.current.get(current.id);
      if (entry) {
        window.clearTimeout(entry.timer);
        pendingDeletesRef.current.delete(current.id);
      }
      const restored = current;
      startTransition(() => {
        setNotes((prev) => {
          const next = [...prev, restored].sort(
            (a, b) => b.createdAt - a.createdAt,
          );
          return next;
        });
      });
      return null;
    });
  }, []);

  const remove = useCallback(
    (id: string) => {
      const noteToDelete = notes.find((n) => n.id === id);
      if (!noteToDelete) return;

      startTransition(() => {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        setOpenId((current) => (current === id ? null : current));
        setUndoTarget(noteToDelete);
      });

      const timer = window.setTimeout(() => {
        pendingDeletesRef.current.delete(noteToDelete.id);
        // Only clear the visible toast if it still points at this
        // note — a later delete may have already replaced it.
        setUndoTarget((current) =>
          current && current.id === noteToDelete.id ? null : current,
        );
        commitDelete(noteToDelete);
      }, 4_000);

      pendingDeletesRef.current.set(noteToDelete.id, {
        note: noteToDelete,
        timer,
      });
    },
    [notes, commitDelete]
  );

  const extractFocusTimerRef = useRef<number | null>(null);

  const startEditingExtract = useCallback((note: NoteRead) => {
    setEditingExtractFor(note.id);
    setDraftAction(note.extractBody ?? "");
    setExtractError(null);
    // Focus runs on next paint — cancel any pending focus timer first.
    if (extractFocusTimerRef.current !== null) {
      window.clearTimeout(extractFocusTimerRef.current);
    }
    extractFocusTimerRef.current = window.setTimeout(() => {
      extractFocusTimerRef.current = null;
      extractInputRef.current?.focus();
      extractInputRef.current?.select();
    }, 0);
  }, []);

  const cancelEditingExtract = useCallback(() => {
    setEditingExtractFor(null);
    setDraftAction("");
    setExtractError(null);
  }, []);

  const commitExtract = useCallback(
    (noteId: string) => {
      const trimmed = draftAction.trim();
      if (!trimmed) {
        cancelEditingExtract();
        return;
      }
      const previousNotes = notes;
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId
            ? { ...n, extractBody: trimmed, updatedAt: Date.now() }
            : n
        )
      );
      setEditingExtractFor(null);
      setDraftAction("");
      setExtractError(null);
      startTransition(async () => {
        try {
          const saved = await setNoteExtract(noteId, trimmed);
          setNotes((prev) => prev.map((n) => (n.id === noteId ? saved : n)));
        } catch (err) {
          setNotes(previousNotes);
          setExtractError(friendlyError(err, "Could not draft action"));
        }
      });
    },
    [draftAction, notes, cancelEditingExtract]
  );

  const removeExtract = useCallback(
    (noteId: string) => {
      const previousNotes = notes;
      setNotes((prev) =>
        prev.map((n) =>
          n.id === noteId ? { ...n, extractBody: null, updatedAt: Date.now() } : n
        )
      );
      setExtractError(null);
      startTransition(async () => {
        try {
          const saved = await clearNoteExtract(noteId);
          setNotes((prev) => prev.map((n) => (n.id === noteId ? saved : n)));
        } catch (err) {
          setNotes(previousNotes);
          setExtractError(friendlyError(err, "Could not clear action"));
        }
      });
    },
    [notes]
  );

  const onExtractKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>, noteId: string) => {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelEditingExtract();
        return;
      }
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        commitExtract(noteId);
      }
    },
    [cancelEditingExtract, commitExtract]
  );

  const sendToTasks = useCallback(
    (noteId: string) => {
      setSendingExtractFor(noteId);
      setExtractError(null);
      startTransition(async () => {
        try {
          const { note: updated, result } = await sendExtractToTasks(noteId);
          setNotes((prev) =>
            prev.map((n) => (n.id === noteId ? updated : n))
          );
          setSentResults((prev) => {
            const next = new Map(prev);
            next.set(noteId, result);
            return next;
          });
        } catch (err) {
          setExtractError(friendlyError(err, "Could not send to Tasks"));
        } finally {
          setSendingExtractFor(null);
        }
      });
    },
    []
  );

  const onCaptureKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setDraft("");
        return;
      }
      // Enter saves; Shift+Enter for newline (slight refinement over PRODUCT.md
      // §4 — keeps multi-line bodies easy without losing the 3-second budget).
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        commit();
      }
    },
    [commit]
  );

  const onSearchKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setQuery("");
        captureRef.current?.focus();
      }
    },
    []
  );

  const openNote = notes.find((n) => n.id === openId) ?? null;

  return (
    <main className="shell">
      {/* ── The notebook ────────────────────────────────────────── */}
      <section className="notebook" aria-label="Signal Notes notebook">
        <div className="notebook-top">
          <a href="/" className="wordmark" aria-label="Signal Notes home">
            <span className="word">notes</span>
            <span className="dot" aria-hidden />
          </a>
          <label className="search">
            <span>Search</span>
            <input
              ref={searchRef}
              id="search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="anything"
              spellCheck={false}
              autoComplete="off"
            />
          </label>
        </div>

        <label className="capture">
          <span className="sr-only">Capture a private note</span>
          <textarea
            id="capture"
            ref={captureRef}
            autoFocus
            rows={3}
            placeholder=""
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onCaptureKeyDown}
            spellCheck
          />
          <PrivateNotesEmptyState visible={draftIsEmpty} />
          <p className="capture-hint">
            <kbd>Enter</kbd> saves · <kbd>Shift</kbd>+<kbd>Enter</kbd> new line · <kbd>Esc</kbd> clears
          </p>
          {error && (
            <p role="alert" className="capture-hint capture-hint-error">
              {error}
            </p>
          )}
        </label>

        <div className="stream-head">
          <span>Stream</span>
          <span>
            {query.trim()
              ? `${filteredNotes.length} of ${notes.length}`
              : `${notes.length} ${notes.length === 1 ? "note" : "notes"}`}
          </span>
        </div>

        {notes.length === 0 && (
          <p className="empty-state">
            <em>Nothing here yet.</em> Start typing.
          </p>
        )}

        {notes.length > 0 && filteredNotes.length === 0 && query.trim() && (
          <p className="empty-state">
            No notes match <em>“{query.trim()}”</em>.
          </p>
        )}

        <ol className="stream" aria-label="Recent notes">
          {filteredNotes.map((note) => {
            const isOpen = openId === note.id;
            return (
              <li key={note.id}>
                <button
                  type="button"
                  className={`note-row${freshIds.has(note.id) ? " is-fresh" : ""}`}
                  onClick={() => setOpenId(isOpen ? null : note.id)}
                  aria-expanded={isOpen}
                >
                  <span>
                    <span className="note-title">{firstLine(note.body)}</span>
                    {preview(note.body) && !isOpen && (
                      <span className="note-preview">{preview(note.body)}</span>
                    )}
                  </span>
                  <span className="note-meta">
                    {(note.extractBody || note.promotedTaskId) && (
                      <span
                        aria-label="Private action drafted"
                        className="note-dot"
                      />
                    )}
                    <span>
                      <RelativeTime ts={note.createdAt} />
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {openNote && (
          <article className="open-note" aria-label="Open note">
            <div className="open-note-head">
              <span>
                Captured <RelativeTime ts={openNote.createdAt} />
              </span>
              <div className="open-note-head-controls">
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => remove(openNote.id)}
                  aria-label="Delete note"
                >
                  Delete
                </button>
                {!openNote.extractBody &&
                  editingExtractFor !== openNote.id && (
                    <button
                      type="button"
                      className="btn-draft-action"
                      onClick={() => startEditingExtract(openNote)}
                    >
                      Draft action
                    </button>
                  )}
              </div>
            </div>
            <p className="open-note-body">{openNote.body}</p>

            {editingExtractFor === openNote.id && (
              <div className="extract-input" role="group" aria-label="Draft action">
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
                    onClick={cancelEditingExtract}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-draft-action"
                    onClick={() => commitExtract(openNote.id)}
                    disabled={draftAction.trim().length === 0}
                  >
                    Save
                  </button>
                </div>
                <p className="extract-hint">
                  <kbd>Enter</kbd> saves · <kbd>Esc</kbd> cancels
                </p>
              </div>
            )}

            {openNote.extractBody && editingExtractFor !== openNote.id && (
              <div className="extract-drafted" aria-label="Action drafted">
                {openNote.promotedTaskId ? (
                  <p className="extract-drafted-meta">
                    Sent to{" "}
                    {sentResults.get(openNote.id)?.workspaceName ?? "Tasks"}
                  </p>
                ) : (
                  <p className="extract-drafted-meta">
                    Action drafted &middot; pending Tasks send
                  </p>
                )}
                <p className="extract-drafted-body">{openNote.extractBody}</p>
                <div className="extract-drafted-controls">
                  {openNote.promotedTaskId ? (
                    sentResults.get(openNote.id)?.taskUrl && (
                      <a
                        className="btn-delete"
                        href={sentResults.get(openNote.id)!.taskUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open in Tasks
                      </a>
                    )
                  ) : (
                    <button
                      type="button"
                      className="btn-draft-action"
                      onClick={() => sendToTasks(openNote.id)}
                      disabled={sendingExtractFor === openNote.id}
                    >
                      {sendingExtractFor === openNote.id
                        ? "Sending…"
                        : "Send to Tasks"}
                    </button>
                  )}
                  {!openNote.promotedTaskId && (
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => startEditingExtract(openNote)}
                      disabled={sendingExtractFor === openNote.id}
                    >
                      Edit
                    </button>
                  )}
                  {!openNote.promotedTaskId && (
                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => removeExtract(openNote.id)}
                      disabled={sendingExtractFor === openNote.id}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}

            {extractError && (
              <p
                role="alert"
                className="extract-error"
              >
                {extractError}
              </p>
            )}
          </article>
        )}
      </section>

      {/* ── Undo toast ──────────────────────────────────────────── */}
      {undoTarget && (
        <div className="undo-toast" role="status" aria-live="polite">
          <span>Note deleted.</span>
          <button type="button" className="undo-toast-btn" onClick={undoDelete}>
            Undo
          </button>
        </div>
      )}

      {/* ── Brand aside (right column) ──────────────────────────── */}
      <aside className="product">
        <p className="product-eyebrow">Signal Notes</p>
        <h1 className="product-h1">Capture clarity.</h1>
        <p className="product-promise">
          A private layer for thoughts before they become work.
        </p>
        <dl className="product-stats">
          <div>
            <dt>Privacy</dt>
            <dd>Private by default</dd>
          </div>
          <div>
            <dt>Stream</dt>
            <dd>
              <em>{notes.length}</em> {notes.length === 1 ? "note" : "notes"}
            </dd>
          </div>
          <div>
            <dt>Last saved</dt>
            <dd>
              {lastSavedTs ? (
                <em>
                  <RelativeTime ts={lastSavedTs} />
                </em>
              ) : (
                "—"
              )}
            </dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>Private build</dd>
          </div>
        </dl>
      </aside>
    </main>
  );
}
