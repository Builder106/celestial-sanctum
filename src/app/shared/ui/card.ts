import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CardVariant = 'paper' | 'cream' | 'gold' | 'inverse';

@Component({
  selector: 'sanctum-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<article [class]="classes()"><ng-content /></article>`,
  styles: `
    :host { display: block; }
    article {
      transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
    }
    :host(.lift) article:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 30px -8px rgba(26, 22, 18, 0.08);
    }
    @media (prefers-reduced-motion: reduce) {
      article, article:hover { transform: none !important; }
    }
  `,
  host: {
    '[class.lift]': 'lift()',
  },
})
export class Card {
  readonly variant = input<CardVariant>('paper');
  readonly padded = input(true);
  readonly lift = input<boolean>(false);

  protected readonly classes = computed(() => {
    const base = 'relative overflow-hidden rounded-sm';
    const padding = this.padded() ? ' p-8 md:p-10' : '';
    const surface = {
      paper: ' bg-sanctum-paper border border-sanctum-rule',
      cream: ' bg-sanctum-cream/60 border border-sanctum-rule',
      gold: ' bg-sanctum-paper border-2 border-sanctum-gold/40',
      inverse: ' bg-sanctum-ink text-sanctum-cream',
    }[this.variant()];
    return base + padding + surface;
  });
}
