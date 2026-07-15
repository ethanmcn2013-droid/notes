#!/usr/bin/env node
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { discoverRegistry, validateRegistry } from "./lib.mjs";

const root = mkdtempSync(path.join(tmpdir(), "signal-notes-experience-"));

try {
  const repoRoot = path.join(root, "notes");
  const appRoot = path.join(repoRoot, "src", "app");
  mkdirSync(appRoot, { recursive: true });
  writeFileSync(path.join(appRoot, "page.tsx"), "export default function Page(){return null}\n");
  const config = {
    product: { id: "notes", name: "Signal Notes", baseUrl: "http://localhost" },
    breakpoints: {
      mobile: { width: 390, height: 844 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1280, height: 900 },
      wide: { width: 1440, height: 960 },
    },
  };
  const registrations = { routeOverrides: {}, surfaces: [] };
  const registered = discoverRegistry({ repoRoot, config, registrations });

  writeFileSync(
    path.join(appRoot, "page.tsx"),
    "export default function Page(){return null}\r\n",
  );
  const crlfRegistry = discoverRegistry({ repoRoot, config, registrations });
  const lfHash = registered.experiences.find((entry) => entry.id === "notes.page.root")?.materialityHash;
  const crlfHash = crlfRegistry.experiences.find((entry) => entry.id === "notes.page.root")?.materialityHash;
  if (!lfHash || lfHash !== crlfHash) {
    throw new Error(`self-test failed: LF and CRLF materiality hashes differ (${lfHash} vs ${crlfHash})`);
  }

  const missingRoot = path.join(appRoot, "deliberately-unregistered");
  mkdirSync(missingRoot, { recursive: true });
  writeFileSync(path.join(missingRoot, "page.tsx"), "export default function Page(){return null}\n");
  const discovered = discoverRegistry({ repoRoot, config, registrations });
  const errors = validateRegistry({ registry: registered, discovered, repoRoot });

  if (!errors.some((error) => error.includes("discovered experience is not registered"))) {
    throw new Error(`self-test failed: unregistered route was not caught\n${errors.join("\n")}`);
  }
  console.log(
    "experience:self-test: pass - LF/CRLF hashes match and a deliberately unregistered route is rejected",
  );
} finally {
  rmSync(root, { recursive: true, force: true });
}
