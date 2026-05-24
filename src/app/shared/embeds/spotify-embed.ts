import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

// Renders Spotify's official embed iframe directly so visitors see the
// branded green-and-white player immediately. loading="lazy" defers the
// network request until the embed scrolls into view, but once loaded the
// iframe will set sp_t / sp_landing third-party cookies — that's a
// Lighthouse Best Practices ding on /watch (score ~77 instead of 100)
// accepted as a tradeoff for the in-place player UX. The earlier
// click-to-load facade was removed at the parish's request.
@Component({
  selector: 'sanctum-spotify-embed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative overflow-hidden rounded-sm bg-sanctum-paper border border-sanctum-rule">
      <iframe
        [src]="src()"
        [title]="title()"
        [style.height.px]="height()"
        class="w-full"
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
