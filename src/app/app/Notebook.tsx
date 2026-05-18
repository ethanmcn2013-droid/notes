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
  listArchivedNotes,
  promoteNoteToTasks,
  searchNotes,
  sendExtractToTasks,
  setNoteExtract,
  unPromoteNote,
  type ExtractSendResult,
  type NoteRead,
} from "@/server/actions/notes";

// Mirrors MAX_NOTE_BODY_CHARS in server/actions/notes.ts — kept in
// sync by hand because a "use server" module can't export a const.
const MAX_NOTE_BODY_CHARS = 10_000;

// Long-press timing per UX_SPEC RW-3a.
const LONG_PRESS_CONFIRM_MS = 450; // tray appears at this threshold
const LONG_PRESS_FEEDBACK_MS = 350; // scale-down feedback before confirm
const LONG_PRESS_MOVE_THRESHOLD_PX = 8; // cancel if touch moves more than this

// Grace period before the promoted note slides out of the stream view.
const PROMOTE_GRACE_MS = 1500;
// Toast auto-dismiss for success/error.
const PROMOTE_TOAST_DISMISS_MS = 3000;

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

// ── Toast state ─────────────────────────────────────────────────────

type PromoteToast =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string; noteId: string };

interface NotebookProps {
  initialNotes: NoteRead[];
  initialArchivedNotes: NoteRead[];
}

export function Notebook({ initialNotes, initialArchivedNotes }: NotebookProps) {
  const [notes, setNotes] = useState<NoteRead[]>(initialNotes);
  const [archivedNotes, setArchivedNotes] = useState<NoteRead[]>(initialArchivedNotes);
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

  // Promote gesture state
  // activeTrayId: which note row shows the inline action tray (touch path)
  const [activeTrayId, setActiveTrayId] = useState<string | null>(null);
  // pendingFeedbackIds: note rows showing scale-down pre-confirm feedback
  const [pendingFeedbackIds, setPendingFeedbackIds] = useState<Set<string>>(new Set());
  // promotingIds: note rows with optimistic "is-promoted" state (fading out)
  const [promotingIds, setPromotingIds] = useState<Set<string>>(new Set());
  // promoteToast: the "Added to Tasks" / error whisper at the bottom
  const [promoteToast, setPromoteToast] = useState<PromoteToast | null>(null);
  // archivedOpen: whether the "In Tasks" collapsible section is open
  const [archivedOpen, setArchivedOpen] = useState(false);
  // unpromotingIds: tracks which archived notes are being un-promoted
  const [unpromotingIds, setUnpromotingIds] = useState<Set<string>>(new Set());
  // Mobile nudge: one-time "Long-press any note to send it to Tasks"
  // Shown on first visit if no promoted notes exist. localStorage-gated.
  // UX_SPEC §RW-3a "First-touch test lens" item 1.
  const NUDGE_KEY = "notes-longpress-nudge-dismissed";
  const [showNudge, setShowNudge] = useState(false);

  const [, startTransition] = useTransition();
  const captureRef = useRef<HTMLTextAreaElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const extractInputRef = useRef<HTMLInputElement | null>(null);
  const undoBtnRef = useRef<HTMLButtonElement | null>(null);
  const undoReturnFocusRef = useRef<HTMLElement | null>(null);
  const freshTimersRef = useRef<Map<string, number>>(new Map());
  const pendingDeletesRef = useRef<Map<string, { note: NoteRead; timer: number }>>(
    new Map(),
  );
  const promoteToastTimerRef = useRef<number | null>(null);
  // Long-press timers per note id
  const longPressFeedbackTimerRef = useRef<Map<string, number>>(new Map());
  const longPressConfirmTimerRef = useRef<Map<string, number>>(new Map());
  // Touch start coords for move-threshold check
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Mobile nudge: show once on first visit if no promoted notes exist.
  // Read localStorage after mount so SSR doesn't throw.
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(NUDGE_KEY) === "1";
      if (!dismissed && initialArchivedNotes.length === 0) {
        setShowNudge(true);
      }
    } catch { /* private browsing */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismissNudge() {
    setShowNudge(false);
    try { localStorage.setItem(NUDGE_KEY, "1"); } catch { /* private browsing */ }
  }

  // P3-1: Deterministic first-paint focus — cursor ready, nothing highlighted.
  useEffect(() => {
    const el = captureRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const len = el.value.length;
    el.setSelectionRange(len, len);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const refocus = () => {
      if (document.visibilityState === "visible" && document.activeElement !== searchRef.current) {
        captureRef.current?.focus();
      }
    };
    document.addEventListener("visibilitychange", refocus);
    return () => document.removeEventListener("visibilitychange", refocus);
  }, []);

  useEffect(() => {
    return () => {
      freshTimersRef.current.forEach((id) => window.clearTimeout(id));
      pendingDeletesRef.current.forEach(({ timer }) => window.clearTimeout(timer));
      if (extractFocusTimerRef.current !== null) window.clearTimeout(extractFocusTimerRef.current);
      if (promoteToastTimerRef.current !== null) window.clearTimeout(promoteToastTimerRef.current);
      longPressFeedbackTimerRef.current.forEach((id) => window.clearTimeout(id));
      longPressConfirmTimerRef.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    if (undoTarget) {
      undoReturnFocusRef.current = document.activeElement as HTMLElement | null;
      window.setTimeout(() => undoBtnRef.current?.focus(), 0);
    } else {
      if (undoReturnFocusRef.current?.isConnected) {
        undoReturnFocusRef.current.focus();
      } else {
        captureRef.current?.focus();
      }
      undoReturnFocusRef.current = null;
    }
  }, [undoTarget]);

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

  // Keyboard note navigation — utility pass 2026-05-18.
  // j / ArrowDown → next note, k / ArrowUp → previous, Enter/Space open
  // (native <button>), Esc closes the open note (or exits the search box
  // back to the list). Mirrors the existing Cmd/K idiom. Reads live DOM so
  // it always tracks the rendered (filtered) list with no stale closures.
  // No new styling — reuses the app's existing focus-visible ring.
  useEffect(() => {
    const isTypingTarget = (el: EventTarget | null) => {
      const n = el as HTMLElement | null;
      if (!n) return false;
      return (
        n.tagName === "INPUT" ||
        n.tagName === "TEXTAREA" ||
        n.tagName === "SELECT" ||
        n.isContentEditable
      );
    };
    const onNav = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(document.activeElement)) {
        if (event.key === "Escape") {
          (document.activeElement as HTMLElement).blur();
        }
        return;
      }
      if (event.key === "Escape") {
        setOpenId((cur) => (cur ? null : cur));
        return;
      }
      const isNext = event.key === "j" || event.key === "ArrowDown";
      const isPrev = event.key === "k" || event.key === "ArrowUp";
      if (!isNext && !isPrev) return;
      const rows = Array.from(
        document.querySelectorAll<HTMLElement>("[data-note-row]"),
      );
      if (rows.length === 0) return;
      event.preventDefault();
      const idx = rows.findIndex((r) => r === document.activeElement);
      const nextIdx =
        idx === -1
          ? isNext
            ? 0
            : rows.length - 1
          : isNext
            ? Math.min(idx + 1, rows.length - 1)
            : Math.max(idx - 1, 0);
      const target = rows[nextIdx];
      target.focus();
      target.scrollIntoView({ block: "nearest" });
    };
    document.addEventListener("keydown", onNav);
    return () => document.removeEventListener("keydown", onNav);
  }, []);

  // Dismiss tray on outside click / scroll
  useEffect(() => {
    if (!activeTrayId) return;
    const dismiss = () => setActiveTrayId(null);
    document.addEventListener("click", dismiss, { capture: true, once: true });
    document.addEventListener("scroll", dismiss, { capture: true, once: true });
    return () => {
      document.removeEventListener("click", dismiss, { capture: true });
      document.removeEventListener("scroll", dismiss, { capture: true });
    };
  }, [activeTrayId]);

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
    if (searchResults === null) {
      const q = normalizeForSearch(query.trim());
      return notes.filter((n) => normalizeForSearch(n.body).includes(q));
    }
    return searchResults;
  }, [notes, query, searchResults]);

  const lastSavedTs = notes[0]?.createdAt ?? null;
  const draftIsEmpty = draft.trim().length === 0;

  // ── Promote toast helpers ────────────────────────────────────────

  function showPromoteToast(toast: PromoteToast) {
    if (promoteToastTimerRef.current !== null) {
      window.clearTimeout(promoteToastTimerRef.current);
    }
    setPromoteToast(toast);
    promoteToastTimerRef.current = window.setTimeout(() => {
      promoteToastTimerRef.current = null;
      setPromoteToast(null);
    }, PROMOTE_TOAST_DISMISS_MS);
  }

  // ── Core promote action (shared by touch + pointer paths) ────────

  const executePromote = useCallback(
    (noteId: string) => {
      // Optimistic: mark as promoting (fades to 0.5, "In Tasks" label).
      setPromotingIds((prev) => new Set(prev).add(noteId));

      // After grace period: remove from active stream.
      window.setTimeout(() => {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        setPromotingIds((prev) => {
          const next = new Set(prev);
          next.delete(noteId);
          return next;
        });
        // Close open-note panel if this note was open.
        setOpenId((current) => (current === noteId ? null : current));
      }, PROMOTE_GRACE_MS);

      startTransition(async () => {
        try {
          const { note: updated, result } = await promoteNoteToTasks(noteId);
          // Merge the server result into archivedNotes for the "In Tasks" section.
          setArchivedNotes((prev) => {
            const without = prev.filter((n) => n.id !== noteId);
            return [updated, ...without];
          });
          setSentResults((prev) => {
            const next = new Map(prev);
            next.set(noteId, result);
            return next;
          });
          showPromoteToast({ kind: "success", message: "Added to Tasks" });
          dismissNudge();
        } catch (err) {
          // Rollback: restore note to active stream.
          setNotes((prev) => {
            // Find the note in promoting state or just restore from scratch.
            const fromArchive = archivedNotes.find((n) => n.id === noteId);
            if (!fromArchive) return prev;
            const restored = { ...fromArchive, archivedAt: null, promotedTaskId: null };
            const next = [...prev, restored].sort((a, b) => b.createdAt - a.createdAt);
            return next;
          });
          setPromotingIds((prev) => {
            const next = new Set(prev);
            next.delete(noteId);
            return next;
          });
          showPromoteToast({
            kind: "error",
            message: "Couldn't add to Tasks — tap to try again",
            noteId,
          });
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [archivedNotes]
  );

  // ── Long-press gesture (touch) ───────────────────────────────────

  const clearLongPressTimers = useCallback((noteId: string) => {
    const fTimer = longPressFeedbackTimerRef.current.get(noteId);
    if (fTimer !== undefined) {
      window.clearTimeout(fTimer);
      longPressFeedbackTimerRef.current.delete(noteId);
    }
    const cTimer = longPressConfirmTimerRef.current.get(noteId);
    if (cTimer !== undefined) {
      window.clearTimeout(cTimer);
      longPressConfirmTimerRef.current.delete(noteId);
    }
    setPendingFeedbackIds((prev) => {
      const next = new Set(prev);
      next.delete(noteId);
      return next;
    });
  }, []);

  const onNoteTouchStart = useCallback(
    (event: React.TouchEvent, noteId: string) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };

      // Feedback at 350ms
      const fTimer = window.setTimeout(() => {
        longPressFeedbackTimerRef.current.delete(noteId);
        setPendingFeedbackIds((prev) => new Set(prev).add(noteId));
      }, LONG_PRESS_FEEDBACK_MS);
      longPressFeedbackTimerRef.current.set(noteId, fTimer);

      // Tray at 450ms
      const cTimer = window.setTimeout(() => {
        longPressConfirmTimerRef.current.delete(noteId);
        setPendingFeedbackIds((prev) => {
          const next = new Set(prev);
          next.delete(noteId);
          return next;
        });
        setActiveTrayId(noteId);
      }, LONG_PRESS_CONFIRM_MS);
      longPressConfirmTimerRef.current.set(noteId, cTimer);
    },
    []
  );

  const onNoteTouchMove = useCallback(
    (event: React.TouchEvent, noteId: string) => {
      const touch = event.touches[0];
      const start = touchStartRef.current;
      if (!touch || !start) return;
      const dx = Math.abs(touch.clientX - start.x);
      const dy = Math.abs(touch.clientY - start.y);
      if (dx > LONG_PRESS_MOVE_THRESHOLD_PX || dy > LONG_PRESS_MOVE_THRESHOLD_PX) {
        clearLongPressTimers(noteId);
      }
    },
    [clearLongPressTimers]
  );

  const onNoteTouchEnd = useCallback(
    (noteId: string) => {
      clearLongPressTimers(noteId);
      touchStartRef.current = null;
    },
    [clearLongPressTimers]
  );

  // ── Un-promote ───────────────────────────────────────────────────

  const handleUnpromote = useCallback(
    (noteId: string) => {
      setUnpromotingIds((prev) => new Set(prev).add(noteId));
      startTransition(async () => {
        try {
          const restored = await unPromoteNote(noteId);
          setArchivedNotes((prev) => prev.filter((n) => n.id !== noteId));
          // Re-insert into active stream with fresh marker.
          setNotes((prev) => {
            const next = [restored, ...prev].sort(
              (a, b) => b.createdAt - a.createdAt
            );
            return next;
          });
          setFreshIds((prev) => new Set(prev).add(noteId));
          window.clearTimeout(freshTimersRef.current.get(noteId));
          freshTimersRef.current.set(
            noteId,
            window.setTimeout(() => {
              freshTimersRef.current.delete(noteId);
              setFreshIds((p) => {
                const n2 = new Set(p);
                n2.delete(noteId);
                return n2;
              });
            }, 600)
          );
        } catch (err) {
          setError(friendlyError(err, "Could not remove from Tasks"));
        } finally {
          setUnpromotingIds((prev) => {
            const next = new Set(prev);
            next.delete(noteId);
            return next;
          });
        }
      });
    },
    []
  );

  // ── Existing note actions ────────────────────────────────────────

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
      archivedAt: null,
    };
    setNotes((prev) => [optimistic, ...prev]);
    setFreshIds((prev) => new Set(prev).add(tempId));
    setDraft("");
    setError(null);

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
        setNotes((prev) => {
          const next = [...prev, noteToDelete].sort((a, b) => b.createdAt - a.createdAt);
          return next;
        });
        setError(friendlyError(err, "Could not delete"));
      }
    });
  }, []);

  const undoDelete = useCallback(() => {
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
        setUndoTarget((current) =>
          current && current.id === noteToDelete.id ? null : current,
        );
        commitDelete(noteToDelete);
      }, 6_000);

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

  // Two-step send (escape hatch for notes needing extract shaping).
  const sendToTasks = useCallback(
    (noteId: string) => {
      setSendingExtractFor(noteId);
      setExtractError(null);
      startTransition(async () => {
        try {
          const { note: updated, result } = await sendExtractToTasks(noteId);
          // sendExtractToTasks now also archives the note (D1 semantics).
          // Remove from active stream, add to archived.
          setNotes((prev) => prev.filter((n) => n.id !== noteId));
          setOpenId((current) => (current === noteId ? null : current));
          setArchivedNotes((prev) => {
            const without = prev.filter((n) => n.id !== noteId);
            return [updated, ...without];
          });
          setSentResults((prev) => {
            const next = new Map(prev);
            next.set(noteId, result);
            return next;
          });
          showPromoteToast({ kind: "success", message: "Added to Tasks" });
          dismissNudge();
        } catch (err) {
          setExtractError(friendlyError(err, "Could not send to Tasks"));
        } finally {
          setSendingExtractFor(null);
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const onCaptureKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setDraft("");
        return;
      }
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

  // Open-note promote (button in the open-note panel controls).
  const promoteFromOpenNote = useCallback(
    (noteId: string) => {
      setOpenId(null);
      setActiveTrayId(null);
      executePromote(noteId);
    },
    [executePromote]
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
            rows={3}
            placeholder="Capture a thought…"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onCaptureKeyDown}
            maxLength={MAX_NOTE_BODY_CHARS}
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
          {(notes.length > 0 || query.trim()) && (
            <span>
              {query.trim()
                ? `${filteredNotes.length} of ${notes.length}`
                : `${notes.length} ${notes.length === 1 ? "note" : "notes"}`}
            </span>
          )}
        </div>

        {notes.length === 0 && (
          <p className="empty-state">
            <em>Nothing here yet.</em> Start typing.
          </p>
        )}

        {notes.length > 0 && filteredNotes.length === 0 && query.trim() && (
          <p className="empty-state">
            No notes match <em>"{query.trim()}"</em>.
          </p>
        )}

        <ol className="stream" aria-label="Recent notes">
          {filteredNotes.map((note) => {
            const isOpen = openId === note.id;
            const isPromoting = promotingIds.has(note.id);
            const hasFeedback = pendingFeedbackIds.has(note.id);
            const hasTray = activeTrayId === note.id;
            return (
              <li key={note.id} className="note-list-item">
                {/* Note row — the main clickable target */}
                <div className="note-row-wrapper">
                  <button
                    type="button"
                    className={[
                      "note-row",
                      freshIds.has(note.id) ? "is-fresh" : "",
                      isPromoting ? "is-promoted" : "",
                      hasFeedback ? "is-longpress-feedback" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={(e) => {
                      // Don't open/close if tray is showing — the tray
                      // handles the confirm.
                      if (hasTray) {
                        e.stopPropagation();
                        return;
                      }
                      setOpenId(isOpen ? null : note.id);
                      setActiveTrayId(null);
                    }}
                    onTouchStart={(e) => onNoteTouchStart(e, note.id)}
                    onTouchMove={(e) => onNoteTouchMove(e, note.id)}
                    onTouchEnd={() => onNoteTouchEnd(note.id)}
                    onTouchCancel={() => onNoteTouchEnd(note.id)}
                    data-note-row={note.id}
                    aria-expanded={isOpen}
                    aria-controls={`note-panel-${note.id}`}
                  >
                    <span>
                      <span className="note-title">{firstLine(note.body)}</span>
                      {preview(note.body) && !isOpen && (
                        <span className="note-preview">{preview(note.body)}</span>
                      )}
                    </span>
                    <span className="note-meta">
                      {isPromoting && (
                        <span className="note-tasks-label" aria-label="In Tasks">
                          In Tasks
                        </span>
                      )}
                      {!isPromoting && (note.extractBody || note.promotedTaskId) && (
                        <span
                          aria-label="Private action drafted"
                          className="note-dot"
                        />
                      )}
                      {!isPromoting && (
                        <span>
                          <RelativeTime ts={note.createdAt} />
                        </span>
                      )}
                    </span>
                  </button>

                  {/* Pointer hover ghost button — "→ Tasks" */}
                  {/* Only shown on non-touch pointer devices via CSS.
                      Does not appear when the note is already promoting. */}
                  {!isPromoting && (
                    <button
                      type="button"
                      className="note-ghost-promote"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTrayId(null);
                        executePromote(note.id);
                      }}
                      title={`Will add: ${firstLine(note.body).slice(0, 40)}${firstLine(note.body).length > 40 ? "…" : ""}`}
                      aria-label={`Promote to task: ${firstLine(note.body)}`}
                    >
                      → Tasks
                    </button>
                  )}
                </div>

                {/* Inline tray (touch long-press confirm) */}
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
                      onClick={() => {
                        setActiveTrayId(null);
                        executePromote(note.id);
                      }}
                    >
                      Promote to task
                    </button>
                    <button
                      type="button"
                      className="note-tray-cancel"
                      onClick={() => setActiveTrayId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            );
          }).flatMap((liEl, idx) =>
            // BV-3: nudge renders as a <li> immediately after the first note row.
            // UX_SPEC §RW-3a "First-touch test lens" item 1: "below the first note row".
            // Logic unchanged — same showNudge condition, same dismiss handler.
            idx === 0 && showNudge && filteredNotes.length > 0
              ? [
                  liEl,
                  <li key="mobile-nudge" className="note-nudge-li" aria-hidden>
                    <div
                      className="note-nudge"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "6px 0 2px",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--color-ink-faint, #d4d4d8)",
                          lineHeight: 1.4,
                        }}
                      >
                        Long-press any note to send it to Tasks.
                      </span>
                      <button
                        type="button"
                        onClick={dismissNudge}
                        aria-label="Dismiss hint"
                        style={{
                          fontSize: 10,
                          color: "var(--color-ink-faint, #d4d4d8)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px 4px",
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </li>,
                ]
              : [liEl],
          )}
        </ol>

        {openNote && (
          <article className="open-note" aria-label="Open note" id={`note-panel-${openNote.id}`}>
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
                {/* "Promote to task" explicit button — always visible in
                    the open-note panel. This is the pointer escape hatch
                    and the post-promote "In Tasks" state label. */}
                {openNote.promotedTaskId ? (
                  <span className="open-note-promoted-label">In Tasks</span>
                ) : (
                  <button
                    type="button"
                    className="btn-draft-action"
                    onClick={() => promoteFromOpenNote(openNote.id)}
                    aria-label="Promote to task"
                  >
                    Promote to task
                  </button>
                )}
                {!openNote.extractBody &&
                  !openNote.promotedTaskId &&
                  editingExtractFor !== openNote.id && (
                    <button
                      type="button"
                      className="btn-draft-action"
                      onClick={() => startEditingExtract(openNote)}
                      aria-describedby={notes.length <= 1 ? "draft-action-hint" : undefined}
                    >
                      Draft action
                    </button>
                  )}
                {!openNote.extractBody &&
                  !openNote.promotedTaskId &&
                  editingExtractFor !== openNote.id &&
                  notes.length <= 1 && (
                    <span
                      id="draft-action-hint"
                      className="draft-action-hint"
                    >
                      Draft an action to send to Signal Tasks.
                    </span>
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

        {/* ── "In Tasks" collapsible section (D1 archived notes) ── */}
        {archivedNotes.length > 0 && (
          <div className="in-tasks-section">
            <button
              type="button"
              className="in-tasks-toggle"
              aria-expanded={archivedOpen}
              onClick={() => setArchivedOpen((v) => !v)}
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
                        onClick={() => handleUnpromote(note.id)}
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
        )}
      </section>

      {/* ── Undo toast ──────────────────────────────────────────── */}
      {undoTarget && (
        <div className="undo-toast" role="status" aria-live="polite">
          <span>Note deleted.</span>
          <button
            ref={undoBtnRef}
            type="button"
            className="undo-toast-btn"
            onClick={undoDelete}
          >
            Undo
          </button>
        </div>
      )}

      {/* ── Promote toast ───────────────────────────────────────── */}
      {promoteToast && (
        <div
          className={`promote-toast promote-toast--${promoteToast.kind}`}
          role="status"
          aria-live="polite"
        >
          <span>{promoteToast.message}</span>
          {promoteToast.kind === "error" && (
            <button
              type="button"
              className="undo-toast-btn"
              onClick={() => {
                const id = promoteToast.noteId;
                setPromoteToast(null);
                executePromote(id);
              }}
            >
              Retry
            </button>
          )}
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
            <dt>Notes</dt>
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
            <dt>Notebook</dt>
            <dd>Your notes</dd>
          </div>
        </dl>
      </aside>
    </main>
  );
}
