import { defineConfig } from "@playwright/test";
const port = Number(process.env.ARVESSA_TEST_PORT || 3000);
const baseURL = `http://127.0.0.1:${port}`;
const engine = process.env.ARVESSA_E2E_ENGINE || "chromium";
if (!["chromium", "firefox", "webkit"].includes(engine)) throw Error("Unsupported Playwright browser");
const browserName = engine as "chromium" | "firefox" | "webkit";
const suffix = engine === "chromium" ? "" : "-" + engine;
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45000,
  expect: { timeout: 12000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["json", { outputFile: `../../.agent-work/e2e-results${suffix}.json` }],
    [
      "html",
      { outputFolder: `../../.agent-work/playwright-report${suffix}`, open: "never" },
    ],
  ],
  outputDir: `../../.agent-work/test-results${suffix}`,
  use: {
    baseURL,
    headless: true,
    browserName,
    channel: process.env.ARVESSA_BROWSER === "chrome" ? "chrome" : undefined,
    viewport: { width: 1440, height: 1000 },
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: engine === "chromium" ? {
      args: [
        "--disable-background-networking",
        "--disable-extensions",
        "--disable-crash-reporter",
      ],
    } : undefined,
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
