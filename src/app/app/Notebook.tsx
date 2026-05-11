"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ── Locked types (PRODUCT.md §6) ───────────────────────────────────
type Note = {
  id: string;
  body: string;
  createdAt: number;
  updatedAt: number;
  promotedTaskId?: string;
};

// ── Locked capture placeholders (PRODUCT.md §9) ────────────────────
// Hand-curated, drawn from the audience. Same discipline as the
// Analytics prose library. Rotation on each mount.
const CAPTURE_PROMPTS = [
  "What just came up?",
  "What's the one thing to remember?",
  "What needs writing down?",
  "What did the meeting just decide?",
  "What's worth remembering before you forget?",
  "Three seconds. Type it now.",
] as const;

const STORAGE_KEY = "signal-notes-v1";

function loadNotes(): Note[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Note[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveNotes(notes: Note[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // Quota or private-browsing — swallow. Server sync in 9.2.
  }
}

function makeId() {
  return `n_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
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
  // No second line — fall through to a substring of the first line beyond the title length.
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

export function Notebook() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const captureRef = useRef<HTMLTextAreaElement | null>(null);
  const tickRef = useRef(0);
  const [, forceTick] = useState(0);

  // Pick one placeholder per mount (PRODUCT.md §9 — hand-curated rotation)
  const placeholder = useMemo(() => {
    const idx = Math.floor(Math.random() * CAPTURE_PROMPTS.length);
    return CAPTURE_PROMPTS[idx];
  }, []);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setNotes(loadNotes());
    setHydrated(true);
  }, []);

  // Persist on every change after hydration
  useEffect(() => {
    if (!hydrated) return;
    saveNotes(notes);
  }, [notes, hydrated]);

  // Refocus capture when the tab returns to foreground (PRODUCT.md §5 budget)
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
    const now = Date.now();
    const note: Note = {
      id: makeId(),
      body,
      createdAt: now,
      updatedAt: now,
    };
    setNotes((prev) => [note, ...prev]);
    setDraft("");
    setOpenId(null);
  }, [draft]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Esc → discard (PRODUCT.md §4)
      if (event.key === "Escape") {
        event.preventDefault();
        setDraft("");
        return;
      }
      // Enter without modifier → save (PRODUCT.md §4 — three-second capture)
      // Shift+Enter or Cmd+Enter both also save (also per PRODUCT.md §4 "⌘↵ or ⇧↵ to commit").
      // Plain Enter is the primary; modifier combos are accelerators that mean the same thing.
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
      {/* Wordmark gesture (BRAND.md §4) */}
      <a href="/" className="notes-mark mb-10 text-[28px]" aria-label="Signal Notes home">
        <span className="word">notes</span>
        <span className="dot">.</span>
      </a>

      {/* ── Capture field (PRODUCT.md §4) ────────────────────────── */}
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

      {/* ── Stream (PRODUCT.md §4) ───────────────────────────────── */}
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
          {hydrated ? `${notes.length} ${notes.length === 1 ? "note" : "notes"}` : ""}
        </span>
      </div>

      {/* Empty state — PRODUCT.md §9 (literal copy) */}
      {hydrated && notes.length === 0 && (
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
              )}
            </li>
          );
        })}
      </ol>

      {/* ── Honest scaffold note (removable in 9.5) ─────────────── */}
      <p
        className="mt-16 font-mono text-[11px] tracking-wide"
        style={{ color: "var(--color-ink-faint)" }}
      >
        Notes are saved locally on this device. Cross-device sync and
        promote-to-task ship in upcoming cycles.
      </p>
    </main>
  );
}
