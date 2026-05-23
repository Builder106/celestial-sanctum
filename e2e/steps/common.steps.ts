import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { dwellForDemo } from '../support/dwell';
import { demoFill, installDemoEnhancements } from '../support/demo-page-setup';

const { Given, When, Then, Before, After } = createBdd();

// ─── Lifecycle ──────────────────────────────────────────────────────────────

// Install demo cursor + zoom + grain before every scenario. No-op outside
// DEMO=1, so QA scenarios pay nothing.
Before(async ({ page }) => {
  await installDemoEnhancements(page);
});

// Linger on the final frame for demo recordings so the end-state reads
// as a still rather than blinking to black.
After(async ({ page }) => {
  if (process.env.DEMO === '1') {
    const tail = Number(process.env.DEMO_TAIL_MS ?? 1500);
    try {
      await page.waitForTimeout(tail);
    } catch {
      // ignore
    }
  }
});

// ─── Navigation ────────────────────────────────────────────────────────────

Given('I am on the home page', async ({ page }) => {
  await page.goto('/');
  // The h1 ("Sanctum parish.") is wrapped in sanctumLetterReveal which
  // replaces innerHTML with per-letter spans during hydration, making the
  // role-based heading match a moving target. Wait for the eyebrow line
  // instead — it's static text rendered above the h1.
  await page.getByText('Celestial Church of Christ').first().waitFor({ state: 'visible', timeout: 15_000 });
  await dwellForDemo(page);
});

Given('I am on the {string} page', async ({ page }, path: string) => {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  await dwellForDemo(page);
});

When('I navigate to {string} from the main nav', async ({ page }, label: string) => {
  await page.getByRole('navigation', { name: /primary/i }).getByRole('link', { name: label, exact: false }).first().click();
  await page.waitForLoadState('networkidle');
  await dwellForDemo(page);
});

When('I click the {string} button', async ({ page }, label: string) => {
  await page.getByRole('button', { name: label, exact: false }).first().click();
  await dwellForDemo(page);
});

When('I click the {string} link', async ({ page }, label: string) => {
  await page.getByRole('link', { name: label, exact: false }).first().click();
  await page.waitForLoadState('networkidle');
  await dwellForDemo(page);
});

When('I scroll to the {string} section', async ({ page }, anchorId: string) => {
  await page.evaluate((id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), anchorId);
  await dwellForDemo(page, 2000);
});

When('I scroll down by {int} pixels', async ({ page }, pixels: number) => {
  await page.evaluate((px) => window.scrollBy({ top: px, behavior: 'smooth' }), pixels);
  await dwellForDemo(page, 1500);
});

When('I pause for narration', async ({ page }) => {
  await dwellForDemo(page, 2500);
});

// ─── Assertions ────────────────────────────────────────────────────────────

Then('I see the heading {string}', async ({ page }, text: string) => {
  // Some h1/h2/h3 are wrapped in sanctumLetterReveal which splits text into
  // per-letter spans, breaking strict role-name resolution. Fall back to a
  // text-search if the role-based locator misses.
  const byRole = page.getByRole('heading', { name: new RegExp(text, 'i') }).first();
  const byText = page.getByText(new RegExp(text, 'i')).first();
  await expect(byRole.or(byText)).toBeVisible();
  await dwellForDemo(page);
});

Then('I see the text {string}', async ({ page }, text: string) => {
  await expect(page.getByText(text, { exact: false }).first()).toBeVisible();
  await dwellForDemo(page);
});

Then('the page title contains {string}', async ({ page }, text: string) => {
  await expect(page).toHaveTitle(new RegExp(text, 'i'));
});

Then('the URL is {string}', async ({ page }, path: string) => {
  const expected = new URL(path, 'http://localhost:4200').pathname;
  await expect(page).toHaveURL(new RegExp(expected.replace(/\//g, '\\/') + '(?:[?#].*)?$'));
});

Then('the footer shows the parish address', async ({ page }) => {
  const footer = page.getByRole('contentinfo');
  await expect(footer.getByText('11750 Cedar Avenue')).toBeVisible();
  await expect(footer.getByText('Bloomington, CA 92316')).toBeVisible();
});

// ─── Contact form ──────────────────────────────────────────────────────────

When('I fill the contact form with sample text', async ({ page }) => {
  // The footer also has an Email input (newsletter signup); use the contact
  // form's <select> as a scope anchor — only the contact form has a Topic
  // select, so its surrounding <form> is unambiguous.
  const form = page.locator('form').filter({ has: page.getByLabel('Topic') }).first();
  await demoFill(form.getByLabel('Your name'), 'Jane Adeyemi');
  await demoFill(form.getByLabel('Email'), 'jane@example.com');
  await demoFill(form.getByLabel('Message'), 'First-time visiting this Sunday — what should I expect?');
  await dwellForDemo(page);
});

When('I select the {string} topic', async ({ page }, topic: string) => {
  await page.getByLabel('Topic').selectOption({ label: topic });
  await dwellForDemo(page);
});

// ─── Spotify facade ────────────────────────────────────────────────────────

When('I click the Spotify play button', async ({ page }) => {
  await page.getByRole('button', { name: /play.*Sanctum/i }).first().click();
  await dwellForDemo(page, 2500);
});

Then('the Spotify player loads', async ({ page }) => {
  await expect(page.locator('iframe[title*="Sanctum Podcast"]')).toBeVisible({ timeout: 10_000 });
  await dwellForDemo(page);
});
