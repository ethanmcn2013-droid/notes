#!/usr/bin/env node
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";

const ROOT = process.cwd();
const EXPERIENCE = path.join(ROOT, "experience");
const OUTPUT = path.join(EXPERIENCE, "output");
const SCREENSHOTS = path.join(OUTPUT, "screenshots");

const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));
const registry = readJson(path.join(EXPERIENCE, "registry.json"));
const config = readJson(path.join(EXPERIENCE, "config.json"));
const plan = readJson(path.join(EXPERIENCE, "capture-plan.json"));
const registryById = new Map(registry.experiences.map((entry) => [entry.id, entry]));

const valueArg = (name) =>
  process.argv.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3);
const baseUrl = (
  valueArg("base-url") ??
  process.env.EXPERIENCE_BASE_URL ??
  "http://127.0.0.1:3000"
).replace(/\/$/, "");
const selectedExperiences = new Set(
  (valueArg("experience") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean),
);
const selectedBreakpoint = valueArg("breakpoint");
const launchChannel = process.env.PLAYWRIGHT_CHANNEL || undefined;

function fail(message) {
  console.error(`experience:capture: ${message}`);
  process.exit(1);
}

if (plan.schemaVersion !== "signal-experience-capture-plan/1") {
  fail("unsupported capture-plan schema");
}
if (!Array.isArray(plan.captures) || !plan.captures.length) {
  fail("capture-plan must contain at least one capture");
}
if (!Array.isArray(plan.breakpoints) || !plan.breakpoints.length) {
  fail("capture-plan must declare breakpoints");
}
for (const breakpoint of plan.breakpoints) {
  if (!config.breakpoints[breakpoint]) fail(`unknown breakpoint ${breakpoint}`);
}
if (selectedBreakpoint && !plan.breakpoints.includes(selectedBreakpoint)) {
  fail(`selected breakpoint ${selectedBreakpoint} is not in the capture plan`);
}

const captureKeys = new Set();
for (const item of plan.captures) {
  if (!registryById.has(item.experienceId)) fail(`unknown experience ${item.experienceId}`);
  if (!item.state || !item.path || !item.expectedContent) {
    fail(`${item.experienceId}: state, path, and expectedContent are required`);
  }
  const key = `${item.experienceId}:${item.state}`;
  if (captureKeys.has(key)) fail(`duplicate capture ${key}`);
  captureKeys.add(key);
}

function safeSegment(value) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

function fileHash(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function isExpectedStatus(item, status) {
  if (Array.isArray(item.expectedStatus)) return item.expectedStatus.includes(status);
  if (Number.isInteger(item.expectedStatus)) return status === item.expectedStatus;
  return status >= 200 && status < 400;
}

function unexpectedRuntimeErrors(errors, item) {
  if (item.expectedRuntimeErrors === true) return [];
  if (!item.expectedRuntimePattern) return errors;
  return errors.filter((error) => !error.includes(item.expectedRuntimePattern));
}

function absoluteUrl(relativePath) {
  return new URL(relativePath, `${baseUrl}/`).toString();
}

mkdirSync(SCREENSHOTS, { recursive: true });
const results = [];
const browser = await chromium.launch({
  headless: true,
  ...(launchChannel ? { channel: launchChannel } : {}),
});

try {
  for (const item of plan.captures) {
    if (selectedExperiences.size && !selectedExperiences.has(item.experienceId)) continue;
    for (const breakpoint of plan.breakpoints) {
      if (selectedBreakpoint && breakpoint !== selectedBreakpoint) continue;
      const viewport = config.breakpoints[breakpoint];
      const context = await browser.newContext({
        viewport,
        locale: plan.determinism.locale,
        timezoneId: plan.determinism.timezoneId,
        colorScheme: plan.determinism.colorScheme,
        reducedMotion: plan.determinism.reducedMotion,
        serviceWorkers: "block",
      });
      const fixedTime = Date.parse(plan.determinism.fixedTime);
      await context.addInitScript((time) => {
        const NativeDate = Date;
        class FixedDate extends NativeDate {
          constructor(...args) {
            super(...(args.length ? args : [time]));
          }
          static now() {
            return time;
          }
        }
        Object.defineProperty(globalThis, "Date", {
          configurable: true,
          value: FixedDate,
        });
      }, fixedTime);

      const page = await context.newPage();
      const consoleErrors = [];
      const pageErrors = [];
      const failedRequests = [];
      page.on("console", (message) => {
        if (message.type() === "error") consoleErrors.push(message.text());
      });
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("requestfailed", (request) => {
        if (new URL(request.url()).origin === new URL(baseUrl).origin) {
          failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText ?? "failed"}`);
        }
      });

      const url = absoluteUrl(item.path);
      let response = null;
      let navigationError = null;
      let contentMatched = false;
      let targetMatched = !item.targetSelector;
      let accessibility = { violations: 0, blocking: 0, ruleIds: [], details: [] };
      let runtime = {
        overflowPixels: null,
        focusTarget: null,
        focusVisible: null,
        skipMainFocused: null,
        keyboardPass: false,
      };

      try {
        response = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 45_000,
        });
        await page.addStyleTag({
          content:
            "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;caret-color:transparent!important}html{scroll-behavior:auto!important}",
        });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(plan.determinism.settleMilliseconds);
        if (item.targetSelector) {
          try {
            await page.locator(item.targetSelector).first().waitFor({ state: "attached", timeout: 5_000 });
            targetMatched = true;
          } catch {
            targetMatched = false;
          }
        }
        try {
          await page.waitForFunction(
            (expectedContent) => document.body.innerText.includes(expectedContent),
            item.expectedContent,
            { timeout: 5_000 },
          );
          contentMatched = true;
        } catch {
          contentMatched = false;
        }

        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        const blocking = axe.violations.filter((violation) =>
          ["serious", "critical"].includes(violation.impact ?? ""),
        );
        accessibility = {
          violations: axe.violations.length,
          blocking: blocking.length,
          ruleIds: axe.violations.map((violation) => violation.id),
          details: axe.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            help: violation.help,
            nodes: violation.nodes.slice(0, 8).map((node) => ({
              target: node.target,
              failureSummary: node.failureSummary,
            })),
          })),
        };

        const keyboardMode = item.keyboardMode ?? "focusable";
        if (keyboardMode === "none") {
          runtime.keyboardPass = true;
        } else {
          await page.evaluate(() => {
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
            document.body.tabIndex = -1;
            document.body.focus();
          });
          await page.keyboard.press("Tab");
          await page.evaluate(() => document.body.removeAttribute("tabindex"));
          const focus = await page.evaluate(() => {
            const active = document.activeElement;
            if (!(active instanceof HTMLElement)) {
              return { target: null, visible: false, focusVisible: false };
            }
            const rect = active.getBoundingClientRect();
            const style = getComputedStyle(active);
            return {
              target: `${active.tagName.toLowerCase()}${active.id ? `#${active.id}` : ""}${active.getAttribute("href") ? `[href=\"${active.getAttribute("href")}\"]` : ""}`,
              visible: rect.width > 0 && rect.height > 0 && style.visibility !== "hidden",
              focusVisible:
                active.matches(":focus-visible") &&
                style.outlineStyle !== "none" &&
                Number.parseFloat(style.outlineWidth) > 0,
            };
          });
          runtime.focusTarget = focus.target;
          runtime.focusVisible = focus.focusVisible;
          if (keyboardMode === "skip-main") {
            const skipFocused = focus.target?.includes('[href="#main-content"]') ?? false;
            if (skipFocused) await page.keyboard.press("Enter");
            runtime.skipMainFocused = await page.evaluate(
              () => document.activeElement?.id === "main-content",
            );
            runtime.keyboardPass =
              focus.visible && focus.focusVisible && skipFocused && runtime.skipMainFocused;
          } else {
            runtime.keyboardPass = focus.visible && focus.focusVisible;
          }
        }

        runtime.overflowPixels = await page.evaluate(() =>
          Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
        );
      } catch (error) {
        navigationError = error instanceof Error ? error.message : String(error);
      }

      const relativeScreenshot = path
        .join(
          "screenshots",
          safeSegment(item.experienceId),
          safeSegment(item.state),
          `${safeSegment(breakpoint)}.png`,
        )
        .split(path.sep)
        .join("/");
      const screenshot = path.join(OUTPUT, relativeScreenshot);
      if (!navigationError) {
        mkdirSync(path.dirname(screenshot), { recursive: true });
        await page.screenshot({ path: screenshot, animations: "disabled", fullPage: false });
      }

      const status = response?.status() ?? null;
      const unexpectedConsoleErrors = unexpectedRuntimeErrors(
        consoleErrors,
        item,
      );
      const unexpectedPageErrors = unexpectedRuntimeErrors(
        pageErrors,
        item,
      );
      const pass =
        !navigationError &&
        status !== null &&
        isExpectedStatus(item, status) &&
        contentMatched &&
        targetMatched &&
        accessibility.blocking === 0 &&
        runtime.overflowPixels === 0 &&
        runtime.keyboardPass &&
        unexpectedConsoleErrors.length === 0 &&
        unexpectedPageErrors.length === 0;

      results.push({
        experienceId: item.experienceId,
        product: registryById.get(item.experienceId).product,
        state: item.state,
        breakpoint,
        viewport,
        url,
        status,
        expectedStatus: item.expectedStatus ?? "2xx/3xx",
        expectedContent: item.expectedContent,
        contentMatched,
        targetSelector: item.targetSelector ?? null,
        targetMatched,
        navigationError,
        candidateScreenshot: navigationError ? null : relativeScreenshot,
        candidateHash: navigationError ? null : fileHash(screenshot),
        accessibility,
        runtime: {
          ...runtime,
          consoleErrors,
          pageErrors,
          unexpectedConsoleErrors,
          unexpectedPageErrors,
          failedRequests,
        },
        pass,
      });
      await context.close();
      process.stdout.write(
        `${item.experienceId}:${item.state}:${breakpoint} ${pass ? "pass" : "review"}\n`,
      );
    }
  }
} finally {
  await browser.close();
}

const summary = {
  captures: results.length,
  passing: results.filter((result) => result.pass).length,
  requiringReview: results.filter((result) => !result.pass).length,
  experiences: new Set(results.map((result) => result.experienceId)).size,
  stateVariants: new Set(results.map((result) => `${result.experienceId}:${result.state}`)).size,
  breakpointVariants: new Set(
    results.map((result) => `${result.experienceId}:${result.breakpoint}`),
  ).size,
  accessibilityPassing: results.filter(
    (result) =>
      result.accessibility.blocking === 0 &&
      result.runtime.unexpectedPageErrors.length === 0,
  ).length,
  keyboardPassing: results.filter((result) => result.runtime.keyboardPass).length,
};
const manifest = {
  schemaVersion: "signal-experience-capture/1",
  capturedAt: new Date().toISOString(),
  baseUrl,
  determinism: plan.determinism,
  summary,
  results,
};
mkdirSync(OUTPUT, { recursive: true });
writeFileSync(
  path.join(OUTPUT, "capture-manifest.json"),
  `${JSON.stringify(manifest, null, 2)}\n`,
);
console.log(JSON.stringify(summary, null, 2));
if (summary.requiringReview) process.exitCode = 1;
