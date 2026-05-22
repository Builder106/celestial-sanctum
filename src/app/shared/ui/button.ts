import { computed, Directive, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonTone = 'dark' | 'light';

/**
 * Color treatment by variant × tone.
 *
 * `tone="dark"` (default) — designed for cream/paper backgrounds.
 * `tone="light"` — designed for burgundy / ink backgrounds.
 */
const VARIANT: Record<ButtonTone, Record<ButtonVariant, string>> = {
  dark: {
    primary: 'bg-sanctum-burgundy text-sanctum-cream hover:bg-sanctum-ink',
    secondary: 'bg-sanctum-blue text-sanctum-cream hover:bg-sanctum-ink',
    ghost:
      'border border-sanctum-ink/30 text-sanctum-ink hover:border-sanctum-ink hover:bg-sanctum-ink hover:text-sanctum-cream',
  },
  light: {
    primary: 'bg-sanctum-cream text-sanctum-burgundy hover:bg-sanctum-gold hover:text-sanctum-ink',
    secondary: 'bg-sanctum-gold text-sanctum-ink hover:bg-sanctum-cream',
    ghost:
      'border border-sanctum-cream/70 text-sanctum-cream hover:bg-sanctum-cream hover:text-sanctum-burgundy',
  },
};

const SIZE: Record<ButtonSize, string> = {
  sm: 'px-5 py-2.5 text-[11px]',
  md: 'px-7 py-3.5 text-xs',
  lg: 'px-9 py-4 text-sm',
};

const BASE =
  'inline-flex items-center justify-center gap-2 font-body font-medium uppercase tracking-[0.18em] transition-colors duration-300 cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed';

/**
 * `<a sanctumBtn>` and `<button sanctumBtn>` — applies Sanctum button styling
 * to native anchors and buttons. Replaces the old `<sanctum-button>` component,
 * which had a content-projection bug under SSR due to twin `<ng-content>` slots
 * in `@if`/`@else` branches.
 */
@Directive({
  selector: 'a[sanctumBtn], button[sanctumBtn]',
  standalone: true,
  host: {
    '[class]': 'classes()',
  },
})
export class SanctumButton {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly tone = input<ButtonTone>('dark');

  protected readonly classes = computed(
    () => `${BASE} ${VARIANT[this.tone()][this.variant()]} ${SIZE[this.size()]}`,
  );
}
