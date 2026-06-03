import { describe, expect, it } from 'vitest';

import { MAX_PRAYER_LENGTH, relativeTime, validatePrayerText } from './prayer.util';

describe('validatePrayerText', () => {
  it('rejects empty or too-short text (after trimming)', () => {
    expect(validatePrayerText('')).not.toBeNull();
    expect(validatePrayerText('  a  ')).not.toBeNull();
  });

  it('accepts normal prayer text', () => {
    expect(validatePrayerText('Please pray for my family.')).toBeNull();
  });

  it('rejects text over the max length', () => {
    expect(validatePrayerText('x'.repeat(MAX_PRAYER_LENGTH + 1))).not.toBeNull();
  });

  it('measures the trimmed length', () => {
    expect(validatePrayerText(`   ${'ok!!'}   `)).toBeNull();
  });
});

describe('relativeTime', () => {
  const base = new Date('2026-06-02T12:00:00Z');

  it('says "just now" for very recent times', () => {
    expect(relativeTime(new Date(base.getTime() - 10_000), base)).toBe('just now');
  });

  it('formats minutes', () => {
    expect(relativeTime(new Date(base.getTime() - 5 * 60_000), base)).toBe('5m ago');
  });

  it('formats hours', () => {
    expect(relativeTime(new Date(base.getTime() - 3 * 3_600_000), base)).toBe('3h ago');
  });

  it('formats days', () => {
    expect(relativeTime(new Date(base.getTime() - 2 * 86_400_000), base)).toBe('2d ago');
  });

  it('falls back to a short date for anything older than a week', () => {
    expect(relativeTime(new Date('2026-01-01T00:00:00Z'), base)).toMatch(/Jan/);
  });
});
