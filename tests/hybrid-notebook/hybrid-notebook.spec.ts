import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

type HybridMode =
  | "default"
  | "save-error"
  | "conflict"
  | "tasks-error"
  | "tasks-lost-reply"
  | "offline"
  | "read-only";

const FIXTURE_NOTE = "Florist can do the arch but wants final stem count Monday.";

function appUrl(mode: HybridMode = "default", fixture = "populated") {
  const params = new URLSearchParams({ fixture });
  if (mode !== "default") params.set("hybridMode", mode);
  return `/app?${params.toString()}`;
}

async function openNotebook(
  page: Page,
  mode: HybridMode = "default",
  fixture = "populated",
) {
  const response = await page.goto(appUrl(mode, fixture));
  expect(response?.ok()).toBeTruthy();
  const notebook = page.locator('[data-hybrid-notebook="true"]');
  await expect(notebook).toBeVisible();
  await page.waitForFunction(() => {
    const capture = document.querySelector("[data-notes-hybrid-capture]");
    return Boolean(
      capture &&
        Object.keys(capture).some((key) => key.startsWith("__reactProps$")) &&
        typeof (window as typeof window & {
          __signalNotesClaimEarlyCapture?: unknown;
        }).__signalNotesClaimEarlyCapture === "undefined",
    );
  });
  await expect(notebook).toHaveAttribute("data-review-mode", mode);
  await expect(page.getByRole("heading", { level: 1, name: "Notes." })).toBeVisible();
  return notebook;
}

function watchReviewBoundary(page: Page) {
  const forbidden: string[] = [];
  const localOrigin = new URL(page.url()).origin;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (request.method() === "POST" && request.headers()["next-action"]) {
      forbidden.push(`POST ${request.url()}`);
      return;
    }
    if (
      url.origin !== localOrigin &&
      /(tasks\.signalstudio\.ie|turso|libsql|clerk)/i.test(request.url())
    ) {
      forbidden.push(`${request.method()} ${request.url()}`);
    }
  });
  return forbidden;
}

function noteRow(page: Page, text: string): Locator {
  return page.locator("[data-note-row]").filter({ hasText: text });
}

async function selectExactText(textarea: Locator, source: string) {
  await textarea.focus();
  await textarea.evaluate((element, exactSource) => {
    const field = element as HTMLTextAreaElement;
    const start = field.value.indexOf(exactSource);
    if (start < 0) throw new Error(`Selection source was not found: ${exactSource}`);
    field.setSelectionRange(start, start + exactSource.length);
    document.dispatchEvent(new Event("selectionchange", { bubbles: true }));
    field.dispatchEvent(new Event("select", { bubbles: true }));
    field.dispatchEvent(new KeyboardEvent("keyup", { key: "Shift", bubbles: true }));
  }, source);
}

async function expectNoPrivateBoundaryRequests(forbidden: string[]) {
  expect(
    forbidden,
    "Review-fixture interactions must not POST server actions or contact Tasks, Turso, LibSQL, or Clerk.",
  ).toEqual([]);
}

test("desktop capture, search, edit, exact approval, and source retention stay in the production component", async ({
  page,
}) => {
  await openNotebook(page);
  const forbidden = watchReviewBoundary(page);
  const capture = page.getByRole("textbox", { name: "Capture" });
  const sourceBody =
    "Saturday loading bay inspection. Confirm the ramp measurements with Eoin before Friday.";
  const sourceSelection = "Confirm the ramp measurements with Eoin before Friday.";
  const approvedWording = "Confirm ramp measurements with Eoin by Friday.";

  await expect(capture).toBeFocused();
  await capture.fill(sourceBody);
  await capture.press("Enter");
  await expect(capture).toHaveValue("");
  await expect(noteRow(page, "Saturday loading bay inspection")).toHaveCount(1);

  const search = page.getByRole("searchbox", { name: "Find" });
  await search.fill("ramp measurements");
  const result = noteRow(page, "Confirm the ramp measurements");
  await expect(result).toHaveCount(1);
  await expect(result).toContainText("ramp measurements");
  await result.click();

  const detail = page.getByRole("textbox", { name: "Private note body" });
  await expect(detail).toBeFocused();
  await expect(detail).toHaveValue(sourceBody);
  await detail.fill(`${sourceBody} Call the installer before noon.`);
  await page.getByRole("button", { name: "Save edit" }).click();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();

  await selectExactText(detail, sourceSelection);
  await expect(page.getByText(`${sourceSelection.length} selected characters.`)).toBeVisible();
  await page.getByRole("button", { name: "Use selection" }).click();
  const approval = page.getByRole("textbox", { name: "Approved Tasks wording" });
  await expect(approval).toBeFocused();
  await expect(approval).toHaveValue(sourceSelection);
  await approval.fill(approvedWording);
  await page.getByRole("button", { name: "Send approved extract to Tasks" }).click();

  await expect(page.getByText("Sent to Review workspace.")).toBeVisible();
  await expect(page.getByText(approvedWording, { exact: true })).toBeVisible();
  await expect(page.getByText(/The source note remains private and editable here/)).toBeVisible();
  await expect(detail).toHaveValue(`${sourceBody} Call the installer before noon.`);

  await search.fill("");
  await expect(noteRow(page, "Saturday loading bay inspection")).toHaveCount(1);
  await expectNoPrivateBoundaryRequests(forbidden);
});

test("a failed capture retries under the same row identity without duplicating text", async ({
  page,
}) => {
  await openNotebook(page, "save-error");
  const forbidden = watchReviewBoundary(page);
  const body = "Retry this exact capture under one stable identity.";
  const capture = page.getByRole("textbox", { name: "Capture" });

  await capture.fill(body);
  await capture.press("Enter");
  const row = noteRow(page, body);
  await expect(row).toHaveCount(1);
  const item = row.locator("xpath=..");
  await expect(item).toHaveAttribute("data-state", "failed");
  await item.evaluate((element) => {
    (window as typeof window & { __failedHybridRow?: Element }).__failedHybridRow = element;
  });

  await item.getByRole("button", { name: "Retry save" }).click();
  await expect(item).toHaveAttribute("data-state", "saved");
  await expect(noteRow(page, body)).toHaveCount(1);
  expect(
    await item.evaluate(
      (element) =>
        element ===
        (window as typeof window & { __failedHybridRow?: Element }).__failedHybridRow,
    ),
  ).toBe(true);
  await expectNoPrivateBoundaryRequests(forbidden);
});

test("conflict recovery preserves both exact versions when the user chooses keep both", async ({
  page,
}) => {
  await openNotebook(page, "conflict");
  const forbidden = watchReviewBoundary(page);
  const originalCount = await page.locator("[data-note-row]").count();
  await noteRow(page, FIXTURE_NOTE).click();
  const detail = page.getByRole("textbox", { name: "Private note body" });
  const localVersion = `${await detail.inputValue()}\n\nLocal review edit.`;
  await detail.fill(localVersion);
  await page.getByRole("button", { name: "Save edit" }).click();

  const conflict = page.locator('[data-state="conflict"]').filter({ hasText: "This note changed somewhere else." });
  await expect(conflict).toBeVisible();
  await expect(conflict.getByRole("heading", { name: "Your local version" })).toBeVisible();
  await expect(conflict.getByText("Local review edit.", { exact: false })).toBeVisible();
  await expect(conflict.getByRole("heading", { name: "Latest saved version" })).toBeVisible();
  await expect(conflict.getByText("Remote review edit.", { exact: false })).toBeVisible();

  await conflict.getByRole("button", { name: "Keep both as notes" }).click();
  await expect(page.locator('[data-hybrid-toast="true"]').getByText("Both exact versions are retained as separate notes.")).toBeVisible();
  await expect(page.locator("[data-note-row]")).toHaveCount(originalCount + 1);
  await expect(noteRow(page, "Local review edit.")).toHaveCount(1);
  await expect(detail).toHaveValue(/Remote review edit\./);
  await expectNoPrivateBoundaryRequests(forbidden);
});

test("delete requires confirmation and undo restores the same note", async ({ page }) => {
  await openNotebook(page);
  const forbidden = watchReviewBoundary(page);
  const originalCount = await page.locator("[data-note-row]").count();
  await noteRow(page, FIXTURE_NOTE).click();
  await page.getByRole("button", { name: "Delete…" }).click();
  const confirmation = page.getByRole("region", { name: "Delete this private note?" });
  await expect(confirmation).toBeVisible();
  await expect(confirmation.getByRole("button", { name: "Delete note" })).toBeFocused();
  await confirmation.getByRole("button", { name: "Delete note" }).click();

  await expect(page.locator("[data-note-row]")).toHaveCount(originalCount - 1);
  await expect(noteRow(page, FIXTURE_NOTE)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Undo" })).toBeFocused();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.locator("[data-note-row]")).toHaveCount(originalCount);
  await expect(noteRow(page, FIXTURE_NOTE)).toHaveCount(1);
  await expect(page.locator('[data-hybrid-toast="true"]').getByText("Note restored.")).toBeVisible();
  await expectNoPrivateBoundaryRequests(forbidden);
});

test("a lost Tasks reply retries idempotently and retains the private source note", async ({
  page,
}) => {
  await openNotebook(page, "tasks-lost-reply");
  const forbidden = watchReviewBoundary(page);
  await noteRow(page, FIXTURE_NOTE).click();
  const detail = page.getByRole("textbox", { name: "Private note body" });
  const sourceSelection = "final stem count Monday";
  await selectExactText(detail, sourceSelection);
  await page.getByRole("button", { name: "Use selection" }).click();
  const approved = page.getByRole("textbox", { name: "Approved Tasks wording" });
  await approved.fill("Confirm final stem count on Monday.");

  await page.getByRole("button", { name: "Send approved extract to Tasks" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Tasks may have accepted this action" }),
  ).toContainText("the receipt was lost");
  const retry = page.getByRole("button", { name: "Retry approved send" });
  await expect(retry).toBeVisible();
  await retry.click();

  await expect(page.getByText("Sent to Review workspace.")).toBeVisible();
  await expect(page.locator('[data-hybrid-toast="true"]').getByText(/Existing Tasks receipt recovered. No duplicate was created./)).toBeVisible();
  await expect(page.getByText(/Receipt review_task_demo_n_02/)).toBeVisible();
  await expect(detail).toHaveValue(new RegExp(FIXTURE_NOTE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  await expect(noteRow(page, FIXTURE_NOTE)).toHaveCount(1);
  await expectNoPrivateBoundaryRequests(forbidden);
});

test("keyboard semantics save only on Enter, preserve Escape text, and expose deliberate navigation", async ({
  page,
}) => {
  await openNotebook(page);
  const capture = page.getByRole("textbox", { name: "Capture" });
  await capture.fill("First line");
  await capture.press("Shift+Enter");
  await expect(capture).toHaveValue("First line\n");
  await expect(noteRow(page, "First line")).toHaveCount(0);

  await capture.type("Second line");
  await capture.press("Escape");
  await expect(page.getByText("Discard this unsaved capture?")).toBeVisible();
  await expect(capture).toHaveValue("First line\nSecond line");
  await page.getByRole("button", { name: "Keep writing" }).click();
  await expect(capture).toHaveValue("First line\nSecond line");
  await capture.press("Enter");
  await expect(noteRow(page, "First line")).toHaveCount(1);

  await page.keyboard.press("Control+k");
  await expect(page.getByRole("searchbox", { name: "Find" })).toBeFocused();
  await page.keyboard.press("Escape");
  const rows = page.locator("[data-note-row]");
  await rows.first().focus();
  await page.keyboard.press("j");
  await expect(rows.nth(1)).toBeFocused();

  await noteRow(page, FIXTURE_NOTE).click();
  const detail = page.getByRole("textbox", { name: "Private note body" });
  await detail.fill(`${await detail.inputValue()} Unsaved keyboard edit.`);
  await detail.press("Escape");
  const navigation = page.getByRole("region", { name: "Save this edit before leaving?" });
  await expect(navigation).toBeVisible();
  await expect(detail).toContainText("Unsaved keyboard edit.");
  await navigation.getByRole("button", { name: "Stay here" }).click();
  await expect(detail).toBeVisible();
});

for (const width of [390, 320, 768] as const) {
  test(`mobile/tablet ${width}px uses a full-screen detail with a clean return to the stream`, async ({
    page,
  }) => {
    const height = width === 390 ? 844 : width === 768 ? 1024 : 800;
    await page.setViewportSize({ width, height });
    await openNotebook(page);
    await noteRow(page, FIXTURE_NOTE).click();
    const detailPane = page.locator("#hybrid-note-detail");
    await expect(detailPane).toBeVisible();
    await expect(detailPane).toHaveAttribute("data-open", "true");
    const geometry = await detailPane.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
        position: getComputedStyle(element).position,
      };
    });
    expect(geometry.position).toBe("fixed");
    expect(geometry.x).toBeCloseTo(0, 0);
    expect(geometry.y).toBeCloseTo(0, 0);
    expect(geometry.width).toBeCloseTo(width, 0);
    expect(geometry.height).toBeGreaterThanOrEqual(height);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBe(0);

    const back = page.getByRole("button", { name: "Back", exact: true });
    const box = await back.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    await back.click();
    await expect(detailPane).not.toBeVisible();
    await expect(noteRow(page, FIXTURE_NOTE)).toBeFocused();
  });
}

test("the production hybrid component passes automated WCAG checks in core and conflict states", async ({
  page,
}) => {
  await openNotebook(page);
  let results = await new AxeBuilder({ page })
    .include('[data-hybrid-notebook="true"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    results.violations,
    results.violations.map((violation) => violation.id).join(", "),
  ).toEqual([]);

  await openNotebook(page, "conflict");
  await noteRow(page, FIXTURE_NOTE).click();
  const detail = page.getByRole("textbox", { name: "Private note body" });
  await detail.fill(`${await detail.inputValue()} Local conflict audit.`);
  await page.getByRole("button", { name: "Save edit" }).click();
  await expect(page.getByText("This note changed somewhere else.")).toBeVisible();
  results = await new AxeBuilder({ page })
    .include('[data-hybrid-notebook="true"]')
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(
    results.violations,
    results.violations.map((violation) => violation.id).join(", "),
  ).toEqual([]);
});
