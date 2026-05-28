import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * The Sanctum Mark — the official Celestial Church of Christ seal.
 *
 * Each tone has its own pre-colored SVG under `/img/cccIcon-<tone>.svg`
 * (default keeps the multicolor canonical version at `cccIcon.svg`). We
 * pick the right file per tone rather than recoloring at render time
 * with CSS filters — filters can only collapse the whole seal into a
 * single hue, which destroys the contrast between the outline, the
 * rainbow, and the inner detail. Per-tone SVGs let each variant keep
 * proper outline/body contrast and let the .punch overlays (eye lashes,
 * pupil, crown center, title letter holes) read as actual transparent
 * holes against any background.
 *
 * To add a new tone: extend the union, drop a matching
 * `cccIcon-<tone>.svg` in public/img/, and add it to the SVG_BY_TONE
 * map. See the variant generator note in public/img/.
 */
@Component({
  selector: 'sanctum-mark',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <img
      [src]="src()"
      alt=""
      [attr.width]="size()"
      [attr.height]="size()"
      [style.width.px]="size()"
      [style.height.px]="size()"
      decoding="async"
      loading="lazy"
    />
  `,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
    }
  `,
})
export class SanctumMark {
  readonly size = input<number>(60);
  readonly tone = input<'default' | 'light' | 'mono-gold' | 'mono-ink'>('default');

  private static readonly SVG_BY_TONE = {
    'default': '/img/cccIcon.svg',
    'light': '/img/cccIcon-light.svg',
    'mono-gold': '/img/cccIcon-mono-gold.svg',
    'mono-ink': '/img/cccIcon-mono-ink.svg',
  } as const;

  protected readonly src = computed(() => SanctumMark.SVG_BY_TONE[this.tone()]);
}
