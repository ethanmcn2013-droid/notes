#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { registryMetrics } from "./lib.mjs";

const ROOT = process.cwd();
const EXPERIENCE = path.join(ROOT, "experience");
const OUTPUT = path.join(EXPERIENCE, "output");
const enforce = process.argv.includes("--enforce");
const readJson = (file) => JSON.parse(readFileSync(file, "utf8"));

const registry = readJson(path.join(EXPERIENCE, "registry.json"));
const plan = readJson(path.join(EXPERIENCE, "capture-plan.json"));
const grandfather = readJson(path.join(ROOT, ".ds-grandfather.json"));
const captureFile = path.join(OUTPUT, "capture-manifest.json");

if (!existsSync(captureFile)) {
  console.error("experience:audit: capture manifest is missing; run experience:capture first");
  process.exit(1);
}

const capture = readJson(captureFile);
const registryById = new Map(registry.experiences.map((entry) => [entry.id, entry]));
const resultByKey = new Map(
  capture.results.map((result) => [
    `${result.experienceId}:${result.state}:${result.breakpoint}`,
    result,
  ]),
);
const structuralErrors = [];

for (const item of plan.captures) {
  if (!registryById.has(item.experienceId)) {
    structuralErrors.push(`capture plan references unknown ${item.experienceId}`);
  }
  for (const breakpoint of plan.breakpoints) {
    const key = `${item.experienceId}:${item.state}:${breakpoint}`;
    if (!resultByKey.has(key)) structuralErrors.push(`missing rendered evidence ${key}`);
  }
}

const resultKeys = new Set();
for (const result of capture.results) {
  const key = `${result.experienceId}:${result.state}:${result.breakpoint}`;
  if (resultKeys.has(key)) structuralErrors.push(`duplicate rendered evidence ${key}`);
  resultKeys.add(key);
  if (!registryById.has(result.experienceId)) {
    structuralErrors.push(`capture manifest references unknown ${result.experienceId}`);
  }
  if (result.candidateScreenshot) {
    const screenshot = path.join(OUTPUT, result.candidateScreenshot);
    if (!existsSync(screenshot)) structuralErrors.push(`missing screenshot file ${result.candidateScreenshot}`);
  }
}

function observation(result, rule, severity, dimension, evidence, recommendation) {
  return {
    id: `notes-auto-${result.experienceId.replaceAll(".", "-")}-${result.state}-${result.breakpoint}-${rule}`,
    experienceId: result.experienceId,
    product: result.product,
    state: result.state,
    breakpoint: result.breakpoint,
    rule,
    severity,
    dimension,
    evidence,
    recommendation,
    confidence: 1,
    deterministic: true,
  };
}

const observations = [];
for (const result of capture.results) {
  if (result.navigationError || result.status == null) {
    observations.push(
      observation(
        result,
        "route-runtime-failure",
        "release-blocking",
        "implementation-fidelity",
        [result.navigationError ?? "No HTTP response"],
        "Repair the route and attach a clean deterministic recapture.",
      ),
    );
  } else if (!result.contentMatched) {
    observations.push(
      observation(
        result,
        "expected-state-not-rendered",
        "release-blocking",
        "state-completeness",
        [`Expected rendered content was absent: ${result.expectedContent}`],
        "Repair the fixture or state rendering so the intended experience is observable.",
      ),
    );
  }
  if (result.accessibility.blocking > 0) {
    observations.push(
      observation(
        result,
        "blocking-axe-violation",
        "release-blocking",
        "accessibility",
        result.accessibility.details.flatMap((violation) =>
          violation.nodes.map(
            (node) => `${violation.id} ${node.target.join(" ")}: ${node.failureSummary}`,
          ),
        ),
        "Resolve every serious or critical Axe node and recapture the experience.",
      ),
    );
  }
  if ((result.runtime.overflowPixels ?? 0) > 0) {
    observations.push(
      observation(
        result,
        "horizontal-overflow",
        "high",
        "responsive-behavior",
        [`${result.runtime.overflowPixels}px horizontal overflow`],
        "Remove the overflowing constraint and verify the same state at every breakpoint.",
      ),
    );
  }
  if (!result.runtime.keyboardPass) {
    observations.push(
      observation(
        result,
        "keyboard-smoke-failure",
        "release-blocking",
        "accessibility",
        [
          `First focus target: ${result.runtime.focusTarget ?? "none"}`,
          `Visible focus: ${String(result.runtime.focusVisible)}`,
          `Skip target focused: ${String(result.runtime.skipMainFocused)}`,
        ],
        "Restore a visible keyboard entry point and a working skip-to-main path where required.",
      ),
    );
  }
  const runtimeErrors = [
    ...result.runtime.unexpectedPageErrors,
    ...result.runtime.unexpectedConsoleErrors,
  ];
  if (runtimeErrors.length) {
    observations.push(
      observation(
        result,
        "unexpected-runtime-errors",
        result.runtime.unexpectedPageErrors.length ? "release-blocking" : "high",
        "implementation-fidelity",
        runtimeErrors,
        "Remove the runtime error at its source; do not suppress it in the harness.",
      ),
    );
  }
}

const metrics = registryMetrics(registry);
const capturedExperienceIds = new Set(capture.results.map((result) => result.experienceId));
const capturedStateVariants = new Set(
  capture.results.map((result) => `${result.experienceId}:${result.state}`),
).size;
const capturedBreakpointVariants = new Set(
  capture.results.map((result) => `${result.experienceId}:${result.breakpoint}`),
).size;
const criticalIds = new Set(
  registry.experiences
    .filter((entry) => entry.reviewTier === "critical")
    .map((entry) => entry.id),
);
const capturedCriticalIds = [...criticalIds].filter((id) => capturedExperienceIds.has(id));
const legacyEntries = Object.values(grandfather);
const legacyDebt = {
  files: legacyEntries.length,
  rawHex: legacyEntries.reduce(
    (sum, entry) => sum + (typeof entry === "number" ? entry : entry.hex ?? 0),
    0,
  ),
  easing: legacyEntries.reduce(
    (sum, entry) => sum + (typeof entry === "number" ? 0 : entry.ease ?? 0),
    0,
  ),
};
const highRisk = observations.filter((item) =>
  ["release-blocking", "high"].includes(item.severity),
);
const report = {
  schemaVersion: "signal-notes-quality-report/1",
  generatedAt: new Date().toISOString(),
  status:
    structuralErrors.length || highRisk.length ? "review-required" : "pilot-clean",
  inventory: metrics,
  renderedEvidence: {
    captures: capture.results.length,
    passing: capture.results.filter((result) => result.pass).length,
    experiences: capturedExperienceIds.size,
    stateVariants: {
      captured: capturedStateVariants,
      required: metrics.stateVariants,
    },
    breakpointVariants: {
      captured: capturedBreakpointVariants,
      required: metrics.breakpointVariants,
    },
    criticalExperiences: {
      captured: capturedCriticalIds.length,
      registered: criticalIds.size,
      missing: [...criticalIds].filter((id) => !capturedExperienceIds.has(id)),
    },
    accessibilityPassing: capture.results.filter(
      (result) =>
        result.accessibility.blocking === 0 &&
        result.runtime.unexpectedPageErrors.length === 0,
    ).length,
    keyboardPassing: capture.results.filter((result) => result.runtime.keyboardPass).length,
    visualBaselineStatus: "candidate-only-founder-approval-required",
  },
  designSystem: {
    conformance: "verified-separately-by-ds-check",
    legacyDebt,
  },
  observations,
  structuralErrors,
  policy:
    "Automation emits deterministic evidence and findings; it does not manufacture subjective design scores or founder-approved visual baselines.",
};

mkdirSync(OUTPUT, { recursive: true });
writeFileSync(
  path.join(OUTPUT, "quality-report.json"),
  `${JSON.stringify(report, null, 2)}\n`,
);
writeFileSync(
  path.join(OUTPUT, "quality-report.md"),
  [
    "# Signal Notes experience quality report",
    "",
    `Generated: ${report.generatedAt}`,
    `Status: **${report.status}**`,
    "",
    "## Inventory and rendered evidence",
    "",
    `- ${metrics.experiences} registered experiences`,
    `- ${metrics.stateVariants} required state variants`,
    `- ${metrics.breakpointVariants} required breakpoint variants`,
    `- ${capture.results.length} deterministic captures (${report.renderedEvidence.passing} passing)`,
    `- ${capturedStateVariants}/${metrics.stateVariants} state variants captured`,
    `- ${capturedBreakpointVariants}/${metrics.breakpointVariants} experience-breakpoint variants captured`,
    `- ${capturedCriticalIds.length}/${criticalIds.size} critical experiences captured`,
    `- ${report.renderedEvidence.accessibilityPassing}/${capture.results.length} captures pass blocking accessibility/runtime gates`,
    `- ${report.renderedEvidence.keyboardPassing}/${capture.results.length} captures pass keyboard smoke`,
    "- Visual evidence is candidate-only until the founder approves a golden baseline.",
    "",
    "## Deterministic findings",
    "",
    `- ${observations.length} observations`,
    `- ${observations.filter((item) => item.severity === "release-blocking").length} release-blocking`,
    `- ${observations.filter((item) => item.severity === "high").length} high`,
    `- ${structuralErrors.length} structural errors`,
    "",
    ...observations.flatMap((item) => [
      `### ${item.id}`,
      "",
      `${item.severity} Â· ${item.dimension} Â· ${item.experienceId} Â· ${item.state} Â· ${item.breakpoint}`,
      "",
      ...item.evidence.map((line) => `- ${line}`),
      "",
      `Correction: ${item.recommendation}`,
      "",
    ]),
    "Automation does not assign subjective visual, clarity, composition, or brand scores.",
    "",
  ].join("\n"),
);

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const cards = capture.results
  .map((result) => {
    const screenshot = result.candidateScreenshot
      ? `<img src="${escapeHtml(result.candidateScreenshot)}" alt="${escapeHtml(`${result.experienceId}, ${result.state}, ${result.breakpoint}`)}" loading="lazy">`
      : "<p>Capture unavailable</p>";
    return `<article class="card" data-status="${result.pass ? "pass" : "review"}">
      <div class="frame">${screenshot}</div>
      <div class="meta"><span>${escapeHtml(result.breakpoint)}</span><strong>${result.pass ? "pass" : "review"}</strong></div>
      <h2>${escapeHtml(result.experienceId)}</h2>
      <p>${escapeHtml(result.state)} Â· HTTP ${escapeHtml(result.status ?? "none")} Â· ${result.accessibility.blocking} blocking a11y Â· ${escapeHtml(result.runtime.overflowPixels ?? "?")}px overflow</p>
    </article>`;
  })
  .join("\n");
const gallery = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Signal Notes Experience Gallery</title><style>
:root{font-family:system-ui,sans-serif;color:#18181b;background:#f4f4f5}*{box-sizing:border-box}body{margin:0}header{padding:48px max(24px,5vw) 28px;border-bottom:1px solid #d4d4d8}header p{max-width:68ch;color:#52525b}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:18px;padding:28px max(24px,5vw) 64px}.card{background:white;border:1px solid #d4d4d8;border-radius:10px;overflow:hidden}.frame{aspect-ratio:16/10;background:#e4e4e7;overflow:hidden}.frame img{width:100%;height:100%;object-fit:cover;object-position:top}.meta{display:flex;justify-content:space-between;padding:14px 16px 0;text-transform:uppercase;letter-spacing:.08em;font-size:11px}.meta strong{color:#4338ca}.card h2{font-size:16px;margin:12px 16px 6px}.card p{font-size:13px;color:#52525b;margin:0 16px 18px;line-height:1.5}</style></head><body><header><small>SIGNAL NOTES / EXPERIENCE QUALITY</small><h1>Rendered evidence, not quality by assertion.</h1><p>${metrics.experiences} registered experiences. ${capture.results.length} deterministic candidate captures across the supported breakpoints. Founder-approved visual baselines remain an explicit separate gate.</p></header><main class="grid">${cards}</main></body></html>`;
writeFileSync(path.join(OUTPUT, "gallery.html"), gallery);

console.log(
  JSON.stringify(
    {
      status: report.status,
      captures: capture.results.length,
      passing: report.renderedEvidence.passing,
      stateVariants: `${capturedStateVariants}/${metrics.stateVariants}`,
      breakpointVariants: `${capturedBreakpointVariants}/${metrics.breakpointVariants}`,
      criticalExperiences: `${capturedCriticalIds.length}/${criticalIds.size}`,
      observations: observations.length,
      structuralErrors: structuralErrors.length,
    },
    null,
    2,
  ),
);
if (enforce && (structuralErrors.length || highRisk.length)) process.exitCode = 1;
