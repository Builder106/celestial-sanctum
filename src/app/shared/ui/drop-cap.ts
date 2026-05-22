import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'sanctum-drop-cap',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-content />`,
  styles: `
    :host {
      display: block;
      font-family: var(--font-body);
      font-size: 1.125rem;
      line-height: 1.75;
      color: var(--color-sanctum-ink);
    }
    :host::first-letter {
      font-family: var(--font-display);
      font-weight: 500;
      float: left;
      font-size: 4.5em;
      line-height: 0.85;
      padding-right: 0.75rem;
      padding-top: 0.4rem;
      color: var(--color-sanctum-burgundy);
    }
  `,
})
export class DropCap {}
