import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/firebase/auth.service';
import { DevotionalService, type Devotional } from '../../core/firebase/devotional.service';
import { SeoService } from '../../core/seo/seo.service';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumButton } from '../../shared/ui/button';
import { Card } from '../../shared/ui/card';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { SanctumMark } from '../../shared/ui/sanctum-mark';

/**
 * Daily Devotional — the member-facing reader.
 *
 * Shows the latest clergy-published devotional (public read). Signed-in members
 * can mark it read to advance a consecutive-day streak.
 */
@Component({
  selector: 'sanctum-devotional',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Card, Display, Eyebrow, SanctumButton, SanctumMark, SanctumReveal],
  template: `
    <section sanctumReveal class="pt-24 md:pt-32 pb-10 px-6 max-w-2xl mx-auto text-center">
      <div class="flex justify-center mb-6"><sanctum-mark [size]="52" /></div>
      <sanctum-eyebrow class="mb-5">Daily Devotional</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-2"><h1>Daily <span class="italic text-sanctum-burgundy">bread.</span></h1></sanctum-display>
      @if (streak() > 0) {
        <p class="mt-4 font-body text-xs uppercase tracking-[0.22em] text-sanctum-gold font-semibold">
          {{ streak() }}-day reading streak
        </p>
      }
    </section>

    <section class="px-6 pb-24 max-w-2xl mx-auto">
      @if (loading()) {
        <p class="text-center font-body text-sanctum-muted py-16">Loading today's devotional…</p>
      } @else if (!devotional()) {
        <div class="text-center py-16">
          <div class="flex justify-center mb-5"><sanctum-mark [size]="40" tone="mono-gold" /></div>
          <p class="font-body text-lg text-sanctum-muted">No devotional yet — check back soon.</p>
        </div>
      } @else {
        @let d = devotional()!;
        <sanctum-card variant="paper" class="block">
          <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-gold font-semibold mb-3">
            {{ d.reference }}
          </p>
          <h2 class="font-display text-3xl md:text-4xl text-sanctum-ink leading-[1.15] mb-5 tracking-[-0.01em]">
            {{ d.title }}
          </h2>
          <div class="font-body text-lg text-sanctum-ink/85 leading-[1.75] whitespace-pre-line">
            {{ d.body }}
          </div>
          <p class="mt-6 font-body text-xs uppercase tracking-[0.18em] text-sanctum-muted">
            {{ d.authorName }}@if (d.date) { · {{ d.date }} }
          </p>
        </sanctum-card>

        <div class="mt-8 text-center">
          @if (auth.signedIn()) {
            @if (readToday()) {
              <p class="font-body text-sm text-sanctum-gold font-semibold">
                ✓ Read today — grace and peace.
              </p>
            } @else {
              <button sanctumBtn variant="primary" size="md" [disabled]="marking()" (click)="markRead()">
                {{ marking() ? 'Saving…' : 'Mark as read' }}
              </button>
            }
          } @else {
            <p class="font-body text-sm text-sanctum-muted">
              <a routerLink="/profile" class="text-sanctum-blue hover:text-sanctum-burgundy underline"
                >Sign in</a
              >
              to build a reading streak.
            </p>
          }
        </div>
      }
    </section>
  `,
})
export class DevotionalPage {
  protected readonly auth = inject(AuthService);
  private readonly devotionals = inject(DevotionalService);
  private readonly seo = inject(SeoService);

  protected readonly devotional = signal<Devotional | null>(null);
  protected readonly loading = signal(true);
  protected readonly streak = signal(0);
  protected readonly readToday = signal(false);
  protected readonly marking = signal(false);

  constructor() {
    this.seo.set({
      title: 'Daily Devotional',
      description: 'A daily scripture and reflection from Celestial Sanctum Parish.',
      path: '/devotional',
      noindex: true,
    });
    this.auth.init();
    afterNextRender(() => void this.load());
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      this.devotional.set(await this.devotionals.latest());
      for (let i = 0; i < 50 && !this.auth.ready(); i++) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (this.auth.signedIn()) {
        const s = await this.devotionals.readState();
        this.streak.set(s.streak);
        this.readToday.set(s.readToday);
      }
    } catch {
      /* ignore */
    } finally {
      this.loading.set(false);
    }
  }

  protected async markRead(): Promise<void> {
    if (this.marking()) return;
    this.marking.set(true);
    try {
      const s = await this.devotionals.markReadToday();
      this.streak.set(s.streak);
      this.readToday.set(true);
    } catch {
      /* ignore */
    } finally {
      this.marking.set(false);
    }
  }
}
