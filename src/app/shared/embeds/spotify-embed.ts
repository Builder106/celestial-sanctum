import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
