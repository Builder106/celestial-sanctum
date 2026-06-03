import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { PrayerService, type Prayer } from '../../core/firebase/prayer.service';
import { SeoService } from '../../core/seo/seo.service';
import { SanctumCascade } from '../../core/motion/cascade.directive';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { Card } from '../../shared/ui/card';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { SanctumMark } from '../../shared/ui/sanctum-mark';
import { relativeTime } from '../prayers/prayer.util';

/**
 * Testimonies — answered prayers from the wall.
 *
 * Read-only view of prayers their authors have marked answered (newest first).
 * Public read, like the wall; fetches on the browser after hydration.
 */
@Component({
  selector: 'sanctum-testimonies',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Card, Display, Eyebrow, SanctumMark, SanctumCascade, SanctumReveal],
  template: `
    <section sanctumReveal class="pt-24 md:pt-32 pb-10 px-6 max-w-3xl mx-auto text-center">
      <div class="flex justify-center mb-6"><sanctum-mark [size]="52" /></div>
      <sanctum-eyebrow class="mb-5">Testimonies</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-6">
        <h1>Answered <span class="italic text-sanctum-burgundy">prayers.</span></h1>
      </sanctum-display>
      <p class="font-body text-lg text-sanctum-muted leading-relaxed max-w-xl mx-auto">
        Praise reports from the parish family — prayers the Lord has answered.
      </p>
      <p class="mt-6">
        <a
          routerLink="/prayers"
          class="font-body text-xs uppercase tracking-[0.22em] font-semibold text-sanctum-blue hover:text-sanctum-burgundy transition-colors"
        >
          ← Back to the prayer wall
        </a>
      </p>
    </section>

    <section class="px-6 pb-24 max-w-2xl mx-auto">
      @if (loading()) {
        <p class="text-center font-body text-sanctum-muted py-16">Gathering testimonies…</p>
      } @else if (list().length === 0) {
        <div class="text-center py-16">
          <div class="flex justify-center mb-5"><sanctum-mark [size]="40" tone="mono-gold" /></div>
          <p class="font-body text-lg text-sanctum-muted">
            No testimonies yet — answered prayers will appear here.
          </p>
        </div>
      } @else {
        <div sanctumCascade stagger="tight" class="flex flex-col gap-5">
          @for (t of list(); track t.id) {
            <sanctum-card variant="paper" class="block">
              <p class="font-body text-lg text-sanctum-ink leading-relaxed whitespace-pre-line">
                {{ t.text }}
              </p>
              <div class="mt-5 flex items-center justify-between gap-4 flex-wrap">
                <p class="font-body text-xs uppercase tracking-[0.18em] text-sanctum-muted">
                  {{ t.isAnonymous ? 'Anonymous' : t.authorName || 'A member'
                  }}@if (t.answeredAt) { · answered {{ rel(t.answeredAt) }} }
                </p>
                <span class="font-body text-xs uppercase tracking-[0.18em] text-sanctum-gold">
                  Answered
                </span>
              </div>
            </sanctum-card>
          }
        </div>
      }
    </section>
  `,
})
export class Testimonies {
  private readonly prayers = inject(PrayerService);
  private readonly seo = inject(SeoService);

  protected readonly list = signal<Prayer[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.seo.set({
      title: 'Testimonies',
      description:
        'Answered prayers and praise reports from the Celestial Sanctum Parish family.',
      path: '/testimonies',
      noindex: true,
    });
    afterNextRender(() => void this.load());
  }

  protected rel(d: Date): string {
    return relativeTime(d);
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.list.set(await this.prayers.listTestimonies());
    } catch {
      /* leave empty on failure */
    } finally {
      this.loading.set(false);
    }
  }
}
