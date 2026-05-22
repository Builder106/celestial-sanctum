import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'sanctum-map-embed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full aspect-[4/3] md:aspect-[16/9] overflow-hidden rounded-sm border border-sanctum-rule bg-sanctum-cream">
      <iframe
        [src]="src()"
        [title]="title()"
        class="absolute inset-0 w-full h-full"
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen
      ></iframe>
    </div>
  `,
})
export class MapEmbed {
  readonly query = input.required<string>();
  readonly title = input<string>('Map');

  private sanitizer = inject(DomSanitizer);

  protected src = computed<SafeResourceUrl>(() => {
    const q = encodeURIComponent(this.query());
    const url = `https://www.google.com/maps?q=${q}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });
}
