import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SanctumButton } from '../../shared/ui/button';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { Icon } from '../../shared/ui/icon';
import { SanctumMark } from '../../shared/ui/sanctum-mark';
import { YouTubeEmbed } from '../../shared/embeds/youtube-embed';
import { SeoService } from '../../core/seo/seo.service';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumCascade } from '../../core/motion/cascade.directive';
import { SanctumDrawIn } from '../../core/motion/draw-in.directive';

interface StreamingPlatform {
  label: string;
  url: string;
  /** Icon component name (sanctum-icon) — falls back to text-only chip if blank. */
  icon: 'spotify' | 'youtube' | null;
  /** Brand color the platform pill picks up on hover. */
  accent: string;
}

@Component({
  selector: 'sanctum-choir-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Display, Eyebrow, Icon, SanctumButton, SanctumCascade, SanctumDrawIn, SanctumMark, SanctumReveal, YouTubeEmbed],
  template: `
    <!-- Hero -->
    <section sanctumCascade stagger="spaced" class="pt-24 md:pt-32 pb-12 px-6 max-w-6xl mx-auto">
      <sanctum-eyebrow class="mb-6">The Sanctum Choir</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-8 max-w-4xl">
        <h1>
          <span class="italic text-sanctum-burgundy">Ohun ta ni</span> ju wura lo.
        </h1>
      </sanctum-display>
      <p class="font-body text-base md:text-lg text-sanctum-muted leading-relaxed max-w-2xl mb-2">
        A song worth more than gold — glory worth more than gold.
      </p>
      <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-gold font-semibold">
        Yoruba praise lyric · Sanctum Choir signature
      </p>
    </section>

    <div sanctumReveal distance="whisper" class="flex justify-center py-12 md:py-16">
      <sanctum-mark sanctumDrawIn [size]="56" />
    </div>

    <!-- Welcome / who we are -->
    <section id="welcome" class="scroll-mt-28 py-12 md:py-16 px-6 max-w-6xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-start">
        <figure sanctumReveal class="md:col-span-5">
          <img
            src="/img/sanctum-choir.jpg"
            alt="The CCC Sanctum Choir in white sutanas and gold sashes during worship."
            width="1000"
            height="1000"
            class="w-full h-auto rounded-sm border border-sanctum-rule"
            loading="lazy"
            decoding="async"
          />
        </figure>

        <div sanctumReveal [delay]="120" class="md:col-span-7">
          <sanctum-eyebrow class="mb-4">Halleluyah</sanctum-eyebrow>
          <sanctum-display size="lg" class="mb-6">
            <h2>
              We write &amp; sing songs to
              <span class="italic text-sanctum-burgundy">praise the Lord.</span>
            </h2>
          </sanctum-display>
          <div class="space-y-5 font-body text-base md:text-lg text-sanctum-ink/85 leading-[1.75]">
            <p>
              We are the CCC Sanctum Choir, the official choir of Celestial
              Sanctum Parish in Bloomington, California. We write and sing
              songs to praise the Lord Jesus.
            </p>
            <p>
              Music is a universal language. We explore several genres in
              our songs — gospel, traditional CCC hymns, contemporary
              praise — but regardless of style, all our music is focused
              on the Lord. Always remember, Jesus loves you.
            </p>
          </div>
        </div>
      </div>
    </section>

    <div sanctumReveal distance="whisper" class="flex justify-center py-16 md:py-20">
      <sanctum-mark [size]="56" />
    </div>

    <!-- Featured release: Praises in Diverse Spaces -->
    <section id="featured" class="scroll-mt-28 py-12 md:py-16 px-6 max-w-6xl mx-auto">
      <header sanctumReveal class="mb-10 md:mb-12 max-w-2xl">
        <sanctum-eyebrow class="mb-4">Latest release</sanctum-eyebrow>
        <sanctum-display size="lg" class="mb-5">
          <h2>
            Praises in
            <span class="italic text-sanctum-burgundy">Diverse Spaces.</span>
          </h2>
        </sanctum-display>
        <p class="font-body text-base md:text-lg text-sanctum-muted leading-relaxed">
          Our most recent EP. Five praises across five spaces — released
          March 1, 2024 on every major platform.
        </p>
      </header>

      <aside
        sanctumReveal
        [delay]="120"
        class="bg-sanctum-paper border border-sanctum-gold/60 rounded-sm p-7 md:p-10 shadow-[0_6px_24px_-12px_rgba(26,22,18,0.18)]"
      >
        <div class="flex flex-col md:flex-row md:items-start gap-8 md:gap-10">
          <sanctum-mark [size]="80" tone="default" class="shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="font-body text-[11px] md:text-xs uppercase tracking-[0.3em] text-sanctum-blue font-semibold mb-3">
              EP · March 1, 2024
            </p>
            <h3 class="font-display text-3xl md:text-4xl text-sanctum-ink leading-[1.15] mb-4 tracking-[-0.01em]">
              Praises in Diverse <span class="italic text-sanctum-burgundy">Spaces.</span>
            </h3>
            <p class="font-body text-base md:text-lg text-sanctum-ink/85 leading-[1.7] mb-7 max-w-2xl">
              Available on Spotify, Apple Music, Deezer, Audiomack, and Amazon
              Music. Hit play wherever you listen.
            </p>

            <div class="flex flex-wrap gap-3">
              @for (p of streamingPlatforms; track p.url) {
                <a
                  [href]="p.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm border border-sanctum-rule bg-sanctum-cream/40 text-sanctum-ink hover:border-sanctum-gold hover:bg-sanctum-paper transition-colors font-body text-sm font-semibold"
                >
                  @if (p.icon) {
                    <sanctum-icon [name]="p.icon" [size]="16" class="text-sanctum-muted" />
                  }
                  {{ p.label }}
                  <sanctum-icon name="arrow-up-right" [size]="12" class="ml-1 align-[-1px] text-sanctum-muted" />
                </a>
              }
            </div>
          </div>
        </div>
      </aside>
    </section>

    <div sanctumReveal distance="whisper" class="flex justify-center py-16 md:py-20">
      <sanctum-mark [size]="56" />
    </div>

    <!-- Music video -->
    <section id="video" class="scroll-mt-28 py-12 md:py-16 px-6 max-w-5xl mx-auto">
      <header sanctumReveal class="mb-10 max-w-2xl">
        <sanctum-eyebrow class="mb-4">Music video</sanctum-eyebrow>
        <sanctum-display size="lg" class="mb-5">
          <h2>
            Ju Wura —
            <span class="italic text-sanctum-burgundy">Harvest of Metanoia.</span>
          </h2>
        </sanctum-display>
        <p class="font-body text-base md:text-lg text-sanctum-muted leading-relaxed">
          Filmed during the Harvest of Metanoia. White sutanas, gold sashes,
          the full Sanctum Choir live.
        </p>
      </header>

      <div sanctumReveal [delay]="150">
        <sanctum-youtube-embed
          videoId="cGvmHtvn5kw"
          title="Ju Wura by Sanctum Choir — Harvest of Metanoia Visuals"
        />
      </div>
    </section>

    <div sanctumReveal distance="whisper" class="flex justify-center py-16 md:py-20">
      <sanctum-mark [size]="56" />
    </div>

    <!-- Listen on (artist pages, not per-release) -->
    <section id="listen" class="scroll-mt-28 py-12 md:py-16 px-6 max-w-6xl mx-auto">
      <header sanctumReveal class="mb-10 md:mb-12 max-w-2xl">
        <sanctum-eyebrow class="mb-4">Follow the choir</sanctum-eyebrow>
        <sanctum-display size="lg" class="mb-5">
          <h2>
            Listen
            <span class="italic text-sanctum-burgundy">anywhere.</span>
          </h2>
        </sanctum-display>
        <p class="font-body text-base md:text-lg text-sanctum-muted leading-relaxed">
          Subscribe on your favorite platform to catch every new release
          the moment it drops.
        </p>
      </header>

      <div
        sanctumCascade
        stagger="tight"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5"
      >
        @for (p of streamingPlatforms; track p.url) {
          <a
            [href]="p.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group flex flex-col items-center justify-center gap-3 p-6 md:p-7 bg-sanctum-paper border border-sanctum-rule rounded-sm transition-all duration-300 hover:border-sanctum-gold hover:-translate-y-0.5"
          >
            @if (p.icon) {
              <sanctum-icon [name]="p.icon" [size]="28" class="text-sanctum-muted group-hover:text-sanctum-burgundy transition-colors" />
            } @else {
              <span
                class="inline-flex items-center justify-center w-7 h-7 rounded-full font-body text-[11px] font-bold uppercase tracking-tight text-sanctum-muted group-hover:text-sanctum-burgundy transition-colors border border-sanctum-rule"
              >
                {{ p.label.slice(0, 1) }}
              </span>
            }
            <span class="font-body text-sm font-semibold text-sanctum-ink text-center leading-tight">
              {{ p.label }}
            </span>
          </a>
        }
      </div>
    </section>

    <!-- Closing ornament -->
    <div class="flex justify-center pb-24 md:pb-32 pt-12">
      <sanctum-mark [size]="40" tone="mono-gold" />
    </div>
  `,
})
export class Choir {
  private readonly seo = inject(SeoService);
  constructor() {
    this.seo.set({
      title: 'Sanctum Choir',
      description: 'The CCC Sanctum Choir — the official choir of Celestial Sanctum Parish in Bloomington, California. Latest release "Praises in Diverse Spaces" on Spotify, Apple Music, Deezer, Audiomack, and Amazon Music.',
      path: '/choir',
    });
  }

  /** Choir artist pages across streaming services. URLs lifted from the
   *  live celestialsanctumparish.org/sanctumchoir page during the
   *  recreation. Spotify + YouTube get glyph icons from the existing
   *  icon set; the rest fall back to monogram chips since the icon
   *  library doesn't ship Apple/Deezer/Audiomack/Amazon glyphs and
   *  adding four bespoke SVGs for one page wasn't worth the bytes. */
  protected readonly streamingPlatforms: readonly StreamingPlatform[] = [
    {
      label: 'Spotify',
      url: 'https://open.spotify.com/artist/5VJjKIJwXkXG97AWJFJyLB',
      icon: 'spotify',
      accent: '#1DB954',
    },
    {
      label: 'Apple Music',
      url: 'https://music.apple.com/na/artist/ccc-sanctum-choir/1482043145',
      icon: null,
      accent: '#FA243C',
    },
    {
      label: 'Deezer',
      url: 'https://www.deezer.com/us/artist/75640462',
      icon: null,
      accent: '#A238FF',
    },
    {
      label: 'Audiomack',
      url: 'https://audiomack.com/ccc-sanctum-choir',
      icon: null,
      accent: '#FFA200',
    },
    {
      label: 'Amazon Music',
      url: 'https://www.amazon.com/music/player/artists/B07YR4LBX1/ccc-sanctum-choir',
      icon: null,
      accent: '#25D1DA',
    },
  ];
}
