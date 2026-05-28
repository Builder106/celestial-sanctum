import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { CalendarEvent } from '../../core/calendar/calendar.types';

interface AgendaDay {
  /** YYYY-MM-DD in America/Los_Angeles, used as the group key + track-by. */
  isoDate: string;
  /** "WED" / "THU" — three-letter weekday in caps. */
  weekdayLabel: string;
  /** Numeric day-of-month, e.g. "28". */
  dayNumber: string;
  /** "MAY" / "JUN" — three-letter month in caps. */
  monthLabel: string;
  events: AgendaEvent[];
}

interface AgendaEvent {
  uid: string;
  summary: string;
  /** "12 – 2am" / "9 – 10pm" / "All day". */
  timeLabel: string;
  location?: string;
}

const TIMEZONE = 'America/Los_Angeles';

/**
 * Renders an iCal-parsed list of events as a parish-styled agenda.
 *
 * Mirrors the visual hierarchy of Google's agenda view (date column on the
 * left, time + title + location stacked on the right) but in Sanctum
 * typography. Events are grouped by day in the parish timezone — a midnight
 * vigil that starts at 12am Thursday and runs until 2am Thursday shows once
 * under Thursday, matching Google's grouping behavior.
 *
 * Empty state: when `events` is null (loading or fetch failure) or an empty
 * array (calendar has no upcoming events), renders a calm fallback message
 * with the parish's hand-off to "subscribe in your calendar app".
 */
@Component({
  selector: 'sanctum-agenda',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure
      class="w-full bg-sanctum-paper border border-sanctum-gold/60 rounded-sm overflow-hidden shadow-[0_6px_24px_-12px_rgba(26,22,18,0.18)]"
    >
      <figcaption
        class="flex items-center justify-between px-5 md:px-7 py-4 bg-sanctum-cream border-b border-sanctum-gold/50"
      >
        <span
          class="font-body text-xs md:text-sm uppercase tracking-[0.35em] text-sanctum-blue font-semibold"
        >
          Parish events
        </span>
        <span class="font-body text-xs text-sanctum-muted whitespace-nowrap">
          Pacific Time
        </span>
      </figcaption>

      @if (events() === null) {
        <div class="px-5 md:px-7 py-16 text-center">
          <p class="font-body text-sm text-sanctum-muted">
            Couldn't reach the parish calendar right now. Try again in a moment,
            or
            <a
              href="https://calendar.google.com/calendar/u/0?cid=Y2VsZXN0aWFsc2FuY3R1bXBhcmlzaEBnbWFpbC5jb20"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sanctum-blue underline decoration-sanctum-gold/60 underline-offset-4 hover:decoration-sanctum-gold"
              >view it on Google Calendar</a>.
          </p>
        </div>
      } @else if (days().length === 0) {
        <div class="px-5 md:px-7 py-16 text-center">
          <p class="font-body text-sm text-sanctum-muted">
            No upcoming events on the calendar yet. Check back soon — the parish
            updates it through the week.
          </p>
        </div>
      } @else {
        <ul class="divide-y divide-sanctum-rule">
          @for (day of days(); track day.isoDate) {
            <li class="flex gap-5 md:gap-8 px-5 md:px-7 py-5 md:py-6">
              <!-- Date column. Day number in display serif, weekday/month
                   in eyebrow caps. Mirrors Google's "28 MAY, THU" layout
                   but in parish typography. -->
              <div class="flex-shrink-0 w-16 md:w-20 text-center pt-1">
                <p class="font-display text-3xl md:text-4xl font-medium text-sanctum-ink leading-none">
                  {{ day.dayNumber }}
                </p>
                <p
                  class="mt-2 font-body text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-sanctum-blue font-semibold"
                >
                  {{ day.monthLabel }}, {{ day.weekdayLabel }}
                </p>
              </div>

              <!-- Events for the day. Multiple events stack with a thin
                   gold-rule divider between them — gentler than a heavy
                   border, still gives the eye somewhere to rest. -->
              <ul class="flex-1 flex flex-col gap-3 md:gap-4 min-w-0">
                @for (evt of day.events; track evt.uid) {
                  <li class="flex flex-col gap-1 min-w-0">
                    <p
                      class="font-body text-xs uppercase tracking-[0.25em] text-sanctum-gold font-semibold"
                    >
                      {{ evt.timeLabel }}
                    </p>
                    <p class="font-display text-lg md:text-xl text-sanctum-ink leading-snug">
                      {{ evt.summary }}
                    </p>
                    @if (evt.location) {
                      <p class="font-body text-xs md:text-sm text-sanctum-muted leading-snug">
                        {{ evt.location }}
                      </p>
                    }
                  </li>
                }
              </ul>
            </li>
          }
        </ul>
      }
    </figure>
  `,
})
export class SanctumAgenda {
  /** `null` = loading or fetch failure. Empty array = no upcoming events. */
  readonly events = input<CalendarEvent[] | null>(null);

  protected readonly days = computed<AgendaDay[]>(() => {
    const evts = this.events();
    if (!evts || evts.length === 0) return [];

    // Group by day in the parish timezone. Intl.DateTimeFormat with a
    // canonical en-US locale gives us deterministic weekday/month labels
    // that match the previous Google embed layout.
    const dayFmt = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const labelFmt = new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

    const groups = new Map<string, AgendaDay>();
    for (const evt of evts) {
      const start = new Date(evt.start);
      const isoDate = dayFmt.format(start); // "2026-05-28"
      let group = groups.get(isoDate);
      if (!group) {
        const parts = labelFmt.formatToParts(start);
        const get = (type: string) =>
          parts.find((p) => p.type === type)?.value.toUpperCase() ?? '';
        group = {
          isoDate,
          weekdayLabel: get('weekday'),
          monthLabel: get('month'),
          dayNumber: parts.find((p) => p.type === 'day')?.value ?? '',
          events: [],
        };
        groups.set(isoDate, group);
      }
      group.events.push({
        uid: evt.uid + '-' + evt.start,
        summary: evt.summary,
        timeLabel: formatTime(evt),
        location: evt.location,
      });
    }
    return [...groups.values()];
  });
}

/**
 * Format the time range as "9 – 10pm", "12 – 2am", "10am – 3pm", or
 * "All day" — matching the abbreviated style we used in the iframe embed
 * so visitors don't perceive a regression in legibility.
 *
 * Removes redundant am/pm on the start time when both ends share a period
 * ("9 – 10pm" not "9pm – 10pm"). Keeps both periods when they differ
 * ("10am – 3pm").
 */
function formatTime(evt: CalendarEvent): string {
  if (evt.allDay) return 'All day';
  const start = new Date(evt.start);
  const end = new Date(evt.end);
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  const startParts = fmt.formatToParts(start);
  const endParts = fmt.formatToParts(end);
  const startTime = compactTime(startParts);
  const endTime = compactTime(endParts);
  const startPeriod = startParts.find((p) => p.type === 'dayPeriod')?.value.toLowerCase() ?? '';
  const endPeriod = endParts.find((p) => p.type === 'dayPeriod')?.value.toLowerCase() ?? '';
  if (startPeriod === endPeriod) {
    return `${startTime} – ${endTime}${endPeriod}`;
  }
  return `${startTime}${startPeriod} – ${endTime}${endPeriod}`;
}

/** Render time as "9" or "9:30" — drop ":00" minutes for tighter agenda rows. */
function compactTime(parts: Intl.DateTimeFormatPart[]): string {
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '';
  return minute === '00' ? hour : `${hour}:${minute}`;
}
