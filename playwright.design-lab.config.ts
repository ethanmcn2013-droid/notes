import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env.DESIGN_LAB_BASE_URL;
const baseURL = externalBaseUrl ?? "http://127.0.0.1:4340";

export default defineConfig({
  testDir: "./tests/design-lab",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  retries: 0,
  reporter: [["line"]],
  outputDir: "test-results/design-lab",
  use: {
    baseURL,
    ...devices["Desktop Chrome"],
    viewport: { width: 1440, height: 1000 },
    colorScheme: "light",
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: externalBaseUrl
    ? undefined
    : {
        command: "pnpm exec next dev -H 127.0.0.1 -p 4340",
        url: `${baseURL}/__design-lab/notes`,
        reuseExistingServer: true,
        timeout: 120_000,
        env: {
          SIGNAL_ACCESS_MODE: "review",
          NEXT_PUBLIC_SIGNAL_ACCESS_MODE: "review",
          SIGNAL_NOTES_DESIGN_LAB: "1",
        },
      },
});
