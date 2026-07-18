import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

type Option = "a" | "b" | "c";
type Scenario = "capture" | "stream" | "search" | "detail";
type Dataset = "sparse" | "normal" | "dense" | "edge";
type Mode =
  | "default"
  | "empty"
  | "loading"
  | "saving"
  | "saved"
  | "offline"
  | "error"
  | "conflict"
  | "read-only";

function labUrl({
  option = "a",
  scenario = "capture",
  dataset = "normal",
  mode = "default",
}: {
  option?: Option;
  scenario?: Scenario;
  dataset?: Dataset;
  mode?: Mode;
} = {}) {
  return `/__design-lab/notes?option=${option}&scenario=${scenario}&dataset=${dataset}&mode=${mode}&viewport=auto`;
}

async function openLab(page: Page, config = {}) {
  await page.goto(labUrl(config));
  await expect(page.locator("[data-capture-ready=true]")).toBeAttached();
  await expect(page.locator('[data-lab-hydrated="true"]')).toBeAttached();
}

async function settleFocus(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }),
  );
}

test("capture is present in initial HTML and receives first focus", async ({ page, request }) => {
  const response = await request.get(labUrl());
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  expect(html).toContain("data-lab-capture=\"true\"");
  expect(html).toContain("autofocus");
  expect(html.match(/id=\"signal-notes-lab-early-draft\"/g)).toHaveLength(1);

  await openLab(page);
  await expect(page.locator("[data-lab-capture]")).toBeFocused();
});

test("writing entered before hydration survives and saves once", async ({ page }) => {
  await page.addInitScript(() => {
    const counts = { add: [] as string[], remove: [] as string[] };
    (window as typeof window & { __earlyDraftListenerCounts: typeof counts }).__earlyDraftListenerCounts = counts;
    const originalAdd = Document.prototype.addEventListener;
    const originalRemove = Document.prototype.removeEventListener;
    Document.prototype.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions,
    ) {
      const name = typeof listener === "function" ? listener.name : "";
      if (this === document && ["remember", "queueSave"].includes(name)) counts.add.push(`${type}:${name}`);
      return originalAdd.call(this, type, listener, options);
    };
    Document.prototype.removeEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | EventListenerOptions,
    ) {
      const name = typeof listener === "function" ? listener.name : "";
      if (this === document && ["remember", "queueSave"].includes(name)) counts.remove.push(`${type}:${name}`);
      return originalRemove.call(this, type, listener, options);
    };
  });
  await page.route(/\/_next\/static\/chunks\/.*\.js/, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_200));
    await route.continue();
  });
  await page.goto(labUrl(), { waitUntil: "commit" });
  const capture = page.locator("[data-lab-capture]");
  await capture.waitFor({ state: "attached" });
  await expect(page.locator("#signal-notes-lab-early-draft")).toHaveCount(1);
  const bootstrap = await page.locator("#signal-notes-lab-early-draft").textContent();
  expect(bootstrap).toBeTruthy();
  await capture.fill("Typed before the client became interactive");
  await page.evaluate((source) => {
    const duplicate = document.createElement("script");
    duplicate.textContent = source;
    document.head.appendChild(duplicate);
    duplicate.remove();
  }, bootstrap!);
  await expect(page.locator('[data-lab-hydrated="false"]')).toBeAttached();
  await capture.press("Enter");
  await expect(capture).toHaveValue("Typed before the client became interactive");
  await expect(page.locator('[data-lab-hydrated="true"]')).toBeAttached({ timeout: 15_000 });
  await expect(page.locator('[data-note-id="lab_capture_001"]')).toContainText(
    "Typed before the client became interactive",
  );
  await expect(page.locator('[data-note-id="lab_capture_001"]')).toHaveCount(1);
  const bootstrapState = await page.evaluate(() => ({
    counts: (window as typeof window & {
      __earlyDraftListenerCounts: { add: string[]; remove: string[] };
    }).__earlyDraftListenerCounts,
    claimPresent: typeof (window as typeof window & {
      __signalNotesLabClaimEarlyDraft?: unknown;
    }).__signalNotesLabClaimEarlyDraft !== "undefined",
    installed: (window as typeof window & {
      __signalNotesLabEarlyDraftInstalled?: boolean;
    }).__signalNotesLabEarlyDraftInstalled,
  }));
  expect(bootstrapState.counts.add.sort()).toEqual(["input:remember", "keydown:queueSave"]);
  expect(bootstrapState.counts.remove.sort()).toEqual(["input:remember", "keydown:queueSave"]);
  expect(bootstrapState.claimPresent).toBe(false);
  expect(bootstrapState.installed).toBe(true);
});

test("one capture survives direction changes in the shared store", async ({ page }) => {
  await openLab(page);
  const capture = page.locator("[data-lab-capture]");
  await capture.fill("The same note follows every design direction");
  await capture.press("Enter");
  await expect(page.getByText("The same note follows every design direction").first()).toBeVisible();

  await page.getByRole("tab", { name: /B Quiet Editorial Stream/ }).click();
  await expect(page.getByText("The same note follows every design direction").first()).toBeVisible();
  await page.getByRole("tab", { name: /C Capture Field/ }).click();
  await expect(page.getByText("The same note follows every design direction").first()).toBeVisible();
  await expect(page.locator('[data-note-id="lab_capture_001"]')).toHaveCount(1);
});

test("direction tabs use roving focus and label the active panel", async ({ page }) => {
  await openLab(page);
  const optionA = page.getByRole("tab", { name: /A Instant Notebook/ });
  const optionB = page.getByRole("tab", { name: /B Quiet Editorial Stream/ });
  const optionC = page.getByRole("tab", { name: /C Capture Field/ });
  const panel = page.getByRole("tabpanel");

  await expect(optionA).toHaveAttribute("tabindex", "0");
  await expect(optionB).toHaveAttribute("tabindex", "-1");
  await expect(optionC).toHaveAttribute("tabindex", "-1");

  await optionA.focus();
  await optionA.press("ArrowRight");
  await settleFocus(page);
  await expect(optionB).toBeFocused();
  await expect(optionB).toHaveAttribute("aria-selected", "true");
  await expect(panel).toHaveAttribute("aria-labelledby", "design-option-tab-b");

  await optionB.press("End");
  await settleFocus(page);
  await expect(optionC).toBeFocused();
  await optionC.press("Home");
  await settleFocus(page);
  await expect(optionA).toBeFocused();
  await optionA.press("ArrowLeft");
  await settleFocus(page);
  await expect(optionC).toBeFocused();
  await expect(optionC).toHaveAttribute("tabindex", "0");
  await expect(optionA).toHaveAttribute("tabindex", "-1");
});

test("failed save retains exact writing and retries the same note", async ({ page }) => {
  await openLab(page, { mode: "error" });
  const body = "Failure must keep this exact private draft";
  await page.locator("[data-lab-capture]").fill(body);
  await page.locator("[data-lab-capture]").press("Enter");

  const row = page.locator('[data-note-id="lab_capture_001"]');
  await expect(row).toContainText(body);
  await expect(row).toHaveAttribute("data-sync-state", "failed");
  await expect(row).toContainText("Your exact writing is retained");
  await row.getByRole("button", { name: "Retry same note" }).click();
  await expect(row).toHaveAttribute("data-sync-state", "synced");
  await expect(page.locator('[data-note-id="lab_capture_001"]')).toHaveCount(1);
});

test("capture preserves exact deliberate whitespace in the private body", async ({ page }) => {
  await openLab(page);
  const exact = "  Leading space stays\n\nTrailing space stays  ";
  const capture = page.locator("[data-lab-capture]");
  await capture.fill(exact);
  await capture.press("Enter");
  await page.locator('[data-note-id="lab_capture_001"] [data-open-note]').click();
  await expect(page.getByRole("textbox", { name: "Note body" })).toHaveValue(exact);
});

test("Escape protects a dirty capture and restores focus", async ({ page }) => {
  await openLab(page);
  const capture = page.locator("[data-lab-capture]");
  await capture.fill("Unsaved writing is never silently erased");
  await capture.press("Escape");
  const dialog = page.getByRole("alertdialog", { name: "Protect unsaved writing" });
  await expect(dialog).toBeVisible();
  const descriptionId = await dialog.getAttribute("aria-describedby");
  expect(descriptionId).toBeTruthy();
  await expect(page.locator(`#${descriptionId}`)).toContainText("Escape never deletes writing silently");
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(capture).toHaveValue("Unsaved writing is never silently erased");
  await expect(capture).toBeFocused();

  await capture.press("Escape");
  await page.getByRole("button", { name: "Discard draft" }).click();
  await expect(capture).toHaveValue("");
  await expect(capture).toBeFocused();
});

test("search highlights, navigates, clears, and returns to recency", async ({ page }) => {
  await openLab(page, { scenario: "search", dataset: "dense" });
  const search = page.getByRole("searchbox", { name: "Search notes" });
  await expect(search).toHaveValue("delivery");
  await expect(page.locator("mark").first()).toBeVisible();
  const count = await page.locator("[data-note-id]").count();
  expect(count).toBeGreaterThan(1);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await expect(page.locator("[data-lab-detail]")).toBeVisible();
  await search.fill("no-match-8472");
  await expect(page.getByText("No private notes match this search.")).toBeVisible();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await expect(search).toHaveValue("");
  await expect(page.getByRole("heading", { name: /Recent notes|By date|Latest captures/ })).toBeVisible();
});

test("Option C cannot hide an active search filter", async ({ page }) => {
  await openLab(page, { option: "c", scenario: "search", dataset: "normal" });
  const search = page.getByRole("searchbox", { name: "Search notes" });
  await search.fill("delivery");
  expect(await page.locator("[data-note-id]").count()).toBeLessThan(24);

  await page.getByRole("button", { name: "Close search" }).click();
  await expect(search).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open search" })).toBeVisible();
  await expect(page.locator("[data-note-id]")).toHaveCount(24);
});

test("search result navigation never steals focus from its keyboard controls", async ({ page }) => {
  for (const option of ["a", "b", "c"] as Option[]) {
    await openLab(page, { option, scenario: "search" });
    const search = page.getByRole("searchbox", { name: "Search notes" });
    await search.focus();
    await search.press("ArrowDown");
    await settleFocus(page);
    await expect(search).toBeFocused();
    const detail = page.locator("[data-lab-detail]");
    await expect(detail).toBeVisible();
    const firstNoteId = await detail.getAttribute("data-lab-detail-note");
    await search.press("ArrowDown");
    await settleFocus(page);
    await expect(search).toBeFocused();
    await expect(detail).not.toHaveAttribute("data-lab-detail-note", firstNoteId ?? "");

    const next = page.getByRole("button", { name: "Next", exact: true });
    await next.focus();
    await next.press("Enter");
    await settleFocus(page);
    await expect(next).toBeFocused();
  }
});

test("dirty detail blocks row, search-result, and Option C shortcut navigation", async ({ page }) => {
  await openLab(page, { option: "a", scenario: "stream", dataset: "normal" });
  await page.getByRole("button", { name: /Venue walkthrough with Niamh and Eoin/ }).click();
  const detail = page.locator("[data-lab-detail]");
  const editor = page.getByRole("textbox", { name: "Note body" });
  const dirtyBody = `${await editor.inputValue()}\n\nUnsaved navigation guard.`;
  await editor.fill(dirtyBody);
  const openId = await detail.getAttribute("data-lab-detail-note");
  await page.getByRole("button", { name: /Supplier delivery moved to Tuesday/ }).click();
  await expect(detail).toHaveAttribute("data-lab-detail-note", openId ?? "");
  await expect(editor).toHaveValue(dirtyBody);
  await expect(page.getByRole("alertdialog", { name: "Protect unsaved writing" })).toBeVisible();
  await page.getByRole("button", { name: "Keep writing" }).click();

  await editor.press("Control+s");
  await page.getByRole("button", { name: /Supplier delivery moved to Tuesday/ }).click();
  await expect(detail).not.toHaveAttribute("data-lab-detail-note", openId ?? "");

  await openLab(page, { option: "a", scenario: "search", dataset: "normal" });
  const search = page.getByRole("searchbox", { name: "Search notes" });
  await page.getByRole("button", { name: "Next", exact: true }).click();
  const searchDetail = page.locator("[data-lab-detail]");
  const searchEditor = page.getByRole("textbox", { name: "Note body" });
  const searchId = await searchDetail.getAttribute("data-lab-detail-note");
  await searchEditor.fill(`${await searchEditor.inputValue()}\n\nKeep this search edit.`);
  await search.focus();
  await search.press("ArrowDown");
  await expect(searchDetail).toHaveAttribute("data-lab-detail-note", searchId ?? "");
  await expect(page.getByRole("alertdialog", { name: "Protect unsaved writing" })).toBeVisible();
  await page.getByRole("button", { name: "Keep writing" }).click();

  await openLab(page, { option: "c", scenario: "search", dataset: "normal" });
  await page.getByRole("button", { name: "Next", exact: true }).click();
  const cEditor = page.getByRole("textbox", { name: "Note body" });
  const cDirty = `${await cEditor.inputValue()}\n\nKeep the C draft.`;
  await cEditor.fill(cDirty);
  await cEditor.focus();
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("alertdialog", { name: "Protect unsaved writing" })).toBeVisible();
  await page.getByRole("button", { name: "Keep writing" }).click();
  await expect(cEditor).toBeFocused();
  await expect(cEditor).toHaveValue(cDirty);
});

test("unsent approved wording is protected across back, navigation, shortcuts, and review controls", async ({ page }) => {
  await openLab(page, { option: "a", scenario: "capture", dataset: "normal" });
  await page.getByRole("button", { name: /Venue walkthrough with Niamh and Eoin/ }).click();
  const editor = page.getByRole("textbox", { name: "Note body" });
  const exact = "Confirm the portable ramp with Eoin by Friday.";
  await editor.evaluate((element, selected) => {
    const textarea = element as HTMLTextAreaElement;
    const start = textarea.value.indexOf(selected as string);
    textarea.focus();
    textarea.setSelectionRange(start, start + (selected as string).length);
    textarea.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  }, exact);
  await page.getByRole("button", { name: "Use selection" }).click();
  const approved = page.getByRole("textbox", { name: "Approved wording" });
  const protectedWording = "Edited approved wording that must not vanish.";
  await approved.fill(protectedWording);

  const dialog = page.getByRole("alertdialog", { name: "Protect unsaved writing" });
  async function keepProtectedWork() {
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/approved wording/i);
    await expect(approved).toHaveValue(protectedWording);
    await page.getByRole("button", { name: "Keep writing" }).click();
    await expect(dialog).toHaveCount(0);
    await expect(approved).toHaveValue(protectedWording);
  }

  await page.getByRole("button", { name: "Back to stream" }).click();
  await keepProtectedWork();

  await page.getByRole("button", { name: /Supplier delivery moved to Tuesday/ }).click();
  await keepProtectedWork();

  await openLab(page, { option: "a", scenario: "search", dataset: "normal" });
  await page.getByRole("button", { name: /from: private.sender@example.test/ }).click();
  const privateExact = "Confirm the revised delivery time with the supplier.";
  await editor.evaluate((element, selected) => {
    const textarea = element as HTMLTextAreaElement;
    const start = textarea.value.indexOf(selected as string);
    textarea.focus();
    textarea.setSelectionRange(start, start + (selected as string).length);
    textarea.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  }, privateExact);
  await page.getByRole("button", { name: "Use selection" }).click();
  await approved.fill(protectedWording);
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await keepProtectedWork();

  await page.getByRole("tab", { name: /C Capture Field/ }).click();
  await page.keyboard.press("Control+k");
  await keepProtectedWork();

  await page.getByRole("button", { name: "Search", exact: true }).click();
  await keepProtectedWork();

  await page.getByLabel("Dataset").selectOption("dense");
  await keepProtectedWork();

  await page.getByLabel("Mode").selectOption("offline");
  await keepProtectedWork();

  await page.getByRole("button", { name: "Back to stream" }).click();
  await expect(dialog).toBeVisible();
  await page.getByRole("button", { name: "Discard unsent work" }).click();
  await expect(page.locator("[data-lab-detail]")).toHaveCount(0);
  await expect(page.getByText(/Nothing was sent/).last()).toBeAttached();
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.getByRole("button", { name: /Venue walkthrough with Niamh and Eoin/ }).click();
  await expect(page.locator("[data-extraction-state]")).toHaveCount(0);
});

test("edit, dirty close protection, delete, and durable undo are keyboard reachable", async ({ page }) => {
  await openLab(page);
  const opener = page.getByRole("button", { name: /Venue walkthrough with Niamh and Eoin/ });
  await opener.click();
  const detail = page.locator("[data-lab-detail]");
  await settleFocus(page);
  await expect(detail).toBeFocused();
  const editor = page.getByRole("textbox", { name: "Note body" });
  await editor.fill(`${await editor.inputValue()}\n\nAdded in the lab.`);
  await editor.press("Escape");
  await expect(page.getByRole("alertdialog", { name: "Protect unsaved writing" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(editor).toBeFocused();
  await editor.press("Control+s");
  const deleteNote = page.getByRole("button", { name: "Delete note" });
  await deleteNote.focus();
  await deleteNote.press("Enter");
  const confirmDelete = page.getByRole("button", { name: "Confirm delete" });
  await expect(confirmDelete).toBeFocused();
  await confirmDelete.press("Escape");
  await expect(deleteNote).toBeFocused();
  await deleteNote.press("Enter");
  await expect(confirmDelete).toBeFocused();
  await confirmDelete.press("Enter");
  const undo = page.getByRole("button", { name: "Undo delete" });
  await expect(undo).toBeFocused();
  await undo.press("Enter");
  await expect(opener).toBeVisible();
  await expect(opener).toBeFocused();
  await opener.press("Enter");
  await settleFocus(page);
  await expect(detail).toBeFocused();
  await editor.focus();
  await editor.press("Escape");
  await expect(opener).toBeFocused();
});

test("discarding dirty detail closes once and restores its originating row", async ({ page }) => {
  await openLab(page);
  const opener = page.getByRole("button", { name: /Venue walkthrough with Niamh and Eoin/ });
  await opener.click();
  const editor = page.getByRole("textbox", { name: "Note body" });
  const original = await editor.inputValue();
  await editor.fill(`${original}\n\nThis edit will be discarded.`);
  await editor.press("Escape");
  await page.getByRole("button", { name: "Discard changes" }).click();
  await expect(page.locator("[data-lab-detail]")).toHaveCount(0);
  await expect(opener).toBeFocused();
  await opener.press("Enter");
  await expect(page.getByRole("textbox", { name: "Note body" })).toHaveValue(original);
});

test("copy note writes the exact private body only after explicit activation", async ({ page }) => {
  await openLab(page);
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: new URL(page.url()).origin,
  });
  await page.getByRole("button", { name: /Venue walkthrough with Niamh and Eoin/ }).click();
  const exact = await page.getByRole("textbox", { name: "Note body" }).inputValue();
  await page.getByRole("button", { name: "Copy note" }).click();
  await expect(page.getByText("Note copied.", { exact: true })).toBeAttached();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  // Windows clipboard transport canonicalizes LF to CRLF; compare the payload
  // after transport-level newline normalization, without trimming user text.
  expect(copied.replace(/\r\n/g, "\n")).toBe(exact.replace(/\r\n/g, "\n"));

  const editor = page.getByRole("textbox", { name: "Note body" });
  await editor.fill("");
  await page.getByRole("button", { name: "Copy note" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("");
});

test("only an exact selected extract can be sent and the private note stays in place", async ({ page }) => {
  await openLab(page);
  await page.getByRole("button", { name: /from: private.sender@example.test/ }).click();
  const editor = page.getByRole("textbox", { name: "Note body" });
  const exact = "Confirm the revised delivery time with the supplier.";
  await editor.evaluate((element, selected) => {
    const textarea = element as HTMLTextAreaElement;
    const start = textarea.value.indexOf(selected as string);
    textarea.focus();
    textarea.setSelectionRange(start, start + (selected as string).length);
    textarea.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  }, exact);
  await page.getByRole("button", { name: "Use selection" }).click();
  const approved = page.getByRole("textbox", { name: "Approved wording" });
  await expect(approved).toHaveValue(exact);
  await expect(approved).toBeFocused();
  expect(await approved.inputValue()).not.toContain("private.sender@example.test");
  await page.getByRole("button", { name: "Send approved extract to Tasks" }).click();
  await expect(page.getByText("Approved extract sent.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close receipt" })).toBeFocused();
  await expect(page.locator('[data-note-id="lab_email_context"]')).toBeVisible();
});

test("approved wording is editable and cancellation is reversible before submission", async ({ page }) => {
  await openLab(page);
  await page.getByRole("button", { name: /Venue walkthrough with Niamh and Eoin/ }).click();
  const editor = page.getByRole("textbox", { name: "Note body" });
  const exact = "Confirm the portable ramp with Eoin by Friday.";
  await editor.evaluate((element, selected) => {
    const textarea = element as HTMLTextAreaElement;
    const start = textarea.value.indexOf(selected as string);
    textarea.focus();
    textarea.setSelectionRange(start, start + (selected as string).length);
    textarea.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  }, exact);
  await page.getByRole("button", { name: "Use selection" }).click();
  const approved = page.getByRole("textbox", { name: "Approved wording" });
  await approved.fill(`${exact}\nBring the access measurements.`);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator("[data-extraction-state]")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Use selection" })).toBeFocused();
  await expect(editor).toHaveValue(/family conversation about cost private/);
  await page.getByRole("button", { name: "Use selection" }).click();
  await expect(page.getByRole("textbox", { name: "Approved wording" })).toHaveValue(exact);
});

test("extraction Escape, read-only mode, and existing receipts expose stable focus states", async ({ page }) => {
  await openLab(page);
  await page.getByRole("button", { name: /Venue walkthrough with Niamh and Eoin/ }).click();
  const editor = page.getByRole("textbox", { name: "Note body" });
  await editor.evaluate((element) => {
    const textarea = element as HTMLTextAreaElement;
    textarea.focus();
    textarea.setSelectionRange(0, 8);
    textarea.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  });
  const useSelection = page.getByRole("button", { name: "Use selection" });
  await useSelection.click();
  const extraction = page.locator("[data-extraction-state]");
  await expect(useSelection).toHaveAttribute("aria-expanded", "true");
  await expect(useSelection).toHaveAttribute("aria-controls", await extraction.getAttribute("id") ?? "");
  await page.getByRole("textbox", { name: "Approved wording" }).focus();
  await page.keyboard.press("Escape");
  await expect(extraction).toHaveCount(0);
  await expect(useSelection).toBeFocused();

  await openLab(page, { scenario: "detail", mode: "read-only" });
  await expect(page.getByRole("button", { name: "Use selection" })).toBeDisabled();
  await expect(page.getByRole("textbox", { name: "Approved wording" })).toHaveAttribute("readonly", "");
  await expect(page.getByRole("button", { name: "Send approved extract to Tasks" })).toBeDisabled();
  await expect(page.getByText(/Read-only review\. The approved wording is visible/)).toBeVisible();

  await openLab(page);
  await page.getByRole("button", { name: /Bar stock before Saturday/ }).click();
  const viewReceipt = page.getByRole("button", { name: "View sent receipt" });
  await viewReceipt.click();
  await expect(page.getByRole("textbox", { name: "Approved wording" })).toHaveValue(
    "Order two extra cases before Friday afternoon.",
  );
  await expect(page.getByRole("textbox", { name: "Approved wording" })).toHaveAttribute("readonly", "");
  await expect(page.getByText("Approved extract already sent.")).toBeVisible();
  await expect(page.getByText(/lab_task_lab_already_sent/)).toBeVisible();
  const closeReceipt = page.getByRole("button", { name: "Close receipt" });
  await expect(closeReceipt).toBeFocused();
  await closeReceipt.press("Enter");
  await expect(viewReceipt).toBeFocused();
});

test("ambiguous Tasks reply retries idempotently without false success", async ({ page }) => {
  await openLab(page, { scenario: "detail", mode: "error" });
  await page.getByRole("button", { name: "Send approved extract to Tasks" }).click();
  await expect(page.locator('[data-extraction-message="failure"]').filter({ hasText: /reply was lost/i })).toBeVisible();
  await expect(page.getByText("Approved extract sent.")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "Approved wording" })).toHaveAttribute("readonly", "");
  const retry = page.getByRole("button", { name: "Retry safely" });
  await expect(retry).toBeFocused();
  await retry.press("Enter");
  await expect(page.getByText("Already accepted. No duplicate created.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Close receipt" })).toBeFocused();
  await expect(page.locator('[data-note-id="lab_venue_walkthrough"]')).toHaveCount(1);
});

test("a rejected Tasks request retains approved wording and retries without private context", async ({ page }) => {
  await openLab(page, { mode: "error" });
  await page.getByRole("button", { name: /from: private.sender@example.test/ }).click();
  const editor = page.getByRole("textbox", { name: "Note body" });
  const exact = "Confirm the revised delivery time with the supplier.";
  await editor.evaluate((element, selected) => {
    const textarea = element as HTMLTextAreaElement;
    const start = textarea.value.indexOf(selected as string);
    textarea.focus();
    textarea.setSelectionRange(start, start + (selected as string).length);
    textarea.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  }, exact);
  await page.getByRole("button", { name: "Use selection" }).click();
  const approved = page.getByRole("textbox", { name: "Approved wording" });
  await expect(approved).toHaveValue(exact);
  await page.getByRole("button", { name: "Send approved extract to Tasks" }).click();
  await expect(page.locator('[data-extraction-message="failure"]')).toContainText(
    "Tasks did not accept the approved wording",
  );
  await expect(approved).not.toHaveAttribute("readonly", "");
  expect(await approved.inputValue()).not.toContain("private.sender@example.test");
  await page.getByRole("button", { name: "Retry safely" }).click();
  await expect(page.getByText("Approved extract sent.")).toBeVisible();
  await expect(page.locator('[data-note-id="lab_email_context"]')).toHaveCount(1);
});

test("offline writing queues locally and reconnects in place", async ({ page }) => {
  await openLab(page, { mode: "offline" });
  await page.locator("[data-lab-capture]").fill("Captured while the connection was gone");
  await page.locator("[data-lab-capture]").press("Enter");
  const row = page.locator('[data-note-id="lab_capture_001"]');
  await expect(row).toHaveAttribute("data-sync-state", "pending");
  await page.getByLabel("Mode").selectOption("default");
  await expect(row).toHaveAttribute("data-sync-state", "synced");
  await expect(page.locator('[data-note-id="lab_capture_001"]')).toHaveCount(1);
});

test("empty, loading, saving, saved, offline, error, conflict, and read-only are explicit", async ({ page }) => {
  await openLab(page, { mode: "empty" });
  await expect(page.getByText("Your next note starts here.")).toBeVisible();
  await page.getByLabel("Mode").selectOption("loading");
  await expect(page.getByLabel("Loading private notes")).toBeVisible();
  await page.getByLabel("Mode").selectOption("saving");
  await expect(page.getByText("Saving locally")).toBeVisible();
  await page.getByLabel("Mode").selectOption("saved");
  await expect(page.getByText("Your exact writing is safely in the stream.", { exact: true })).toBeVisible();
  await expect(page.locator('[data-note-id="lab_mode_saved"]')).toBeVisible();
  await page.getByLabel("Mode").selectOption("offline");
  await expect(page.getByText("New writing stays queued here until reconnection.")).toBeVisible();
  await page.getByLabel("Mode").selectOption("error");
  await expect(page.getByText("Failure rehearsal")).toBeVisible();
  await page.getByLabel("Mode").selectOption("conflict");
  const conflict = page.locator('[data-lab-conflict="unresolved"]');
  await expect(conflict).toContainText("Portable ramp confirmed with Eoin for Friday.");
  await expect(conflict).toContainText("Portable ramp still needs final confirmation.");
  await expect(page.getByRole("textbox", { name: "Note body" })).toHaveAttribute("readonly", "");
  await page.getByRole("button", { name: "Keep both as notes" }).click();
  const resolvedConflict = page.locator('[data-lab-conflict="resolved"]');
  await expect(resolvedConflict).toBeVisible();
  await expect(resolvedConflict).toBeFocused();
  await expect(page.getByLabel("Mode")).toHaveValue("saved");
  await expect(page.locator('[data-note-id="lab_mode_conflict_remote"]')).toHaveCount(1);
  await page.getByLabel("Mode").selectOption("read-only");
  await expect(page.locator("[data-lab-capture]")).toHaveAttribute("readonly", "");
  await expect(page.getByRole("button", { name: "Save note" })).toBeDisabled();
});

test("new captures stay visible while fixture history is empty or loading", async ({ page }) => {
  for (const option of ["a", "b", "c"] as Option[]) {
    for (const mode of ["empty", "loading"] as const) {
      await openLab(page, { option, mode });
      const body = `${option.toUpperCase()} ${mode} capture remains visible`;
      await page.locator("[data-lab-capture]").fill(body);
      await page.locator("[data-lab-capture]").press("Enter");
      const row = page.locator('[data-note-id="lab_capture_001"]');
      await expect(row).toBeVisible();
      await expect(row).toContainText(body);
      if (mode === "loading") {
        await expect(page.getByLabel("Loading private notes")).toBeVisible();
      }
    }
  }
});

test("async save and Tasks receipts cannot cross mode or dataset resets", async ({ page }) => {
  await openLab(page);
  await page.locator("[data-lab-capture]").fill("Pause this acknowledgement offline");
  await page.locator("[data-lab-capture]").press("Enter");
  let row = page.locator('[data-note-id="lab_capture_001"]');
  await page.getByLabel("Mode").selectOption("offline");
  await page.waitForTimeout(300);
  await expect(row).toHaveAttribute("data-sync-state", "pending");
  await page.getByLabel("Mode").selectOption("default");
  await expect(row).toHaveAttribute("data-sync-state", "synced");

  await openLab(page, { mode: "error" });
  await page.locator("[data-lab-capture]").fill("Default wins before the error timer");
  await page.locator("[data-lab-capture]").press("Enter");
  row = page.locator('[data-note-id="lab_capture_001"]');
  await page.getByLabel("Mode").selectOption("default");
  await expect(row).toHaveAttribute("data-sync-state", "synced");

  await openLab(page, { mode: "saving" });
  await page.locator("[data-lab-capture]").fill("Saving resumes when the mode clears");
  await page.locator("[data-lab-capture]").press("Enter");
  row = page.locator('[data-note-id="lab_capture_001"]');
  await expect(row).toHaveAttribute("data-sync-state", "pending");
  await page.getByLabel("Mode").selectOption("default");
  await expect(row).toHaveAttribute("data-sync-state", "synced");

  await openLab(page, { scenario: "detail" });
  await page.getByRole("button", { name: "Send approved extract to Tasks" }).click();
  const dataset = page.getByLabel("Dataset");
  await dataset.selectOption("dense");
  await expect(dataset).toHaveValue("normal");
  await expect(page.getByText(/Wait for the approved extract result before changing dataset/).last()).toBeAttached();
  await expect(page.getByText("Approved extract sent.")).toBeVisible();
  await dataset.selectOption("dense");
  await expect(dataset).toHaveValue("dense");
  await expect(page.locator('[data-extraction-state="sent"]')).toHaveCount(0);
  await expect(page.getByText("Approved extract sent.")).toHaveCount(0);
});

test("lab interactions issue no fetch, XHR, beacon, or websocket requests", async ({ page }) => {
  await openLab(page);
  const forbidden: string[] = [];
  page.on("request", (request) => {
    if (["fetch", "xhr", "websocket", "eventsource"].includes(request.resourceType())) {
      forbidden.push(`${request.resourceType()}: ${request.url()}`);
    }
  });
  await page.locator("[data-lab-capture]").fill("Network-isolated capture");
  await page.locator("[data-lab-capture]").press("Enter");
  await page.getByRole("tab", { name: /B Quiet Editorial Stream/ }).click();
  await page.getByRole("searchbox", { name: "Search notes" }).fill("delivery");
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.getByRole("tab", { name: /C Capture Field/ }).click();
  await expect(page.getByText("Network-isolated capture").first()).toBeVisible();
  expect(forbidden).toEqual([]);
});

test("initial load contacts only the local review origin", async ({ page }) => {
  const contacted = new Set<string>();
  page.on("request", (request) => contacted.add(new URL(request.url()).origin));
  await openLab(page, { option: "c", scenario: "detail", dataset: "edge" });
  expect([...contacted]).toEqual([new URL(page.url()).origin]);
});

test("mobile capture is first, fully visible, and has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLab(page, { option: "a" });
  const capture = page.locator("[data-lab-capture]");
  await expect(capture).toBeInViewport();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
  const box = await page.getByRole("button", { name: "Save note" }).boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
});

test("every option renders all four deterministic scenarios", async ({ page }) => {
  const options: Option[] = ["a", "b", "c"];
  const scenarios: Scenario[] = ["capture", "stream", "search", "detail"];
  for (const option of options) {
    for (const scenario of scenarios) {
      await openLab(page, { option, scenario, dataset: "edge" });
      await expect(page.locator(`[data-option="${option}"]`)).toBeVisible();
      if (scenario === "search") {
        await expect(page.getByRole("searchbox", { name: "Search notes" })).toHaveValue("delivery");
      }
      if (scenario === "detail") {
        await expect(page.locator("[data-lab-detail]")).toBeVisible();
        await expect(page.getByRole("textbox", { name: "Approved wording" })).toHaveValue(
          "Confirm the portable ramp with Eoin by Friday.",
        );
      }
    }
  }
});

test("IME composition does not prematurely save a capture", async ({ page }) => {
  await openLab(page);
  const capture = page.locator("[data-lab-capture]");
  await capture.fill("日本語の入力途中");
  await capture.dispatchEvent("keydown", { key: "Enter", code: "Enter", isComposing: true });
  await expect(capture).toHaveValue("日本語の入力途中");
  await expect(page.locator('[data-note-id="lab_capture_001"]')).toHaveCount(0);
});

test("search announces only the settled query", async ({ page }) => {
  await openLab(page);
  await page.evaluate(() => {
    const live = document.querySelector('[aria-live="polite"]');
    (window as typeof window & { __labAnnouncements: string[] }).__labAnnouncements = [];
    if (!live) return;
    const observer = new MutationObserver(() => {
      (window as typeof window & { __labAnnouncements: string[] }).__labAnnouncements.push(
        live.textContent ?? "",
      );
    });
    observer.observe(live, { childList: true, characterData: true, subtree: true });
  });
  const search = page.getByRole("searchbox", { name: "Search notes" });
  await search.pressSequentially("delivery", { delay: 20 });
  await page.waitForTimeout(450);
  const announcements = await page.evaluate(
    () => (window as typeof window & { __labAnnouncements: string[] }).__labAnnouncements,
  );
  expect(announcements.filter((message) => message.includes("result"))).toHaveLength(1);
  expect(announcements.at(-1)).toContain("delivery");
});

test("forced colours retain a visible focus outline and 320px reflows", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
  await openLab(page, { option: "c", scenario: "detail", dataset: "edge" });
  const back = page.getByRole("button", { name: "Back to stream" });
  await page.keyboard.press("Tab");
  await back.focus();
  await expect(back).toBeFocused();
  const outline = await back.evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: style.outlineWidth };
  });
  expect(outline.style).not.toBe("none");
  expect(Number.parseFloat(outline.width)).toBeGreaterThanOrEqual(2);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});

test("Option C keeps conflict recovery and a level-one detail heading at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await openLab(page, { option: "c", scenario: "detail", dataset: "edge", mode: "conflict" });
  await expect(page.getByRole("heading", { level: 1, name: "Private note detail" })).toBeAttached();
  const conflict = page.locator('[data-lab-conflict="unresolved"]');
  await expect(conflict).toBeVisible();
  const resolution = page.getByRole("button", { name: "Use other device" });
  await expect(resolution).toBeVisible();
  await resolution.click();
  await expect(page.locator('[data-lab-conflict="resolved"]')).toBeFocused();
});

test("late dense-stream detail focus and return always remain in the viewport", async ({ page }) => {
  for (const option of ["a", "b", "c"] as Option[]) {
    await openLab(page, { option, scenario: "stream", dataset: "dense" });
    const opener = page.locator("[data-note-id] [data-open-note]").last();
    await opener.scrollIntoViewIfNeeded();
    await opener.click();
    const detail = page.locator("[data-lab-detail]");
    await settleFocus(page);
    await expect(detail).toBeFocused();
    await expect(detail).toBeInViewport();
    await detail.press("Escape");
    await settleFocus(page);
    await expect(opener).toBeFocused();
    await expect(opener).toBeInViewport();
  }
});

test("text-spacing override does not clip controls or writing", async ({ page }) => {
  await openLab(page, { option: "b", scenario: "detail", dataset: "edge" });
  await page.addStyleTag({
    content: `* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`,
  });
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(page.getByRole("button", { name: "Save changes" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Approved wording" })).toBeVisible();
  const editorOverflow = await page.getByRole("textbox", { name: "Note body" }).evaluate((element) => ({
    clientHeight: element.clientHeight,
    scrollHeight: element.scrollHeight,
    overflowY: getComputedStyle(element).overflowY,
  }));
  expect(
    editorOverflow.scrollHeight <= editorOverflow.clientHeight + 1 ||
      ["auto", "scroll"].includes(editorOverflow.overflowY),
  ).toBeTruthy();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});

test("all direction and mode combinations pass automated WCAG 2.2 AA checks", async ({ page }) => {
  test.slow();
  const options: Option[] = ["a", "b", "c"];
  const modes: Mode[] = [
    "default",
    "empty",
    "loading",
    "saving",
    "saved",
    "offline",
    "error",
    "conflict",
    "read-only",
  ];
  for (const option of options) {
    for (const mode of modes) {
      await page.goto(labUrl({ option, mode, scenario: mode === "default" ? "detail" : "capture", dataset: "sparse" }));
      await expect(page.locator("[data-capture-ready=true]")).toBeVisible();
      const results = await new AxeBuilder({ page })
        .include("#design-lab-canvas")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations, `${option}/${mode}: ${results.violations.map((item) => item.id).join(", ")}`).toEqual([]);
    }
  }
});
