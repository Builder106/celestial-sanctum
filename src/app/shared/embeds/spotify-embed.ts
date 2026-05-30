import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Renders Spotify's official embed iframe directly so visitors see the
// branded green-and-white player with cover art, episode title, and
// scrubber immediately. loading="lazy" defers the network request until
// the embed scrolls into view, but once loaded the iframe will set
// sp_t / sp_landing third-party cookies — that's a Lighthouse Best
// Practices ding (~77 on /watch) accepted as a tradeoff for the
// in-place player UX. A click-to-load facade was tried; the parish
// preferred the live iframe.
//
// The wrapper pins its height to `height()` so the page reserves the
// space before the iframe paints — keeps CLS at zero for this
// section even though Spotify's iframe loads asynchronously.
@Component({
  selector: 'sanctum-spotify-embed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative overflow-hidden rounded-sm bg-sanctum-paper border border-sanctum-rule"
      [style.height.px]="height()"
    >
      <iframe
        [src]="src()"
        [title]="title()"
        [style.height.px]="height()"
        class="w-full block"
        loading="lazy"
        frameborder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      ></iframe>
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

  private sanitizer = inject(DomSanitizer);

  protected src = computed<SafeResourceUrl>(() => {
    const path = this.episodeId()
      ? `episode/${this.episodeId()}`
      : `show/${this.showId()}`;
    const url = `https://open.spotify.com/embed/${path}?utm_source=generator&theme=${this.theme()}`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
}
