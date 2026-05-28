import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SanctumButton } from '../../shared/ui/button';
import { SeoService } from '../../core/seo/seo.service';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { SanctumMark } from '../../shared/ui/sanctum-mark';
import { GoogleCalendarEmbed } from '../../shared/embeds/google-calendar-embed';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumCascade } from '../../core/motion/cascade.directive';
import { SanctumDrawIn } from '../../core/motion/draw-in.directive';

interface RecurringService {
  day: string;
  title: string;
  time: string;
  highlight?: boolean;
}

@Component({
  selector: 'sanctum-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Display, Eyebrow, SanctumButton, SanctumCascade, SanctumDrawIn, SanctumMark, SanctumReveal, GoogleCalendarEmbed],
  template: `
    <!-- Page hero -->
    <section sanctumCascade stagger="spaced" class="pt-24 md:pt-32 pb-12 px-6 max-w-6xl mx-auto">
      <sanctum-eyebrow class="mb-6">Parish calendar</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-8 max-w-4xl">
        <h1>
          The vigil
          <span class="italic text-sanctum-burgundy">never ends.</span>
        </h1>
      </sanctum-display>
      <p class="font-body text-xl text-sanctum-muted leading-relaxed max-w-2xl">
        The parish keeps a full week of prayer, study, and worship around Sunday
        morning. Add an event to your calendar or just show up.
      </p>
    </section>

    <div class="flex justify-center py-12 md:py-16">
      <sanctum-mark sanctumDrawIn [size]="56" />
    </div>

    <!-- Recurring weekly services -->
    <section id="weekly" class="scroll-mt-28 py-12 md:py-16 px-6 max-w-6xl mx-auto">
      <header sanctumReveal class="mb-10 max-w-2xl">
        <sanctum-eyebrow class="mb-4">Every week</sanctum-eyebrow>
        <sanctum-display size="lg" class="mb-5">
          <h2>
            The weekly
            <span class="italic text-sanctum-burgundy">rhythm.</span>
          </h2>
        </sanctum-display>
        <p class="font-body text-base md:text-lg text-sanctum-muted leading-relaxed">
          Seven services across seven days. Sunday and the Thursday vigil anchor
          the week; weeknight gatherings are open to all.
        </p>
      </header>

      <div sanctumCascade stagger="tight" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        @for (svc of weekly; track svc.day) {
          <article
            class="relative p-6 md:p-8 bg-sanctum-paper border border-sanctum-rule rounded-sm transition-all duration-300 hover:border-sanctum-gold"
            [class.border-l-4]="svc.highlight"
            [class.border-l-sanctum-burgundy]="svc.highlight"
          >
            <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-gold font-semibold mb-3">
              {{ svc.day }}
            </p>
            <h3 class="font-display text-2xl text-sanctum-ink mb-3 font-medium leading-snug">
              {{ svc.title }}
            </h3>
            <p class="font-body text-sm text-sanctum-muted">{{ svc.time }}</p>
          </article>
        }
      </div>
    </section>

    <div sanctumReveal distance="whisper" class="flex justify-center py-16 md:py-20">
      <sanctum-mark [size]="56" />
    </div>

    <!-- Google Calendar event embed -->
    <section id="events" class="scroll-mt-28 py-12 md:py-16 px-6 max-w-6xl mx-auto">
      <header sanctumReveal class="mb-10 max-w-2xl">
        <sanctum-eyebrow class="mb-4">Upcoming events</sanctum-eyebrow>
        <sanctum-display size="lg" class="mb-5">
          <h2>
            One-off services
            <span class="italic text-sanctum-burgundy">&amp; gatherings.</span>
          </h2>
        </sanctum-display>
        <p class="font-body text-base md:text-lg text-sanctum-muted leading-relaxed">
          Harvest, baptisms, choir releases, special vigils. Synced from the
          parish's Google Calendar.
        </p>
      </header>

      <div sanctumReveal [delay]="150">
        <sanctum-google-calendar-embed [calendarId]="calendarId" />
      </div>

      <p class="mt-6 font-body text-sm text-sanctum-muted text-center">
        Prefer your own calendar app?
        <a
          [href]="addToCalendarHref"
          target="_blank"
          rel="noopener noreferrer"
          class="text-sanctum-blue underline decoration-sanctum-gold/60 underline-offset-4 hover:decoration-sanctum-gold"
        >Add the parish calendar</a>
        to Google Calendar, Apple Calendar, or Outlook.
      </p>
    </section>

    <!-- Subscribe to calendar -->
    <section class="relative bg-sanctum-burgundy text-sanctum-cream overflow-hidden py-24 md:py-32 px-6 mt-24">
      <div
        class="absolute inset-0 opacity-10 pointer-events-none"
        aria-hidden="true"
        style='background-image: url("data:image/svg+xml,%3Csvg viewBox=%270 0 400 400%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E");'
      ></div>
      <div sanctumCascade stagger="default" class="relative max-w-3xl mx-auto text-center">
        <div class="flex justify-center mb-10">
          <sanctum-mark [size]="56" tone="light" />
        </div>
        <p class="font-body text-xs uppercase tracking-[0.4em] text-sanctum-gold font-semibold mb-6">
          Never miss a vigil
        </p>
        <h2
          class="font-display italic font-medium text-sanctum-cream tracking-[-0.02em] leading-[0.95] mb-8"
          style="font-size: clamp(2.5rem, 6vw, 4.5rem);"
        >
          Save Sundays.
        </h2>
        <p class="font-body text-lg text-sanctum-cream/85 leading-relaxed mb-10 max-w-xl mx-auto">
          Sanctum News emails you the week's events every Friday afternoon —
          worship times, special services, and choir releases.
        </p>
        <a sanctumBtn variant="ghost" tone="light" size="lg" href="/contact">
          Subscribe to Sanctum News
        </a>
      </div>
    </section>
  `,
})
export class Calendar {
  private readonly seo = inject(SeoService);
  constructor() {
    this.seo.set({
      title: 'Calendar',
      description: 'Weekly rhythm at Celestial Sanctum Parish — Sunday worship, Monday Bible study, Thursday midnight vigil, plus seasonal events.',
      path: '/calendar',
    });
  }

  /** Parish Google Calendar identifier (the Gmail address that owns the
   *  calendar). The calendar must be set to "Make available to public" for
   *  the embed and the iCal subscription link to resolve — see
   *  PHASE8_SETUP.md for the one-time enablement steps. */
  protected readonly calendarId = 'celestialsanctumparish@gmail.com';

  /** Click-to-subscribe deep link. Adding a Google Calendar by URL prompts
   *  the user to confirm in their Google account; Apple Calendar and
   *  Outlook on macOS recognize the webcal:// equivalent. We hand out the
   *  Google flavor since that's what most parish visitors will recognize. */
  protected readonly addToCalendarHref =
    `https://calendar.google.com/calendar/u/0/r?cid=${encodeURIComponent(this.calendarId)}`;

  protected readonly weekly: RecurringService[] = [
    {
      day: 'Sunday',
      title: 'Worship Service',
      time: '10 AM – 2 PM',
      highlight: true,
    },
    {
      day: 'Monday',
      title: 'Bible Study',
      time: '8 PM',
    },
    {
      day: 'Tuesday',
      title: 'Prophesying Into Your Situation',
      time: '8 PM',
    },
    {
      day: 'Wednesday',
      title: 'Seeker Service',
      time: '9 AM',
    },
    {
      day: 'Thursday',
      title: 'Midnight Vigil',
      time: '12 AM',
      highlight: true,
    },
    {
      day: 'Friday',
      title: 'Power Day Service',
      time: '9:30 PM',
    },
    {
      day: 'Saturday',
      title: "Women's Fellowship",
      time: '5 PM',
    },
  ];
}
