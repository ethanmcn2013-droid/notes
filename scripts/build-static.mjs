import { cp, mkdir, rm } from "node:fs/promises";

const outputDir = "dist";

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await Promise.all([
  cp("index.html", `${outputDir}/index.html`),
  cp("styles.css", `${outputDir}/styles.css`),
  cp("app.js", `${outputDir}/app.js`),
]);
