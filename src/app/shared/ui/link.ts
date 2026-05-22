import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icon } from './icon';

@Component({
  selector: 'sanctum-link',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <a
      [href]="href()"
      [attr.target]="external() ? '_blank' : null"
      [attr.rel]="external() ? 'noopener noreferrer' : null"
      [class]="classes()"
    >
      <ng-content />
      @if (arrow()) {
        <sanctum-icon
          [name]="external() ? 'arrow-up-right' : 'arrow-right'"
          [size]="14"
        />
      }
    </a>
  `,
  styles: `
    :host { display: inline-flex; }
    a {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      position: relative;
      transition: color 0.25s ease;
    }
    a.underline-on-hover {
      background-image: linear-gradient(currentColor, currentColor);
      background-size: 0% 1px;
      background-repeat: no-repeat;
      background-position: 0 100%;
      transition: background-size 0.35s ease, color 0.25s ease;
    }
    a.underline-on-hover:hover { background-size: 100% 1px; }
  `,
})
export class Link {
  readonly href = input.required<string>();
  readonly external = input<boolean>(false);
  readonly arrow = input<boolean>(false);
  readonly tone = input<'blue' | 'ink' | 'gold' | 'muted'>('blue');
  readonly weight = input<'regular' | 'bold'>('regular');

  protected readonly classes = computed(() => {
    const toneClass = {
      blue: 'text-sanctum-blue hover:text-sanctum-ink',
      ink: 'text-sanctum-ink hover:text-sanctum-blue',
      gold: 'text-sanctum-gold hover:text-sanctum-ink',
      muted: 'text-sanctum-muted hover:text-sanctum-ink',
    }[this.tone()];
    const weightClass = this.weight() === 'bold' ? 'font-semibold' : '';
    return `underline-on-hover ${toneClass} ${weightClass}`;
  });
}
