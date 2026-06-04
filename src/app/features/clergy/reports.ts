import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/firebase/auth.service';
import { RoleService } from '../../core/firebase/role.service';
import { PrayerService, type ReportGroup } from '../../core/firebase/prayer.service';
import { SeoService } from '../../core/seo/seo.service';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumButton } from '../../shared/ui/button';
import { Card } from '../../shared/ui/card';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { SanctumMark } from '../../shared/ui/sanctum-mark';
import { relativeTime } from '../prayers/prayer.util';

/**
 * Clergy reports queue — prayers members have flagged, grouped by prayer with
 * a report count. Clergy can remove the prayer or dismiss the report(s).
 * Clergy-gated (RoleService + the rules deny the reports read otherwise).
 */
@Component({
  selector: 'sanctum-clergy-reports',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Card, Display, Eyebrow, SanctumButton, SanctumMark, SanctumReveal],
  template: `
    <section sanctumReveal class="pt-24 md:pt-32 pb-10 px-6 max-w-3xl mx-auto text-center">
      <div class="flex justify-center mb-6"><sanctum-mark [size]="52" /></div>
      <sanctum-eyebrow class="mb-5">Clergy</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-6"><h1>Reported <span class="italic text-sanctum-burgundy">prayers.</span></h1></sanctum-display>
    </section>

    <section class="px-6 pb-24 max-w-2xl mx-auto">
      @if (loading()) {
        <p class="text-center font-body text-sanctum-muted py-16">Loading…</p>
      } @else if (!auth.signedIn()) {
        <sanctum-card variant="cream" class="block text-center">
          <p class="font-body text-base text-sanctum-ink/85 mb-5">Sign in with a clergy account to review reports.</p>
          <a sanctumBtn variant="primary" size="sm" routerLink="/profile">Sign in</a>
        </sanctum-card>
      } @else if (!role.isClergy()) {
        <sanctum-card variant="cream" class="block text-center">
          <p class="font-body text-base text-sanctum-ink/85 mb-2">Reviewing reports is for parish clergy.</p>
          <a sanctumBtn variant="primary" size="sm" routerLink="/clergy">Clergy dashboard</a>
        </sanctum-card>
      } @else if (list().length === 0) {
        <div class="text-center py-16">
          <div class="flex justify-center mb-5"><sanctum-mark [size]="40" tone="mono-gold" /></div>
          <p class="font-body text-lg text-sanctum-muted">No reports — the wall is clear.</p>
        </div>
      } @else {
        <div class="flex flex-col gap-5">
          @for (g of list(); track g.prayerId) {
            <sanctum-card variant="paper" class="block">
              @if (g.prayer) {
                <p class="font-body text-base text-sanctum-ink leading-relaxed whitespace-pre-line mb-3">
                  {{ g.prayer.text }}
                </p>
                <p class="font-body text-xs uppercase tracking-[0.18em] text-sanctum-muted mb-4">
                  {{ g.prayer.isAnonymous ? 'Anonymous' : g.prayer.authorName || 'A member' }}
                </p>
              } @else {
                <p class="font-body text-base italic text-sanctum-muted mb-4">
                  This prayer has already been removed.
                </p>
              }
              <p class="font-body text-xs uppercase tracking-[0.18em] text-sanctum-burgundy font-semibold mb-4">
                {{ g.count }} report{{ g.count === 1 ? '' : 's' }}@if (g.lastReportedAt) { · last {{ rel(g.lastReportedAt) }} }
              </p>
              <div class="flex items-center gap-4">
                @if (g.prayer) {
                  <button
                    type="button"
                    (click)="removePrayer(g)"
                    class="font-body text-xs uppercase tracking-[0.18em] text-sanctum-burgundy hover:text-sanctum-ink transition-colors"
                  >
                    Remove prayer
                  </button>
                }
                <button
                  type="button"
                  (click)="dismiss(g)"
                  class="font-body text-xs uppercase tracking-[0.18em] text-sanctum-muted hover:text-sanctum-burgundy transition-colors"
                >
                  Dismiss report{{ g.count === 1 ? '' : 's' }}
                </button>
              </div>
            </sanctum-card>
          }
        </div>
      }
    </section>
  `,
})
export class ClergyReports {
  protected readonly auth = inject(AuthService);
  protected readonly role = inject(RoleService);
  private readonly prayers = inject(PrayerService);
  private readonly seo = inject(SeoService);

  protected readonly list = signal<ReportGroup[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.seo.set({
      title: 'Reported Prayers',
      description: 'Clergy review queue for flagged prayers.',
      path: '/clergy/reports',
      noindex: true,
    });
    this.auth.init();
    afterNextRender(() => void this.init());
  }

  protected rel(d: Date): string {
    return relativeTime(d);
  }

  private async init(): Promise<void> {
    try {
      for (let i = 0; i < 50 && !this.auth.ready(); i++) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (this.auth.signedIn()) {
        await this.role.refresh();
        if (this.role.isClergy()) {
          this.list.set(await this.prayers.listReports());
        }
      }
    } catch {
      /* ignore — non-clergy reads are denied by the rules */
    } finally {
      this.loading.set(false);
    }
  }

  protected async removePrayer(g: ReportGroup): Promise<void> {
    if (typeof window !== 'undefined' && !window.confirm('Remove this prayer for everyone?')) return;
    try {
      await this.prayers.removeReportedPrayer(g.prayerId, g.reportIds);
      this.list.update((l) => l.filter((x) => x.prayerId !== g.prayerId));
    } catch {
      /* ignore */
    }
  }

  protected async dismiss(g: ReportGroup): Promise<void> {
    try {
      await this.prayers.dismissReports(g.reportIds);
      this.list.update((l) => l.filter((x) => x.prayerId !== g.prayerId));
    } catch {
      /* ignore */
    }
  }
}
