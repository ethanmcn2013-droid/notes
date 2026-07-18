"use client";

import { useServerInsertedHTML } from "next/navigation";
import { useRef } from "react";

/**
 * Parser-time handoff for writing entered before the lab JavaScript hydrates.
 *
 * React can replace the server-rendered capture textarea while a lazy option
 * hydrates. This reviewed inline script records only input from that one
 * textarea, keeps it in a closure (never storage, URL, logs, or network), and
 * exposes a one-shot claim function. CaptureComposer claims it on mount, then
 * the listener and global function are removed.
 */
export const EARLY_DRAFT_BOOTSTRAP = String.raw`(() => {
  if (window.__signalNotesLabEarlyDraftInstalled) return;
  window.__signalNotesLabEarlyDraftInstalled = true;
  let value = "";
  let pendingSave = false;
  const remember = (event) => {
    const target = event.target;
    if (target instanceof HTMLTextAreaElement && target.hasAttribute("data-lab-capture")) {
      value = target.value;
    }
  };
  const queueSave = (event) => {
    const target = event.target;
    if (!(target instanceof HTMLTextAreaElement) || !target.hasAttribute("data-lab-capture")) return;
    if (event.key !== "Enter" || event.shiftKey || event.isComposing || event.keyCode === 229) return;
    if (!target.value.trim()) return;
    event.preventDefault();
    value = target.value;
    pendingSave = true;
    target.setAttribute("data-early-save", "queued");
  };
  document.addEventListener("input", remember, true);
  document.addEventListener("keydown", queueSave, true);
  window.__signalNotesLabClaimEarlyDraft = () => {
    document.removeEventListener("input", remember, true);
    document.removeEventListener("keydown", queueSave, true);
    delete window.__signalNotesLabClaimEarlyDraft;
    return { value, pendingSave };
  };
})();`;

export function EarlyDraftBootstrap() {
  const inserted = useRef(false);
  useServerInsertedHTML(() => (
    inserted.current ? null : (
      (inserted.current = true),
      <script
        id="signal-notes-lab-early-draft"
        data-reviewed-inline-script="true"
        dangerouslySetInnerHTML={{ __html: EARLY_DRAFT_BOOTSTRAP }}
      />
    )
  ));
  return null;
}
