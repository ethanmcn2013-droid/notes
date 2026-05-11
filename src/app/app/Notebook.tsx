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
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const captureRef = useRef<HTMLTextAreaElement | null>(null);
  const tickRef = useRef(0);
  const [, forceTick] = useState(0);

  // One placeholder per mount (PRODUCT.md §9)
  const placeholder = useMemo(() => {
    const idx = Math.floor(Math.random() * CAPTURE_PROMPTS.length);
    return CAPTURE_PROMPTS[idx];
  }, []);

  // Refocus capture when the tab returns to foreground
  useEffect(() => {
    const refocus = () => {
      if (document.visibilityState === "visible") {
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

  const commit = useCallback(() => {
    const body = draft.trim();
    if (!body) return;

    // Optimistic write: render in the stream immediately (PRODUCT.md §5
    // 'Save: < 100ms perceived'). Server action fires in the background.
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
    setDraft("");
    setError(null);

    startTransition(async () => {
      try {
        const saved = await createNote(body);
        // Reconcile: replace the optimistic row with the server row.
        setNotes((prev) =>
          prev.map((n) => (n.id === tempId ? saved : n))
        );
      } catch (err) {
        // Roll back the optimistic row.
        setNotes((prev) => prev.filter((n) => n.id !== tempId));
        setError(err instanceof Error ? err.message : "Could not save");
      }
    });
  }, [draft]);

  const remove = useCallback(
    (id: string) => {
      // Optimistic remove.
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

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setDraft("");
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        commit();
      }
    },
    [commit]
  );

  const openNote = notes.find((n) => n.id === openId) ?? null;

  return (
    <main
      className="mx-auto flex max-w-[760px] flex-col px-7 pt-14 pb-28"
      style={{ minHeight: "calc(100vh - 42px)" }}
    >
      <label className="sr-only" htmlFor="capture">
        Capture a note
      </label>
      <textarea
        id="capture"
        ref={captureRef}
        autoFocus
        rows={3}
        placeholder={placeholder}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        spellCheck
        className="w-full resize-none border-0 bg-transparent p-0 text-[18px] leading-[1.55] outline-0 placeholder:opacity-60"
        style={{ color: "var(--color-ink)", caretColor: "var(--color-accent)" }}
      />
      <p
        className="mt-2 font-mono text-[11px] tracking-wide"
        style={{ color: "var(--color-ink-faint)" }}
      >
        Enter saves · Esc clears · first line becomes the title
      </p>

      {error && (
        <p
          className="mt-2 text-[12px]"
          role="alert"
          style={{ color: "#b04848" }}
        >
          {error}
        </p>
      )}

      <div
        className="mt-14 mb-4 flex items-baseline justify-between border-t pt-6"
        style={{ borderColor: "var(--color-line)" }}
      >
        <span
          className="font-mono text-[11px] uppercase tracking-[0.14em] font-semibold"
          style={{ color: "var(--color-ink-faint)" }}
        >
          Stream
        </span>
        <span
          className="font-mono text-[11px] tracking-wide"
          style={{ color: "var(--color-ink-faint)" }}
        >
          {notes.length} {notes.length === 1 ? "note" : "notes"}
        </span>
      </div>

      {notes.length === 0 && (
        <p
          className="mt-6 text-[15px]"
          style={{ color: "var(--color-ink-soft)" }}
        >
          Nothing here yet. Start typing.
        </p>
      )}

      <ol
        className="mt-2 flex flex-col"
        aria-label="Recent notes"
        style={{ borderTop: notes.length ? `1px dashed var(--color-line)` : undefined }}
      >
        {notes.map((note) => {
          const isOpen = openId === note.id;
          return (
            <li
              key={note.id}
              className="border-b py-4"
              style={{ borderColor: "var(--color-line)", borderStyle: "dashed" }}
            >
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : note.id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between gap-4">
                  <span
                    className="flex-1 truncate text-[15.5px] font-medium"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {firstLine(note.body)}
                  </span>
                  <span className="flex items-center gap-2">
                    {note.promotedTaskId && (
                      <span
                        aria-label="Promoted to a task"
                        className="inline-block h-1.5 w-1.5 rounded-full"
                        style={{ background: "var(--color-signal)" }}
                      />
                    )}
                    <span
                      className="font-mono text-[11px] tracking-wide whitespace-nowrap"
                      style={{ color: "var(--color-ink-faint)" }}
                    >
                      {relativeTime(note.createdAt)}
                    </span>
                  </span>
                </div>
                {preview(note.body) && !isOpen && (
                  <p
                    className="mt-1 truncate text-[13.5px]"
                    style={{ color: "var(--color-ink-soft)" }}
                  >
                    {preview(note.body)}
                  </p>
                )}
              </button>

              {isOpen && openNote && openNote.id === note.id && (
                <div className="mt-3">
                  <p
                    className="whitespace-pre-line text-[15.5px] leading-[1.6]"
                    style={{ color: "var(--color-ink)" }}
                  >
                    {openNote.body}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className="font-mono text-[11px] tracking-wide"
                      style={{ color: "var(--color-ink-faint)" }}
                    >
                      Captured {relativeTime(openNote.createdAt)}
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => remove(note.id)}
                        className="text-[12px] underline decoration-dotted underline-offset-2"
                        style={{ color: "var(--color-ink-faint)" }}
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        disabled
                        aria-label="Promote to task (ships in next cycle)"
                        title="Promote to task — ships next cycle"
                        className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[12px] font-medium opacity-50"
                        style={{
                          borderColor: "var(--color-line-strong)",
                          color: "var(--color-ink-soft)",
                        }}
                      >
                        Promote to task
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <p
        className="mt-16 font-mono text-[11px] tracking-wide"
        style={{ color: "var(--color-ink-faint)" }}
      >
        Notes sync to your Signal account. Promote-to-task ships in the next cycle.
      </p>
    </main>
  );
}
