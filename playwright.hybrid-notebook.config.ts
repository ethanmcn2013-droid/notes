import { defineConfig, devices } from "@playwright/test";

const externalBaseUrl = process.env.HYBRID_NOTEBOOK_BASE_URL;
const baseURL = externalBaseUrl ?? "http://127.0.0.1:4342";

export default defineConfig({
  testDir: "./tests/hybrid-notebook",
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  retries: 0,
  reporter: [["line"]],
  outputDir: "test-results/hybrid-notebook",
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
        command: "pnpm exec next dev -H 127.0.0.1 -p 4342",
        url: `${baseURL}/app?fixture=populated`,
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
          SIGNAL_ACCESS_MODE: "review",
          NEXT_PUBLIC_SIGNAL_ACCESS_MODE: "review",
          NOTES_HYBRID_NOTEBOOK_ENABLED: "1",
          SIGNAL_PLANNING_PERIODS_ENABLED: "0",
          VERCEL_ENV: "preview",
          NEXT_TELEMETRY_DISABLED: "1",
        },
      },
});
