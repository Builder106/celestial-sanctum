import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Hairline } from './hairline';

@Component({
  selector: 'sanctum-quote',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Hairline],
  template: `
    <figure class="relative max-w-3xl mx-auto text-center">
      <div class="flex justify-center mb-8">
        <sanctum-hairline tone="gold" width="md" />
      </div>
      @if (eyebrow()) {
        <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-blue font-semibold mb-6">
          {{ eyebrow() }}
        </p>
      }
      <blockquote
        class="font-display text-3xl md:text-4xl lg:text-5xl text-sanctum-ink leading-[1.15] tracking-[-0.01em]"
      >
        <ng-content />
      </blockquote>
      @if (citation()) {
        <figcaption class="mt-8 font-body text-sm text-sanctum-muted tracking-wide">
          — <cite class="not-italic font-semibold text-sanctum-ink">{{ citation() }}</cite>
          @if (citationDetail()) {
            <span class="text-sanctum-muted">, {{ citationDetail() }}</span>
          }
        </figcaption>
      }
      <div class="flex justify-center mt-10">
        <sanctum-hairline tone="gold" width="md" />
      </div>
    </figure>
  `,
})
export class Quote {
  readonly eyebrow = input<string | null>(null);
  readonly citation = input<string | null>(null);
  readonly citationDetail = input<string | null>(null);
}
