"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import { createNote, deleteNote, type NoteRead } from "@/server/actions/notes";

// ── Locked capture placeholders (PRODUCT.md §9) ────────────────────
const CAPTURE_PROMPTS = [
  "What just came up?",
  "What's the one thing to remember?",
  "What needs writing down?",
  "What did the meeting just decide?",
  "What's worth remembering before you forget?",
  "Three seconds. Type it now.",
] as const;

function makeOptimisticId() {
  return `opt_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
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
  const [, startTransition] = useTransition();
  const captureRef = useRef<HTMLTextAreaElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const tickRef = useRef(0);
  const [, forceTick] = useState(0);

  // One placeholder per mount (PRODUCT.md §9)
  const placeholder = useMemo(() => {
    const idx = Math.floor(Math.random() * CAPTURE_PROMPTS.length);
    return CAPTURE_PROMPTS[idx];
  }, []);

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

  // Tick relative timestamps once a minute
  useEffect(() => {
    const id = window.setInterval(() => {
      tickRef.current += 1;
      forceTick(tickRef.current);
    }, 60_000);
    return () => window.clearInterval(id);
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

  const filteredNotes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter((n) => n.body.toLowerCase().includes(q));
  }, [notes, query]);

  const lastSavedTs = notes[0]?.createdAt ?? null;

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
      promotedTaskId: null,
    };
    setNotes((prev) => [optimistic, ...prev]);
    setFreshIds((prev) => new Set(prev).add(tempId));
    setDraft("");
    setError(null);

    // Clear the "fresh" marker after the entry animation finishes
    window.setTimeout(() => {
      setFreshIds((prev) => {
        const next = new Set(prev);
        next.delete(tempId);
        return next;
      });
    }, 500);

    startTransition(async () => {
      try {
        const saved = await createNote(body);
        setNotes((prev) => prev.map((n) => (n.id === tempId ? saved : n)));
        // Carry the fresh marker over to the real id briefly
        setFreshIds((prev) => {
          const next = new Set(prev);
          next.add(saved.id);
          window.setTimeout(() => {
            setFreshIds((p) => {
              const n2 = new Set(p);
              n2.delete(saved.id);
              return n2;
            });
          }, 500);
          return next;
        });
      } catch (err) {
        setNotes((prev) => prev.filter((n) => n.id !== tempId));
        setError(err instanceof Error ? err.message : "Could not save");
      }
    });
  }, [draft]);

  const remove = useCallback(
    (id: string) => {
      const previousNotes = notes;
      setNotes((prev) => prev.filter((n) => n.id !== id));
      setOpenId((current) => (current === id ? null : current));
      startTransition(async () => {
        try {
          await deleteNote(id);
        } catch (err) {
          setNotes(previousNotes);
          setError(err instanceof Error ? err.message : "Could not delete");
        }
      });
    },
    [notes]
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
            notes<span>.</span>
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
          <span className="sr-only">Capture a note</span>
          <textarea
            id="capture"
            ref={captureRef}
            autoFocus
            rows={3}
            placeholder={placeholder}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onCaptureKeyDown}
            spellCheck
          />
          <p className="capture-hint">
            <kbd>Enter</kbd> saves · <kbd>Shift</kbd>+<kbd>Enter</kbd> new line · <kbd>Esc</kbd> clears
          </p>
          {error && (
            <p
              role="alert"
              className="capture-hint"
              style={{ color: "#b04848", marginTop: 8 }}
            >
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
                    {note.promotedTaskId && (
                      <span
                        aria-label="Promoted to a task"
                        className="note-dot"
                      />
                    )}
                    <span>{relativeTime(note.createdAt)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ol>

        {openNote && (
          <article className="open-note" aria-label="Open note">
            <div className="open-note-head">
              <span>Captured {relativeTime(openNote.createdAt)}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button
                  type="button"
                  className="btn-delete"
                  onClick={() => remove(openNote.id)}
                  aria-label="Delete note"
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="btn-promote"
                  disabled
                  title="Promote to task — ships next cycle"
                  aria-label="Promote to task (ships in next cycle)"
                >
                  Task
                </button>
              </div>
            </div>
            <p className="open-note-body">{openNote.body}</p>
          </article>
        )}
      </section>

      {/* ── Brand aside (right column) ──────────────────────────── */}
      <aside className="product">
        <p className="product-eyebrow">Signal Notes</p>
        <h1 className="product-h1">Capture clarity.</h1>
        <p className="product-promise">
          Capture in three seconds. Find it later. Promote it when it matters.
        </p>
        <dl className="product-stats">
          <div>
            <dt>Stream</dt>
            <dd>
              <em>{notes.length}</em> {notes.length === 1 ? "note" : "notes"}
            </dd>
          </div>
          <div>
            <dt>Last saved</dt>
            <dd>
              {lastSavedTs ? <em>{relativeTime(lastSavedTs)}</em> : "—"}
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
