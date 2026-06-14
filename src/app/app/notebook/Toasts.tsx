"use client";

import type { RefObject } from "react";

import type { PromoteToast } from "./utils";

interface UndoToastProps {
  visible: boolean;
  onUndo: () => void;
  undoBtnRef: RefObject<HTMLButtonElement | null>;
}

export function UndoToast({ visible, onUndo, undoBtnRef }: UndoToastProps) {
  if (!visible) return null;
  return (
    <div className="undo-toast" role="status" aria-live="polite">
      <span>Note deleted.</span>
      <button
        ref={undoBtnRef}
        type="button"
        className="undo-toast-btn"
        onClick={onUndo}
      >
        Undo
      </button>
    </div>
  );
}

interface PromoteToastBannerProps {
  toast: PromoteToast | null;
  onRetry: (noteId: string) => void;
}

export function PromoteToastBanner({ toast, onRetry }: PromoteToastBannerProps) {
  if (!toast) return null;
  return (
    <div
      className={`promote-toast promote-toast--${toast.kind}`}
      role="status"
      aria-live="polite"
    >
      <span>{toast.message}</span>
      {toast.kind === "error" && (
        <button
          type="button"
          className="undo-toast-btn"
          onClick={() => onRetry(toast.noteId)}
        >
          Retry
        </button>
      )}
    </div>
  );
}
