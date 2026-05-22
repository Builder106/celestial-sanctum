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

@Component({
  selector: 'sanctum-youtube-embed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div class="relative w-full aspect-video overflow-hidden rounded-sm bg-sanctum-ink border border-sanctum-rule">
      @if (activated()) {
        <iframe
          [src]="iframeSrc()"
          [title]="title()"
          class="absolute inset-0 w-full h-full"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      } @else {
        <button
          type="button"
          class="group absolute inset-0 w-full h-full flex items-center justify-center"
          [attr.aria-label]="'Play ' + title()"
          (click)="activate()"
        >
          <img
            [src]="posterSrc()"
            [alt]="title()"
            class="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
            loading="lazy"
          />
          <div
            class="absolute inset-0 bg-gradient-to-t from-sanctum-ink/40 via-transparent to-transparent"
            aria-hidden="true"
          ></div>
          @if (live()) {
            <span class="absolute top-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 bg-sanctum-burgundy text-sanctum-cream text-[10px] font-bold uppercase tracking-[0.2em] rounded-full">
              <span class="w-1.5 h-1.5 rounded-full bg-sanctum-cream animate-pulse"></span>
              Live
            </span>
          }
          <span class="relative z-10 inline-flex items-center justify-center w-20 h-20 rounded-full bg-sanctum-cream/95 group-hover:bg-sanctum-cream text-sanctum-ink shadow-2xl transition-all duration-300 group-hover:scale-105">
            <sanctum-icon name="play" [size]="30" />
          </span>
          <span class="absolute bottom-6 left-6 right-6 text-left font-display text-2xl md:text-3xl text-sanctum-cream drop-shadow-lg leading-tight">
            {{ title() }}
          </span>
        </button>
      }
    </div>
  `,
  styles: `:host { display: block; }`,
})
export class YouTubeEmbed {
  readonly videoId = input.required<string>();
  readonly title = input<string>('YouTube video');
  readonly live = input<boolean>(false);

  protected readonly activated = signal(false);
  private sanitizer = inject(DomSanitizer);

  protected posterSrc = computed(
    () => `https://i.ytimg.com/vi/${this.videoId()}/maxresdefault.jpg`,
  );

  protected iframeSrc = computed<SafeResourceUrl>(() => {
    const url = `https://www.youtube.com/embed/${this.videoId()}?autoplay=1&rel=0`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  protected activate(): void {
    this.activated.set(true);
  }
}
