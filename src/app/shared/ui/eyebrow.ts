import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'sanctum-eyebrow',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="classes()"><ng-content /></span>`,
  styles: `:host { display: inline-block; }`,
})
export class Eyebrow {
  readonly tone = input<'blue' | 'gold' | 'muted'>('blue');

  protected readonly classes = computed(() => {
    const base =
      'font-body text-xs uppercase tracking-[0.3em] font-semibold inline-flex items-center gap-2';
    switch (this.tone()) {
      case 'gold':
        return `${base} text-sanctum-gold`;
      case 'muted':
        return `${base} text-sanctum-muted`;
      default:
        return `${base} text-sanctum-blue`;
    }
  });
}
