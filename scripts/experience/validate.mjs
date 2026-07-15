#!/usr/bin/env node
import path from "node:path";
import { discoverRegistry, readJson, registryMetrics, validateRegistry } from "./lib.mjs";

const repoRoot = process.cwd();
const experienceRoot = path.join(repoRoot, "experience");
const config = readJson(path.join(experienceRoot, "config.json"));
const registrations = readJson(path.join(experienceRoot, "registrations.json"));
const registry = readJson(path.join(experienceRoot, "registry.json"));
const discovered = discoverRegistry({ repoRoot, config, registrations });
const errors = validateRegistry({ registry, discovered, repoRoot });

if (errors.length) {
  console.error(`experience:validate: ${errors.length} failure(s)\n${errors.map((error) => `  x ${error}`).join("\n")}`);
  process.exit(1);
}

console.log(`experience:validate: clean\n${JSON.stringify(registryMetrics(registry), null, 2)}`);
