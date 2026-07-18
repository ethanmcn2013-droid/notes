export type LabOption = "a" | "b" | "c";

export type LabScenario = "capture" | "stream" | "search" | "detail";

export type LabDataset = "sparse" | "normal" | "dense" | "edge";

export type LabMode =
  | "default"
  | "empty"
  | "loading"
  | "saving"
  | "saved"
  | "offline"
  | "error"
  | "conflict"
  | "read-only";

export type LabViewport = "auto" | "390" | "768" | "1280" | "1440" | "1728";

export type LabSyncState = "pending" | "synced" | "failed";

export type LabTaskState = "idle" | "sending" | "failed" | "sent";

export type LabNoteId = `lab_${string}`;

export type LabConflictResolution =
  | "keep-local"
  | "use-remote"
  | "keep-both";

export type LabConflictVersion = {
  body: string;
  updatedAt: number;
};

export type LabConflict = {
  noteId: LabNoteId;
  detectedAt: number;
  local: LabConflictVersion;
  remote: LabConflictVersion;
};

export type LabConflictResolutionReceipt = LabConflict & {
  resolution: LabConflictResolution;
  resolvedAt: number;
  resultingNoteIds: LabNoteId[];
};

export type LabNote = {
  id: LabNoteId;
  body: string;
  createdAt: number;
  updatedAt: number;
  syncState: LabSyncState;
  approvedExtract: string | null;
  promotedTaskId: string | null;
};

export type LabExtractionPayload = {
  noteId: LabNoteId;
  body: string;
  workspaceId: "lab_workspace_review";
};

export type LabTaskReceipt = {
  taskId: `lab_task_${string}`;
  noteId: LabNoteId;
  body: string;
  workspaceId: "lab_workspace_review";
  created: boolean;
};

export type LabExtraction = {
  noteId: LabNoteId | null;
  selectedText: string;
  approvedText: string;
  state: LabTaskState;
  attempts: number;
  receipt: LabTaskReceipt | null;
  error: string | null;
};

export type LabUndo = {
  note: LabNote;
  index: number;
} | null;

export type LabMetrics = {
  focusReadyMs: number | null;
  saveToStreamMs: number | null;
  searchToResultMs: number | null;
};

export type LabState = {
  option: LabOption;
  scenario: LabScenario;
  dataset: LabDataset;
  mode: LabMode;
  notes: LabNote[];
  draft: string;
  query: string;
  searchCursor: number;
  openNoteId: LabNoteId | null;
  detailDraft: string;
  selectedText: string;
  extraction: LabExtraction;
  taskLedger: Record<string, LabTaskReceipt>;
  conflict: LabConflict | null;
  lastConflictResolution: LabConflictResolutionReceipt | null;
  undo: LabUndo;
  discardPrompt: "capture" | "detail" | null;
  announcement: string;
  nextSequence: number;
  metrics: LabMetrics;
};

export type LabAction =
  | { type: "set-option"; option: LabOption }
  | { type: "set-scenario"; scenario: LabScenario }
  | { type: "set-dataset"; dataset: LabDataset }
  | { type: "set-mode"; mode: LabMode }
  | { type: "set-draft"; value: string }
  | { type: "request-discard"; target: "capture" | "detail" }
  | { type: "cancel-discard" }
  | { type: "confirm-discard" }
  | { type: "capture-start"; note: LabNote }
  | { type: "sync-success"; noteId: LabNoteId }
  | { type: "sync-failure"; noteId: LabNoteId; message: string }
  | { type: "retry-sync"; noteId: LabNoteId }
  | { type: "sync-all" }
  | { type: "set-query"; value: string }
  | { type: "move-search"; direction: 1 | -1; resultIds: LabNoteId[] }
  | { type: "open-note"; noteId: LabNoteId }
  | { type: "close-note" }
  | { type: "set-detail-draft"; value: string }
  | { type: "save-edit"; noteId: LabNoteId; updatedAt: number }
  | {
      type: "resolve-conflict";
      resolution: LabConflictResolution;
      resolvedAt: number;
    }
  | { type: "set-selected-text"; value: string }
  | { type: "delete-note"; noteId: LabNoteId }
  | { type: "undo-delete" }
  | { type: "prepare-extract" }
  | { type: "set-approved-text"; value: string }
  | { type: "cancel-extract" }
  | { type: "send-extract-start" }
  | {
      type: "send-extract-failure";
      message: string;
      acceptedReceipt?: LabTaskReceipt;
    }
  | { type: "send-extract-success"; receipt: LabTaskReceipt }
  | { type: "announce"; message: string }
  | { type: "set-metric"; metric: keyof LabMetrics; value: number };

export type LabInitialConfig = Partial<
  Pick<LabState, "option" | "scenario" | "dataset" | "mode">
>;
