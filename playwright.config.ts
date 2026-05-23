import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

// QA suite — verifies critical paths render correctly. Runs headless, in
// parallel, no videos by default (only on failure). The narrative demo
// suite lives in playwright.demo.config.ts and shares the same step library.
const testDir = defineBddConfig({
  features: 'e2e/features/*.feature',
  steps: 'e2e/steps/*.ts',
});

export default defineConfig({
  testDir,
  // 60s per-test timeout because the dev server cold-starts ng serve on
  // first request, then SSR fetches Sanity per route. After warm-up most
  // tests finish in 2-3s.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  // ng serve is slow to boot the first time (~30s); be generous on the wait.
  // Skip if the dev server is already running locally.
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
