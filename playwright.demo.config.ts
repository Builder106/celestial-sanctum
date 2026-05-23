import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

// Demo suite — produces narrative video walkthroughs for the README. Runs
// headless but with slowMo for readability, single-worker (parallel races
// the video subsystem and produces 0-byte mp4s), no retries (a re-run
// would record over the previous video). Two warmup scenarios at the top
// (00-warmup.feature) absorb the first-test-slot 0-byte video bug —
// the custom reporter discards their output.
//
// Tune via env vars: DEMO_SLOWMO (default 1200ms), DEMO_TYPE_DELAY
// (70ms), DEMO_TAIL_MS (1500ms), DEMO_DWELL_MS (1500ms), DEMO_ZOOM (1.3).
const SLOW_MO = Number(process.env.DEMO_SLOWMO ?? 1200);

const testDir = defineBddConfig({
  features: 'e2e/demo/features/*.feature',
  steps: 'e2e/steps/*.ts',
});

export default defineConfig({
  testDir,
  timeout: 180_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ['list'],
    ['./e2e/reporters/demo-reporter.ts'],
  ],
  outputDir: 'e2e/demo/test-results',
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    viewport: { width: 2560, height: 1600 },
    video: { mode: 'on', size: { width: 2560, height: 1600 } },
    launchOptions: { slowMo: SLOW_MO },
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Device preset overrides the top-level `use` block silently;
        // re-pin viewport + video at project level so dimensions actually
        // match what we set above.
        viewport: { width: 2560, height: 1600 },
        video: { mode: 'on', size: { width: 2560, height: 1600 } },
      },
    },
  ],
  webServer: {
    command: 'npm start',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
