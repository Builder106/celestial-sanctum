import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SanctumMark } from '../ui/sanctum-mark';

/**
 * Renders the parish's public Google Calendar as an iframe embed.
 *
 * Requires the calendar to be set to "Make available to public" in Google
 * Calendar's settings (under Settings → Settings for my calendars → the
 * calendar → Access permissions). Without that, the iframe loads but
 * shows "Could not be displayed".
 *
 * Visual integration with the parish aesthetic happens via:
 *
 * 1. URL parameters Google honors — `bgcolor` pins the iframe background
 *    to sanctum-cream (#FBF8F1), `color` pushes event accent dots to
 *    sanctum-blue (#1E3A5F), `wkst=1` starts the week on Sunday.
 * 2. A paper-white card wrapper with a real gold-hairline header strip:
 *    Sanctum mark + "Parish events" eyebrow + timezone label. Sits on
 *    the cream page with a subtle drop shadow so it reads as a
 *    cathedral-card containing Google's chrome, not a Google embed
 *    sitting on parish chrome.
 * 3. A 36px cream band overlaid at the bottom of the iframe masking
 *    Google's duplicate "Add to Google Calendar" link + "Google Calendar"
 *    wordmark. We replicate the subscription affordance with our own
 *    styled link on the consuming page.
 * 4. A gentle `sepia + saturate` filter on the iframe to warm Google's
 *    cool blue UI chrome closer to the parish palette without distorting
 *    text legibility.
 *
 * Defaults to AGENDA mode because the parish uses this surface for
 * one-off events (harvests, baptisms, choir releases, special vigils)
 * which read better as a "what's coming up" list than a month grid —
 * especially on mobile, where Google's month view is cramped. The mode
 * input lets a future page swap to MONTH/WEEK if needed.
 */
@Component({
  selector: 'sanctum-google-calendar-embed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SanctumMark],
  template: `
    <figure
      class="w-full bg-sanctum-paper border border-sanctum-gold/60 rounded-sm overflow-hidden shadow-[0_6px_24px_-12px_rgba(26,22,18,0.18)]"
    >
      <!-- Parish header strip — Sanctum mark on the left, eyebrow centered
           or aligned, timezone label on the right. Reads as cathedral
           chrome wrapping Google's gray controls. -->
      <figcaption
        class="flex items-center gap-4 px-5 md:px-7 py-4 bg-sanctum-cream border-b border-sanctum-gold/50"
      >
        <sanctum-mark [size]="32" tone="default" />
        <span
          class="flex-1 font-body text-xs md:text-sm uppercase tracking-[0.35em] text-sanctum-blue font-semibold"
        >
          Parish events
        </span>
        <span class="font-body text-xs text-sanctum-muted whitespace-nowrap">
          {{ timezoneLabel() }}
        </span>
      </figcaption>

      <div class="relative bg-sanctum-cream">
        <iframe
          [src]="embedUrl()"
          [title]="title()"
          [style.height.px]="height()"
          class="w-full block border-0 bg-sanctum-cream"
          style="filter: sepia(0.08) saturate(0.9) hue-rotate(-4deg);"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
        <!-- Mask Google's bottom branding strip ("Google Calendar" wordmark
             + "Add to Google Calendar" link) with a cream band. The iframe
             retains every scroll/navigation control above this strip. We
             ship our own styled subscribe link on the consuming page so
             the affordance isn't lost. -->
        <div
          class="absolute inset-x-0 bottom-0 h-9 bg-sanctum-cream pointer-events-none"
          aria-hidden="true"
        ></div>
      </div>
    </figure>
  `,
})
export class GoogleCalendarEmbed {
  /** Calendar identifier — usually the parish's Gmail address. */
  readonly calendarId = input.required<string>();
  /** IANA timezone, e.g. "America/Los_Angeles". Drives the times Google renders. */
  readonly timezone = input<string>('America/Los_Angeles');
  /** Initial view. AGENDA is mobile-friendly; MONTH is the desktop default. */
  readonly mode = input<'AGENDA' | 'MONTH' | 'WEEK'>('AGENDA');
  /** Pixel height of the iframe before the bottom-strip mask. Pick a value
   *  ~36px taller than what you actually want visible — the mask covers
   *  the bottom 36px to hide Google's branding strip. */
  readonly height = input<number>(760);
  /** Accessible label for the iframe. */
  readonly title = input<string>('Parish events calendar');
  /** Event accent color (the dot before each event row). URL-encoded inside
   *  the embed URL. Default: sanctum-blue. */
  readonly accentColor = input<string>('#1E3A5F');

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly embedUrl = computed<SafeResourceUrl>(() => {
    const params = new URLSearchParams({
      src: this.calendarId(),
      ctz: this.timezone(),
      mode: this.mode(),
      // Hide Google's own page-title row, calendar tabs, sub-calendar
      // sidebar, print button, and timezone label. We want a clean grid
      // of events, not Google's full chrome.
      showTitle: '0',
      showNav: '1',
      showDate: '1',
      showPrint: '0',
      showTabs: '0',
      showCalendars: '0',
      showTz: '0',
      // Visual coupling to the parish palette.
      bgcolor: '#FBF8F1',
      color: this.accentColor(),
      // Christian-week default — Sunday first.
      wkst: '1',
    });
    const url = `https://calendar.google.com/calendar/embed?${params.toString()}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  /** Human-readable timezone for the figcaption (e.g. "Pacific Time"). */
  protected readonly timezoneLabel = computed(() => {
    const tz = this.timezone();
    if (tz === 'America/Los_Angeles') return 'Pacific Time';
    if (tz === 'America/Denver') return 'Mountain Time';
    if (tz === 'America/Chicago') return 'Central Time';
    if (tz === 'America/New_York') return 'Eastern Time';
    return tz.split('/').pop()?.replace(/_/g, ' ') ?? tz;
  });
}
