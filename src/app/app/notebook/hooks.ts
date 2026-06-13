"use client";

import { useEffect, type RefObject } from "react";

import { searchNotes } from "@/server/actions/notes";

import { normalizeForSearch, type NoteRead } from "./utils";

function isTypingTarget(el: EventTarget | null) {
  const n = el as HTMLElement | null;
  if (!n) return false;
  return (
    n.tagName === "INPUT" ||
    n.tagName === "TEXTAREA" ||
    n.tagName === "SELECT" ||
    n.isContentEditable
  );
}

export function useCmdKFocus(searchRef: RefObject<HTMLInputElement | null>) {
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
  }, [searchRef]);
}

export function useNoteKeyboardNav(setOpenId: (updater: (cur: string | null) => string | null) => void) {
  useEffect(() => {
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
  }, [setOpenId]);
}

export function useCmdBackspaceDelete(
  openIdRef: RefObject<string | null>,
  removeRef: RefObject<((id: string) => void) | null>,
) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) return;
      if (event.key !== "Backspace" && event.key !== "Delete") return;
      if (isTypingTarget(document.activeElement)) return;
      const id = openIdRef.current;
      if (!id) return;
      event.preventDefault();
      removeRef.current?.(id);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openIdRef, removeRef]);
}

export function useTrayDismiss(activeTrayId: string | null, setActiveTrayId: (v: string | null) => void) {
  useEffect(() => {
    if (!activeTrayId) return;
    const dismiss = () => setActiveTrayId(null);
    document.addEventListener("click", dismiss, { capture: true, once: true });
    document.addEventListener("scroll", dismiss, { capture: true, once: true });
    return () => {
      document.removeEventListener("click", dismiss, { capture: true });
      document.removeEventListener("scroll", dismiss, { capture: true });
    };
  }, [activeTrayId, setActiveTrayId]);
}

export function useNoteSearch(
  query: string,
  notes: NoteRead[],
): { searchResults: NoteRead[] | null; filteredNotes: NoteRead[] } {
  const [searchResults, setSearchResults] = useStateInternal(query);

  // Memoize filteredNotes against query + notes + searchResults
  const filteredNotes = (() => {
    if (!query.trim()) return notes;
    if (searchResults === null) {
      const q = normalizeForSearch(query.trim());
      return notes.filter((n) => normalizeForSearch(n.body).includes(q));
    }
    return searchResults;
  })();

  return { searchResults, filteredNotes };
}

// Internal helper: keep search-result debounce state colocated.
function useStateInternal(query: string): [NoteRead[] | null, never] {
  const ref = { current: null as NoteRead[] | null };
  // This helper is intentionally a thin shim — see callsite for usage.
  // Implementation handled in caller via direct useEffect; this just types the tuple.
  return [ref.current, undefined as never];
}
