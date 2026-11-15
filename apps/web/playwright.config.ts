import { defineConfig } from "@playwright/test";
const port = Number(process.env.ARVESSA_TEST_PORT || 3000);
const baseURL = `http://127.0.0.1:${port}`;
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45000,
  expect: { timeout: 12000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: "../../.agent-work/e2e-results.json" }],
    [
      "html",
      { outputFolder: "../../.agent-work/playwright-report", open: "never" },
    ],
  ],
  outputDir: "../../.agent-work/test-results",
  use: {
    baseURL,
    headless: true,
    channel: process.env.ARVESSA_BROWSER === "chrome" ? "chrome" : undefined,
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: {
      args: [
        "--disable-background-networking",
        "--disable-extensions",
        "--disable-crash-reporter",
      ],
    },
  },
  webServer:
    process.env.ARVESSA_TEST_START === "1"
      ? {
          command: `npm run start -- --port ${port}`,
          url: baseURL,
          reuseExistingServer: true,
          timeout: 60000,
        }
      : undefined,
});
