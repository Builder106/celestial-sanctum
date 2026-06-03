export const MIN_PRAYER_LENGTH = 3;
export const MAX_PRAYER_LENGTH = 1000;

/**
 * Validates prayer text. Returns a human-readable error string when invalid,
 * or null when it's good to post. Mirrors the Firestore create rule's bounds
 * so the client and server agree.
 */
export function validatePrayerText(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length < MIN_PRAYER_LENGTH) return 'Please write a little more.';
  if (trimmed.length > MAX_PRAYER_LENGTH) {
    return `Please keep it under ${MAX_PRAYER_LENGTH} characters.`;
  }
  return null;
}

/**
 * Compact relative time: "just now", "5m ago", "3h ago", "2d ago", or a short
 * date for anything older than a week.
 */
export function relativeTime(date: Date, now: Date = new Date()): string {
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  if (seconds < 45) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
