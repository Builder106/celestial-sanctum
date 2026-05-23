import type { Page } from '@playwright/test';

const DEFAULT_DWELL = Number(process.env.DEMO_DWELL_MS ?? 1500);

// Hold the current frame so the viewer of the demo video can register what
// just happened. No-op outside DEMO mode so QA scenarios don't pay the cost.
// Call after every "thing just appeared" beat in demo features — page
// navigations and assertion-only steps don't trigger slowMo, so the video
// would otherwise blink past them.
export async function dwellForDemo(page: Page, ms = DEFAULT_DWELL): Promise<void> {
  if (process.env.DEMO !== '1') return;
  try {
    await page.waitForTimeout(ms);
  } catch {
    // Page may already be closed at end-of-scenario; swallow.
  }
}
