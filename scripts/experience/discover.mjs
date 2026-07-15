#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import path from "node:path";
import { discoverRegistry, readJson, registryMetrics, writeStableJson } from "./lib.mjs";

const repoRoot = process.cwd();
const experienceRoot = path.join(repoRoot, "experience");
const config = readJson(path.join(experienceRoot, "config.json"));
const registrations = readJson(path.join(experienceRoot, "registrations.json"));
const registry = discoverRegistry({ repoRoot, config, registrations });

if (process.argv.includes("--write")) {
  writeFileSync(path.join(experienceRoot, "registry.json"), writeStableJson(registry));
}

console.log(JSON.stringify(registryMetrics(registry), null, 2));
