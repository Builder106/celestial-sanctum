import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { PortableTextBlock } from '@portabletext/types';
import { SanctumButton } from '../../shared/ui/button';
import { Countdown } from '../../shared/ui/countdown';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { SanctumMark } from '../../shared/ui/sanctum-mark';
import { SpotifyEmbed } from '../../shared/embeds/spotify-embed';
import { YouTubeEmbed } from '../../shared/embeds/youtube-embed';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumCascade } from '../../core/motion/cascade.directive';
import { SanctumDrawIn } from '../../core/motion/draw-in.directive';
import { SanctumLetterReveal } from '../../core/motion/letter-reveal.directive';
import { SanctumCiteRule } from '../../core/motion/cite-rule.directive';
import { SanityService } from '../../core/sanity/sanity.service';
import type { SundayBlock } from '../../core/sanity/sanity.types';

const FALLBACK = {
  heroEyebrow: 'Celestial Church of Christ · Bloomington, CA',
  heroLead: 'You are welcome to',
  heroHeadline: 'Sanctum parish.',
  heroSubcopy:
    'A parish of the Celestial Church of Christ, keeping vigil in Bloomington since 1999. Come as you are.',
  missionEyebrow: 'Our Mission',
  missionQuote:
    'The church exists to win and nurture souls for the kingdom of God — to carry the cross of Jesus, lift it high, and make Him known.',
  pastorPullQuote: '"This is your house."',
  pastorParagraphs: [
    "Whether you've worshipped with us for years or are visiting for the first time, this is your house. Our parish keeps the rhythm — Sunday worship, the Thursday vigil, the choir's hymns in Yoruba and English — and it's here for you to step into at any time.",
    'If you carry a question, a grief, or a thanksgiving, bring it. The doors are open.',
  ],
  pastorSignature: '— The Pastor',
  sundayRhythm: [
    {
      time: '10 AM',
      heading: 'Arrive',
      body: "Doors open at half past nine. You don't need to wear a sutana — come as you are, find a seat anywhere, and let the choir set the tone.",
    },
    {
      time: '11 AM',
      heading: 'Worship',
      body: 'Songs in Yoruba and English, scripture readings, prayer, the message. Communion the first Sunday of every month.',
    },
    {
      time: '1 PM',
      heading: 'Fellowship',
      body: "After service we gather for food and conversation. If you're new, stay for it — it's how the parish makes room for you.",
    },
  ] satisfies SundayBlock[],
} as const;

@Component({
  selector: 'sanctum-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Countdown,
    Display,
    Eyebrow,
    SanctumButton,
    SanctumCascade,
    SanctumCiteRule,
    SanctumDrawIn,
    SanctumLetterReveal,
    SanctumMark,
    SanctumReveal,
    SpotifyEmbed,
    YouTubeEmbed,
  ],
  template: `
    <!-- Cinematic hero -->
    <section class="relative w-full h-[94vh] min-h-[640px] overflow-hidden">
      <div class="absolute inset-0 hero-curtain overflow-hidden">
        <img
          src="/img/banner12c.jpg"
          alt="A sister in white sutana reading a Celestial Church hymnbook"
          class="w-full h-full object-cover ken-burns object-[85%_25%] md:object-[65%_30%]"
          fetchpriority="high"
        />
      </div>
      <!-- Cream gradient bottom -->
      <div
        class="absolute inset-0"
        style="background: linear-gradient(180deg, transparent 0%, transparent 45%, rgba(251,248,241,0.5) 80%, var(--color-sanctum-cream) 100%);"
        aria-hidden="true"
      ></div>
      <!-- Left ink scrim for type legibility -->
      <div
        class="absolute inset-0"
        style="background: linear-gradient(90deg, rgba(26,22,18,0.55) 0%, rgba(26,22,18,0.25) 30%, transparent 55%);"
        aria-hidden="true"
      ></div>

      <div class="relative z-10 h-full max-w-6xl mx-auto px-6 md:px-10 flex items-center">
        <div class="max-w-4xl text-white">
          <sanctum-eyebrow tone="gold">{{ heroEyebrow() }}</sanctum-eyebrow>
          <p class="font-display text-2xl md:text-3xl text-white/90 mt-8 mb-2 italic font-light">
            {{ heroLead() }}
          </p>
          <h1
            sanctumLetterReveal
            [delay]="200"
            class="font-display italic font-medium text-sanctum-gold tracking-[-0.02em] leading-[0.9] mb-10"
            style="font-size: clamp(3.75rem, 9vw, 7.5rem);"
          >
            {{ heroHeadline() }}
          </h1>
          <p class="font-body text-lg md:text-xl max-w-lg leading-relaxed text-white/85 mb-10">
            {{ heroSubcopy() }}
          </p>
          <div class="flex items-center gap-4 flex-wrap mb-6">
            <a sanctumBtn variant="primary" size="lg" href="/visit">
              Plan Your Visit
            </a>
            <a sanctumBtn variant="ghost" tone="light" size="lg" href="/watch">
              Watch Online
            </a>
          </div>
          <p class="font-body text-sm text-white/70 tracking-wide">
            Sunday worship in
            <sanctum-countdown style="inline" class="ml-1 text-white" />
          </p>
        </div>
      </div>
    </section>

    <!-- Mission quote -->
    <section sanctumReveal class="py-32 md:py-40 px-6">
      <div class="max-w-3xl mx-auto text-center">
        <div class="flex justify-center mb-10">
          <sanctum-mark sanctumDrawIn [size]="64" />
        </div>
        <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-blue font-semibold mb-8">
          {{ missionEyebrow() }}
        </p>
        <blockquote class="font-display text-3xl md:text-5xl text-sanctum-ink leading-[1.15] tracking-[-0.01em] mb-12">
          {{ missionQuote() }}
        </blockquote>
      </div>
    </section>

    <!-- Type-only moment: "Come and see." -->
    <section class="py-32 md:py-48 px-6 bg-sanctum-cream">
      <div class="max-w-4xl mx-auto text-center">
        <div sanctumReveal distance="whisper" class="flex justify-center mb-16 md:mb-20">
          <sanctum-mark [size]="48" />
        </div>
        <p
          sanctumLetterReveal
          [delay]="100"
          [letterStagger]="65"
          class="font-display italic text-sanctum-burgundy tracking-[-0.02em] leading-[0.95]"
          style="font-size: clamp(3.5rem, 11vw, 8rem);"
        >
          Come and see.
        </p>
        <p
          sanctumReveal
          [delay]="900"
          class="mt-12 font-body text-xs uppercase tracking-[0.4em] text-sanctum-gold font-semibold"
        >
          <span sanctumCiteRule [delay]="200">John 1 : 46</span>
        </p>
        <div sanctumReveal distance="whisper" [delay]="500" class="flex justify-center mt-16 md:mt-20">
          <sanctum-mark [size]="48" />
        </div>
      </div>
    </section>

    <!-- Pastor's letter -->
    <section class="py-24 md:py-32 px-6 bg-sanctum-paper border-y border-sanctum-rule">
      <div sanctumCascade stagger="default" class="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
        <div class="md:col-span-4 lg:col-span-3 flex flex-col items-center md:items-start">
          @if (pastorPortrait(); as portrait) {
            <img
              [src]="portrait"
              alt="Portrait of the pastor"
              class="w-48 h-48 md:w-full md:aspect-square md:h-auto max-w-[14rem] rounded-full object-cover border-2 border-sanctum-gold"
            />
          } @else {
            <!-- Placeholder portrait: cream-on-burgundy silhouette in gold-rule circle -->
            <div class="relative w-48 h-48 md:w-full md:aspect-square md:h-auto max-w-[14rem] rounded-full overflow-hidden border-2 border-sanctum-gold bg-sanctum-burgundy">
              <svg
                viewBox="0 0 200 200"
                xmlns="http://www.w3.org/2000/svg"
                class="absolute inset-0 w-full h-full"
                role="img"
                aria-label="Placeholder portrait of the pastor"
              >
                <circle cx="100" cy="80" r="32" fill="var(--color-sanctum-cream)" />
                <path
                  d="M 30 200 Q 30 130 60 120 L 80 115 L 100 130 L 120 115 L 140 120 Q 170 130 170 200 Z"
                  fill="var(--color-sanctum-cream)"
                />
                <path
                  d="M 80 130 L 100 145 L 120 130 L 120 140 L 100 155 L 80 140 Z"
                  fill="var(--color-sanctum-burgundy)"
                />
              </svg>
            </div>
            <p class="mt-5 font-body text-xs uppercase tracking-[0.3em] text-sanctum-muted text-center md:text-left">
              Portrait forthcoming
            </p>
          }
        </div>

        <div class="md:col-span-8 lg:col-span-9">
          <sanctum-eyebrow class="mb-5">From the Pastor</sanctum-eyebrow>
          <p class="font-display text-3xl md:text-4xl text-sanctum-ink leading-[1.2] mb-8">
            {{ pastorPullQuote() }}
          </p>
          <div class="space-y-5 font-body text-base md:text-lg text-sanctum-ink/85 leading-[1.75] max-w-2xl">
            @for (paragraph of pastorParagraphs(); track $index) {
              <p>{{ paragraph }}</p>
            }
          </div>
          <p class="mt-10 font-display italic text-xl text-sanctum-burgundy">
            {{ pastorSignature() }}
          </p>
        </div>
      </div>
    </section>

    <!-- A Sunday at Sanctum -->
    <section class="py-24 md:py-32 px-6 max-w-6xl mx-auto">
      <header sanctumReveal class="text-center mb-16 md:mb-20">
        <sanctum-eyebrow class="mb-5">A Sunday at Sanctum</sanctum-eyebrow>
        <sanctum-display size="lg" class="mt-4 max-w-3xl mx-auto">
          <h2>The shape of the Lord's Day.</h2>
        </sanctum-display>
      </header>
      <div sanctumCascade stagger="default" class="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
        @for (block of sundayRhythm(); track block.time) {
          <article>
            <p class="font-display italic text-3xl text-sanctum-gold mb-4">
              {{ block.time }}
            </p>
            <h3 class="font-display text-2xl text-sanctum-ink mb-3 font-medium">
              {{ block.heading }}
            </h3>
            <p class="font-body text-base text-sanctum-muted leading-relaxed">
              {{ block.body }}
            </p>
          </article>
        }
      </div>
    </section>

    <!-- 24/7 Livestream -->
    <section class="py-24 md:py-32 px-6 bg-sanctum-paper border-y border-sanctum-rule">
      <div class="max-w-5xl mx-auto">
        <header sanctumReveal class="text-center mb-12">
          <sanctum-eyebrow class="mb-4">Live now</sanctum-eyebrow>
          <sanctum-display size="md" class="mt-4">
            <h2>CCC Original Songs &amp; Hymns</h2>
          </sanctum-display>
          <p class="font-body text-base text-sanctum-muted leading-relaxed mt-5 max-w-2xl mx-auto">
            A 24/7 livestream of original Celestial Church of Christ songs and
            hymns — sung in Yoruba, English, and the languages of the diaspora.
          </p>
        </header>
        <div sanctumReveal [delay]="150">
          <sanctum-youtube-embed
            videoId="MybSY9EjesQ"
            title="Celestial Church of Christ Original Songs and Hymns — 24/7 Livestream"
            [live]="true"
          />
        </div>
      </div>
    </section>

    <!-- Podcast -->
    <section class="py-24 md:py-32 px-6">
      <div class="max-w-4xl mx-auto text-center">
        <div sanctumReveal>
          <sanctum-eyebrow class="mb-4">Sanctum Podcast</sanctum-eyebrow>
          <sanctum-display size="md">
            <h2>Devotionals, in your ears.</h2>
          </sanctum-display>
          <p class="font-body text-base text-sanctum-muted leading-relaxed mt-5 mb-10 max-w-2xl mx-auto">
            Spiritual devotionals, biblical teachings, and prophetic reflections —
            drop in for the latest episode or work through the back catalogue.
          </p>
        </div>
        <div sanctumReveal [delay]="150">
          <sanctum-spotify-embed
            showId="0lQ2H8kaRG8nl6InuGUcC6"
            title="CCC Sanctum Podcast"
          />
        </div>
        <div sanctumReveal [delay]="250" class="mt-8">
          <a
            sanctumBtn
            variant="ghost"
            href="https://open.spotify.com/show/0lQ2H8kaRG8nl6InuGUcC6"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open on Spotify
          </a>
        </div>
      </div>
    </section>

    <!-- Find us in Bloomington — full-bleed burgundy -->
    <section class="relative bg-sanctum-burgundy text-sanctum-cream overflow-hidden py-32 md:py-40 px-6">
      <!-- Subtle warm grain overlay -->
      <div
        class="absolute inset-0 opacity-10 pointer-events-none"
        aria-hidden="true"
        style='background-image: url("data:image/svg+xml,%3Csvg viewBox=%270 0 400 400%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E");'
      ></div>

      <div sanctumCascade stagger="default" class="relative max-w-5xl mx-auto text-center">
        <div class="flex justify-center mb-10">
          <sanctum-mark [size]="56" tone="light" />
        </div>
        <p class="font-body text-xs uppercase tracking-[0.4em] text-sanctum-gold font-semibold mb-8">
          You're welcome here
        </p>
        <h2
          sanctumLetterReveal
          [letterStagger]="40"
          class="font-display italic font-medium text-sanctum-cream tracking-[-0.02em] leading-[0.95] mb-10"
          style="font-size: clamp(3.5rem, 9vw, 7.5rem);"
        >
          Find us in Bloomington.
        </h2>
        <p class="font-body text-lg md:text-xl text-sanctum-cream/85 leading-relaxed max-w-2xl mx-auto mb-3">
          11750 Cedar Avenue · Bloomington, CA 92316
        </p>
        <p class="font-body text-sm text-sanctum-cream/65 mb-12">
          Twenty-five minutes east of downtown San Bernardino, twelve from Riverside.
        </p>
        <div class="flex flex-wrap gap-4 justify-center">
          <a
            sanctumBtn
            variant="primary"
            tone="light"
            size="lg"
            href="https://maps.google.com/?q=11750+Cedar+Avenue+Bloomington+CA+92316"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Directions
          </a>
          <a sanctumBtn variant="ghost" tone="light" size="lg" href="/contact">
            Contact Us
          </a>
        </div>
      </div>
    </section>
  `,
})
export class Home {
  private readonly sanity = inject(SanityService);

  private readonly homepageData = toSignal(this.sanity.homepage(), { initialValue: null });
  private readonly pastorData = toSignal(this.sanity.pastor(), { initialValue: null });

  // Each section reads CMS-first, falling back to the hardcoded constants.
  // This means /(home) keeps rendering during Phase 5 setup before the
  // Sanity project is wired up, and again later if the CMS fetch fails.
  protected readonly heroEyebrow = computed(() => this.homepageData()?.heroEyebrow ?? FALLBACK.heroEyebrow);
  protected readonly heroLead = computed(() => this.homepageData()?.heroLead ?? FALLBACK.heroLead);
  protected readonly heroHeadline = computed(() => this.homepageData()?.heroHeadline ?? FALLBACK.heroHeadline);
  protected readonly heroSubcopy = computed(() => this.homepageData()?.heroSubcopy ?? FALLBACK.heroSubcopy);
  protected readonly missionEyebrow = computed(() => this.homepageData()?.missionEyebrow ?? FALLBACK.missionEyebrow);
  protected readonly missionQuote = computed(() => this.homepageData()?.missionQuote ?? FALLBACK.missionQuote);
  protected readonly sundayRhythm = computed<readonly SundayBlock[]>(
    () => this.homepageData()?.sundayRhythm ?? FALLBACK.sundayRhythm,
  );

  protected readonly pastorPortrait = computed(() => this.pastorData()?.portraitUrl ?? null);
  protected readonly pastorPullQuote = computed(
    () => this.pastorData()?.letterPullQuote ?? FALLBACK.pastorPullQuote,
  );
  protected readonly pastorParagraphs = computed<readonly string[]>(() => {
    const body = this.pastorData()?.letterBody;
    if (!body || body.length === 0) return FALLBACK.pastorParagraphs;
    return body.map(blockToPlainText).filter((p) => p.length > 0);
  });
  protected readonly pastorSignature = computed(
    () => this.pastorData()?.signature ?? FALLBACK.pastorSignature,
  );
}

// Flattens one Portable Text block to a plain paragraph string. Good enough
// for the short pastor's letter; richer rendering (links, marks) would call
// for @portabletext/to-html-string.
function blockToPlainText(block: PortableTextBlock | string): string {
  if (typeof block === 'string') return block;
  if (!Array.isArray(block.children)) return '';
  return block.children
    .map((child) => ('text' in child && typeof child.text === 'string' ? child.text : ''))
    .join('');
}
