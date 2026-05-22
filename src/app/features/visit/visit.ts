import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SanctumButton } from '../../shared/ui/button';
import { Countdown } from '../../shared/ui/countdown';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { SanctumMark } from '../../shared/ui/sanctum-mark';
import { MapEmbed } from '../../shared/embeds/map-embed';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumCascade } from '../../core/motion/cascade.directive';
import { SanctumDrawIn } from '../../core/motion/draw-in.directive';
import { SanctumLetterReveal } from '../../core/motion/letter-reveal.directive';

interface ServiceSlot {
  day: string;
  detail: string;
  highlight?: boolean;
}

interface FaqItem {
  q: string;
  a: string;
}

@Component({
  selector: 'sanctum-visit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Countdown, Display, Eyebrow, MapEmbed, SanctumButton, SanctumCascade, SanctumDrawIn, SanctumLetterReveal, SanctumMark, SanctumReveal],
  template: `
    <!-- Page hero -->
    <section sanctumCascade stagger="spaced" class="pt-24 md:pt-32 pb-16 px-6 max-w-6xl mx-auto">
      <sanctum-eyebrow class="mb-6">Plan your visit</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-8 max-w-4xl">
        <h1>
          Come as you are.
          <span class="italic text-sanctum-burgundy block">Wear what you brought.</span>
        </h1>
      </sanctum-display>
      <p class="font-body text-xl text-sanctum-muted leading-relaxed max-w-2xl">
        First time at a Celestial Church of Christ parish? Here's what to expect.
        Bring your questions; the doors are open.
      </p>
    </section>

    <!-- When -->
    <section id="when" class="py-20 md:py-24 px-6 max-w-6xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div sanctumReveal class="lg:col-span-5">
          <sanctum-eyebrow class="mb-5">When</sanctum-eyebrow>
          <sanctum-display size="lg" class="mb-6">
            <h2>Sundays at 10 AM.</h2>
          </sanctum-display>
          <p class="font-body text-base md:text-lg text-sanctum-muted leading-relaxed mb-6 max-w-md">
            Main worship runs from 10 in the morning to 2 in the afternoon. The
            parish keeps a full week of prayer and study around that anchor.
          </p>
          <div class="inline-flex items-baseline gap-3">
            <span class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-gold font-semibold">
              Next service in
            </span>
            <sanctum-countdown style="inline" />
          </div>
        </div>
        <div class="lg:col-span-7">
          <ul sanctumCascade stagger="tight" class="space-y-1 list-none">
            @for (slot of schedule; track slot.day) {
              <li
                class="flex justify-between items-baseline gap-4 py-4 border-b border-sanctum-rule"
                [class.border-l-2]="slot.highlight"
                [class.border-l-sanctum-burgundy]="slot.highlight"
                [class.pl-4]="slot.highlight"
              >
                <span
                  class="font-body text-sm font-semibold tracking-wider uppercase"
                  [class.text-sanctum-burgundy]="slot.highlight"
                  [class.text-sanctum-ink]="!slot.highlight"
                >
                  {{ slot.day }}
                </span>
                <span
                  class="font-body text-sm text-right"
                  [class.text-sanctum-ink]="slot.highlight"
                  [class.text-sanctum-muted]="!slot.highlight"
                  [class.font-semibold]="slot.highlight"
                >
                  {{ slot.detail }}
                </span>
              </li>
            }
          </ul>
        </div>
      </div>
    </section>

    <div class="flex justify-center py-16">
      <sanctum-mark sanctumDrawIn [size]="56" />
    </div>

    <!-- Where -->
    <section id="where" class="py-20 md:py-24 px-6 max-w-6xl mx-auto">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div sanctumReveal class="lg:col-span-5">
          <sanctum-eyebrow class="mb-5">Where</sanctum-eyebrow>
          <sanctum-display size="lg" class="mb-6">
            <h2>11750 Cedar Avenue.</h2>
          </sanctum-display>
          <address class="not-italic font-body text-base md:text-lg text-sanctum-muted leading-relaxed mb-8 max-w-md">
            <p class="text-sanctum-ink font-medium mb-1">11750 Cedar Avenue</p>
            <p>Bloomington, CA 92316</p>
            <p class="mt-4 text-sm">
              Twenty-five minutes east of downtown San Bernardino · twelve from Riverside · just off the 10 freeway.
            </p>
          </address>
          <div class="flex flex-wrap gap-3">
            <a
              sanctumBtn
              variant="primary"
              size="sm"
              href="https://maps.google.com/?q=11750+Cedar+Avenue+Bloomington+CA+92316"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Directions
            </a>
            <a sanctumBtn variant="ghost" size="sm" href="tel:909-996-2397">
              Call · 909.996.2397
            </a>
          </div>
        </div>
        <div sanctumReveal [delay]="150" class="lg:col-span-7">
          <sanctum-map-embed
            query="11750 Cedar Avenue Bloomington CA 92316"
            title="Map to Celestial Sanctum Parish"
          />
        </div>
      </div>
    </section>

    <div sanctumReveal distance="whisper" class="flex justify-center py-16">
      <sanctum-mark [size]="56" />
    </div>

    <!-- What happens in service -->
    <section id="service" class="py-20 md:py-24 px-6 bg-sanctum-paper border-y border-sanctum-rule">
      <div class="max-w-4xl mx-auto px-2 md:px-0">
        <div sanctumReveal>
          <sanctum-eyebrow class="mb-5">What happens during service</sanctum-eyebrow>
          <sanctum-display size="lg" class="mb-10">
            <h2>
              Divinely revealed,
              <span class="italic text-sanctum-burgundy">biblically grounded.</span>
            </h2>
          </sanctum-display>
          <p class="font-body text-lg text-sanctum-ink/85 leading-[1.75] mb-10 max-w-2xl">
            A Celestial Church of Christ service is unconventional in appearance
            and ancient in pattern. If you've never been to one, here's what you'll
            see and why we do it that way.
          </p>
        </div>

        <dl sanctumCascade stagger="default" class="space-y-10">
          @for (item of serviceElements; track item.term) {
            <div>
              <dt class="font-display italic text-2xl md:text-3xl text-sanctum-burgundy mb-3">
                {{ item.term }}
              </dt>
              <dd class="font-body text-base md:text-lg text-sanctum-ink/85 leading-[1.75] max-w-2xl">
                {{ item.definition }}
              </dd>
            </div>
          }
        </dl>
      </div>
    </section>

    <!-- FAQs -->
    <section id="faq" class="py-24 md:py-32 px-6 max-w-4xl mx-auto">
      <div sanctumReveal>
        <sanctum-eyebrow class="mb-5">First time?</sanctum-eyebrow>
        <sanctum-display size="lg" class="mb-12">
          <h2>Questions you might have.</h2>
        </sanctum-display>
      </div>

      <div sanctumCascade stagger="tight" class="space-y-10">
        @for (faq of faqs; track faq.q) {
          <div class="border-b border-sanctum-rule pb-10 last:border-b-0">
            <p class="font-display text-2xl text-sanctum-ink mb-3 leading-snug">
              {{ faq.q }}
            </p>
            <p class="font-body text-base md:text-lg text-sanctum-muted leading-[1.75]">
              {{ faq.a }}
            </p>
          </div>
        }
      </div>
    </section>

    <!-- Closing — full bleed burgundy -->
    <section class="relative bg-sanctum-burgundy text-sanctum-cream overflow-hidden py-24 md:py-32 px-6">
      <div
        class="absolute inset-0 opacity-10 pointer-events-none"
        aria-hidden="true"
        style='background-image: url("data:image/svg+xml,%3Csvg viewBox=%270 0 400 400%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E");'
      ></div>
      <div sanctumCascade stagger="default" class="relative max-w-4xl mx-auto text-center">
        <div class="flex justify-center mb-10">
          <sanctum-mark [size]="56" tone="light" />
        </div>
        <p class="font-body text-xs uppercase tracking-[0.4em] text-sanctum-gold font-semibold mb-8">
          We'd love to meet you
        </p>
        <h2
          sanctumLetterReveal
          [letterStagger]="45"
          class="font-display italic font-medium text-sanctum-cream tracking-[-0.02em] leading-[0.95] mb-10"
          style="font-size: clamp(3rem, 8vw, 6rem);"
        >
          Bring your questions.
        </h2>
        <p class="font-body text-lg text-sanctum-cream/85 leading-relaxed max-w-2xl mx-auto mb-12">
          Email the parish in advance and we'll watch for you Sunday morning.
          Or just come — we'll find you.
        </p>
        <div class="flex flex-wrap gap-4 justify-center">
          <a
            sanctumBtn
            variant="primary"
            tone="light"
            size="lg"
            href="mailto:celestialsanctumparish@gmail.com"
          >
            Email Us
          </a>
          <a sanctumBtn variant="ghost" tone="light" size="lg" href="/contact">
            Contact Form
          </a>
        </div>
      </div>
    </section>
  `,
})
export class Visit {
  protected readonly schedule: ServiceSlot[] = [
    { day: 'Sunday', detail: 'Worship · 10 AM – 2 PM', highlight: true },
    { day: 'Monday', detail: 'Bible Study · 8 PM' },
    { day: 'Tuesday', detail: 'Prophesying Into Your Situation · 8 PM' },
    { day: 'Wednesday', detail: 'Seeker Service · 9 AM' },
    { day: 'Thursday', detail: 'Midnight Vigil · 12 AM', highlight: true },
    { day: 'Friday', detail: 'Power Day Service · 9:30 PM' },
    { day: 'Saturday', detail: "Women's Fellowship · 5 PM" },
  ];

  protected readonly serviceElements = [
    {
      term: 'You\'ll be asked to remove your shoes.',
      definition:
        'This follows the biblical pattern (Exodus 3:5) of approaching holy ground. Sandals or socks are fine. There is a rack at the entrance.',
    },
    {
      term: 'White sutanas — encouraged but optional.',
      definition:
        'Members wear white robes called sutanas; visitors are not required to. The garments symbolize heavenly citizenship and the biblical attire of saints. If you come without one, you\'ll be just as welcome.',
    },
    {
      term: 'Women wear head coverings.',
      definition:
        'In keeping with 1 Corinthians 11, women cover their heads during service. If you don\'t have one, there are coverings at the door.',
    },
    {
      term: 'Seven candlesticks burn at the altar.',
      definition:
        'They represent the seven spirits of God described in Revelation. The altar itself represents God\'s throne.',
    },
    {
      term: 'Incense and water are part of prayer.',
      definition:
        'Incense is burned during prayer for sanctification — a representation of prayer rising and of God\'s presence. Water sprinkling serves as purification, paralleling Old Testament practice and New Testament redemption through Christ.',
    },
    {
      term: 'We kneel, bow, and lift our hands.',
      definition:
        'The parish emphasizes humble worship through posture — kneeling at moments of prayer, bowing at the altar, lifting hands during songs and intercession. Follow as you\'re able.',
    },
  ];

  protected readonly faqs: FaqItem[] = [
    {
      q: 'What should I wear?',
      a: "Come as you are. Smart-casual is the norm for visitors — clean shirt, trousers or modest dress. You'll remove shoes at the entrance, and women cover their heads. The white sutana is for members and is not required of visitors.",
    },
    {
      q: 'Can I bring my children?',
      a: 'Yes. Children worship alongside the congregation; the parish runs a Youth Ministry that engages younger members through education, relationships, and Bible teaching. Stay with your kids during service — they\'re welcome at the altar.',
    },
    {
      q: "I've never been to a Celestial Church before. Will I feel out of place?",
      a: "You'll be visibly new — that's fine. Several members will greet you. The Wednesday morning Seeker Service at 9 AM is specifically shaped around people exploring the parish for the first time; consider starting there if a full Sunday feels like a lot.",
    },
    {
      q: 'What about parking?',
      a: 'There is on-site parking at 11750 Cedar Avenue with street parking nearby for Sunday overflow. Arrive 10–15 minutes early on Sundays to find a spot before the 10 AM start.',
    },
    {
      q: 'How long is service?',
      a: "Sunday worship runs from 10 AM to about 2 PM, with fellowship and food after. You're welcome to stay for the whole arc or leave when you need to.",
    },
    {
      q: 'Is the service in English?',
      a: 'Yes. Songs are sung in both Yoruba (the Celestial Church\'s Nigerian roots) and English; readings, prayers, and the message are in English. The choir often translates as they go.',
    },
  ];
}
