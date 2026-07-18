import { expect, test, type Page } from "@playwright/test";

function labUrl(
  baseURL: string,
  scenario: "capture" | "search" | "detail",
  viewport: "auto" | "390",
  option: "a" | "b" | "c" = "c",
) {
  return new URL(
    `/__design-lab/notes?option=${option}&scenario=${scenario}&dataset=sparse&mode=default&viewport=${viewport}`,
    baseURL,
  ).toString();
}

async function openLab(page: Page, url: string) {
  await page.goto(url);
  await expect(page.locator('[data-lab-hydrated="true"]')).toBeAttached();
}

async function captureGeometry(page: Page) {
  return page.evaluate(() => {
    const capture = document.querySelector<HTMLTextAreaElement>("[data-lab-capture]")!;
    const captureSection = capture.closest<HTMLElement>("section")!;
    const captureBand = captureSection.parentElement!;
    const main = capture.closest<HTMLElement>("main")!;
    const rowOpen = document.querySelector<HTMLElement>("[data-open-note]")!;
    const rowMeta = rowOpen.querySelector("time")!.parentElement!;
    const canvas = document.querySelector<HTMLElement>("#design-lab-canvas")!;
    const mainStyle = getComputedStyle(main);
    const captureRect = capture.getBoundingClientRect();
    const mainRect = main.getBoundingClientRect();
    const mainContentWidth =
      mainRect.width -
      Number.parseFloat(mainStyle.paddingLeft) -
      Number.parseFloat(mainStyle.paddingRight);

    return {
      captureBandColumns: getComputedStyle(captureBand).gridTemplateColumns.split(/\s+/).length,
      captureFont: getComputedStyle(capture).fontSize,
      captureHeight: captureRect.height,
      captureWidthRatio: captureRect.width / mainContentWidth,
      rowColumns: getComputedStyle(rowOpen).gridTemplateColumns.split(/\s+/).length,
      rowHeight: rowOpen.getBoundingClientRect().height,
      rowMetaDirection: getComputedStyle(rowMeta).flexDirection,
      canvasOverflow: canvas.scrollWidth - canvas.clientWidth,
      documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
}

async function detailGeometry(page: Page) {
  return page.evaluate(() => {
    const detail = document.querySelector<HTMLElement>("[data-lab-detail]")!;
    const editor = document.querySelector<HTMLTextAreaElement>("[data-private-note-body]")!;
    const approved = document.querySelector<HTMLTextAreaElement>("[data-approved-extract]")!;
    const extraction = approved.closest<HTMLElement>("section")!;
    const privacyBoundary = extraction.firstElementChild as HTMLElement;
    const save = [...detail.querySelectorAll<HTMLButtonElement>("button")].find(
      (button) => button.textContent?.trim() === "Save changes",
    )!;
    const toolbar = save.parentElement!;
    const canvas = document.querySelector<HTMLElement>("#design-lab-canvas")!;
    const detailStyle = getComputedStyle(detail);

    return {
      detailPadding: Number.parseFloat(detailStyle.paddingLeft),
      detailBorderLeft: Number.parseFloat(detailStyle.borderLeftWidth),
      detailMinHeight: Number.parseFloat(detailStyle.minHeight),
      editorFont: getComputedStyle(editor).fontSize,
      approvedFont: getComputedStyle(approved).fontSize,
      privacyColumns: getComputedStyle(privacyBoundary).gridTemplateColumns.split(/\s+/).length,
      saveWidthRatio: save.getBoundingClientRect().width / toolbar.getBoundingClientRect().width,
      canvasOverflow: canvas.scrollWidth - canvas.clientWidth,
      viewportHeight: window.innerHeight,
    };
  });
}

async function resultTargetHeights(page: Page) {
  const previous = await page.getByRole("button", { name: "Previous" }).boundingBox();
  const next = await page.getByRole("button", { name: "Next", exact: true }).boundingBox();
  return { previous: previous!.height, next: next!.height };
}

test("phone review chrome keeps every capture visibly above the fold", async ({ page, baseURL }) => {
  if (!baseURL) throw new Error("The design-lab geometry test requires a base URL.");
  await page.setViewportSize({ width: 390, height: 844 });

  for (const option of ["a", "b", "c"] as const) {
    await openLab(page, labUrl(baseURL, "capture", "auto", option));
    const capture = await page.locator("[data-lab-capture]").boundingBox();
    expect(capture, `${option}: capture should render`).not.toBeNull();
    expect(capture!.y, `${option}: capture starts too low`).toBeLessThan(700);
    expect(capture!.y + capture!.height, `${option}: capture should be fully visible`).toBeLessThanOrEqual(844);
  }

  const controlGroups = [
    page.getByRole("tab"),
    page.getByRole("group", { name: "Review scenario" }).getByRole("button"),
    page.locator("header").getByRole("combobox"),
    page.getByRole("button", { name: "Reset fixture" }),
  ];
  for (const controls of controlGroups) {
    const heights = await controls.evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().height),
    );
    expect(heights.length).toBeGreaterThan(0);
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(44);
  }
});

test("the 390 review canvas matches real-phone core geometry", async ({ browser, baseURL }) => {
  if (!baseURL) throw new Error("The design-lab geometry test requires a base URL.");

  const phoneContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const reviewContext = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const phone = await phoneContext.newPage();
  const review = await reviewContext.newPage();

  try {
    await Promise.all([
      openLab(phone, labUrl(baseURL, "capture", "auto")),
      openLab(review, labUrl(baseURL, "capture", "390")),
    ]);
    const [phoneCapture, reviewCapture] = await Promise.all([
      captureGeometry(phone),
      captureGeometry(review),
    ]);

    expect(phoneCapture.captureBandColumns).toBe(1);
    expect(reviewCapture.captureBandColumns).toBe(1);
    expect(reviewCapture.captureFont).toBe(phoneCapture.captureFont);
    expect(reviewCapture.captureHeight).toBeCloseTo(phoneCapture.captureHeight, 0);
    expect(phoneCapture.captureWidthRatio).toBeGreaterThan(0.98);
    expect(reviewCapture.captureWidthRatio).toBeGreaterThan(0.98);
    expect(phoneCapture.rowColumns).toBe(1);
    expect(reviewCapture.rowColumns).toBe(1);
    expect(phoneCapture.rowMetaDirection).toBe("row");
    expect(reviewCapture.rowMetaDirection).toBe("row");
    expect(phoneCapture.rowHeight).toBeGreaterThanOrEqual(72);
    expect(reviewCapture.rowHeight).toBeGreaterThanOrEqual(72);
    expect(phoneCapture.canvasOverflow).toBe(0);
    expect(reviewCapture.canvasOverflow).toBe(0);
    expect(phoneCapture.documentOverflow).toBe(0);
    expect(reviewCapture.documentOverflow).toBe(0);

    await Promise.all([
      openLab(phone, labUrl(baseURL, "detail", "auto")),
      openLab(review, labUrl(baseURL, "detail", "390")),
    ]);
    const [phoneDetail, reviewDetail] = await Promise.all([
      detailGeometry(phone),
      detailGeometry(review),
    ]);

    expect(reviewDetail.detailPadding).toBe(phoneDetail.detailPadding);
    expect(reviewDetail.detailBorderLeft).toBe(phoneDetail.detailBorderLeft);
    expect(reviewDetail.editorFont).toBe(phoneDetail.editorFont);
    expect(reviewDetail.approvedFont).toBe(phoneDetail.approvedFont);
    expect(phoneDetail.privacyColumns).toBe(1);
    expect(reviewDetail.privacyColumns).toBe(1);
    expect(phoneDetail.saveWidthRatio).toBeGreaterThan(0.45);
    expect(reviewDetail.saveWidthRatio).toBeGreaterThan(0.45);
    expect(phoneDetail.detailMinHeight).toBeGreaterThanOrEqual(phoneDetail.viewportHeight);
    expect(reviewDetail.detailMinHeight).toBeGreaterThanOrEqual(reviewDetail.viewportHeight);
    expect(phoneDetail.canvasOverflow).toBe(0);
    expect(reviewDetail.canvasOverflow).toBe(0);

    await Promise.all([
      openLab(phone, labUrl(baseURL, "search", "auto")),
      openLab(review, labUrl(baseURL, "search", "390")),
    ]);
    const [phoneTargets, reviewTargets] = await Promise.all([
      resultTargetHeights(phone),
      resultTargetHeights(review),
    ]);
    expect(phoneTargets.previous).toBeGreaterThanOrEqual(44);
    expect(phoneTargets.next).toBeGreaterThanOrEqual(44);
    expect(reviewTargets.previous).toBeGreaterThanOrEqual(44);
    expect(reviewTargets.next).toBeGreaterThanOrEqual(44);
  } finally {
    await Promise.all([phoneContext.close(), reviewContext.close()]);
  }
});
