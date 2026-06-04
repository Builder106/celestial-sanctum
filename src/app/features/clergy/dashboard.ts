import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/firebase/auth.service';
import { RoleService } from '../../core/firebase/role.service';
import { RequestService } from '../../core/firebase/request.service';
import { PrayerService } from '../../core/firebase/prayer.service';
import { SeoService } from '../../core/seo/seo.service';
import { SanctumCascade } from '../../core/motion/cascade.directive';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumButton } from '../../shared/ui/button';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { SanctumMark } from '../../shared/ui/sanctum-mark';

/**
 * Clergy dashboard — one hub for the parish-staff tools, instead of scattered
 * links on the Profile. Clergy-gated (RoleService + the rules behind each
 * tool). Loads the inbox count for an at-a-glance "new requests" badge.
 */
@Component({
  selector: 'sanctum-clergy-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Display, Eyebrow, SanctumButton, SanctumMark, SanctumCascade, SanctumReveal],
  template: `
    <section sanctumReveal class="pt-24 md:pt-32 pb-10 px-6 max-w-4xl mx-auto text-center">
      <div class="flex justify-center mb-6"><sanctum-mark [size]="52" /></div>
      <sanctum-eyebrow class="mb-5">Clergy</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-4"><h1>Parish <span class="italic text-sanctum-burgundy">dashboard.</span></h1></sanctum-display>
      @if (firstName()) {
        <p class="font-body text-lg text-sanctum-muted">Welcome back, {{ firstName() }}.</p>
      }
    </section>

    <section class="px-6 pb-24 max-w-4xl mx-auto">
      @if (loading()) {
        <p class="text-center font-body text-sanctum-muted py-16">Loading…</p>
      } @else if (!auth.signedIn()) {
        <div class="max-w-md mx-auto text-center p-8 rounded-sm border border-sanctum-rule bg-sanctum-cream/60">
          <p class="font-body text-base text-sanctum-ink/85 mb-5">Sign in with a clergy account to open the dashboard.</p>
          <a sanctumBtn variant="primary" size="sm" routerLink="/profile">Sign in</a>
        </div>
      } @else if (!role.isClergy()) {
        <div class="max-w-md mx-auto text-center p-8 rounded-sm border border-sanctum-rule bg-sanctum-cream/60">
          <p class="font-body text-base text-sanctum-ink/85 mb-2">This area is for parish clergy.</p>
          <a sanctumBtn variant="primary" size="sm" routerLink="/profile">Back to profile</a>
        </div>
      } @else {
        <div sanctumCascade stagger="default" class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <a
            routerLink="/clergy/inbox"
            class="block p-7 rounded-sm border border-sanctum-rule bg-sanctum-paper hover:border-sanctum-gold hover:-translate-y-0.5 transition-all duration-300"
          >
            <div class="flex items-center justify-between gap-3 mb-2">
              <h2 class="font-display text-2xl text-sanctum-ink">Requests</h2>
              @if (newCount() > 0) {
                <span class="font-body text-[11px] uppercase tracking-[0.18em] text-sanctum-cream bg-sanctum-burgundy rounded-sm px-2 py-1">
                  {{ newCount() }} new
                </span>
              }
            </div>
            <p class="font-body text-sm text-sanctum-muted leading-relaxed">
              Pastoral notes + service requests from members.
            </p>
          </a>

          <a
            routerLink="/clergy/reports"
            class="block p-7 rounded-sm border border-sanctum-rule bg-sanctum-paper hover:border-sanctum-gold hover:-translate-y-0.5 transition-all duration-300"
          >
            <div class="flex items-center justify-between gap-3 mb-2">
              <h2 class="font-display text-2xl text-sanctum-ink">Reports</h2>
              @if (reportCount() > 0) {
                <span class="font-body text-[11px] uppercase tracking-[0.18em] text-sanctum-cream bg-sanctum-burgundy rounded-sm px-2 py-1">
                  {{ reportCount() }}
                </span>
              }
            </div>
            <p class="font-body text-sm text-sanctum-muted leading-relaxed">
              Prayers members have flagged for review.
            </p>
          </a>

          <a
            routerLink="/clergy/devotional"
            class="block p-7 rounded-sm border border-sanctum-rule bg-sanctum-paper hover:border-sanctum-gold hover:-translate-y-0.5 transition-all duration-300"
          >
            <h2 class="font-display text-2xl text-sanctum-ink mb-2">Daily devotional</h2>
            <p class="font-body text-sm text-sanctum-muted leading-relaxed">
              Publish today's reflection — subscribers can be notified.
            </p>
          </a>

          <a
            routerLink="/clergy/notify"
            class="block p-7 rounded-sm border border-sanctum-rule bg-sanctum-paper hover:border-sanctum-gold hover:-translate-y-0.5 transition-all duration-300"
          >
            <h2 class="font-display text-2xl text-sanctum-ink mb-2">Send a notification</h2>
            <p class="font-body text-sm text-sanctum-muted leading-relaxed">
              Broadcast a push to a category of subscribers.
            </p>
          </a>

          <a
            routerLink="/prayers"
            class="block p-7 rounded-sm border border-sanctum-rule bg-sanctum-cream/50 hover:border-sanctum-gold hover:-translate-y-0.5 transition-all duration-300"
          >
            <h2 class="font-display text-2xl text-sanctum-ink mb-2">Prayer wall</h2>
            <p class="font-body text-sm text-sanctum-muted leading-relaxed">
              Read the wall and moderate — you can remove any prayer.
            </p>
          </a>
        </div>
      }
    </section>
  `,
})
export class ClergyDashboard {
  protected readonly auth = inject(AuthService);
  protected readonly role = inject(RoleService);
  private readonly requests = inject(RequestService);
  private readonly prayers = inject(PrayerService);
  private readonly seo = inject(SeoService);

  protected readonly loading = signal(true);
  protected readonly newCount = signal(0);
  protected readonly reportCount = signal(0);
  protected readonly firstName = computed(() => {
    const name = this.auth.user()?.displayName ?? '';
    return name.split(' ')[0] ?? '';
  });

  constructor() {
    this.seo.set({
      title: 'Clergy Dashboard',
      description: 'Parish clergy tools.',
      path: '/clergy',
      noindex: true,
    });
    this.auth.init();
    afterNextRender(() => void this.init());
  }

  private async init(): Promise<void> {
    try {
      for (let i = 0; i < 50 && !this.auth.ready(); i++) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (this.auth.signedIn()) {
        await this.role.refresh();
        if (this.role.isClergy()) {
          const [inbox, reports] = await Promise.all([
            this.requests.listInbox(),
            this.prayers.reportCount(),
          ]);
          this.newCount.set(inbox.filter((r) => r.status === 'new').length);
          this.reportCount.set(reports);
        }
      }
    } catch {
      /* ignore — non-clergy reads are denied by the rules */
    } finally {
      this.loading.set(false);
    }
  }
}
