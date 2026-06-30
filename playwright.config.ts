import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E config.
 *
 * Why Playwright (over Cypress): first-class Next.js App Router support,
 * built-in auto-waiting + network mocking (`page.route`) which we rely on
 * heavily here to stub the Cloudinary-backed `/api/admin/upload` endpoint
 * (no real Cloudinary credentials in this environment), and a single
 * `webServer` option that boots `next dev` against our test DB for the
 * whole run.
 *
 * The dev server is booted with the same `.env` (test-only Postgres +
 * placeholder Cloudinary/SMTP values) used by the Vitest integration
 * suite. `globalSetup` resets and reseeds the test DB once before the
 * whole E2E run so tests start from a known state.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30000,
  reporter: [["list"]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npx next dev -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 60000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
