import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Click-to-load facade around Spotify's iframe embed.
 *
 * Spotify's iframe drops `sp_t` and `sp_landing` third-party cookies as
 * soon as it loads — that's a Lighthouse Best Practices ding (~77
 * instead of 100) on every route that ships one. The facade renders a
 * parish-styled play card on first paint, defers the iframe load until
 * a visitor explicitly clicks. Cookies only land after explicit user
 * interaction, which keeps Best Practices clean.
 *
 * The wrapper pins its height to `height()` even before the iframe
 * mounts so the layout reserves the space — preventing the CLS spike
 * the embed used to cause when it expanded from zero to the loaded
 * height. Once activated, the iframe sets `autoplay` in its allow list
 * so the player starts on click (matching the muscle memory of a
 * direct embed).
 */
@Component({
  selector: 'sanctum-spotify-embed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
          class="w-full block"
          loading="lazy"
          frameborder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        ></iframe>
      } @else {
        <button
          type="button"
          (click)="activate()"
          [attr.aria-label]="'Play ' + title() + ' on Spotify'"
          class="group w-full h-full flex items-center justify-between gap-4 px-5 md:px-6 text-left transition-colors hover:bg-sanctum-cream"
        >
          <span class="flex items-center gap-4 min-w-0">
            <!-- Spotify wordmark glyph in brand green so visitors
                 recognize the affordance without losing the parish
                 chrome around it. -->
            <span
              class="shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-full bg-[#1DB954] text-white shadow-[0_4px_12px_-4px_rgba(29,185,84,0.5)] group-hover:scale-105 transition-transform"
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.301.421-1.02.599-1.561.3z"/>
              </svg>
            </span>
            <span class="flex flex-col min-w-0">
              <span class="font-body text-[11px] uppercase tracking-[0.3em] text-sanctum-blue font-semibold">
                Listen on Spotify
              </span>
              <span class="font-display text-lg md:text-xl text-sanctum-ink leading-snug truncate">
                {{ title() }}
              </span>
            </span>
          </span>
          <!-- Burgundy play affordance on the right — visually balances
               the green Spotify glyph and matches the parish CTA
               vocabulary. -->
          <span
            class="shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-full bg-sanctum-burgundy text-sanctum-cream group-hover:bg-sanctum-ink transition-colors"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" class="ml-0.5">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
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

  /** Flips to true on first click — swaps the facade for the real
   *  iframe. Stays true for the component's lifetime so the iframe
   *  doesn't re-mount on subsequent change-detection cycles. */
  protected readonly activated = signal(false);

  protected activate(): void {
    this.activated.set(true);
  }

  private sanitizer = inject(DomSanitizer);

  protected src = computed<SafeResourceUrl>(() => {
    const path = this.episodeId()
      ? `episode/${this.episodeId()}`
      : `show/${this.showId()}`;
    // `autoplay=1` so the player starts when the iframe mounts after
    // the user's click — matches the muscle memory of a direct embed.
    const url = `https://open.spotify.com/embed/${path}?utm_source=generator&theme=${this.theme()}&autoplay=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
}
