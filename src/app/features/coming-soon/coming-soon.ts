import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { SanctumButton } from '../../shared/ui/button';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { SanctumMark } from '../../shared/ui/sanctum-mark';

@Component({
  selector: 'sanctum-coming-soon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Display, Eyebrow, SanctumButton, SanctumMark],
  template: `
    <section class="py-32 md:py-40 px-6 max-w-3xl mx-auto text-center">
      <div class="flex justify-center mb-10">
        <sanctum-mark [size]="56" />
      </div>
      <sanctum-eyebrow tone="muted" class="mb-6">Under construction</sanctum-eyebrow>
      <sanctum-display size="lg" class="mb-8">
        <h1>{{ titleText() }}.</h1>
      </sanctum-display>
      <p class="font-body text-lg text-sanctum-muted leading-relaxed mb-10">
        This page is part of a phased rebuild of celestialsanctumparish.org. Pages
        and content land in upcoming phases; in the meantime, the live parish
        site at
        <a
          href="https://celestialsanctumparish.org"
          class="text-sanctum-blue hover:text-sanctum-burgundy transition-colors underline decoration-sanctum-gold underline-offset-4"
        >
          celestialsanctumparish.org
        </a>
        is the source of truth.
      </p>
      <div class="flex flex-wrap gap-3 justify-center">
        <a sanctumBtn variant="primary" href="/">Home</a>
        <a sanctumBtn variant="ghost" href="/__styleguide">Design System</a>
      </div>
      <div class="flex justify-center mt-12">
        <sanctum-mark [size]="56" />
      </div>
    </section>
  `,
})
export class ComingSoon {
  private route = inject(ActivatedRoute);

  protected titleText = toSignal(
    this.route.url.pipe(
      map((segments) => {
        if (!segments.length) return 'Coming Soon';
        const last = segments[segments.length - 1].path;
        return last
          .split('-')
          .map((p) => p[0]?.toUpperCase() + p.slice(1))
          .join(' ');
      }),
    ),
    { initialValue: 'Coming Soon' },
  );
}
