import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import {
  auditDesignLabBoundary,
  DEFAULT_LAB_ROOT,
  formatBoundaryReport,
} from "./privacy-boundary.mjs";

test("the complete design-lab source tree stays inside the privacy boundary", () => {
  const report = auditDesignLabBoundary();
  assert.deepEqual(report.violations, [], formatBoundaryReport(report));
  assert.ok(report.files.includes("lab-store.tsx"), "the client store must be audited");
  assert.ok(report.files.includes("lab-model.ts"), "the pure model must be audited");
  assert.ok(report.files.includes("lab-fixtures.ts"), "the fixture corpus must be audited");
  assert.ok(
    report.files.includes("early-draft-bootstrap.tsx"),
    "the parser-time draft handoff must be audited",
  );
});

test("the reviewed early-draft handoff is memory-only and one-shot", async () => {
  const bootstrapUrl = pathToFileURL(
    path.join(DEFAULT_LAB_ROOT, "early-draft-bootstrap.tsx"),
  );
  const { EARLY_DRAFT_BOOTSTRAP } = await import(
    `${bootstrapUrl.href}?privacy-boundary-bootstrap`
  );

  assert.match(EARLY_DRAFT_BOOTSTRAP, /document\.addEventListener\("input"/);
  assert.match(EARLY_DRAFT_BOOTSTRAP, /document\.removeEventListener\("input"/);
  assert.match(EARLY_DRAFT_BOOTSTRAP, /document\.addEventListener\("keydown"/);
  assert.match(EARLY_DRAFT_BOOTSTRAP, /pendingSave/);
  assert.match(EARLY_DRAFT_BOOTSTRAP, /__signalNotesLabEarlyDraftInstalled/);
  assert.match(EARLY_DRAFT_BOOTSTRAP, /delete window\.__signalNotesLabClaimEarlyDraft/);
  assert.doesNotMatch(
    EARLY_DRAFT_BOOTSTRAP,
    /fetch|XMLHttpRequest|WebSocket|sendBeacon|localStorage|sessionStorage|indexedDB|cookie|console/i,
  );
});

test("the scanner rejects boundary escapes and forbidden capabilities", (context) => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "notes-lab-boundary-"));
  context.after(() => fs.rmSync(temporaryRoot, { recursive: true, force: true }));
  fs.writeFileSync(
    path.join(temporaryRoot, "unsafe.tsx"),
    [
      'import { auth } from "@clerk/nextjs";',
      'import * as Sentry from "@sentry/nextjs";',
      'import { mutate } from "../../server/actions/notes";',
      'import { db } from "../../server/db";',
      'import { redirect } from "next/navigation";',
      'export async function unsafe() {',
      '  localStorage.setItem("note", "private");',
      '  navigator.sendBeacon("/api/analytics", "private");',
      '  void process.env.TURSO_DATABASE_URL;',
      '  return fetch("/api/notes", { method: "POST" });',
      '}',
    ].join("\n"),
    "utf8",
  );

  const report = auditDesignLabBoundary(temporaryRoot);
  const rules = new Set(report.violations.map((violation) => violation.rule));
  assert.ok(rules.has("external-module"));
  assert.ok(rules.has("forbidden-import"));
  assert.ok(rules.has("lab-boundary-escape") || rules.has("unresolved-import"));
  assert.ok(rules.has("forbidden-capability"));
  assert.ok(rules.has("framework-capability"));
  assert.ok(rules.has("network-endpoint"));
  assert.ok(rules.has("production-secret-capability"));
});

test("the executable lab model and store touch no network or persistence at import", async () => {
  const touches = [];
  const trapped = [
    "fetch",
    "XMLHttpRequest",
    "WebSocket",
    "EventSource",
    "localStorage",
    "sessionStorage",
    "indexedDB",
    "caches",
  ];
  const previous = new Map();

  for (const name of trapped) {
    previous.set(name, Object.getOwnPropertyDescriptor(globalThis, name));
    Object.defineProperty(globalThis, name, {
      configurable: true,
      get() {
        touches.push(name);
        throw new Error(`Forbidden runtime capability touched: ${name}`);
      },
    });
  }

  try {
    const modelUrl = pathToFileURL(path.join(DEFAULT_LAB_ROOT, "lab-model.ts"));
    const fixtureUrl = pathToFileURL(path.join(DEFAULT_LAB_ROOT, "lab-fixtures.ts"));
    const storeUrl = pathToFileURL(path.join(DEFAULT_LAB_ROOT, "lab-store.tsx"));
    const [model, fixtures, store] = await Promise.all([
      import(`${modelUrl.href}?privacy-boundary`),
      import(`${fixtureUrl.href}?privacy-boundary`),
      import(`${storeUrl.href}?privacy-boundary`),
    ]);

    assert.equal(fixtures.LAB_NOTES.length, 96);
    assert.equal(typeof store.NotesLabProvider, "function");
    const initial = model.createInitialLabState({ dataset: "dense" });
    assert.equal(model.visibleLabNotes(initial).length, 96);

    const payload = model.buildExtractionPayload(
      "lab_venue_walkthrough",
      "  Confirm the portable ramp with Eoin by Friday.  ",
    );
    assert.deepEqual(payload, {
      noteId: "lab_venue_walkthrough",
      body: "  Confirm the portable ramp with Eoin by Friday.  ",
      workspaceId: "lab_workspace_review",
    });
    assert.deepEqual(Object.keys(payload).sort(), ["body", "noteId", "workspaceId"]);

    const receipt = model.receiptForPayload(payload, true);
    assert.equal(receipt.noteId, payload.noteId);
    assert.equal(receipt.body, payload.body);
    assert.equal(receipt.workspaceId, payload.workspaceId);
    assert.deepEqual(touches, []);
  } finally {
    for (const name of trapped) {
      const descriptor = previous.get(name);
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  }
});
