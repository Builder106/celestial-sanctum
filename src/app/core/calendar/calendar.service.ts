import {
  Injectable,
  PendingTasks,
  PLATFORM_ID,
  TransferState,
  inject,
  makeStateKey,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Observable, defer, from, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import type { CalendarEvent } from './calendar.types';

/**
 * Source of truth: the parish's public Google Calendar iCal feed. Anyone
 * can fetch this — no API key, no auth — as long as the calendar itself
 * is set to "Make available to public" in Google Calendar's settings.
 */
const ICS_URL =
  'https://calendar.google.com/calendar/ical/celestialsanctumparish%40gmail.com/public/basic.ics';

/** How far forward to expand recurring events. The parish doesn't need a year
 *  ahead — most calendars only have a few months of forward visibility. */
const HORIZON_DAYS = 120;

/** How many events to include in the rendered list. Cuts off the agenda if
 *  the parish ever bulk-imports a year of recurrences; protects against
 *  the page growing unbounded. */
const MAX_EVENTS = 50;

const eventsKey = makeStateKey<CalendarEvent[]>('calendar:events');

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly transferState = inject(TransferState);
  private readonly pendingTasks = inject(PendingTasks);
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));

  /**
   * Stream of the next ~50 upcoming events, sorted ascending by start time.
   * `null` is the loading / failure state — components render an empty
   * agenda surface when null so the layout doesn't jump.
   */
  events(): Observable<CalendarEvent[] | null> {
    const cached = this.transferState.get<CalendarEvent[] | null>(eventsKey, null);
    if (cached !== null) {
      this.transferState.remove(eventsKey);
      return of(cached);
    }
    // Browser side without a TransferState payload means SSR couldn't reach
    // the iCal feed (or this is a client-only render). Bail out gracefully —
    // the agenda component shows an empty / fallback state.
    if (!this.isServer) return of(null);

    // Server side: fetch + parse + cache.
    const releaseTask = this.pendingTasks.add();
    return defer(() => from(this.fetchAndParse())).pipe(
      tap((events) => {
        if (this.isServer) this.transferState.set(eventsKey, events);
      }),
      catchError((err: unknown) => {
        console.error('[CalendarService] iCal fetch/parse failed:', err);
        return of(null as CalendarEvent[] | null);
      }),
      finalize(() => releaseTask()),
    );
  }

  /**
   * Fetch the public ICS, parse with ical.js, expand recurring events for
   * the next HORIZON_DAYS, and return the next MAX_EVENTS sorted ascending.
   *
   * ical.js is dynamically imported so it lands in a server-only chunk —
   * the browser bundle never needs it because hydration reads pre-parsed
   * events from TransferState.
   */
  private async fetchAndParse(): Promise<CalendarEvent[]> {
    const res = await fetch(ICS_URL, {
      // Google's iCal endpoint sets long cache headers but we want a fresh
      // pull on each SSR. The Vercel function instance is reused between
      // invocations; rely on Vercel's framework caching upstream if we ever
      // need to throttle this further.
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`iCal HTTP ${res.status}`);
    }
    const text = await res.text();

    // Dynamic import keeps ical.js out of the browser bundle. The chunk
    // only loads on the SSR worker.
    const ICALModule = await import('ical.js');
    const ICAL = (ICALModule.default ?? ICALModule) as typeof import('ical.js').default;

    const jcal = ICAL.parse(text);
    const vcalendar = new ICAL.Component(jcal);
    const vevents = vcalendar.getAllSubcomponents('vevent');

    const now = new Date();
    const nowMs = now.getTime();
    // Include events that started in the past day so an event happening
    // right now still shows up while it's in progress.
    const pastWindowMs = nowMs - 24 * 60 * 60 * 1000;
    const horizonMs = nowMs + HORIZON_DAYS * 24 * 60 * 60 * 1000;

    const collected: CalendarEvent[] = [];

    for (const vevent of vevents) {
      const event = new ICAL.Event(vevent);
      if (!event.startDate) continue;

      if (event.isRecurring()) {
        // Expand recurrences up to the horizon. iterator() walks the RRULE
        // forward from DTSTART one occurrence at a time. For a weekly
        // service that started two years ago, that means hundreds of past
        // occurrences before reaching today — we skip those without
        // counting them toward the per-event cap, and bail out on a hard
        // iteration ceiling so a runaway RRULE can't hang the SSR worker.
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

    // Filter to events that haven't fully ended yet, sort ascending,
    // then trim to the page-size limit.
    return collected
      .filter((e) => new Date(e.end).getTime() >= nowMs)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, MAX_EVENTS);
  }
}

/**
 * Convert an ical.js Event + occurrence times into the flat JSON shape the
 * components consume. `allDay` is detected via the iCal `isDate` flag on the
 * start time (iCal date-only values represent all-day events).
 */
function toCalendarEvent(
  event: import('ical.js').default.Event,
  start: import('ical.js').default.Time,
  end: import('ical.js').default.Time,
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
