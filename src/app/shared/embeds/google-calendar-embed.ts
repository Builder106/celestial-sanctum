import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
 *    to sanctum-cream (#FBF8F1) so it blends with the page, `color`
 *    pushes event accent dots to sanctum-blue (#1E3A5F), `wkst=1`
 *    starts the week on Sunday (Christian-week default).
 * 2. A parish-styled wrapper — gold hairline frame, cream tint, generous
 *    inner padding. The iframe sits *inside* the frame so Google's gray
 *    top chrome is visually contained by parish chrome on the outside.
 * 3. A cream-colored band overlaid at the bottom of the iframe to mask
 *    Google's "Add to Google Calendar" link and the "Google Calendar"
 *    wordmark. We replicate the subscription affordance with our own
 *    styled link on the consuming page, so the masked elements would
 *    just be duplication; the iframe itself remains fully functional.
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
  template: `
    <figure class="w-full bg-sanctum-cream border border-sanctum-gold/40 rounded-sm overflow-hidden">
      <!-- Eyebrow inside the frame so Google's gray top bar reads as the
           second tier of chrome rather than a foreign UI dropping in. -->
      <figcaption
        class="flex items-center justify-between px-5 md:px-6 py-3 bg-sanctum-paper border-b border-sanctum-rule"
      >
        <span class="font-body text-[11px] uppercase tracking-[0.3em] text-sanctum-blue font-semibold">
          Parish events
        </span>
        <span class="font-body text-xs text-sanctum-muted hidden sm:inline">
          {{ timezoneLabel() }}
        </span>
      </figcaption>

      <div class="relative">
        <iframe
          [src]="embedUrl()"
          [title]="title()"
          [style.height.px]="height()"
          class="w-full block border-0 bg-sanctum-cream"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
        ></iframe>
        <!-- Mask Google's bottom branding strip ("Google Calendar" wordmark
             + "Add to Google Calendar" link) with a cream band. The iframe
             retains every scroll/navigation control above this strip. We
             ship our own styled subscribe link on the consuming page so the
             affordance isn't lost. -->
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
   *  ~30px taller than what you actually want visible — the mask covers
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
    // Fallback: strip the continent and humanize the city name.
    return tz.split('/').pop()?.replace(/_/g, ' ') ?? tz;
  });
}
