import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 4330);
const HOST = "127.0.0.1";

export default defineConfig({
  testDir: "./tests",
  timeout: 45000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }]
  ],
  use: {
    baseURL: `http://${HOST}:${PORT}`,
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: devices["Pixel 5"].userAgent,
    trace: "on-first-retry"
  },
  webServer: {
    command: "node tests/serve.mjs",
    url: `http://${HOST}:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300000
  }
});
