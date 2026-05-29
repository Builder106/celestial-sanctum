import type { VercelRequest, VercelResponse } from '@vercel/node';
import ICAL from 'ical.js';

// GET /api/calendar — fetches the parish's public Google iCal feed,
// expands recurring events for the next ~120 days, and returns the next
// 50 chronological occurrences as JSON.
//
// Why this function exists alongside the SSR-time fetch in CalendarService:
// the Angular site prerenders /calendar at build time, baking the events
// into the HTML via TransferState. That works for visitors who land on
// /calendar as their first page. But visitors who land elsewhere and
// then navigate to /calendar via the SPA router don't get a fresh SSR —
// Angular routes client-side, TransferState is empty, the service has
// no data to render. This endpoint is the client-side fallback the
// service falls through to in that case.
//
// CORS: same-origin, no headers needed — the parish's Angular app is
// the only consumer.
//
// Caching: Cache-Control allows Vercel's edge to hold the response for
// a couple of minutes since the iCal feed itself updates slowly.

interface CalendarEvent {
  uid: string;
  start: string;
  end: string;
  summary: string;
  location?: string;
  description?: string;
  allDay: boolean;
}

const ICS_URL =
  'https://calendar.google.com/calendar/ical/celestialsanctumparish%40gmail.com/public/basic.ics';
const HORIZON_DAYS = 120;
const MAX_EVENTS = 50;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const events = await fetchAndParse();
    // Edge cache for 5 minutes; stale-while-revalidate up to 10 minutes
    // so a popular path serves instantly even right after expiry.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ events });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error('[api/calendar] fetch/parse failed:', detail);
    res.status(502).json({ error: 'Calendar unavailable', detail });
  }
}

async function fetchAndParse(): Promise<CalendarEvent[]> {
  const res = await fetch(ICS_URL, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`iCal HTTP ${res.status}`);
  }
  const text = await res.text();

  const jcal = ICAL.parse(text);
  const vcalendar = new ICAL.Component(jcal);
  const vevents = vcalendar.getAllSubcomponents('vevent');

  const now = new Date();
  const nowMs = now.getTime();
  const pastWindowMs = nowMs - 24 * 60 * 60 * 1000;
  const horizonMs = nowMs + HORIZON_DAYS * 24 * 60 * 60 * 1000;

  const collected: CalendarEvent[] = [];

  for (const vevent of vevents) {
    const event = new ICAL.Event(vevent);
    if (!event.startDate) continue;

    if (event.isRecurring()) {
      const iter = event.iterator();
      let next: InstanceType<typeof ICAL.Time> | null;
      let added = 0;
      let walked = 0;
      const WALK_CAP = 5000;
      while ((next = iter.next())) {
        if (++walked > WALK_CAP) break;
        const nextMs = next.toJSDate().getTime();
        if (nextMs > horizonMs) break;
        if (nextMs < pastWindowMs) continue;
        const occurrence = event.getOccurrenceDetails(next);
        collected.push(toCalendarEvent(event, occurrence.startDate, occurrence.endDate));
        if (++added > MAX_EVENTS) break;
      }
    } else {
      collected.push(toCalendarEvent(event, event.startDate, event.endDate));
    }
  }

  return collected
    .filter((e) => new Date(e.end).getTime() >= nowMs)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, MAX_EVENTS);
}

function toCalendarEvent(
  event: ICAL.Event,
  start: ICAL.Time,
  end: ICAL.Time,
): CalendarEvent {
  return {
    uid: event.uid,
    summary: event.summary || 'Untitled event',
    location: event.location || undefined,
    description: event.description || undefined,
    start: start.toJSDate().toISOString(),
    end: end.toJSDate().toISOString(),
    allDay: start.isDate,
  };
}
