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
    <div class="w-full bg-sanctum-paper border border-sanctum-rule rounded-sm overflow-hidden">
      <iframe
        [src]="embedUrl()"
        [title]="title()"
        [style.height.px]="height()"
        class="w-full block border-0"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
      ></iframe>
    </div>
  `,
})
export class GoogleCalendarEmbed {
  /** Calendar identifier — usually the parish's Gmail address. */
  readonly calendarId = input.required<string>();
  /** IANA timezone, e.g. "America/Los_Angeles". Drives the times Google renders. */
  readonly timezone = input<string>('America/Los_Angeles');
  /** Initial view. AGENDA is mobile-friendly; MONTH is the desktop default. */
  readonly mode = input<'AGENDA' | 'MONTH' | 'WEEK'>('AGENDA');
  /** Pixel height. The iframe is fully responsive in width but Google needs
   *  an explicit height — 720 gives ~12 agenda rows or one month grid. */
  readonly height = input<number>(720);
  /** Accessible label for the iframe. */
  readonly title = input<string>('Parish events calendar');

  private readonly sanitizer = inject(DomSanitizer);

  protected readonly embedUrl = computed<SafeResourceUrl>(() => {
    const params = new URLSearchParams({
      src: this.calendarId(),
      ctz: this.timezone(),
      mode: this.mode(),
      showTitle: '0',
      showNav: '1',
      showDate: '1',
      showPrint: '0',
      showTabs: '0',
      showCalendars: '0',
      showTz: '0',
      bgcolor: '#FBF8F1',
    });
    const url = `https://calendar.google.com/calendar/embed?${params.toString()}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
}
