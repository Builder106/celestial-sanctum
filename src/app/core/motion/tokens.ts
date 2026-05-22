/**
 * Motion tokens — the canonical timings, easings, and distances for the
 * Celestial Sanctum animation system. All animation directives consume
 * these so timing tweaks are made in one place.
 */

export const EASING = {
  /** Entrances. Calm, decelerating. */
  reverentOut: [0.16, 1, 0.3, 1] as const,
  /** Rare; use for exits when content is leaving on purpose. */
  reverentIn: [0.4, 0, 1, 1] as const,
  /** Continuous (e.g. Ken-Burns, springs). */
  liturgical: [0.25, 0.46, 0.45, 0.94] as const,
} as const;

export const DURATION = {
  /** 180ms — header bg, mobile menu fade, form state swaps. */
  micro: 0.18,
  /** 300ms — hover, focus (mostly via CSS; this is for parity). */
  short: 0.3,
  /** 600ms — default section reveal. */
  medium: 0.6,
  /** 800ms — big-display reveals, hero copy. */
  long: 0.8,
} as const;

export const DISTANCE = {
  /** 8px — marks, eyebrows, small labels. */
  whisper: 8,
  /** 16px — body, headings, cards. */
  speak: 16,
  /** 28px — hero headlines, big display moments. */
  pulpit: 28,
} as const;

export const STAGGER = {
  /** 60ms — adjacent label-and-headline pairs, FAQ items. */
  tight: 0.06,
  /** 100ms — between sibling cards / paragraphs (default). */
  default: 0.1,
  /** 140ms — hero cascade items (room to breathe). */
  spaced: 0.14,
} as const;

/**
 * Returns `true` when the user has indicated they prefer reduced motion.
 * SSR-safe — returns `false` on the server (animations never run there anyway).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
