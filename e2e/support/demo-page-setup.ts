import type { Page } from '@playwright/test';

// CSS + JS injected on every navigation when DEMO=1. Three jobs:
// 1. Render a visible cursor dot (headless mode hides the system cursor so
//    the viewer can't see where the test is looking).
// 2. Zoom the document slightly to give the video a "filmed close" feel,
//    counter-scale min-h-screen so the hero doesn't overflow.
// 3. Pin the background to the parish cream tone before paint to avoid the
//    white flash some viewers see while CSS loads.
const DEMO_ZOOM = Number(process.env.DEMO_ZOOM ?? 1.3);
const counterScale = ((1 / DEMO_ZOOM) * 100).toFixed(2);

const initScript = `
(() => {
  // Pre-paint background pin
  const style = document.createElement('style');
  style.textContent = \`
    :root, html, body { background: #FBF8F1; }
    html { zoom: ${DEMO_ZOOM}; }
    .min-h-screen { min-height: ${counterScale}vh !important; }
    #demo-cursor {
      position: fixed; z-index: 2147483647; pointer-events: none;
      width: 22px; height: 22px; border-radius: 50%;
      background: rgba(115, 12, 41, 0.78);
      border: 2.5px solid rgba(255, 255, 255, 0.92);
      box-shadow: 0 0 0 1px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.25);
      transform: translate(-50%, -50%);
      transition: top 0.08s linear, left 0.08s linear, transform 0.12s ease-out;
      opacity: 0;
    }
    #demo-cursor.demo-cursor-visible { opacity: 1; }
    #demo-cursor.demo-cursor-pressed { transform: translate(-50%, -50%) scale(0.85); background: rgba(184, 146, 83, 0.9); }
  \`;
  document.head.appendChild(style);

  const installCursor = () => {
    if (document.getElementById('demo-cursor')) return;
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', e => {
      cursor.classList.add('demo-cursor-visible');
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    });
    document.addEventListener('mousedown', () => cursor.classList.add('demo-cursor-pressed'));
    document.addEventListener('mouseup', () => cursor.classList.remove('demo-cursor-pressed'));
  };

  if (document.body) installCursor();
  else document.addEventListener('DOMContentLoaded', installCursor);
})();
`;

export async function installDemoEnhancements(page: Page): Promise<void> {
  if (process.env.DEMO !== '1') return;
  // addInitScript runs on every navigation, so SPA route changes keep the
  // cursor + CSS in place.
  await page.addInitScript(initScript);
}

export const DEMO_TYPE_DELAY = Number(process.env.DEMO_TYPE_DELAY ?? 70);

// Slow-typing helper used by step definitions in DEMO mode. The CLAUDE.md
// pattern monkey-patches Locator.prototype.fill, but @playwright/test
// doesn't expose Locator as a constructor for prototype access in current
// versions. Use this helper directly from steps instead.
export async function demoFill(
  locator: {
    waitFor: (opts?: { state?: 'visible' | 'attached' | 'detached' | 'hidden'; timeout?: number }) => Promise<void>;
    scrollIntoViewIfNeeded: () => Promise<void>;
    click: () => Promise<void>;
    fill: (value: string) => Promise<void>;
    pressSequentially: (text: string, opts?: { delay?: number }) => Promise<void>;
  },
  value: string,
): Promise<void> {
  await locator.waitFor({ state: 'visible' });
  await locator.scrollIntoViewIfNeeded();
  if (process.env.DEMO !== '1') {
    await locator.fill(value);
    return;
  }
  await locator.click();
  await locator.fill('');
  await locator.pressSequentially(value, { delay: DEMO_TYPE_DELAY });
}
