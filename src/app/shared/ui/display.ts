import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'sanctum-display',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `
    :host {
      display: block;
      font-family: var(--font-display);
      font-weight: 400;
      letter-spacing: -0.01em;
      line-height: 1.05;
      color: var(--color-sanctum-ink);
    }
    :host(.size-xs) { font-size: clamp(1.5rem, 3.5vw, 2rem); line-height: 1.15; }
    :host(.size-sm) { font-size: clamp(2rem, 5vw, 3rem); line-height: 1.1; }
    :host(.size-md) { font-size: clamp(2.5rem, 6vw, 4rem); line-height: 1.05; }
    :host(.size-lg) { font-size: clamp(3rem, 8vw, 5.5rem); line-height: 1.02; }
    :host(.size-xl) { font-size: clamp(3.5rem, 10vw, 7rem); line-height: 1; }
    :host(.tone-light) { color: var(--color-sanctum-cream); }
  `,
  host: {
    '[class]': 'hostClass()',
  },
})
export class Display {
  readonly size = input<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('lg');
  readonly tone = input<'ink' | 'light'>('ink');

  protected readonly hostClass = computed(
    () => `size-${this.size()} tone-${this.tone()}`,
  );
}
