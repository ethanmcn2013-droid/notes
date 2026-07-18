import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUTPUT = join(ROOT, "docs", "notes-redesign", "evidence", "performance.json");
const baseUrl = process.env.DESIGN_LAB_BASE_URL ?? "http://127.0.0.1:4341";
const profile = {
  cpuSlowdownMultiplier: 4,
  latencyMs: 150,
  downloadBytesPerSecond: 200_000,
  uploadBytesPerSecond: 93_750,
};
const typingSample = "Calm capture stays local";

function rounded(value) {
  return Math.round(value * 10) / 10;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

function percentile(values, percentileRank) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.max(
    0,
    Math.min(sorted.length - 1, Math.ceil(sorted.length * percentileRank) - 1),
  );
  return sorted[index];
}

function summarize(values) {
  if (values.length === 0) {
    return { count: 0, medianMs: 0, p95Ms: 0, maxMs: 0 };
  }
  return {
    count: values.length,
    medianMs: rounded(median(values)),
    p95Ms: rounded(percentile(values, 0.95)),
    maxMs: rounded(Math.max(...values)),
  };
}

async function waitForDataset(page, dataset, expectedRows) {
  await page.getByLabel("Dataset").selectOption(dataset);
  await page.waitForFunction(
    (expected) => document.querySelectorAll("[data-note-id]").length === expected,
    expectedRows,
  );
}

async function measureTyping(capture, phrase) {
  const durations = await capture.evaluate(async (element, value) => {
    const nativeValueSetter = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      "value",
    )?.set;
    if (!nativeValueSetter) throw new Error("Native textarea value setter is unavailable");

    const afterNextPaint = () =>
      new Promise((resolve) => {
        requestAnimationFrame(() => window.setTimeout(resolve, 0));
      });
    const setValue = (nextValue, inputData) => {
      nativeValueSetter.call(element, nextValue);
      element.dispatchEvent(
        new InputEvent("input", {
          bubbles: true,
          data: inputData,
          inputType: inputData === null ? "deleteContentBackward" : "insertText",
        }),
      );
    };

    element.focus();
    setValue("", null);
    await afterNextPaint();

    const samples = [];
    for (const character of value) {
      const startedAt = performance.now();
      setValue(`${element.value}${character}`, character);
      await afterNextPaint();
      samples.push(performance.now() - startedAt);
    }

    setValue("", null);
    await afterNextPaint();
    return samples;
  }, phrase);

  return durations.map(rounded);
}

const browser = await chromium.launch();
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  browser: {
    engine: "Chromium",
    version: await browser.version(),
  },
  methodology:
    "Local production build, Chromium, 4x CPU slowdown, 150ms request latency, 1.6Mbps download, 750Kbps upload. Five cold, cache-disabled contexts per option. Chromium paint entries and long tasks cover rendering. Native SSR focus is captured from the first focusin event and reported separately from hydration. Typing is measured one synthetic character at a time from input dispatch through the next paint approximation (requestAnimationFrame plus a task) on both 6-note and 96-note streams. Local synthetic evidence, not field data.",
  profile: {
    ...profile,
    cacheDisabled: true,
    viewport: { width: 390, height: 844 },
    runsPerOption: 5,
  },
  typingSampleLength: [...typingSample].length,
  options: {},
};

for (const option of ["a", "b", "c"]) {
  const samples = [];
  for (let run = 0; run < 5; run += 1) {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__signalNotesLabNativeFocusReadyMs = null;
      window.__signalNotesLabLongTasks = [];
      const recordNativeFocus = (event) => {
        const target = event.target;
        if (!(target instanceof HTMLTextAreaElement)) return;
        if (!target.hasAttribute("data-lab-capture")) return;
        window.__signalNotesLabNativeFocusReadyMs = performance.now();
        document.removeEventListener("focusin", recordNativeFocus, true);
      };
      document.addEventListener("focusin", recordNativeFocus, true);
      try {
        new PerformanceObserver((list) => {
          window.__signalNotesLabLongTasks.push(
            ...list.getEntries().map((entry) => entry.duration),
          );
        }).observe({ type: "longtask", buffered: true });
      } catch {
        // Long-task observation is supplementary; the core timing run remains valid.
      }
    });
    const session = await context.newCDPSession(page);
    await session.send("Emulation.setCPUThrottlingRate", {
      rate: profile.cpuSlowdownMultiplier,
    });
    await session.send("Network.enable");
    await session.send("Network.setCacheDisabled", { cacheDisabled: true });
    await session.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: profile.latencyMs,
      downloadThroughput: profile.downloadBytesPerSecond,
      uploadThroughput: profile.uploadBytesPerSecond,
      connectionType: "cellular3g",
    });

    const url = `${baseUrl}/__design-lab/notes?option=${option}&scenario=capture&dataset=dense&mode=default&viewport=auto`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const capture = page.locator("[data-lab-capture]");
    await capture.waitFor();
    await page.waitForFunction(() => document.activeElement?.hasAttribute("data-lab-capture"));
    const nativeFocus = await page.evaluate(() => {
      const recorded = window.__signalNotesLabNativeFocusReadyMs;
      delete window.__signalNotesLabNativeFocusReadyMs;
      return {
        captured: Number.isFinite(recorded),
        value: Number.isFinite(recorded) ? recorded : performance.now(),
      };
    });
    await page.locator('[data-lab-hydrated="true"]').waitFor();
    const hydrationReadyMs = await page.evaluate(() => performance.now());
    const paint = await page.evaluate(() => {
      const entries = performance.getEntriesByType("paint");
      return Object.fromEntries(entries.map((entry) => [entry.name, entry.startTime]));
    });
    if (
      !Number.isFinite(paint["first-paint"]) ||
      !Number.isFinite(paint["first-contentful-paint"])
    ) {
      throw new Error("Chromium did not expose first-paint timing entries");
    }

    const denseTypingInputToPaintMs = await measureTyping(capture, typingSample);
    await waitForDataset(page, "sparse", 6);
    const sparseTypingInputToPaintMs = await measureTyping(capture, typingSample);
    await waitForDataset(page, "dense", 96);

    await capture.fill("Synthetic timing note");
    const saveStart = await page.evaluate(() => performance.now());
    await capture.press("Enter");
    await page.locator('[data-note-id="lab_capture_001"]').waitFor();
    const saveToStreamMs =
      (await page.evaluate(() => performance.now())) - saveStart;

    if (option === "c") {
      await page.getByRole("button", { name: "Open search" }).click();
    }
    const search = page.getByRole("searchbox", { name: "Search notes" });
    const searchStart = await page.evaluate(() => performance.now());
    await search.fill("delivery");
    await page.locator("mark").first().waitFor();
    const searchToResultMs =
      (await page.evaluate(() => performance.now())) - searchStart;
    const longTasksMs = await page.evaluate(() => {
      const tasks = window.__signalNotesLabLongTasks ?? [];
      delete window.__signalNotesLabLongTasks;
      return tasks;
    });

    samples.push({
      firstPaintMs: rounded(paint["first-paint"]),
      firstContentfulPaintMs: rounded(paint["first-contentful-paint"]),
      nativeFocusReadyMs: rounded(nativeFocus.value),
      nativeFocusCaptured: nativeFocus.captured,
      hydrationReadyMs: rounded(hydrationReadyMs),
      denseTypingInputToPaintMs,
      sparseTypingInputToPaintMs,
      saveToStreamMs: rounded(saveToStreamMs),
      searchToResultMs: rounded(searchToResultMs),
      longTasksMs: longTasksMs.map(rounded),
    });
    await context.close();
  }
  const denseTypingSamples = samples.flatMap(
    (sample) => sample.denseTypingInputToPaintMs,
  );
  const sparseTypingSamples = samples.flatMap(
    (sample) => sample.sparseTypingInputToPaintMs,
  );
  const longTaskSamples = samples.flatMap((sample) => sample.longTasksMs);
  report.options[option] = {
    samples,
    median: {
      firstPaintMs: rounded(
        median(samples.map((sample) => sample.firstPaintMs)),
      ),
      firstContentfulPaintMs: rounded(
        median(samples.map((sample) => sample.firstContentfulPaintMs)),
      ),
      nativeFocusReadyMs: rounded(
        median(samples.map((sample) => sample.nativeFocusReadyMs)),
      ),
      hydrationReadyMs: rounded(
        median(samples.map((sample) => sample.hydrationReadyMs)),
      ),
      saveToStreamMs: rounded(
        median(samples.map((sample) => sample.saveToStreamMs)),
      ),
      searchToResultMs: rounded(
        median(samples.map((sample) => sample.searchToResultMs)),
      ),
    },
    nativeFocusCaptureRate:
      samples.filter((sample) => sample.nativeFocusCaptured).length / samples.length,
    typingInputToPaint: {
      dense96: summarize(denseTypingSamples),
      sparse6: summarize(sparseTypingSamples),
    },
    longTasks: {
      ...summarize(longTaskSamples),
      totalMs: rounded(longTaskSamples.reduce((total, value) => total + value, 0)),
      medianCountPerRun: rounded(
        median(samples.map((sample) => sample.longTasksMs.length)),
      ),
    },
  };
}

await mkdir(dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, "utf8");
await browser.close();
console.log(JSON.stringify(report.options, null, 2));
