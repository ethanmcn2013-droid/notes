"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { LAB_NOW } from "./lab-fixtures";
import {
  buildExtractionPayload,
  createInitialLabState,
  getOpenNote,
  hasProtectedDetailWork,
  labReducer,
  modeIsReadOnly,
  receiptForPayload,
  visibleLabNotes,
} from "./lab-model";
import type {
  LabConflictResolution,
  LabDataset,
  LabInitialConfig,
  LabMode,
  LabNoteId,
  LabOption,
  LabScenario,
  LabState,
} from "./lab-types";

type LabActions = {
  setOption: (option: LabOption) => void;
  setScenario: (scenario: LabScenario) => void;
  setDataset: (dataset: LabDataset) => void;
  setMode: (mode: LabMode) => void;
  capture: (bodyOverride?: string) => void;
  requestCaptureDiscard: () => void;
  cancelDiscard: () => void;
  confirmDiscard: () => void;
  retrySync: (noteId: LabNoteId) => void;
  setQuery: (value: string) => void;
  moveSearch: (direction: 1 | -1) => void;
  openNote: (noteId: LabNoteId) => void;
  closeNote: () => void;
  setDetailDraft: (value: string) => void;
  saveDetail: () => void;
  resolveConflict: (resolution: LabConflictResolution) => void;
  selectText: (value: string) => void;
  prepareExtract: (selectedOverride?: string) => void;
  setApprovedText: (value: string) => void;
  cancelExtract: () => void;
  sendExtract: () => void;
  copyOpenNote: () => Promise<void>;
  deleteOpenNote: () => void;
  undoDelete: () => void;
  announce: (message: string) => void;
  setMetric: (
    metric: "focusReadyMs" | "saveToStreamMs" | "searchToResultMs",
    value: number,
  ) => void;
};

type LabStore = {
  state: LabState;
  notes: ReturnType<typeof visibleLabNotes>;
  openNote: ReturnType<typeof getOpenNote>;
  actions: LabActions;
};

const LabStoreContext = createContext<LabStore | null>(null);

type LabDraftStore = {
  draft: string;
  setDraft: (value: string) => void;
};

const LabDraftContext = createContext<LabDraftStore | null>(null);

function roundedDuration(value: number) {
  return Math.max(0, Math.round(value * 10) / 10);
}

export function NotesLabProvider({
  initialConfig,
  children,
}: {
  initialConfig: LabInitialConfig;
  children: ReactNode;
}) {
  const [state, dispatch] = useReducer(
    labReducer,
    initialConfig,
    createInitialLabState,
  );
  const stateRef = useRef(state);
  const [draft, setDraftState] = useState("");
  const draftRef = useRef(draft);
  const timers = useRef<Set<number>>(new Set());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const liveTimers = timers.current;
    return () => {
      liveTimers.forEach((timer) => window.clearTimeout(timer));
      liveTimers.clear();
    };
  }, []);

  const later = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
  }, []);

  const scheduleSync = useCallback(
    (noteId: LabNoteId, isRetry = false) => {
      const settle = () => {
        const current = stateRef.current;
        const note = current.notes.find((candidate) => candidate.id === noteId);
        if (!note || note.syncState !== "pending") return;
        if (current.mode === "offline" || current.mode === "saving") return;
        const action =
          current.mode === "error" && !isRetry
            ? {
                type: "sync-failure" as const,
                noteId,
                message: "Could not sync. Your exact writing is still here. Retry when ready.",
              }
            : { type: "sync-success" as const, noteId };
        stateRef.current = labReducer(current, action);
        dispatch(action);
      };
      later(settle, stateRef.current.mode === "error" && !isRetry ? 220 : 180);
    },
    [later],
  );

  const setOption = useCallback((option: LabOption) => {
    dispatch({ type: "set-option", option });
  }, []);

  const setScenario = useCallback((scenario: LabScenario) => {
    const action = { type: "set-scenario", scenario } as const;
    stateRef.current = labReducer(stateRef.current, action);
    dispatch(action);
  }, []);

  const setDraft = useCallback((value: string) => {
    draftRef.current = value;
    setDraftState(value);
  }, []);

  const setDataset = useCallback((dataset: LabDataset) => {
    const snapshot = stateRef.current;
    if (hasProtectedDetailWork(snapshot)) {
      const action = { type: "set-dataset", dataset } as const;
      stateRef.current = labReducer(snapshot, action);
      dispatch(action);
      return;
    }
    if (draftRef.current) {
      dispatch({ type: "request-discard", target: "capture" });
      return;
    }
    setDraft("");
    dispatch({ type: "set-dataset", dataset });
  }, [setDraft]);

  const setMode = useCallback(
    (mode: LabMode) => {
      if (hasProtectedDetailWork(stateRef.current)) {
        const action = { type: "set-mode", mode } as const;
        stateRef.current = labReducer(stateRef.current, action);
        dispatch(action);
        return;
      }
      const snapshot = stateRef.current;
      const wasPaused = snapshot.mode === "offline" || snapshot.mode === "saving";
      const action = { type: "set-mode", mode } as const;
      const next = labReducer(snapshot, action);
      stateRef.current = next;
      dispatch(action);
      if (wasPaused && mode !== "offline" && mode !== "saving") {
        next.notes
          .filter((note) => note.syncState === "pending")
          .forEach((note) => scheduleSync(note.id));
      }
    },
    [scheduleSync],
  );

  const setMetric = useCallback(
    (
      metric: "focusReadyMs" | "saveToStreamMs" | "searchToResultMs",
      value: number,
    ) => {
      dispatch({ type: "set-metric", metric, value: roundedDuration(value) });
    },
    [],
  );

  const capture = useCallback((bodyOverride?: string) => {
    const snapshot = stateRef.current;
    const body = bodyOverride ?? draftRef.current;
    if (!body.trim() || modeIsReadOnly(snapshot)) return;

    const start = performance.now();
    const sequence = snapshot.nextSequence;
    const noteId = `lab_capture_${String(sequence).padStart(3, "0")}` as LabNoteId;
    const action = {
      type: "capture-start",
      note: {
        id: noteId,
        body,
        createdAt: LAB_NOW + sequence * 1_000,
        updatedAt: LAB_NOW + sequence * 1_000,
        syncState: "pending",
        approvedExtract: null,
        promotedTaskId: null,
      },
    } as const;
    // Update the imperative snapshot before React commits so a rapid second
    // key press cannot reuse the same operation ID or duplicate the note.
    stateRef.current = labReducer(snapshot, action);
    dispatch(action);
    setDraft("");
    requestAnimationFrame(() => {
      setMetric("saveToStreamMs", performance.now() - start);
    });
    scheduleSync(noteId);
  }, [scheduleSync, setDraft, setMetric]);

  const requestCaptureDiscard = useCallback(() => {
    dispatch({ type: "request-discard", target: "capture" });
  }, []);

  const cancelDiscard = useCallback(() => {
    dispatch({ type: "cancel-discard" });
  }, []);

  const confirmDiscard = useCallback(() => {
    const snapshot = stateRef.current;
    if (snapshot.discardPrompt === "capture") setDraft("");
    const confirmAction = { type: "confirm-discard" } as const;
    const confirmed = labReducer(snapshot, confirmAction);
    stateRef.current = confirmed;
    dispatch(confirmAction);
    if (snapshot.discardPrompt === "detail") {
      const closeAction = { type: "close-note" } as const;
      const closed = labReducer(confirmed, closeAction);
      const announceAction = {
        type: "announce",
        message: `${confirmed.announcement} Returned to recency.`,
      } as const;
      stateRef.current = labReducer(closed, announceAction);
      dispatch(closeAction);
      dispatch(announceAction);
    }
  }, [setDraft]);

  const retrySync = useCallback(
    (noteId: LabNoteId) => {
      const snapshot = stateRef.current;
      if (snapshot.mode === "offline") {
        dispatch({
          type: "announce",
          message: "Still offline. The note remains safely queued.",
        });
        return;
      }
      dispatch({ type: "retry-sync", noteId });
      scheduleSync(noteId, true);
    },
    [scheduleSync],
  );

  const setQuery = useCallback(
    (value: string) => {
      const start = performance.now();
      const action = { type: "set-query", value } as const;
      stateRef.current = labReducer(stateRef.current, action);
      dispatch(action);
      requestAnimationFrame(() => {
        setMetric("searchToResultMs", performance.now() - start);
      });
    },
    [setMetric],
  );

  const moveSearch = useCallback((direction: 1 | -1) => {
    const snapshot = stateRef.current;
    const resultIds = visibleLabNotes(snapshot).map((note) => note.id);
    const action = { type: "move-search", direction, resultIds } as const;
    stateRef.current = labReducer(snapshot, action);
    dispatch(action);
  }, []);

  const openNoteById = useCallback((noteId: LabNoteId) => {
    const action = { type: "open-note", noteId } as const;
    stateRef.current = labReducer(stateRef.current, action);
    dispatch(action);
  }, []);

  const closeNote = useCallback(() => {
    const snapshot = stateRef.current;
    const action = { type: "close-note" } as const;
    stateRef.current = labReducer(snapshot, action);
    dispatch(action);
  }, []);

  const setDetailDraft = useCallback((value: string) => {
    const snapshot = stateRef.current;
    if (snapshot.conflict?.noteId === snapshot.openNoteId) {
      dispatch({
        type: "announce",
        message:
          "Resolve the conflict explicitly before editing either retained version.",
      });
      return;
    }
    const action = { type: "set-detail-draft", value } as const;
    stateRef.current = labReducer(snapshot, action);
    dispatch(action);
  }, []);

  const saveDetail = useCallback(() => {
    const snapshot = stateRef.current;
    if (!snapshot.openNoteId || modeIsReadOnly(snapshot)) return;
    if (snapshot.conflict?.noteId === snapshot.openNoteId) {
      dispatch({
        type: "announce",
        message:
          "No version was overwritten. Choose how to resolve the conflict first.",
      });
      return;
    }
    const noteId = snapshot.openNoteId;
    dispatch({
      type: "save-edit",
      noteId,
      updatedAt: LAB_NOW + snapshot.nextSequence * 2_000,
    });
    scheduleSync(noteId);
  }, [scheduleSync]);

  const resolveConflict = useCallback(
    (resolution: LabConflictResolution) => {
      const snapshot = stateRef.current;
      if (!snapshot.conflict) return;
      const action = {
        type: "resolve-conflict",
        resolution,
        resolvedAt: LAB_NOW + snapshot.nextSequence * 5_000,
      } as const;
      // Claim the conflict synchronously so repeated activation cannot resolve
      // the same pair twice or create duplicate keep-both notes.
      stateRef.current = labReducer(snapshot, action);
      dispatch(action);
    },
    [],
  );

  const selectText = useCallback((value: string) => {
    const action = { type: "set-selected-text", value } as const;
    stateRef.current = labReducer(stateRef.current, action);
    dispatch(action);
  }, []);

  const prepareExtract = useCallback((selectedOverride?: string) => {
    if (selectedOverride !== undefined) {
      const selectAction = {
        type: "set-selected-text",
        value: selectedOverride,
      } as const;
      stateRef.current = labReducer(stateRef.current, selectAction);
      dispatch(selectAction);
    }
    const action = { type: "prepare-extract" } as const;
    stateRef.current = labReducer(stateRef.current, action);
    dispatch(action);
  }, []);

  const setApprovedText = useCallback((value: string) => {
    const action = { type: "set-approved-text", value } as const;
    stateRef.current = labReducer(stateRef.current, action);
    dispatch(action);
  }, []);

  const cancelExtract = useCallback(() => {
    const action = { type: "cancel-extract" } as const;
    stateRef.current = labReducer(stateRef.current, action);
    dispatch(action);
  }, []);

  const sendExtract = useCallback(() => {
    const snapshot = stateRef.current;
    const noteId = snapshot.extraction.noteId;
    const approvedText = snapshot.extraction.approvedText;
    if (!noteId || !approvedText.trim() || snapshot.extraction.state === "sending") return;
    if (modeIsReadOnly(snapshot)) {
      dispatch({ type: "announce", message: "Read-only mode does not send extracts." });
      return;
    }
    if (snapshot.mode === "offline") {
      dispatch({
        type: "send-extract-failure",
        message: "Offline. The approved wording is retained for a safe retry.",
      });
      return;
    }

    const note = snapshot.notes.find((candidate) => candidate.id === noteId);
    if (note?.promotedTaskId) {
      dispatch({
        type: "announce",
        message: "Already sent. Repeating the action will not create another task.",
      });
      return;
    }

    const existing = snapshot.taskLedger[noteId];
    const payload = existing
      ? buildExtractionPayload(noteId, existing.body)
      : buildExtractionPayload(noteId, approvedText);
    const receipt = existing
      ? { ...existing, created: false }
      : receiptForPayload(payload, true);

    const startAction = { type: "send-extract-start" } as const;
    // Make the sending lock immediate, including inside the same event loop.
    stateRef.current = labReducer(snapshot, startAction);
    dispatch(startAction);
    if (snapshot.mode === "error" && snapshot.extraction.attempts === 0) {
      const hardFailure = noteId === "lab_email_context";
      later(
        () => {
          const current = stateRef.current;
          if (
            current.extraction.noteId !== noteId ||
            current.extraction.state !== "sending"
          ) return;
          const failureAction = {
            type: "send-extract-failure",
            ...(hardFailure ? {} : { acceptedReceipt: receipt }),
            message: hardFailure
              ? "Tasks did not accept the approved wording. It is retained here for a safe retry."
              : "Tasks accepted the idempotency key, but the reply was lost. Retry safely.",
          } as const;
          stateRef.current = labReducer(current, failureAction);
          dispatch(failureAction);
        },
        260,
      );
      return;
    }
    later(() => {
      const current = stateRef.current;
      if (
        current.extraction.noteId !== noteId ||
        current.extraction.state !== "sending"
      ) return;
      const successAction = { type: "send-extract-success", receipt } as const;
      stateRef.current = labReducer(current, successAction);
      dispatch(successAction);
    }, 260);
  }, [later]);

  const copyOpenNote = useCallback(async () => {
    const snapshot = stateRef.current;
    const note = getOpenNote(snapshot);
    if (!note) return;
    try {
      await navigator.clipboard.writeText(snapshot.detailDraft);
      dispatch({ type: "announce", message: "Note copied." });
    } catch {
      dispatch({
        type: "announce",
        message: "Copy is unavailable here. The note is unchanged.",
      });
    }
  }, []);

  const deleteOpenNote = useCallback(() => {
    const snapshot = stateRef.current;
    if (!snapshot.openNoteId || modeIsReadOnly(snapshot)) return;
    dispatch({ type: "delete-note", noteId: snapshot.openNoteId });
  }, []);

  const undoDelete = useCallback(() => {
    dispatch({ type: "undo-delete" });
  }, []);

  const announce = useCallback((message: string) => {
    dispatch({ type: "announce", message });
  }, []);

  const actions = useMemo<LabActions>(
    () => ({
      setOption,
      setScenario,
      setDataset,
      setMode,
      capture,
      requestCaptureDiscard,
      cancelDiscard,
      confirmDiscard,
      retrySync,
      setQuery,
      moveSearch,
      openNote: openNoteById,
      closeNote,
      setDetailDraft,
      saveDetail,
      resolveConflict,
      selectText,
      prepareExtract,
      setApprovedText,
      cancelExtract,
      sendExtract,
      copyOpenNote,
      deleteOpenNote,
      undoDelete,
      announce,
      setMetric,
    }),
    [
      announce,
      cancelDiscard,
      cancelExtract,
      capture,
      closeNote,
      confirmDiscard,
      copyOpenNote,
      deleteOpenNote,
      moveSearch,
      openNoteById,
      prepareExtract,
      requestCaptureDiscard,
      retrySync,
      resolveConflict,
      saveDetail,
      selectText,
      sendExtract,
      setApprovedText,
      setDataset,
      setDetailDraft,
      setMetric,
      setMode,
      setOption,
      setQuery,
      setScenario,
      undoDelete,
    ],
  );

  const notes = useMemo(() => visibleLabNotes(state), [state]);
  const openNote = useMemo(() => getOpenNote(state), [state]);
  const value = useMemo(
    () => ({ state, notes, openNote, actions }),
    [actions, notes, openNote, state],
  );
  const draftValue = useMemo(() => ({ draft, setDraft }), [draft, setDraft]);

  return (
    <LabDraftContext.Provider value={draftValue}>
      <LabStoreContext.Provider value={value}>
        {children}
      </LabStoreContext.Provider>
    </LabDraftContext.Provider>
  );
}

export function useNotesLab() {
  const store = useContext(LabStoreContext);
  if (!store) {
    throw new Error("useNotesLab must be used inside NotesLabProvider");
  }
  return store;
}

export function useNotesLabDraft() {
  const draftStore = useContext(LabDraftContext);
  if (!draftStore) {
    throw new Error("useNotesLabDraft must be used inside NotesLabProvider");
  }
  return draftStore;
}
