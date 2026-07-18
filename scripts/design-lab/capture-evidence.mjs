import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const EVIDENCE = join(ROOT, "docs", "notes-redesign", "evidence");
const SCREENSHOTS = join(EVIDENCE, "screenshots");
const VIDEOS = join(EVIDENCE, "videos");
const TRACES = join(EVIDENCE, "traces");
const baseUrl = process.env.DESIGN_LAB_BASE_URL ?? "http://127.0.0.1:4340";

const options = ["a", "b", "c"];
const scenarios = ["capture", "stream", "search", "detail"];
const viewports = {
  mobile: { width: 390, height: 844 },
  desktop: { width: 1440, height: 1000 },
};

await Promise.all(
  [SCREENSHOTS, VIDEOS, TRACES].map((directory) =>
    mkdir(directory, { recursive: true }),
  ),
);

const browser = await chromium.launch();
const manifest = [];

for (const [viewportName, viewport] of Object.entries(viewports)) {
  const context = await browser.newContext({ viewport, reducedMotion: "reduce" });
  for (const option of options) {
    for (const scenario of scenarios) {
      const page = await context.newPage();
      const url = `${baseUrl}/__design-lab/notes?option=${option}&scenario=${scenario}&dataset=${
        scenario === "stream" ? "dense" : scenario === "detail" ? "edge" : "normal"
      }&mode=default&viewport=auto`;
      const errors = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(url, { waitUntil: "networkidle" });
      await page.locator('[data-lab-hydrated="true"]').waitFor();
      const readyCapture = page.locator("[data-capture-ready=true]");
      await readyCapture.waitFor({ state: "attached" });
      if (scenario === "capture") await readyCapture.waitFor({ state: "visible" });

      const focusTarget =
        scenario === "detail"
          ? page.locator("[data-extraction-state]")
          : scenario === "stream"
            ? page.getByRole("heading", {
                name: /Recent notes|By date|Latest captures/,
              })
            : page.locator("#design-lab-canvas");
      await focusTarget.first().evaluate((element) =>
        element.scrollIntoView({ block: "start", inline: "nearest" }),
      );
      await page.waitForTimeout(100);

      const filename = `${option}-${scenario}-${viewportName}.png`;
      const path = join(SCREENSHOTS, filename);
      // The context already requests reduced motion. Playwright's additional
      // `animations: "disabled"` fast-forwards transitions and can capture
      // text midway through a compositor update, which corrupts the receipt.
      await page.screenshot({ path });
      if (errors.length) {
        throw new Error(`${option}/${scenario}/${viewportName} console errors:\n${errors.join("\n")}`);
      }
      manifest.push({
        option,
        scenario,
        viewport: viewportName,
        dimensions: viewport,
        url: url.replace(baseUrl, ""),
        file: relative(ROOT, path).replaceAll("\\", "/"),
      });
      await page.close();
    }
  }
  await context.close();
}

for (const option of options) {
  const context = await browser.newContext({
    viewport: viewports.desktop,
    reducedMotion: "no-preference",
    recordVideo: { dir: VIDEOS, size: { width: 1440, height: 1000 } },
  });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const page = await context.newPage();
  const url = `${baseUrl}/__design-lab/notes?option=${option}&scenario=capture&dataset=normal&mode=default&viewport=auto`;
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator('[data-lab-hydrated="true"]').waitFor();
  const capture = page.locator("[data-lab-capture]");
  await capture.fill(`Interaction proof for option ${option.toUpperCase()}`);
  await capture.press("Enter");
  if (option === "c") {
    await page.getByRole("button", { name: "Open search" }).click();
  }
  await page.getByRole("searchbox", { name: "Search notes" }).fill("delivery");
  await page.getByRole("button", { name: "Clear", exact: true }).click();
  await page.getByRole("button", { name: /Venue walkthrough with Niamh and Eoin/ }).click();
  const editor = page.getByRole("textbox", { name: "Note body" });
  const exact = "Confirm the portable ramp with Eoin by Friday.";
  await editor.evaluate((element, selected) => {
    const textarea = element;
    const start = textarea.value.indexOf(selected);
    textarea.focus();
    textarea.setSelectionRange(start, start + selected.length);
    textarea.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
  }, exact);
  await page.getByRole("button", { name: "Use selection" }).click();
  await page.getByRole("button", { name: "Send approved extract to Tasks" }).click();
  await page.getByText("Approved extract sent.").waitFor();

  const tracePath = join(TRACES, `${option}-interaction-proof.zip`);
  await context.tracing.stop({ path: tracePath });
  const video = page.video();
  await page.close();
  if (video) await video.saveAs(join(VIDEOS, `${option}-interaction-proof.webm`));
  await context.close();
}

await writeFile(
  join(EVIDENCE, "screenshot-manifest.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl, captures: manifest }, null, 2)}\n`,
  "utf8",
);

await browser.close();
console.log(`Captured ${manifest.length} screenshots, 3 videos, and 3 traces.`);
