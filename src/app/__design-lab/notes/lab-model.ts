import {
  freshLabNotes,
  LAB_DATASET_IDS,
  LAB_NOW,
} from "./lab-fixtures";
import type {
  LabAction,
  LabDataset,
  LabExtraction,
  LabExtractionPayload,
  LabInitialConfig,
  LabMode,
  LabNote,
  LabNoteId,
  LabScenario,
  LabState,
  LabTaskReceipt,
} from "./lab-types";

const EMPTY_EXTRACTION: LabExtraction = {
  noteId: null,
  selectedText: "",
  approvedText: "",
  state: "idle",
  attempts: 0,
  receipt: null,
  error: null,
};

const DETAIL_NOTE_ID: LabNoteId = "lab_venue_walkthrough";
const DETAIL_SELECTION = "Confirm the portable ramp with Eoin by Friday.";

export const LAB_SAVED_NOTE_ID: LabNoteId = "lab_mode_saved";
export const LAB_CONFLICT_NOTE_ID: LabNoteId = "lab_mode_conflict";
export const LAB_CONFLICT_REMOTE_NOTE_ID: LabNoteId =
  "lab_mode_conflict_remote";

export const LAB_CONFLICT_LOCAL_BODY =
  "Venue walkthrough decisions\n\nPortable ramp confirmed with Eoin for Friday.\nKeep the supplier call at 14:00.";
export const LAB_CONFLICT_REMOTE_BODY =
  "Venue walkthrough decisions\n\nPortable ramp still needs final confirmation.\nSupplier call moved to 15:30.";

const LAB_SAVED_BODY =
  "Accessibility follow-up\n\nSend the final keyboard review to Aoife tomorrow.";
const LAB_CONFLICT_LOCAL_UPDATED_AT = LAB_NOW + 2_000;
const LAB_CONFLICT_REMOTE_UPDATED_AT = LAB_NOW + 3_000;
const LAB_CONFLICT_DETECTED_AT = LAB_NOW + 4_000;

function cloneExtraction(): LabExtraction {
  return { ...EMPTY_EXTRACTION };
}

function noteById(notes: readonly LabNote[], noteId: LabNoteId | null) {
  if (!noteId) return null;
  return notes.find((note) => note.id === noteId) ?? null;
}

function upsertNote(notes: readonly LabNote[], note: LabNote): LabNote[] {
  const index = notes.findIndex((candidate) => candidate.id === note.id);
  if (index < 0) return [note, ...notes];
  return notes.map((candidate) => (candidate.id === note.id ? note : candidate));
}

function applyScenario(state: LabState, scenario: LabScenario): LabState {
  if (scenario === "search") {
    return {
      ...state,
      scenario,
      query: "delivery",
      searchCursor: 0,
      openNoteId: null,
      detailDraft: "",
      selectedText: "",
      extraction: cloneExtraction(),
      discardPrompt: null,
      announcement: "Search scenario ready.",
    };
  }

  if (scenario === "detail") {
    const note = noteById(state.notes, DETAIL_NOTE_ID);
    return {
      ...state,
      scenario,
      query: "",
      searchCursor: 0,
      openNoteId: DETAIL_NOTE_ID,
      detailDraft: note?.body ?? "",
      selectedText: DETAIL_SELECTION,
      extraction: {
        noteId: DETAIL_NOTE_ID,
        selectedText: DETAIL_SELECTION,
        approvedText: DETAIL_SELECTION,
        state: "idle",
        attempts: 0,
        receipt: null,
        error: null,
      },
      discardPrompt: null,
      announcement: "Note detail and approved extract ready.",
    };
  }

  return {
    ...state,
    scenario,
    query: "",
    searchCursor: 0,
    openNoteId: null,
    detailDraft: "",
    selectedText: "",
    extraction: cloneExtraction(),
    discardPrompt: null,
    announcement:
      scenario === "capture" ? "Capture scenario ready." : "Recent stream ready.",
  };
}

function modeState(state: LabState, mode: LabMode): LabState {
  let notes = state.notes;
  if (mode === "saving" && !notes.some((note) => note.id === "lab_mode_saving")) {
    notes = [
      {
        id: "lab_mode_saving",
        body: "Cake tasting moved to 15:30\n\nHold the window for Niamh.",
        createdAt: LAB_NOW + 1_000,
        updatedAt: LAB_NOW + 1_000,
        syncState: "pending",
        approvedExtract: null,
        promotedTaskId: null,
      },
      ...notes,
    ];
  }

  if (mode === "saved") {
    notes = upsertNote(notes, {
      id: LAB_SAVED_NOTE_ID,
      body: LAB_SAVED_BODY,
      createdAt: LAB_NOW + 2_000,
      updatedAt: LAB_NOW + 2_000,
      syncState: "synced",
      approvedExtract: null,
      promotedTaskId: null,
    });
  }

  const conflict =
    mode === "conflict"
      ? {
          noteId: LAB_CONFLICT_NOTE_ID,
          detectedAt: LAB_CONFLICT_DETECTED_AT,
          local: {
            body: LAB_CONFLICT_LOCAL_BODY,
            updatedAt: LAB_CONFLICT_LOCAL_UPDATED_AT,
          },
          remote: {
            body: LAB_CONFLICT_REMOTE_BODY,
            updatedAt: LAB_CONFLICT_REMOTE_UPDATED_AT,
          },
        }
      : null;

  if (conflict) {
    notes = upsertNote(
      notes.filter((note) => note.id !== LAB_CONFLICT_REMOTE_NOTE_ID),
      {
        id: LAB_CONFLICT_NOTE_ID,
        body: conflict.local.body,
        createdAt: LAB_NOW + 1_000,
        updatedAt: conflict.local.updatedAt,
        syncState: "synced",
        approvedExtract: null,
        promotedTaskId: null,
      },
    );
  }

  const clearsDetail = mode === "empty" || mode === "loading";
  const openNoteId = conflict
    ? conflict.noteId
    : clearsDetail
      ? null
      : state.openNoteId;
  const detailDraft = conflict
    ? conflict.local.body
    : clearsDetail
      ? ""
      : state.detailDraft;

  return {
    ...state,
    notes,
    mode,
    openNoteId,
    detailDraft,
    selectedText: conflict ? "" : state.selectedText,
    extraction: conflict ? cloneExtraction() : state.extraction,
    conflict,
    lastConflictResolution:
      mode === "conflict" ? null : state.lastConflictResolution,
    discardPrompt: null,
    announcement:
      mode === "offline"
        ? "Offline. New writing stays safely on this device in the lab."
        : mode === "saved"
          ? "Saved. Your exact writing is safely in the stream."
          : mode === "conflict"
            ? "Conflict found. Both exact versions are retained until you choose a safe resolution."
            : mode === "read-only"
              ? "Read-only review mode."
              : `${mode[0]?.toUpperCase()}${mode.slice(1)} state ready.`,
  };
}

export function createInitialLabState(config: LabInitialConfig = {}): LabState {
  const state: LabState = {
    option: config.option ?? "a",
    scenario: config.scenario ?? "capture",
    dataset: config.dataset ?? "normal",
    mode: config.mode ?? "default",
    notes: freshLabNotes(),
    draft: "",
    query: "",
    searchCursor: 0,
    openNoteId: null,
    detailDraft: "",
    selectedText: "",
    extraction: cloneExtraction(),
    taskLedger: {},
    conflict: null,
    lastConflictResolution: null,
    undo: null,
    discardPrompt: null,
    announcement: "Design lab ready. Capture is focused.",
    nextSequence: 1,
    metrics: {
      focusReadyMs: null,
      saveToStreamMs: null,
      searchToResultMs: null,
    },
  };

  return modeState(applyScenario(state, state.scenario), state.mode);
}

export function labReducer(state: LabState, action: LabAction): LabState {
  switch (action.type) {
    case "set-option":
      return {
        ...state,
        option: action.option,
        announcement: `Option ${action.option.toUpperCase()} ready. Shared note state is unchanged.`,
      };
    case "set-scenario":
      if (hasProtectedDetailWork(state)) {
        return {
          ...state,
          discardPrompt: state.extraction.state === "sending" ? state.discardPrompt : "detail",
          announcement: protectedDetailWorkMessage(state, "changing review scenario"),
        };
      }
      return applyScenario(state, action.scenario);
    case "set-dataset": {
      if (hasProtectedDetailWork(state)) {
        return {
          ...state,
          discardPrompt: state.extraction.state === "sending" ? state.discardPrompt : "detail",
          announcement: protectedDetailWorkMessage(state, "changing dataset"),
        };
      }
      const reset = createInitialLabState({
        option: state.option,
        scenario: state.scenario,
        dataset: action.dataset,
        mode: state.mode,
      });
      return {
        ...reset,
        announcement: `${datasetLabel(action.dataset)} dataset loaded.`,
      };
    }
    case "set-mode":
      if (hasProtectedDetailWork(state)) {
        return {
          ...state,
          discardPrompt: state.extraction.state === "sending" ? state.discardPrompt : "detail",
          announcement: protectedDetailWorkMessage(state, "changing mode"),
        };
      }
      return modeState(state, action.mode);
    case "set-draft":
      return { ...state, draft: action.value, discardPrompt: null };
    case "request-discard":
      return { ...state, discardPrompt: action.target };
    case "cancel-discard":
      return { ...state, discardPrompt: null };
    case "confirm-discard":
      if (state.discardPrompt === "capture") {
        return {
          ...state,
          draft: "",
          discardPrompt: null,
          announcement: "Capture draft discarded.",
        };
      }
      if (state.discardPrompt === "detail") {
        const note = noteById(state.notes, state.openNoteId);
        const discardedExtraction = hasPendingExtraction(state);
        return {
          ...state,
          detailDraft: note?.body ?? "",
          selectedText: "",
          extraction: cloneExtraction(),
          discardPrompt: null,
          announcement: discardedExtraction
            ? "Unsent approved wording discarded. Nothing was sent."
            : "Unsaved note changes discarded.",
        };
      }
      return state;
    case "capture-start":
      return {
        ...state,
        notes: [action.note, ...state.notes],
        draft: "",
        nextSequence: state.nextSequence + 1,
        discardPrompt: null,
        announcement: "Saved locally. Syncing.",
      };
    case "sync-success":
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.noteId ? { ...note, syncState: "synced" } : note,
        ),
        announcement: "Saved.",
      };
    case "sync-failure":
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.noteId ? { ...note, syncState: "failed" } : note,
        ),
        announcement: action.message,
      };
    case "retry-sync":
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.noteId ? { ...note, syncState: "pending" } : note,
        ),
        announcement: "Retrying the same note. No duplicate was created.",
      };
    case "sync-all":
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.syncState === "synced" ? note : { ...note, syncState: "synced" },
        ),
        announcement: "Back online. Pending writing is saved.",
      };
    case "set-query":
      return { ...state, query: action.value, searchCursor: 0 };
    case "move-search": {
      if (hasProtectedDetailWork(state)) {
        return {
          ...state,
          discardPrompt: state.extraction.state === "sending" ? state.discardPrompt : "detail",
          announcement: protectedDetailWorkMessage(state, "opening another result"),
        };
      }
      if (action.resultIds.length === 0) return state;
      const nextCursor =
        (state.searchCursor + action.direction + action.resultIds.length) %
        action.resultIds.length;
      const openNoteId = action.resultIds[nextCursor] ?? action.resultIds[0];
      const note = noteById(state.notes, openNoteId);
      return {
        ...state,
        searchCursor: nextCursor,
        openNoteId,
        detailDraft: note?.body ?? "",
        selectedText: "",
        extraction: cloneExtraction(),
        announcement: note
          ? `Search result ${nextCursor + 1} of ${action.resultIds.length}: ${displayTitle(note.body)}.`
          : `Search result ${nextCursor + 1} of ${action.resultIds.length}.`,
      };
    }
    case "open-note": {
      if (hasProtectedDetailWork(state)) {
        return {
          ...state,
          discardPrompt: state.extraction.state === "sending" ? state.discardPrompt : "detail",
          announcement: protectedDetailWorkMessage(state, "opening another note"),
        };
      }
      const note = noteById(state.notes, action.noteId);
      if (!note) return state;
      return {
        ...state,
        openNoteId: action.noteId,
        detailDraft: note.body,
        selectedText: "",
        extraction: cloneExtraction(),
        discardPrompt: null,
        announcement: "Note opened. Private body stays in Notes.",
      };
    }
    case "close-note":
      if (hasProtectedDetailWork(state)) {
        return {
          ...state,
          discardPrompt: state.extraction.state === "sending" ? state.discardPrompt : "detail",
          announcement: protectedDetailWorkMessage(state, "returning to recency"),
        };
      }
      return {
        ...state,
        openNoteId: null,
        detailDraft: "",
        selectedText: "",
        extraction: cloneExtraction(),
        discardPrompt: null,
        announcement: "Returned to recency.",
      };
    case "set-detail-draft":
      if (state.conflict?.noteId === state.openNoteId) {
        return {
          ...state,
          announcement:
            "Resolve the conflict explicitly before editing either retained version.",
        };
      }
      return { ...state, detailDraft: action.value, discardPrompt: null };
    case "save-edit":
      if (state.conflict?.noteId === action.noteId) {
        return {
          ...state,
          announcement:
            "No version was overwritten. Choose how to resolve the conflict first.",
        };
      }
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.noteId
            ? {
                ...note,
                body: state.detailDraft,
                updatedAt: action.updatedAt,
                syncState: "pending",
              }
            : note,
        ),
        announcement: "Changes saved locally. Created time is unchanged.",
      };
    case "resolve-conflict": {
      const conflict = state.conflict;
      const conflictedNote = conflict
        ? noteById(state.notes, conflict.noteId)
        : null;
      if (!conflict || !conflictedNote) return state;

      const keepRemote = action.resolution === "use-remote";
      const resolvedBody = keepRemote
        ? conflict.remote.body
        : conflict.local.body;
      let notes = state.notes.map((note) =>
        note.id === conflict.noteId
          ? {
              ...note,
              body: resolvedBody,
              updatedAt: action.resolvedAt,
              syncState: "synced" as const,
            }
          : note,
      );
      let resultingNoteIds: LabNoteId[] = [conflict.noteId];

      if (action.resolution === "keep-both") {
        const remoteNote: LabNote = {
          id: LAB_CONFLICT_REMOTE_NOTE_ID,
          body: conflict.remote.body,
          createdAt: action.resolvedAt,
          updatedAt: action.resolvedAt,
          syncState: "synced",
          approvedExtract: null,
          promotedTaskId: null,
        };
        notes = upsertNote(notes, remoteNote);
        resultingNoteIds = [conflict.noteId, remoteNote.id];
      } else {
        notes = notes.filter((note) => note.id !== LAB_CONFLICT_REMOTE_NOTE_ID);
      }

      const resolutionMessage = {
        "keep-local":
          "Conflict resolved safely. Kept the local version; both originals remain in the resolution receipt.",
        "use-remote":
          "Conflict resolved safely. Used the remote version; both originals remain in the resolution receipt.",
        "keep-both":
          "Conflict resolved safely. Kept both exact versions as separate notes.",
      }[action.resolution];

      return {
        ...state,
        notes,
        mode: "saved",
        openNoteId: conflict.noteId,
        detailDraft: resolvedBody,
        selectedText: "",
        extraction: cloneExtraction(),
        conflict: null,
        lastConflictResolution: {
          noteId: conflict.noteId,
          detectedAt: conflict.detectedAt,
          local: { ...conflict.local },
          remote: { ...conflict.remote },
          resolution: action.resolution,
          resolvedAt: action.resolvedAt,
          resultingNoteIds,
        },
        discardPrompt: null,
        announcement: resolutionMessage,
      };
    }
    case "set-selected-text":
      return { ...state, selectedText: action.value };
    case "delete-note": {
      if (state.conflict?.noteId === action.noteId) {
        return {
          ...state,
          announcement:
            "No version was deleted. Resolve the conflict explicitly first.",
        };
      }
      const index = state.notes.findIndex((note) => note.id === action.noteId);
      if (index < 0) return state;
      const note = state.notes[index];
      if (!note) return state;
      return {
        ...state,
        notes: state.notes.filter((candidate) => candidate.id !== action.noteId),
        openNoteId: state.openNoteId === action.noteId ? null : state.openNoteId,
        detailDraft: state.openNoteId === action.noteId ? "" : state.detailDraft,
        undo: { note, index },
        extraction: cloneExtraction(),
        announcement: "Note deleted. Undo is available.",
      };
    }
    case "undo-delete": {
      if (!state.undo) return state;
      const notes = [...state.notes];
      notes.splice(Math.min(state.undo.index, notes.length), 0, state.undo.note);
      return {
        ...state,
        notes,
        undo: null,
        announcement: "Note restored in its previous place.",
      };
    }
    case "prepare-extract":
      if (!state.openNoteId || !state.selectedText.trim()) return state;
      if (state.conflict?.noteId === state.openNoteId) {
        return {
          ...state,
          announcement:
            "Resolve the conflict before approving wording for Tasks. Nothing was sent.",
        };
      }
      if (state.taskLedger[state.openNoteId]) {
        const accepted = state.taskLedger[state.openNoteId];
        return {
          ...state,
          selectedText: accepted.body,
          extraction: {
            noteId: state.openNoteId,
            selectedText: accepted.body,
            approvedText: accepted.body,
            state: "failed",
            attempts: 1,
            receipt: null,
            error:
              "An earlier send was accepted but its reply was lost. Reconcile that exact wording before starting another extract.",
          },
          announcement:
            "An accepted extract needs safe reconciliation. Its wording is locked.",
        };
      }
      return {
        ...state,
        extraction: {
          noteId: state.openNoteId,
          selectedText: state.selectedText,
          approvedText: state.selectedText,
          state: "idle",
          attempts: 0,
          receipt: null,
          error: null,
        },
        announcement: "Selected wording is ready for review. Nothing has been sent.",
      };
    case "set-approved-text":
      if (
        state.extraction.noteId &&
        state.taskLedger[state.extraction.noteId]
      ) {
        return state;
      }
      return {
        ...state,
        extraction: { ...state.extraction, approvedText: action.value, error: null },
      };
    case "cancel-extract":
      return {
        ...state,
        extraction: cloneExtraction(),
        announcement: "Approved extract cancelled. Nothing was sent.",
      };
    case "send-extract-start":
      if (state.extraction.state === "sending") return state;
      return {
        ...state,
        extraction: {
          ...state.extraction,
          state: "sending",
          error: null,
          attempts: state.extraction.attempts + 1,
        },
        announcement: "Sending the approved wording. The private note stays here.",
      };
    case "send-extract-failure":
      return {
        ...state,
        taskLedger: action.acceptedReceipt
          ? {
              ...state.taskLedger,
              [action.acceptedReceipt.noteId]: action.acceptedReceipt,
            }
          : state.taskLedger,
        extraction: {
          ...state.extraction,
          state: "failed",
          error: action.message,
          receipt: null,
        },
        announcement: action.message,
      };
    case "send-extract-success":
      return {
        ...state,
        notes: state.notes.map((note) =>
          note.id === action.receipt.noteId
            ? {
                ...note,
                approvedExtract: action.receipt.body,
                promotedTaskId: action.receipt.taskId,
              }
            : note,
        ),
        taskLedger: {
          ...state.taskLedger,
          [action.receipt.noteId]: action.receipt,
        },
        extraction: {
          ...state.extraction,
          state: "sent",
          receipt: action.receipt,
          error: null,
        },
        announcement:
          "Approved wording sent in the simulation. The note is still private and in place.",
      };
    case "announce":
      return { ...state, announcement: action.message };
    case "set-metric":
      return {
        ...state,
        metrics: { ...state.metrics, [action.metric]: action.value },
      };
  }
}

export function datasetNotes(state: LabState): LabNote[] {
  if (state.mode === "empty" || state.mode === "loading") {
    return state.notes
      .filter((note) => note.id.startsWith("lab_capture_"))
      .sort((a, b) => b.createdAt - a.createdAt);
  }
  const ids = new Set(LAB_DATASET_IDS[state.dataset]);
  return state.notes
    .filter(
      (note) =>
        ids.has(note.id) ||
        note.id.startsWith("lab_capture_") ||
        note.id.startsWith("lab_mode_"),
    )
    .sort((a, b) => b.createdAt - a.createdAt);
}

function normalized(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-GB");
}

function searchTerms(query: string) {
  return normalized(query)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

export interface SearchHighlightRange {
  start: number;
  end: number;
}

export interface LabSearchPresentation {
  title: string;
  titleHighlights: SearchHighlightRange[];
  snippet: string;
  snippetHighlights: SearchHighlightRange[];
  snippetSource: "body" | "approved-extract";
}

/**
 * Builds a folded search index while retaining offsets into the original text.
 * Folding one Unicode symbol at a time means a query such as `cafe` can safely
 * highlight the original `Café` rather than a normalized copy.
 */
function indexedNormalized(value: string) {
  let text = "";
  const starts: number[] = [];
  const ends: number[] = [];
  let sourceOffset = 0;

  for (const symbol of value) {
    const start = sourceOffset;
    sourceOffset += symbol.length;
    const folded = normalized(symbol);
    text += folded;
    for (let index = 0; index < folded.length; index += 1) {
      starts.push(start);
      ends.push(sourceOffset);
    }
  }

  return { text, starts, ends };
}

/** Returns every query-term match as offsets into the unmodified display text. */
export function searchHighlightRanges(
  value: string,
  query: string,
): SearchHighlightRange[] {
  const terms = [...new Set(searchTerms(query))];
  if (terms.length === 0 || !value) return [];

  const indexed = indexedNormalized(value);
  const ranges: SearchHighlightRange[] = [];

  for (const term of terms) {
    let cursor = 0;
    while (cursor <= indexed.text.length - term.length) {
      const match = indexed.text.indexOf(term, cursor);
      if (match < 0) break;
      const endIndex = match + term.length - 1;
      const start = indexed.starts[match];
      const end = indexed.ends[endIndex];
      if (start !== undefined && end !== undefined) ranges.push({ start, end });
      cursor = match + Math.max(1, term.length);
    }
  }

  ranges.sort((left, right) => left.start - right.start || left.end - right.end);
  return ranges.reduce<SearchHighlightRange[]>((merged, range) => {
    const previous = merged.at(-1);
    if (previous && range.start < previous.end) {
      previous.end = Math.max(previous.end, range.end);
      return merged;
    }
    merged.push({ ...range });
    return merged;
  }, []);
}

export function searchLabNotes(notes: readonly LabNote[], query: string): LabNote[] {
  const terms = searchTerms(query);
  if (terms.length === 0) return [...notes];

  return notes
    .map((note) => {
      const body = normalized(note.body);
      const extract = normalized(note.approvedExtract ?? "");
      const title = normalized(note.body.split("\n")[0] ?? "");
      if (!terms.every((term) => body.includes(term) || extract.includes(term))) {
        return null;
      }
      const score = terms.reduce((total, term) => {
        if (title.startsWith(term)) return total + 6;
        if (title.includes(term)) return total + 4;
        if (extract.includes(term)) return total + 3;
        return total + 1;
      }, 0);
      return { note, score };
    })
    .filter((entry): entry is { note: LabNote; score: number } => Boolean(entry))
    .sort((a, b) => b.score - a.score || b.note.createdAt - a.note.createdAt)
    .map((entry) => entry.note);
}

export function visibleLabNotes(state: LabState): LabNote[] {
  const notes = datasetNotes(state);
  return state.query.trim() ? searchLabNotes(notes, state.query) : notes;
}

export function getOpenNote(state: LabState): LabNote | null {
  return noteById(state.notes, state.openNoteId);
}

export function displayTitle(body: string): string {
  const line = body.split("\n").find((part) => part.trim())?.trim() ?? "Untitled note";
  if (line.length <= 92) return line;
  const clipped = line.slice(0, 89);
  const wordBoundary = clipped.lastIndexOf(" ");
  return `${clipped.slice(0, Math.max(wordBoundary, 68)).trim()}…`;
}

export function displayExcerpt(body: string): string {
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const source = lines.slice(1).join(" ") || lines[0] || "";
  if (source.length <= 180) return source;
  return `${source.slice(0, 177).trim()}…`;
}

function firstRangeForEachTerm(value: string, query: string) {
  const indexed = indexedNormalized(value);
  return [...new Set(searchTerms(query))]
    .map((term) => {
      const match = indexed.text.indexOf(term);
      if (match < 0) return null;
      const start = indexed.starts[match];
      const end = indexed.ends[match + term.length - 1];
      return start === undefined || end === undefined ? null : { start, end };
    })
    .filter((range): range is SearchHighlightRange => Boolean(range))
    .sort((left, right) => left.start - right.start || left.end - right.end);
}

export function searchSnippet(body: string, query: string): string {
  const compact = body.replace(/\s+/g, " ").trim();
  const matches = firstRangeForEachTerm(compact, query);
  if (matches.length === 0) return displayExcerpt(body);

  const first = matches[0]!;
  const last = matches.at(-1)!;
  const maximumLength = 180;
  if (last.end - first.start <= maximumLength - 60) {
    let start = Math.max(0, first.start - 44);
    let end = Math.min(compact.length, last.end + 72);
    if (end - start > maximumLength) end = start + maximumLength;
    if (end - start < maximumLength && start > 0) {
      start = Math.max(0, end - maximumLength);
    }
    return `${start > 0 ? "…" : ""}${compact.slice(start, end).trim()}${end < compact.length ? "…" : ""}`;
  }

  // Widely separated terms get short, ordered passages so every matched term
  // can remain visible without turning a stream row into the full note body.
  const passages = matches.map(({ start: matchStart, end: matchEnd }) => {
    const start = Math.max(0, matchStart - 28);
    const end = Math.min(compact.length, matchEnd + 44);
    return `${start > 0 ? "…" : ""}${compact.slice(start, end).trim()}${end < compact.length ? "…" : ""}`;
  });
  return passages.join(" ");
}

/**
 * Supplies everything a result row needs to render search evidence. When one
 * or more terms exist only in an approved extract, its snippet is built solely
 * from that approved text; unrelated private body context is never substituted.
 */
export function searchPresentation(
  note: LabNote,
  query: string,
): LabSearchPresentation {
  const title = displayTitle(note.body);
  const terms = searchTerms(query);
  const body = normalized(note.body);
  const approvedExtract = note.approvedExtract ?? "";
  const extract = normalized(approvedExtract);
  const needsExtractEvidence = Boolean(
    approvedExtract &&
      terms.some((term) => !body.includes(term) && extract.includes(term)),
  );
  const snippetSource = needsExtractEvidence ? "approved-extract" : "body";
  const snippet = terms.length
    ? searchSnippet(needsExtractEvidence ? approvedExtract : note.body, query)
    : displayExcerpt(note.body);

  return {
    title,
    titleHighlights: searchHighlightRanges(title, query),
    snippet,
    snippetHighlights: searchHighlightRanges(snippet, query),
    snippetSource,
  };
}

export function formatRelative(timestamp: number): string {
  const elapsed = Math.max(0, LAB_NOW - timestamp);
  if (elapsed < HOUR_MS) return `${Math.max(1, Math.round(elapsed / 60_000))}m`;
  if (elapsed < DAY_MS) return `${Math.round(elapsed / HOUR_MS)}h`;
  if (elapsed < 14 * DAY_MS) return `${Math.round(elapsed / DAY_MS)}d`;
  const date = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: timestamp < LAB_NOW - 365 * DAY_MS ? "numeric" : undefined,
    timeZone: "Europe/London",
  }).format(timestamp);
  return date;
}

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

export function buildExtractionPayload(
  noteId: LabNoteId,
  approvedText: string,
): LabExtractionPayload {
  return {
    noteId,
    body: approvedText,
    workspaceId: "lab_workspace_review",
  };
}

export function receiptForPayload(
  payload: LabExtractionPayload,
  created: boolean,
): LabTaskReceipt {
  return {
    taskId: `lab_task_${payload.noteId}`,
    noteId: payload.noteId,
    body: payload.body,
    workspaceId: payload.workspaceId,
    created,
  };
}

export function isDetailDirty(state: LabState): boolean {
  const note = getOpenNote(state);
  return Boolean(note && state.detailDraft !== note.body);
}

export function hasPendingExtraction(state: LabState): boolean {
  const note = getOpenNote(state);
  if (!note || state.extraction.noteId !== note.id) return false;
  if (state.extraction.state === "sent" || state.extraction.receipt) return false;
  if (note.promotedTaskId && note.approvedExtract) return false;
  return true;
}

export function hasProtectedDetailWork(state: LabState): boolean {
  return isDetailDirty(state) || hasPendingExtraction(state);
}

function protectedDetailWorkMessage(state: LabState, destination: string): string {
  if (state.extraction.state === "sending") {
    return `Wait for the approved extract result before ${destination}.`;
  }
  if (hasPendingExtraction(state) && isDetailDirty(state)) {
    return `Keep or discard the unsaved note changes and approved wording before ${destination}.`;
  }
  if (hasPendingExtraction(state)) {
    return `Cancel, send, or explicitly discard the approved wording before ${destination}.`;
  }
  return `Save or discard the open note changes before ${destination}.`;
}

export function modeIsReadOnly(state: LabState) {
  return state.mode === "read-only";
}

export function datasetLabel(dataset: LabDataset) {
  return {
    sparse: "Sparse",
    normal: "Normal",
    dense: "Dense",
    edge: "Edge-case",
  }[dataset];
}
