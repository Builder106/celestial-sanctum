import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'sanctum-hairline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="classes()" role="presentation" aria-hidden="true"></span>`,
  styles: `:host { display: block; line-height: 0; }`,
})
export class Hairline {
  readonly tone = input<'gold' | 'rule' | 'ink'>('gold');
  readonly width = input<'sm' | 'md' | 'lg' | 'full'>('md');

  protected readonly classes = computed(() => {
    const toneClass =
      this.tone() === 'rule'
        ? 'bg-sanctum-rule'
        : this.tone() === 'ink'
          ? 'bg-sanctum-ink/40'
          : 'bg-sanctum-gold';
    const widthClass = {
      sm: 'w-10',
      md: 'w-16',
      lg: 'w-24',
      full: 'w-full',
    }[this.width()];
    return `inline-block h-px ${widthClass} ${toneClass}`;
  });
}
