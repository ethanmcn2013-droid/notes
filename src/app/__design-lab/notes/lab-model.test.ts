import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  freshLabNotes,
  LAB_DATASET_IDS,
  LAB_NOTES,
  LAB_NOW,
} from "./lab-fixtures";
import {
  buildExtractionPayload,
  createInitialLabState,
  datasetNotes,
  getOpenNote,
  hasPendingExtraction,
  hasProtectedDetailWork,
  isDetailDirty,
  LAB_CONFLICT_LOCAL_BODY,
  LAB_CONFLICT_NOTE_ID,
  LAB_CONFLICT_REMOTE_BODY,
  LAB_CONFLICT_REMOTE_NOTE_ID,
  LAB_SAVED_NOTE_ID,
  labReducer,
  modeIsReadOnly,
  receiptForPayload,
  searchHighlightRanges,
  searchLabNotes,
  searchPresentation,
  visibleLabNotes,
} from "./lab-model";
import type {
  LabAction,
  LabDataset,
  LabNote,
  LabNoteId,
  LabState,
} from "./lab-types";

const DETAIL_NOTE_ID: LabNoteId = "lab_venue_walkthrough";
const APPROVED_DETAIL_TEXT =
  "Confirm the portable ramp with Eoin by Friday.";
const PRIVATE_DETAIL_SENTINEL =
  "Keep the family conversation about cost private for now.";
const PRIVATE_EMAIL_SENTINEL = "private.sender@example.test";

function dispatch(state: LabState, ...actions: LabAction[]) {
  return actions.reduce(labReducer, state);
}

function note(
  id: LabNoteId,
  body: string,
  approvedExtract: string | null = null,
  createdAt = LAB_NOW,
): LabNote {
  return {
    id,
    body,
    createdAt,
    updatedAt: createdAt,
    syncState: "synced",
    approvedExtract,
    promotedTaskId: null,
  };
}

describe("shared review corpus", () => {
  it("locks a deterministic, unique 96-note corpus with valid lab-only records", () => {
    assert.equal(LAB_NOTES.length, 96);
    assert.equal(new Set(LAB_NOTES.map(({ id }) => id)).size, 96);

    for (const fixture of LAB_NOTES) {
      assert.match(fixture.id, /^lab_[a-z0-9_]+$/);
      assert.ok(fixture.body.trim().length > 0, `${fixture.id} has an empty body`);
      assert.ok(
        fixture.createdAt <= fixture.updatedAt,
        `${fixture.id} was updated before it was created`,
      );
      assert.ok(
        fixture.createdAt <= LAB_NOW,
        `${fixture.id} unexpectedly comes from the future`,
      );
    }
  });

  it("keeps the four dataset definitions exact, unique, and inside the corpus", () => {
    const expectedSizes: Record<LabDataset, number> = {
      sparse: 6,
      normal: 24,
      dense: 96,
      edge: 15,
    };
    const corpusIds = new Set(LAB_NOTES.map(({ id }) => id));

    for (const dataset of Object.keys(expectedSizes) as LabDataset[]) {
      const ids = LAB_DATASET_IDS[dataset];
      assert.equal(ids.length, expectedSizes[dataset]);
      assert.equal(new Set(ids).size, ids.length, `${dataset} contains duplicate IDs`);
      assert.ok(ids.every((id) => corpusIds.has(id)));
    }
  });

  it("contains every high-risk fixture needed for design and privacy review", () => {
    const ids = new Set(LAB_NOTES.map(({ id }) => id));
    const requiredIds: LabNoteId[] = [
      "lab_two_words",
      "lab_very_long_first_line",
      "lab_meeting_notes",
      "lab_private_thought",
      "lab_approved_extract",
      "lab_already_sent",
      "lab_duplicate_a",
      "lab_duplicate_b",
      "lab_unicode",
      "lab_large_body",
      "lab_offline_pending",
      "lab_failed_sync",
      "lab_email_context",
      "lab_punctuation",
    ];

    assert.ok(requiredIds.every((id) => ids.has(id)));
    assert.equal(
      LAB_NOTES.find(({ id }) => id === "lab_offline_pending")?.syncState,
      "pending",
    );
    assert.equal(
      LAB_NOTES.find(({ id }) => id === "lab_failed_sync")?.syncState,
      "failed",
    );
    assert.ok(
      LAB_NOTES.find(({ id }) => id === "lab_large_body")!.body.length > 1_500,
    );
    assert.match(
      LAB_NOTES.find(({ id }) => id === "lab_unicode")!.body,
      /Café handover ☕[\s\S]*Mañana[\s\S]*João[\s\S]*日本語/,
    );
    assert.match(
      LAB_NOTES.find(({ id }) => id === "lab_email_context")!.body,
      new RegExp(PRIVATE_EMAIL_SENTINEL.replace(".", "\\.")),
    );
  });

  it("returns fresh arrays and fresh note objects on every reset", () => {
    const first = freshLabNotes();
    const second = freshLabNotes();

    assert.notStrictEqual(first, second);
    assert.notStrictEqual(first[0], second[0]);
    first[0]!.body = "mutated in one review session";
    assert.notEqual(second[0]!.body, first[0]!.body);
    assert.notEqual(LAB_NOTES[0]!.body, first[0]!.body);
  });
});

describe("scenario, dataset, and mode state", () => {
  it("starts each scenario with its intentional, deterministic review state", () => {
    const capture = createInitialLabState();
    assert.equal(capture.option, "a");
    assert.equal(capture.scenario, "capture");
    assert.equal(capture.dataset, "normal");
    assert.equal(capture.mode, "default");
    assert.equal(capture.openNoteId, null);
    assert.equal(capture.query, "");

    const search = createInitialLabState({ scenario: "search" });
    assert.equal(search.query, "delivery");
    assert.equal(search.openNoteId, null);
    assert.ok(visibleLabNotes(search).length > 0);

    const detail = createInitialLabState({ scenario: "detail" });
    assert.equal(detail.openNoteId, DETAIL_NOTE_ID);
    assert.equal(detail.selectedText, APPROVED_DETAIL_TEXT);
    assert.equal(detail.extraction.noteId, DETAIL_NOTE_ID);
    assert.equal(detail.extraction.approvedText, APPROVED_DETAIL_TEXT);
    assert.equal(detail.detailDraft, getOpenNote(detail)?.body);

    const stream = createInitialLabState({ scenario: "stream" });
    assert.equal(stream.query, "");
    assert.equal(stream.openNoteId, null);
    assert.equal(stream.extraction.noteId, null);
  });

  it("switches scenarios without leaking search, detail, or extraction state", () => {
    let state = createInitialLabState({ scenario: "detail" });
    state = labReducer(state, { type: "set-approved-text", value: "edited extract" });
    const blocked = labReducer(state, { type: "set-scenario", scenario: "search" });
    assert.equal(blocked.scenario, "detail");
    assert.equal(blocked.extraction.approvedText, "edited extract");
    assert.equal(blocked.discardPrompt, "detail");

    state = dispatch(
      state,
      { type: "cancel-extract" },
      { type: "set-scenario", scenario: "search" },
    );

    assert.equal(state.query, "delivery");
    assert.equal(state.openNoteId, null);
    assert.equal(state.detailDraft, "");
    assert.equal(state.selectedText, "");
    assert.deepEqual(state.extraction, {
      noteId: null,
      selectedText: "",
      approvedText: "",
      state: "idle",
      attempts: 0,
      receipt: null,
      error: null,
    });
  });

  it("serves exact dataset sizes, with newest notes first", () => {
    for (const [dataset, expected] of [
      ["sparse", 6],
      ["normal", 24],
      ["dense", 96],
      ["edge", 15],
    ] as const) {
      const notes = datasetNotes(createInitialLabState({ dataset }));
      assert.equal(notes.length, expected);
      assert.ok(
        notes.every(
          (fixture, index) =>
            index === 0 || notes[index - 1]!.createdAt >= fixture.createdAt,
        ),
      );
    }
  });

  it("resets session mutations when the dataset changes but preserves review controls", () => {
    let state = createInitialLabState({
      option: "c",
      scenario: "search",
      dataset: "normal",
      mode: "offline",
    });
    state = dispatch(
      state,
      { type: "set-draft", value: "transient capture" },
      { type: "set-dataset", dataset: "edge" },
    );

    assert.equal(state.option, "c");
    assert.equal(state.scenario, "search");
    assert.equal(state.dataset, "edge");
    assert.equal(state.mode, "offline");
    assert.equal(state.draft, "");
    assert.equal(state.query, "delivery");
    assert.equal(datasetNotes(state).length, 15);
  });

  it("models empty, loading, saving, saved, offline, error, conflict, and read-only explicitly", () => {
    const empty = createInitialLabState({ scenario: "detail", mode: "empty" });
    assert.equal(datasetNotes(empty).length, 0);
    assert.equal(empty.openNoteId, null);
    assert.equal(empty.detailDraft, "");

    const loading = createInitialLabState({ scenario: "detail", mode: "loading" });
    assert.equal(loading.openNoteId, null);
    assert.equal(loading.detailDraft, "");
    assert.equal(loading.notes.length, 96);

    let saving = createInitialLabState({ mode: "saving" });
    assert.equal(
      saving.notes.filter(({ id }) => id === "lab_mode_saving").length,
      1,
    );
    assert.equal(datasetNotes(saving)[0]?.id, "lab_mode_saving");
    saving = labReducer(saving, { type: "set-mode", mode: "saving" });
    assert.equal(
      saving.notes.filter(({ id }) => id === "lab_mode_saving").length,
      1,
    );

    let saved = createInitialLabState({ mode: "saved" });
    assert.equal(saved.mode, "saved");
    assert.equal(
      saved.notes.filter(({ id }) => id === LAB_SAVED_NOTE_ID).length,
      1,
    );
    assert.equal(
      saved.notes.find(({ id }) => id === LAB_SAVED_NOTE_ID)?.syncState,
      "synced",
    );
    assert.equal(datasetNotes(saved)[0]?.id, LAB_SAVED_NOTE_ID);
    assert.match(saved.announcement, /^Saved\./);
    saved = labReducer(saved, { type: "set-mode", mode: "saved" });
    assert.equal(
      saved.notes.filter(({ id }) => id === LAB_SAVED_NOTE_ID).length,
      1,
    );

    const offline = createInitialLabState({ mode: "offline" });
    assert.match(offline.announcement, /^Offline\./);

    const error = createInitialLabState({ mode: "error" });
    assert.equal(error.mode, "error");
    assert.match(error.announcement, /^Error state ready\.$/);

    const conflict = createInitialLabState({ mode: "conflict" });
    assert.equal(conflict.openNoteId, LAB_CONFLICT_NOTE_ID);
    assert.equal(conflict.detailDraft, LAB_CONFLICT_LOCAL_BODY);
    assert.deepEqual(conflict.conflict, {
      noteId: LAB_CONFLICT_NOTE_ID,
      detectedAt: LAB_NOW + 4_000,
      local: {
        body: LAB_CONFLICT_LOCAL_BODY,
        updatedAt: LAB_NOW + 2_000,
      },
      remote: {
        body: LAB_CONFLICT_REMOTE_BODY,
        updatedAt: LAB_NOW + 3_000,
      },
    });
    assert.equal(
      conflict.notes.find(({ id }) => id === LAB_CONFLICT_NOTE_ID)?.body,
      LAB_CONFLICT_LOCAL_BODY,
    );
    assert.equal(
      conflict.notes.some(({ id }) => id === LAB_CONFLICT_REMOTE_NOTE_ID),
      false,
    );
    assert.match(conflict.announcement, /Both exact versions are retained/);

    const readOnly = createInitialLabState({ mode: "read-only" });
    assert.equal(modeIsReadOnly(readOnly), true);
    assert.equal(modeIsReadOnly(createInitialLabState()), false);
  });

  it("keeps session captures visible while fixture rows are empty or loading", () => {
    for (const mode of ["empty", "loading"] as const) {
      let state = createInitialLabState({ mode });
      const note: LabNote = {
        id: `lab_capture_${mode}` as LabNoteId,
        body: `Visible ${mode} capture`,
        createdAt: LAB_NOW + 10_000,
        updatedAt: LAB_NOW + 10_000,
        syncState: "pending",
        approvedExtract: null,
        promotedTaskId: null,
      };
      state = labReducer(state, { type: "capture-start", note });
      assert.deepEqual(datasetNotes(state).map(({ id }) => id), [note.id]);
    }
  });
});

describe("explicit conflict recovery", () => {
  it("retains both exact versions and blocks ordinary overwrite, delete, or extraction paths", () => {
    let state = createInitialLabState({ mode: "conflict" });
    const originalConflict = structuredClone(state.conflict);
    const originalNote = state.notes.find(
      ({ id }) => id === LAB_CONFLICT_NOTE_ID,
    );

    state = dispatch(
      state,
      { type: "set-detail-draft", value: "A silent third version" },
      {
        type: "save-edit",
        noteId: LAB_CONFLICT_NOTE_ID,
        updatedAt: LAB_NOW + 9_000,
      },
      { type: "delete-note", noteId: LAB_CONFLICT_NOTE_ID },
      { type: "set-selected-text", value: "Send this unresolved wording" },
      { type: "prepare-extract" },
    );

    assert.deepEqual(state.conflict, originalConflict);
    assert.equal(state.detailDraft, LAB_CONFLICT_LOCAL_BODY);
    assert.deepEqual(
      state.notes.find(({ id }) => id === LAB_CONFLICT_NOTE_ID),
      originalNote,
    );
    assert.equal(state.extraction.noteId, null);
    assert.match(state.announcement, /Resolve the conflict/);
  });

  for (const [resolution, expectedBody, expectedIds] of [
    ["keep-local", LAB_CONFLICT_LOCAL_BODY, [LAB_CONFLICT_NOTE_ID]],
    ["use-remote", LAB_CONFLICT_REMOTE_BODY, [LAB_CONFLICT_NOTE_ID]],
    [
      "keep-both",
      LAB_CONFLICT_LOCAL_BODY,
      [LAB_CONFLICT_NOTE_ID, LAB_CONFLICT_REMOTE_NOTE_ID],
    ],
  ] as const) {
    it(`${resolution} is explicit, deterministic, and keeps an exact provenance receipt`, () => {
      const before = createInitialLabState({ mode: "conflict" });
      const retainedPair = structuredClone(before.conflict)!;
      const resolvedAt = LAB_NOW + 9_000;
      const state = labReducer(before, {
        type: "resolve-conflict",
        resolution,
        resolvedAt,
      });

      assert.equal(state.mode, "saved");
      assert.equal(state.conflict, null);
      assert.equal(state.openNoteId, LAB_CONFLICT_NOTE_ID);
      assert.equal(state.detailDraft, expectedBody);
      assert.equal(
        state.notes.find(({ id }) => id === LAB_CONFLICT_NOTE_ID)?.body,
        expectedBody,
      );
      assert.deepEqual(state.lastConflictResolution, {
        ...retainedPair,
        resolution,
        resolvedAt,
        resultingNoteIds: [...expectedIds],
      });
      assert.equal(
        state.lastConflictResolution?.local.body,
        LAB_CONFLICT_LOCAL_BODY,
      );
      assert.equal(
        state.lastConflictResolution?.remote.body,
        LAB_CONFLICT_REMOTE_BODY,
      );
      assert.match(state.announcement, /^Conflict resolved safely\./);

      if (resolution === "keep-both") {
        assert.equal(
          state.notes.find(({ id }) => id === LAB_CONFLICT_REMOTE_NOTE_ID)?.body,
          LAB_CONFLICT_REMOTE_BODY,
        );
        assert.ok(
          datasetNotes(state).some(
            ({ id }) => id === LAB_CONFLICT_REMOTE_NOTE_ID,
          ),
        );
      } else {
        assert.equal(
          state.notes.some(({ id }) => id === LAB_CONFLICT_REMOTE_NOTE_ID),
          false,
        );
      }

      const repeated = labReducer(state, {
        type: "resolve-conflict",
        resolution,
        resolvedAt: resolvedAt + 1,
      });
      assert.strictEqual(repeated, state);
    });
  }
});

describe("search model", () => {
  it("is case- and accent-insensitive while preserving non-Latin search", () => {
    const fixtures = datasetNotes(createInitialLabState({ dataset: "dense" }));
    const result = searchLabNotes(fixtures, "CAFE manana JOAO 日本語");

    assert.deepEqual(result.map(({ id }) => id), ["lab_unicode"]);
  });

  it("requires every term and ranks title, approved extract, then body matches", () => {
    const fixtures = [
      note("lab_rank_body", "Meeting note\n\nTuesday delivery is confirmed.", null, 3),
      note(
        "lab_rank_extract",
        "Private logistics note",
        "Tuesday delivery is confirmed.",
        2,
      ),
      note("lab_rank_title", "Tuesday delivery plan\n\nConfirmed.", null, 1),
      note("lab_rank_partial", "Tuesday only", null, 4),
    ];

    assert.deepEqual(
      searchLabNotes(fixtures, "Tuesday delivery").map(({ id }) => id),
      ["lab_rank_title", "lab_rank_extract", "lab_rank_body"],
    );
  });

  it("finds dedicated title, body, and approved-extract fixtures", () => {
    const fixtures = datasetNotes(createInitialLabState({ dataset: "dense" }));
    const results = searchLabNotes(fixtures, "delivery");
    const ids = new Set(results.map(({ id }) => id));

    assert.ok(ids.has("lab_search_title"));
    assert.ok(ids.has("lab_search_body"));
    assert.ok(searchLabNotes(fixtures, "Doyle Hire").some(({ id }) => id === "lab_search_extract"));
  });

  it("presents a title match with offsets into the unchanged display title", () => {
    const presentation = searchPresentation(
      note("lab_title_presentation", "Delivery plan\n\nCall the venue."),
      "delivery",
    );

    assert.equal(presentation.title, "Delivery plan");
    assert.deepEqual(presentation.titleHighlights, [{ start: 0, end: 8 }]);
    assert.equal(
      presentation.title.slice(
        presentation.titleHighlights[0]!.start,
        presentation.titleHighlights[0]!.end,
      ),
      "Delivery",
    );
    assert.equal(presentation.snippetSource, "body");
  });

  it("centres a body-only match in a visible body snippet", () => {
    const presentation = searchPresentation(
      note(
        "lab_body_presentation",
        "Planning note\n\nCall the supplier about the revised loading window.",
      ),
      "supplier",
    );

    assert.equal(presentation.titleHighlights.length, 0);
    assert.equal(presentation.snippetSource, "body");
    assert.match(presentation.snippet, /supplier/);
    assert.deepEqual(
      presentation.snippetHighlights.map(({ start, end }) =>
        presentation.snippet.slice(start, end),
      ),
      ["supplier"],
    );
  });

  it("returns every occurrence of every query term in display order", () => {
    const value = "Supplier delivery moved; supplier confirmed.";
    const firstSupplier = value.indexOf("Supplier");
    const delivery = value.indexOf("delivery");
    const secondSupplier = value.lastIndexOf("supplier");

    assert.deepEqual(searchHighlightRanges(value, "supplier delivery"), [
      { start: firstSupplier, end: firstSupplier + "Supplier".length },
      { start: delivery, end: delivery + "delivery".length },
      { start: secondSupplier, end: secondSupplier + "supplier".length },
    ]);
  });

  it("maps accent-insensitive matches back to the original accented text", () => {
    const value = "Café handover with João";
    const ranges = searchHighlightRanges(value, "CAFE joao");

    assert.deepEqual(ranges, [
      { start: value.indexOf("Café"), end: value.indexOf("Café") + 4 },
      { start: value.indexOf("João"), end: value.indexOf("João") + 4 },
    ]);
    assert.deepEqual(
      ranges.map(({ start, end }) => value.slice(start, end)),
      ["Café", "João"],
    );
  });

  it("uses only approved wording for an approved-extract-only match snippet", () => {
    const rawPrivateBody =
      "Private family budget\n\nDo not surface the surrounding negotiation notes.";
    const approvedExtract =
      "Confirm Doyle Hire delivery before the Friday walkthrough.";
    const fixture = note(
      "lab_extract_presentation",
      rawPrivateBody,
      approvedExtract,
    );

    assert.deepEqual(
      searchLabNotes([fixture], "doyle delivery").map(({ id }) => id),
      [fixture.id],
    );
    const presentation = searchPresentation(fixture, "doyle delivery");
    assert.equal(presentation.snippetSource, "approved-extract");
    assert.match(presentation.snippet, /Doyle Hire delivery/);
    assert.equal(presentation.snippet.includes("Private family budget"), false);
    assert.equal(presentation.snippet.includes("negotiation notes"), false);
    assert.deepEqual(
      presentation.snippetHighlights.map(({ start, end }) =>
        presentation.snippet.slice(start, end).toLocaleLowerCase("en-GB"),
      ),
      ["doyle", "delivery"],
    );
  });

  it("resets and wraps keyboard result navigation without duplicating state", () => {
    let state = createInitialLabState({ scenario: "search" });
    const resultIds = visibleLabNotes(state).slice(0, 3).map(({ id }) => id);
    assert.equal(resultIds.length, 3);

    state = labReducer(state, {
      type: "move-search",
      direction: -1,
      resultIds,
    });
    assert.equal(state.searchCursor, 2);
    assert.equal(state.openNoteId, resultIds[2]);

    state = labReducer(state, {
      type: "move-search",
      direction: 1,
      resultIds,
    });
    assert.equal(state.searchCursor, 0);
    assert.equal(state.openNoteId, resultIds[0]);

    state = dispatch(
      state,
      { type: "set-query", value: "supplier" },
    );
    assert.equal(state.searchCursor, 0);
  });
});

describe("capture, edit, delete, and recovery transitions", () => {
  it("retains exact writing through a failed save and retries the same note id", () => {
    const body = "Private field note\n\nDo not lose this exact sentence.";
    const captured = note("lab_capture_001", body, null, LAB_NOW + 1_000);
    captured.syncState = "pending";

    let state = createInitialLabState({ dataset: "sparse", mode: "error" });
    state = dispatch(
      state,
      { type: "set-draft", value: body },
      { type: "capture-start", note: captured },
    );
    assert.equal(state.draft, "");
    assert.equal(state.nextSequence, 2);
    assert.equal(state.notes[0]?.id, captured.id);

    const countAfterCapture = state.notes.length;
    state = labReducer(state, {
      type: "sync-failure",
      noteId: captured.id,
      message: "Could not sync. Your exact writing is still here.",
    });
    assert.equal(state.notes.length, countAfterCapture);
    assert.equal(state.notes[0]?.body, body);
    assert.equal(state.notes[0]?.syncState, "failed");

    state = labReducer(state, { type: "retry-sync", noteId: captured.id });
    assert.equal(state.notes.length, countAfterCapture);
    assert.equal(state.notes.filter(({ id }) => id === captured.id).length, 1);
    assert.equal(state.notes[0]?.body, body);
    assert.equal(state.notes[0]?.syncState, "pending");

    state = labReducer(state, { type: "sync-success", noteId: captured.id });
    assert.equal(state.notes.length, countAfterCapture);
    assert.equal(state.notes[0]?.body, body);
    assert.equal(state.notes[0]?.syncState, "synced");
    assert.equal(datasetNotes(state)[0]?.id, captured.id);
  });

  it("syncs every pending or failed note in place after reconnecting", () => {
    const before = createInitialLabState({ dataset: "dense", mode: "offline" });
    const affected = before.notes
      .filter(({ syncState }) => syncState !== "synced")
      .map(({ id, body }) => ({ id, body }));
    assert.ok(affected.length >= 2);

    const after = labReducer(before, { type: "sync-all" });
    assert.ok(after.notes.every(({ syncState }) => syncState === "synced"));
    for (const fixture of affected) {
      assert.equal(
        after.notes.find(({ id }) => id === fixture.id)?.body,
        fixture.body,
      );
    }
  });

  it("preserves created time while editing and protects unsaved detail changes", () => {
    let state = createInitialLabState({ scenario: "detail" });
    const original = getOpenNote(state)!;
    const changedBody = `${original.body}\n\nA private addendum.`;

    state = labReducer(state, { type: "set-detail-draft", value: changedBody });
    assert.equal(isDetailDirty(state), true);
    state = labReducer(state, { type: "request-discard", target: "detail" });
    assert.equal(state.discardPrompt, "detail");
    state = labReducer(state, { type: "cancel-discard" });
    assert.equal(state.detailDraft, changedBody);

    state = labReducer(state, {
      type: "save-edit",
      noteId: original.id,
      updatedAt: LAB_NOW + 5_000,
    });
    const edited = state.notes.find(({ id }) => id === original.id)!;
    assert.equal(edited.body, changedBody);
    assert.equal(edited.createdAt, original.createdAt);
    assert.equal(edited.updatedAt, LAB_NOW + 5_000);
    assert.equal(edited.syncState, "pending");
    assert.equal(isDetailDirty(state), false);
  });

  it("blocks every state-changing navigation path while detail edits are dirty", () => {
    const initial = createInitialLabState({ scenario: "detail" });
    const dirty = labReducer(initial, {
      type: "set-detail-draft",
      value: `${initial.detailDraft}\n\nUnsaved navigation guard.`,
    });
    const other = dirty.notes.find(({ id }) => id !== dirty.openNoteId)!.id;
    const actions: LabAction[] = [
      { type: "open-note", noteId: other },
      { type: "move-search", direction: 1, resultIds: [other] },
      { type: "set-scenario", scenario: "search" },
      { type: "set-dataset", dataset: "dense" },
      { type: "set-mode", mode: "offline" },
    ];

    for (const action of actions) {
      const after = labReducer(dirty, action);
      assert.equal(after.openNoteId, dirty.openNoteId);
      assert.equal(after.detailDraft, dirty.detailDraft);
      assert.equal(after.discardPrompt, "detail");
      assert.match(after.announcement, /Keep or discard|Save or discard/);
    }
  });

  it("protects unsent approved wording across every detail navigation path", () => {
    const initial = createInitialLabState({ scenario: "detail" });
    assert.equal(isDetailDirty(initial), false);
    assert.equal(hasPendingExtraction(initial), true);
    assert.equal(hasProtectedDetailWork(initial), true);

    const edited = labReducer(initial, {
      type: "set-approved-text",
      value: "Edited approved wording that must not vanish.",
    });
    const other = edited.notes.find(({ id }) => id !== edited.openNoteId)!.id;
    const actions: LabAction[] = [
      { type: "close-note" },
      { type: "open-note", noteId: other },
      { type: "move-search", direction: 1, resultIds: [other] },
      { type: "set-scenario", scenario: "search" },
      { type: "set-dataset", dataset: "dense" },
      { type: "set-mode", mode: "offline" },
    ];

    for (const action of actions) {
      const after = labReducer(edited, action);
      assert.equal(after.openNoteId, edited.openNoteId);
      assert.equal(after.extraction.approvedText, edited.extraction.approvedText);
      assert.equal(after.discardPrompt, "detail");
      assert.match(after.announcement, /approved wording/);
    }

    const kept = labReducer(
      labReducer(edited, { type: "close-note" }),
      { type: "cancel-discard" },
    );
    assert.equal(kept.extraction.approvedText, edited.extraction.approvedText);
    assert.equal(kept.discardPrompt, null);

    const discarded = labReducer(
      labReducer(edited, { type: "close-note" }),
      { type: "confirm-discard" },
    );
    assert.equal(discarded.extraction.noteId, null);
    assert.equal(discarded.extraction.approvedText, "");
    assert.equal(hasProtectedDetailWork(discarded), false);
    assert.match(discarded.announcement, /Nothing was sent/);
    assert.equal(labReducer(discarded, { type: "close-note" }).openNoteId, null);
  });

  it("only discards a capture after explicit confirmation", () => {
    let state = createInitialLabState();
    state = dispatch(
      state,
      { type: "set-draft", value: "Keep this draft" },
      { type: "request-discard", target: "capture" },
      { type: "cancel-discard" },
    );
    assert.equal(state.draft, "Keep this draft");

    state = dispatch(
      state,
      { type: "request-discard", target: "capture" },
      { type: "confirm-discard" },
    );
    assert.equal(state.draft, "");
  });

  it("restores a deleted note at its previous index with its exact contents", () => {
    let state = createInitialLabState({ scenario: "detail" });
    const index = state.notes.findIndex(({ id }) => id === DETAIL_NOTE_ID);
    const original = state.notes[index]!;

    state = labReducer(state, { type: "delete-note", noteId: DETAIL_NOTE_ID });
    assert.equal(state.notes.some(({ id }) => id === DETAIL_NOTE_ID), false);
    assert.equal(state.openNoteId, null);
    assert.equal(state.undo?.index, index);

    state = labReducer(state, { type: "undo-delete" });
    assert.deepEqual(state.notes[index], original);
    assert.equal(state.undo, null);
  });
});

describe("approved extraction boundary and idempotent promotion", () => {
  it("carries the exact browser selection into review without trimming it", () => {
    const selected = "  Keep this first line.\n\nKeep this second line.  ";
    let state = createInitialLabState({ scenario: "detail" });
    state = labReducer(state, { type: "set-selected-text", value: selected });
    state = labReducer(state, { type: "prepare-extract" });

    assert.equal(state.extraction.selectedText, selected);
    assert.equal(state.extraction.approvedText, selected);
  });

  it("preserves the exact reviewed wording, including deliberate whitespace", () => {
    const approved = "  Keep this first line.\n\nKeep this second line.  ";
    assert.equal(
      buildExtractionPayload(DETAIL_NOTE_ID, approved).body,
      approved,
    );
  });

  it("constructs the only allowed payload from selected wording, never the raw note", () => {
    let state = createInitialLabState({ scenario: "detail" });
    const rawBody = getOpenNote(state)!.body;
    assert.match(rawBody, new RegExp(PRIVATE_DETAIL_SENTINEL.replace(".", "\\.")));

    state = labReducer(state, { type: "prepare-extract" });
    const payload = buildExtractionPayload(
      state.extraction.noteId!,
      state.extraction.approvedText,
    );

    assert.deepEqual(Object.keys(payload).sort(), ["body", "noteId", "workspaceId"]);
    assert.deepEqual(payload, {
      noteId: DETAIL_NOTE_ID,
      body: APPROVED_DETAIL_TEXT,
      workspaceId: "lab_workspace_review",
    });
    assert.equal(JSON.stringify(payload).includes(PRIVATE_DETAIL_SENTINEL), false);
    assert.equal(JSON.stringify(payload).includes("family conversation"), false);
    assert.equal(JSON.stringify(payload).includes(PRIVATE_EMAIL_SENTINEL), false);
    assert.notEqual(payload.body, rawBody);
  });

  it("excludes email headers and surrounding private context from an exact extract", () => {
    const safeText = "Confirm the revised delivery time with the supplier.";
    let state = createInitialLabState({ dataset: "dense" });
    state = dispatch(
      state,
      { type: "open-note", noteId: "lab_email_context" },
      { type: "set-selected-text", value: safeText },
      { type: "prepare-extract" },
    );
    const payload = buildExtractionPayload(
      state.extraction.noteId!,
      state.extraction.approvedText,
    );

    assert.equal(payload.body, safeText);
    assert.equal(JSON.stringify(payload).includes(PRIVATE_EMAIL_SENTINEL), false);
    assert.equal(JSON.stringify(payload).includes("subject:"), false);
  });

  it("does nothing when no exact selection exists", () => {
    let state = createInitialLabState();
    state = labReducer(state, { type: "open-note", noteId: DETAIL_NOTE_ID });
    const before = state;
    state = labReducer(state, { type: "prepare-extract" });

    assert.strictEqual(state, before);
    assert.equal(state.extraction.noteId, null);
  });

  it("keeps failure visible, retains the approved wording, and never claims success", () => {
    let state = createInitialLabState({ scenario: "detail", mode: "error" });
    state = labReducer(state, { type: "prepare-extract" });
    const payload = buildExtractionPayload(
      state.extraction.noteId!,
      state.extraction.approvedText,
    );
    const acceptedReceipt = receiptForPayload(payload, true);

    state = dispatch(
      state,
      { type: "send-extract-start" },
      {
        type: "send-extract-failure",
        acceptedReceipt,
        message: "Tasks accepted the idempotency key, but the reply was lost.",
      },
    );

    assert.equal(state.extraction.state, "failed");
    assert.equal(state.extraction.receipt, null);
    assert.equal(state.extraction.approvedText, APPROVED_DETAIL_TEXT);
    assert.equal(state.extraction.attempts, 1);
    assert.deepEqual(state.taskLedger[DETAIL_NOTE_ID], acceptedReceipt);
    assert.equal(
      state.notes.find(({ id }) => id === DETAIL_NOTE_ID)?.promotedTaskId,
      null,
    );
    assert.doesNotMatch(state.announcement, /sent|created|success/i);
  });

  it("retries with one deterministic task id and leaves the private note in place", () => {
    let state = createInitialLabState({ scenario: "detail", mode: "error" });
    const originalIndex = state.notes.findIndex(({ id }) => id === DETAIL_NOTE_ID);
    const originalBody = state.notes[originalIndex]!.body;
    const originalCount = state.notes.length;

    state = labReducer(state, { type: "prepare-extract" });
    const payload = buildExtractionPayload(
      state.extraction.noteId!,
      state.extraction.approvedText,
    );
    const acceptedReceipt = receiptForPayload(payload, true);
    state = dispatch(
      state,
      { type: "send-extract-start" },
      {
        type: "send-extract-failure",
        acceptedReceipt,
        message: "Reply was lost. Retry safely.",
      },
      { type: "send-extract-start" },
    );

    const retryReceipt = receiptForPayload(payload, false);
    assert.equal(retryReceipt.taskId, acceptedReceipt.taskId);
    state = labReducer(state, {
      type: "send-extract-success",
      receipt: retryReceipt,
    });

    assert.equal(state.extraction.state, "sent");
    assert.equal(state.extraction.attempts, 2);
    assert.equal(state.extraction.receipt?.created, false);
    assert.equal(Object.keys(state.taskLedger).length, 1);
    assert.equal(state.taskLedger[DETAIL_NOTE_ID]?.taskId, acceptedReceipt.taskId);
    assert.equal(state.notes.length, originalCount);
    assert.equal(state.notes[originalIndex]?.id, DETAIL_NOTE_ID);
    assert.equal(state.notes[originalIndex]?.body, originalBody);
    assert.equal(
      state.notes[originalIndex]?.approvedExtract,
      APPROVED_DETAIL_TEXT,
    );
    assert.equal(
      state.notes[originalIndex]?.promotedTaskId,
      acceptedReceipt.taskId,
    );
    assert.equal(state.openNoteId, DETAIL_NOTE_ID);
  });

  it("freezes an accepted ambiguous payload across edits, cancel, and reopen", () => {
    let state = createInitialLabState({ scenario: "detail", mode: "error" });
    state = labReducer(state, { type: "prepare-extract" });
    const acceptedReceipt = receiptForPayload(
      buildExtractionPayload(DETAIL_NOTE_ID, APPROVED_DETAIL_TEXT),
      true,
    );
    state = dispatch(
      state,
      { type: "send-extract-start" },
      {
        type: "send-extract-failure",
        acceptedReceipt,
        message: "Reply was lost. Retry safely.",
      },
      { type: "set-approved-text", value: "A payload that was never accepted." },
    );
    assert.equal(state.extraction.approvedText, APPROVED_DETAIL_TEXT);

    state = dispatch(
      state,
      { type: "cancel-extract" },
      { type: "set-selected-text", value: "A different later selection." },
      { type: "prepare-extract" },
    );
    assert.equal(state.extraction.state, "failed");
    assert.equal(state.extraction.approvedText, APPROVED_DETAIL_TEXT);
    assert.equal(state.taskLedger[DETAIL_NOTE_ID]?.body, APPROVED_DETAIL_TEXT);
    assert.match(state.extraction.error ?? "", /earlier send was accepted/i);
  });

  it("cancels a reviewed extract without changing the note or task ledger", () => {
    let state = createInitialLabState({ scenario: "detail" });
    const originalNotes = state.notes;
    state = dispatch(
      state,
      { type: "prepare-extract" },
      { type: "set-approved-text", value: "A deliberately edited extract." },
      { type: "cancel-extract" },
    );

    assert.strictEqual(state.notes, originalNotes);
    assert.deepEqual(state.taskLedger, {});
    assert.equal(state.extraction.noteId, null);
    assert.equal(state.selectedText, APPROVED_DETAIL_TEXT);
    assert.match(state.announcement, /Nothing was sent\./);
  });
});
