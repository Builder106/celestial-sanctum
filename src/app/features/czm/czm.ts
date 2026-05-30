import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SeoService } from '../../core/seo/seo.service';

interface Podcast {
  title: string;
  description: string;
  /** Spotify show ID — drives the embed iframe + the "Open in Spotify" link. */
  showId: string;
  /** Display chip for "Listen Now" / "Episodes" pill on the card header. */
  badge?: string;
}

interface ComingShow {
  title: string;
  description: string;
}

/**
 * Celestial Zeitgeist Ministries — the parish's youth-led evangelical
 * media ministry. Deliberately ships in a dark-navy/electric-blue palette
 * that contrasts the parish's cream cathedral aesthetic. The page is
 * routed under /czm and opts out of the parish header/footer shell (see
 * App.BARE_ROUTES), so it reads as a sub-microsite within the parish
 * domain rather than a parish page in disguise.
 *
 * Spotify show IDs were lifted from the live celestialsanctumparish.org/czm/
 * page during the recreation; episode titles inside the iframes resolve
 * client-side from Spotify's embed and are not duplicated in static
 * fallback data.
 */
@Component({
  selector: 'sanctum-czm',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <!-- Self-contained dark microsite. All chrome (header, footer) is
         scoped here; the root layout suppresses the parish header/footer
         for /czm via App.bareChrome(). -->
    <div class="czm min-h-screen bg-czm-navy text-czm-text font-body antialiased">
      <!-- Top nav -->
      <header
        class="sticky top-0 z-40 backdrop-blur-md bg-czm-navy/85 border-b border-white/5"
      >
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <!-- aria-label intentionally omitted — the visible two-line
               "Celestial Zeitgeist · MINISTRIES" wordmark becomes the
               accessible name, which matches WCAG 2.5.3 for voice
               control users. -->
          <a routerLink="/czm" class="flex items-center gap-3 group">
            <img
              src="/img/czm-logo.png"
              alt=""
              width="40"
              height="40"
              class="rounded-full"
              decoding="async"
            />
            <span class="flex flex-col leading-tight">
              <span class="text-[15px] font-semibold tracking-tight text-white">Celestial Zeitgeist</span>
              <span class="text-[10px] font-semibold uppercase tracking-[0.25em] text-czm-blue">Ministries</span>
            </span>
          </a>
          <nav class="hidden md:flex items-center gap-7 text-[13px] font-medium">
            <a href="#home" class="text-white hover:text-czm-blue transition-colors">Home</a>
            <a href="#about" class="text-white/75 hover:text-czm-blue transition-colors">About</a>
            <a href="#podcasts" class="text-white/75 hover:text-czm-blue transition-colors">Podcasts</a>
            <a href="#coming-soon" class="text-white/75 hover:text-czm-blue transition-colors">Coming Soon</a>
            <a
              routerLink="/"
              class="ml-3 px-4 py-2 rounded-full border border-white/15 text-white/75 hover:text-white hover:border-czm-blue/60 transition-colors text-[12px]"
            >
              ← Parish site
            </a>
          </nav>
        </div>
      </header>

      <!-- Hero -->
      <section
        id="home"
        class="relative overflow-hidden px-6 pt-20 md:pt-28 pb-20 md:pb-28"
      >
        <!-- Soft radial glow behind the logo -->
        <div
          class="absolute left-1/2 top-24 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-czm-blue/15 blur-3xl pointer-events-none"
          aria-hidden="true"
        ></div>
        <div class="relative max-w-3xl mx-auto text-center">
          <img
            src="/img/czm-logo.png"
            alt="Celestial Zeitgeist Ministries"
            width="180"
            height="180"
            class="mx-auto mb-10 drop-shadow-[0_0_24px_rgba(59,160,232,0.35)]"
          />
          <h1 class="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
            <span class="text-white">Celestial Zeitgeist</span><br />
            <span class="text-czm-blue">Ministries</span>
          </h1>
          <p class="text-base md:text-lg text-white/65 leading-relaxed max-w-xl mx-auto mb-10">
            Cutting through the ideas and movements of the current era —
            directing focus to faith in Christ.
          </p>
          <a
            href="#podcasts"
            class="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-czm-blue to-czm-blue-bright text-white font-semibold text-[14px] shadow-[0_8px_24px_-8px_rgba(59,160,232,0.55)] hover:shadow-[0_12px_32px_-8px_rgba(59,160,232,0.8)] transition-shadow"
          >
            Explore Our Podcasts
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </a>
          <div class="mt-16 flex flex-col items-center gap-2 text-white/60">
            <span class="w-px h-10 bg-white/15"></span>
            <span class="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
          </div>
        </div>
      </section>

      <!-- About / Who We Are -->
      <section id="about" class="bg-white text-czm-navy px-6 py-24 md:py-32 scroll-mt-20">
        <div class="max-w-3xl mx-auto">
          <!-- text-czm-blue-deep instead of -blue: the brand blue
               doesn't have enough contrast against white per WCAG AA. -->
          <p class="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-czm-blue-deep mb-4">
            Our Mission
          </p>
          <h2 class="text-center text-3xl md:text-5xl font-bold tracking-tight text-czm-navy mb-12">
            Who We Are
          </h2>
          <div class="relative pl-6 md:pl-8 border-l-2 border-czm-blue space-y-6 text-czm-navy/75 leading-relaxed text-[15px] md:text-base">
            <p>
              Celestial Zeitgeist Ministries is a nonprofit evangelical media
              resource spearheaded by Celestial Sanctum Parish under the
              Celestial Church of Christ (C.C.C.). Its aim is to cut through
              the ideas and movements of the current era and direct focus to
              faith in Christ.
            </p>
            <p>
              Celestial Zeitgeist is an evangelical ministry; its foundation
              is Jesus Christ as the Word and the only way to the eternal
              fulfillment of life. Celestial Zeitgeist operates under the
              Celestial Church of Christ implementing the CCC doctrine and
              theology to help guide its mission.
            </p>
            <p>
              Celestial Zeitgeist Ministries' mission is to help bring people
              to the body of Christ (the Church) and help keep the body of
              Christ focused on Jesus. To help drive this mission, Celestial
              Zeitgeist Ministries employs the use of modern media formats
              and innovative technological platforms.
            </p>
          </div>
        </div>
      </section>

      <!-- Podcasts -->
      <section id="podcasts" class="bg-czm-navy-2 px-6 py-24 md:py-32 scroll-mt-20">
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16 md:mb-20">
            <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-czm-blue mb-4">
              Listen Now
            </p>
            <h2 class="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Our Podcasts
            </h2>
            <p class="text-white/55 max-w-xl mx-auto text-[15px] md:text-base">
              Conversations rooted in faith, scripture, and the mission of
              the Church.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            @for (podcast of podcasts; track podcast.showId) {
              <article
                class="bg-czm-card border border-white/8 rounded-2xl p-6 md:p-8 transition-colors hover:border-czm-blue/40"
              >
                <h3 class="text-xl font-bold text-white mb-2">{{ podcast.title }}</h3>
                <p class="text-white/55 text-[14px] leading-relaxed mb-6">
                  {{ podcast.description }}
                </p>
                <!-- Click-to-load facade: the Spotify iframe drops
                     sp_t / sp_landing third-party cookies on mount, so
                     deferring it behind an explicit click keeps
                     Best Practices at 100. The facade is dark-navy +
                     electric-blue so it fits the CZM card aesthetic
                     rather than the parish SpotifyEmbed's cream + green
                     chrome. Once activated, the iframe takes over with
                     autoplay=1 in the embed URL so it starts playing
                     immediately. -->
                <div class="rounded-xl overflow-hidden bg-czm-card-deep h-[152px]">
                  @if (isActivated(podcast.showId)) {
                    <iframe
                      [src]="embedUrl(podcast.showId)"
                      [title]="podcast.title + ' on Spotify'"
                      width="100%"
                      height="152"
                      frameborder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                    ></iframe>
                  } @else {
                    <!-- aria-label omitted — the visible two-line text
                         ("Listen on Spotify · <podcast title>")
                         becomes the accessible name. Naming the title
                         in visible text also tells the visitor which
                         show they're about to play. -->
                    <button
                      type="button"
                      (click)="activatePodcast(podcast.showId)"
                      class="group w-full h-full flex items-center justify-between gap-4 px-5 text-left transition-colors hover:bg-czm-card"
                    >
                      <span class="flex items-center gap-3 min-w-0">
                        <span
                          class="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#1DB954] text-white shadow-[0_4px_12px_-4px_rgba(29,185,84,0.45)] group-hover:scale-105 transition-transform"
                          aria-hidden="true"
                        >
                          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.301.421-1.02.599-1.561.3z"/>
                          </svg>
                        </span>
                        <span class="flex flex-col min-w-0">
                          <span class="text-[10px] uppercase tracking-[0.25em] text-czm-blue font-bold">
                            Listen on Spotify
                          </span>
                          <span class="text-white text-sm font-semibold truncate">
                            {{ podcast.title }}
                          </span>
                        </span>
                      </span>
                      <span
                        class="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#3BA0E8] text-white group-hover:bg-[#5FB8F3] transition-colors"
                        aria-hidden="true"
                      >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" class="ml-0.5">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    </button>
                  }
                </div>
                <a
                  [href]="'https://open.spotify.com/show/' + podcast.showId"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-5 inline-flex items-center gap-1.5 text-czm-blue hover:text-czm-blue-bright text-[13px] font-semibold transition-colors"
                >
                  Open in Spotify
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              </article>
            }
          </div>
        </div>
      </section>

      <!-- Coming Soon -->
      <section
        id="coming-soon"
        class="bg-[#f3f5f7] text-czm-navy px-6 py-24 md:py-32 scroll-mt-20"
      >
        <div class="max-w-6xl mx-auto">
          <div class="text-center mb-16 md:mb-20">
            <!-- text-czm-blue-deep on light bg per WCAG AA contrast. -->
            <p class="text-[11px] font-bold uppercase tracking-[0.3em] text-czm-blue-deep mb-4">
              In the Works
            </p>
            <h2 class="text-3xl md:text-5xl font-bold tracking-tight text-czm-navy mb-4">
              Coming Soon
            </h2>
            <p class="text-czm-navy/55 max-w-xl mx-auto text-[15px] md:text-base">
              New shows currently in development.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            @for (show of comingSoon; track show.title; let i = $index) {
              <!-- Inverted dark card on the light section so the previews
                   pop against the surrounding canvas. Decorative numeric
                   watermark sits in the corner; refined status pill with
                   a pulsing indicator dot reads as "in development" rather
                   than generic marketing chrome. Hover lifts the card and
                   pushes the arrow chevron to suggest forthcoming
                   discovery. -->
              <article
                class="group relative overflow-hidden rounded-2xl bg-czm-navy text-white p-7 md:p-9 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_48px_-20px_rgba(11,26,46,0.5)]"
              >
                <!-- Soft electric-blue glow that brightens on hover -->
                <div
                  class="absolute -right-24 -top-24 w-64 h-64 rounded-full bg-[#3BA0E8]/15 blur-3xl pointer-events-none transition-opacity duration-300 group-hover:bg-[#3BA0E8]/25"
                  aria-hidden="true"
                ></div>

                <!-- Decorative numeric watermark -->
                <span
                  class="absolute right-6 top-4 font-bold text-[88px] leading-none text-white/[0.04] select-none pointer-events-none tracking-tighter"
                  aria-hidden="true"
                >
                  {{ '0' + (i + 1) }}
                </span>

                <div class="relative">
                  <h3 class="text-2xl font-bold text-white mb-3 leading-tight">
                    {{ show.title }}
                  </h3>
                  <p class="text-white/55 text-[14px] leading-relaxed mb-8 max-w-sm">
                    {{ show.description }}
                  </p>

                  <!-- Subtle bottom rule + chevron — communicates that
                       these cards will eventually become tappable show
                       links without overpromising clickability today. -->
                  <div class="flex items-center justify-between pt-5 border-t border-white/8">
                    <span class="text-[11px] uppercase tracking-[0.25em] text-white/60 font-semibold">
                      Stay tuned
                    </span>
                    <span
                      class="text-white/60 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#5FB8F3]"
                      aria-hidden="true"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </article>
            }
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="bg-czm-navy text-white/60 px-6 pt-20 pb-10">
        <div class="max-w-3xl mx-auto text-center">
          <img
            src="/img/czm-logo.png"
            alt=""
            width="56"
            height="56"
            class="mx-auto mb-6 opacity-90"
            decoding="async"
            aria-hidden="true"
          />
          <div class="flex justify-center gap-5 mb-8 text-white/50">
            <a href="https://instagram.com/celestialzeitgeist" target="_blank" rel="noopener noreferrer" aria-label="Instagram" class="hover:text-czm-blue transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
              </svg>
            </a>
            <a href="https://open.spotify.com" target="_blank" rel="noopener noreferrer" aria-label="Spotify" class="hover:text-czm-blue transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.301.421-1.02.599-1.561.3z"/>
              </svg>
            </a>
            <a href="https://youtube.com/@cccSanctumParish" target="_blank" rel="noopener noreferrer" aria-label="YouTube" class="hover:text-czm-blue transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
              </svg>
            </a>
          </div>
          <p class="text-[13px] text-white/55 leading-relaxed mb-2">
            A ministry of
            <a routerLink="/" class="text-czm-blue hover:text-czm-blue-bright underline underline-offset-4 transition-colors">Celestial Sanctum Parish</a>
            · Celestial Church of Christ
          </p>
          <p class="text-[12px] text-white/55 mb-6">
            © {{ year() }} Celestial Zeitgeist Ministries. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: `
    /* Microsite-scoped palette. Defined as plain CSS custom props on the
       host so they don't leak into the rest of the app's Tailwind theme. */
    :host {
      display: block;
    }
    .czm {
      --color-czm-navy: #08111d;
      --color-czm-navy-2: #0b1a2e;
      --color-czm-card: #122236;
      --color-czm-card-deep: #0a1626;
      --color-czm-text: #f1f4f8;
      --color-czm-muted: #7b8fa8;
      --color-czm-blue: #3ba0e8;
      --color-czm-blue-bright: #5fb8f3;
      /* Deeper blue for use on light backgrounds (Our Mission / Coming
         Soon sections). The bright #3ba0e8 fails WCAG AA 4.5:1 against
         white (2.84:1); this passes at ~5.1:1 while staying clearly
         within the same blue family. */
      --color-czm-blue-deep: #1e6fa8;
    }
    .bg-czm-navy { background-color: var(--color-czm-navy); }
    .bg-czm-navy\\/85 { background-color: color-mix(in srgb, var(--color-czm-navy) 85%, transparent); }
    .bg-czm-navy-2 { background-color: var(--color-czm-navy-2); }
    .bg-czm-card { background-color: var(--color-czm-card); }
    .bg-czm-card-deep { background-color: var(--color-czm-card-deep); }
    .text-czm-text { color: var(--color-czm-text); }
    .text-czm-muted { color: var(--color-czm-muted); }
    .text-czm-navy { color: var(--color-czm-navy); }
    .text-czm-blue { color: var(--color-czm-blue); }
    .text-czm-blue-bright { color: var(--color-czm-blue-bright); }
    .text-czm-blue-deep { color: var(--color-czm-blue-deep); }
    .bg-czm-blue { background-color: var(--color-czm-blue); }
    .bg-czm-blue\\/15 { background-color: color-mix(in srgb, var(--color-czm-blue) 15%, transparent); }
    .border-czm-blue { border-color: var(--color-czm-blue); }
    .border-czm-blue\\/40 { border-color: color-mix(in srgb, var(--color-czm-blue) 40%, transparent); }
    .border-czm-blue\\/60 { border-color: color-mix(in srgb, var(--color-czm-blue) 60%, transparent); }
    .from-czm-blue { --tw-gradient-from: var(--color-czm-blue); }
    .to-czm-blue-bright { --tw-gradient-to: var(--color-czm-blue-bright); }
  `,
})
export class Czm {
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);

  protected readonly year = signal(new Date().getFullYear());

  protected readonly podcasts: readonly Podcast[] = [
    {
      title: 'The Kindling Podcast',
      description: 'Deep conversations about the Bible, the Celestial Church of Christ, and the Christian faith.',
      showId: '3RkUyxZEvam1SVsJjeE5zD',
    },
    {
      title: 'Jehovah Rabboni',
      description: 'Conversations about life, faith, and the Christian walk — exploring biblical topics and the CCC.',
      showId: '4Rt3Swct7P5jHY1S31N2jY',
    },
    {
      title: 'Symbols of Spirituality',
      description: 'Exploring the symbolic objects and aspects of the Celestial Church of Christ as they relate to the Bible.',
      showId: '74bzOhowB1v8M5BaGkLGNz',
    },
    {
      title: 'Heresies',
      description: 'Exploring heresies in church history and their impact on Christianity today.',
      showId: '5b7raMwXgGhFL5N0hiXczW',
    },
  ];

  protected readonly comingSoon: readonly ComingShow[] = [
    {
      title: 'Iron Sharpens Iron',
      description: 'Sharpening faith through honest dialogue and rigorous conversation.',
    },
    {
      title: 'The Celestial Witness',
      description: 'Bearing witness to the work of Christ through the Celestial Church.',
    },
  ];

  /** Memoize one safe URL per show ID. The embed URL changes only when
   *  the showId changes — which is never for a static list — so a tiny
   *  Map covers it without re-sanitizing on every render. */
  private readonly embedCache = new Map<string, SafeResourceUrl>();

  protected embedUrl(showId: string): SafeResourceUrl {
    let cached = this.embedCache.get(showId);
    if (!cached) {
      // theme=0 = light theme (Spotify's default, white card). The dark
      // theme=1 variant clashes with our dark wrapper card; the contrast
      // between Spotify's white card and our navy card frames each
      // episode cleanly. autoplay=1 so the embed starts on click —
      // matches the muscle memory of a direct iframe.
      const url = `https://open.spotify.com/embed/show/${showId}?utm_source=generator&theme=0&autoplay=1`;
      cached = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.embedCache.set(showId, cached);
    }
    return cached;
  }

  /**
   * Set of show IDs whose Spotify iframe has been activated by a click.
   * Held as a signal so the template re-renders the right card when one
   * flips. Initial state is empty — every card renders the facade until
   * the visitor explicitly opts in. Keeps third-party cookies out of
   * the initial page load and the Best Practices score at 100.
   */
  private readonly activatedShows = signal(new Set<string>());

  protected isActivated(showId: string): boolean {
    return this.activatedShows().has(showId);
  }

  protected activatePodcast(showId: string): void {
    this.activatedShows.update((set) => {
      const next = new Set(set);
      next.add(showId);
      return next;
    });
  }

  constructor() {
    this.seo.set({
      title: 'Celestial Zeitgeist Ministries',
      description: 'A nonprofit evangelical media ministry of Celestial Sanctum Parish — cutting through the ideas and movements of the current era, directing focus to faith in Christ.',
      path: '/czm',
    });
  }
}
