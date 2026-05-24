import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * The Sanctum Mark — the official Celestial Church of Christ seal.
 * Renders the SVG asset at `/img/cccIcon.svg` (the vectorized parish seal:
 * curved title text, rainbow, eye, crown, cross). Used as section dividers
 * and ornaments across the site.
 *
 * Tone variants apply CSS filters to recolor the seal for different
 * backgrounds. The default tone is the seal's natural multicolor; light is
 * for burgundy / dark grounds; mono-gold and mono-ink are accent variants.
 * Filter chains use the standard brightness(0)+saturate+invert+sepia+
 * hue-rotate pattern that converts any multicolor source to a single
 * target hex.
 */
@Component({
  selector: 'sanctum-mark',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img
      src="/img/cccIcon.svg"
      alt=""
      [attr.width]="size()"
      [attr.height]="size()"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.filter]="filter()"
      decoding="async"
      loading="lazy"
    />
  `,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
    }
    img {
      transition: filter 0.2s ease;
    }
  `,
})
export class SanctumMark {
  readonly size = input<number>(60);
  readonly tone = input<'default' | 'light' | 'mono-gold' | 'mono-ink'>('default');

  // Each filter recolors the entire multicolor seal to a single tone. The
  // values were computed by running the parish brand colors through the
  // standard CSS-filter color-converter algorithm (brightness/invert/
  // sepia/saturate/hue-rotate chain).
  protected readonly filter = computed(() => {
    switch (this.tone()) {
      case 'light':
        // Recolors everything to near-cream-white (~#FBF8F1).
        return 'brightness(0) invert(1)';
      case 'mono-gold':
        // Recolors everything to sanctum-gold (~#B89253).
        return 'brightness(0) saturate(100%) invert(58%) sepia(45%) saturate(573%) hue-rotate(2deg) brightness(95%) contrast(80%)';
      case 'mono-ink':
        // Recolors everything to sanctum-ink (~#1A1612).
        return 'brightness(0) saturate(0)';
      case 'default':
      default:
        return 'none';
    }
  });
}
