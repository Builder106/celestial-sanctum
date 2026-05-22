import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The Sanctum Mark — a small, CCC-specific divider/ornament.
 * Three nested rainbow arcs (the Celestial seal's signature) over a candle
 * flame and slender cross. Used in place of plain hairline rules to make
 * every section transition a moment of identity rather than a generic divider.
 */
@Component({
  selector: 'sanctum-mark',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size()"
      [attr.height]="halfHeight()"
      viewBox="0 0 80 40"
      role="presentation"
      aria-hidden="true"
    >
      <!-- Three nested rainbow arcs: ink → blue → gold -->
      <path
        d="M 8 34 Q 40 -4 72 34"
        fill="none"
        [attr.stroke]="arc1Color()"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M 13 34 Q 40 4 67 34"
        fill="none"
        [attr.stroke]="arc2Color()"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M 18 34 Q 40 12 62 34"
        fill="none"
        [attr.stroke]="arc3Color()"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <!-- Candle flame at center (gold teardrop) -->
      <path
        d="M 40 18 C 42 22 42 26 40 28 C 38 26 38 22 40 18 Z"
        [attr.fill]="flameColor()"
      />
      <!-- Slender cross below the flame -->
      <line
        x1="40"
        y1="28"
        x2="40"
        y2="36"
        [attr.stroke]="crossColor()"
        stroke-width="1.2"
        stroke-linecap="round"
      />
      <line
        x1="36"
        y1="32"
        x2="44"
        y2="32"
        [attr.stroke]="crossColor()"
        stroke-width="1.2"
        stroke-linecap="round"
      />
    </svg>
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

  protected halfHeight() {
    return Math.round(this.size() * 0.5);
  }

  protected arc1Color() {
    return this.tone() === 'light'
      ? '#FBF8F1'
      : this.tone() === 'mono-gold'
        ? '#B89253'
        : this.tone() === 'mono-ink'
          ? '#1A1612'
          : '#1A1612';
  }

  protected arc2Color() {
    return this.tone() === 'light'
      ? '#FBF8F1'
      : this.tone() === 'mono-gold'
        ? '#B89253'
        : this.tone() === 'mono-ink'
          ? '#1A1612'
          : '#1E3A5F';
  }

  protected arc3Color() {
    return this.tone() === 'light'
      ? '#FBF8F1'
      : this.tone() === 'mono-gold'
        ? '#B89253'
        : this.tone() === 'mono-ink'
          ? '#1A1612'
          : '#730C29';
  }

  protected flameColor() {
    return this.tone() === 'light' ? '#FBF8F1' : '#B89253';
  }

  protected crossColor() {
    return this.tone() === 'light'
      ? '#FBF8F1'
      : this.tone() === 'mono-gold'
        ? '#B89253'
        : '#1A1612';
  }
}
