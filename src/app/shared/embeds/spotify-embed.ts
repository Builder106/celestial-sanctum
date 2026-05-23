import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Icon } from '../ui/icon';

// Facade pattern: the real iframe (which sets sp_t / sp_landing third-party
// cookies via open.spotify.com) is only mounted after the visitor clicks
// play. Before that we render a static, brand-themed placeholder with the
// same dimensions so there's no layout shift on activation. Lifts
// Lighthouse Best Practices on /watch from 77 to 100 by deferring the
// third-party cookies to explicit user consent.
@Component({
  selector: 'sanctum-spotify-embed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div
      class="relative overflow-hidden rounded-sm bg-sanctum-paper border border-sanctum-rule"
      [style.height.px]="height()"
    >
      @if (activated()) {
        <iframe
          [src]="src()"
          [title]="title()"
          [style.height.px]="height()"
          class="w-full"
          frameborder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        ></iframe>
      } @else {
        <button
          type="button"
          class="group absolute inset-0 w-full h-full flex items-center justify-center text-left"
          [attr.aria-label]="'Load and play ' + title()"
          (click)="activate()"
        >
          <!-- Burgundy ground with subtle radial gold glow toward the play button -->
          <span
            class="absolute inset-0 bg-sanctum-burgundy"
            aria-hidden="true"
          ></span>
          <span
            class="absolute inset-0 opacity-30 pointer-events-none"
            aria-hidden="true"
            style="background: radial-gradient(circle at 28% 50%, rgba(184,146,83,0.55), transparent 55%);"
          ></span>
          <span
            class="absolute inset-0 opacity-10 pointer-events-none"
            aria-hidden="true"
            style='background-image: url("data:image/svg+xml,%3Csvg viewBox=%270 0 400 400%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E");'
          ></span>

          <div class="relative z-10 flex items-center gap-6 px-8 w-full">
            <span
              class="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-sanctum-cream/95 group-hover:bg-sanctum-cream text-sanctum-burgundy shadow-2xl transition-all duration-300 group-hover:scale-105 shrink-0"
            >
              <sanctum-icon name="play" [size]="28" />
            </span>
            <span class="flex-1 min-w-0">
              <span
                class="block font-body text-xs uppercase tracking-[0.3em] text-sanctum-gold font-semibold mb-2"
              >
                Sanctum Podcast
              </span>
              <span
                class="block font-display italic text-2xl md:text-3xl text-sanctum-cream leading-tight truncate"
              >
                {{ title() }}
              </span>
              <span
                class="mt-3 inline-flex items-center gap-2 font-body text-xs text-sanctum-cream/70"
              >
                <sanctum-icon name="spotify" [size]="14" />
                Play on Spotify
              </span>
            </span>
          </div>
        </button>
      }
    </div>
  `,
  styles: `:host { display: block; }`,
})
export class SpotifyEmbed {
  readonly showId = input<string | null>(null);
  readonly episodeId = input<string | null>(null);
  readonly height = input<number>(232);
  readonly title = input<string>('Spotify');
  /** 0 = light theme, 1 = dark theme (Spotify embed query param) */
  readonly theme = input<0 | 1>(0);

  protected readonly activated = signal(false);
  private sanitizer = inject(DomSanitizer);

  protected src = computed<SafeResourceUrl>(() => {
    const path = this.episodeId()
      ? `episode/${this.episodeId()}`
      : `show/${this.showId()}`;
    // autoplay=1 so clicking through doesn't require a second click on the
    // Spotify play button inside the iframe.
    const url = `https://open.spotify.com/embed/${path}?utm_source=generator&theme=${this.theme()}&autoplay=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  protected activate(): void {
    this.activated.set(true);
  }
}
