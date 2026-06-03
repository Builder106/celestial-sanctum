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
import {
  MessagingService,
  NOTIFICATION_CATEGORIES,
  type NotificationCategory,
} from '../../core/firebase/messaging.service';
import { SeoService } from '../../core/seo/seo.service';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumButton } from '../../shared/ui/button';
import { Card } from '../../shared/ui/card';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { SanctumMark } from '../../shared/ui/sanctum-mark';

/**
 * Clergy broadcast — compose a push and send it to everyone subscribed to a
 * category. Posts to /api/notify (which re-checks the clergy role server-side).
 */
@Component({
  selector: 'sanctum-clergy-notify',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Card, Display, Eyebrow, SanctumButton, SanctumMark, SanctumReveal],
  template: `
    <section sanctumReveal class="pt-24 md:pt-32 pb-10 px-6 max-w-3xl mx-auto text-center">
      <div class="flex justify-center mb-6"><sanctum-mark [size]="52" /></div>
      <sanctum-eyebrow class="mb-5">Clergy</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-6"><h1>Send a <span class="italic text-sanctum-burgundy">notification.</span></h1></sanctum-display>
    </section>

    <section class="px-6 pb-24 max-w-xl mx-auto">
      @if (loading()) {
        <p class="text-center font-body text-sanctum-muted py-16">Loading…</p>
      } @else if (!auth.signedIn()) {
        <sanctum-card variant="cream" class="block text-center">
          <p class="font-body text-base text-sanctum-ink/85 mb-5">Sign in with a clergy account to send notifications.</p>
          <a sanctumBtn variant="primary" size="sm" routerLink="/profile">Sign in</a>
        </sanctum-card>
      } @else if (!role.isClergy()) {
        <sanctum-card variant="cream" class="block text-center">
          <p class="font-body text-base text-sanctum-ink/85 mb-2">Sending notifications is for parish clergy.</p>
          <a sanctumBtn variant="primary" size="sm" routerLink="/notifications">Your notification settings</a>
        </sanctum-card>
      } @else {
        <sanctum-card variant="paper" class="block">
          <label class="block mb-5">
            <span class="font-body text-xs uppercase tracking-[0.22em] text-sanctum-gold font-semibold">Audience</span>
            <select
              [value]="category()"
              (change)="category.set($any($event.target).value)"
              class="mt-3 w-full rounded-sm border border-sanctum-rule bg-sanctum-cream/40 p-3 font-body text-base text-sanctum-ink focus:border-sanctum-gold focus:outline-none"
            >
              @for (c of cats; track c.id) {
                <option [value]="c.id">{{ c.label }}</option>
              }
            </select>
          </label>
          <label class="block mb-5">
            <span class="font-body text-xs uppercase tracking-[0.22em] text-sanctum-gold font-semibold">Title</span>
            <input
              type="text"
              [value]="title()"
              (input)="title.set($any($event.target).value)"
              [attr.maxlength]="120"
              placeholder="e.g. Sunday service moved to 9 AM"
              class="mt-3 w-full rounded-sm border border-sanctum-rule bg-sanctum-cream/40 p-3 font-body text-base text-sanctum-ink placeholder:text-sanctum-muted focus:border-sanctum-gold focus:outline-none"
            />
          </label>
          <label class="block mb-5">
            <span class="font-body text-xs uppercase tracking-[0.22em] text-sanctum-gold font-semibold">Message</span>
            <textarea
              [value]="body()"
              (input)="body.set($any($event.target).value)"
              [attr.maxlength]="500"
              rows="4"
              placeholder="The notification body…"
              class="mt-3 w-full resize-none rounded-sm border border-sanctum-rule bg-sanctum-cream/40 p-4 font-body text-base text-sanctum-ink placeholder:text-sanctum-muted focus:border-sanctum-gold focus:outline-none"
            ></textarea>
          </label>
          @if (result()) {
            <p class="mb-4 font-body text-sm text-sanctum-gold font-semibold">{{ result() }}</p>
          }
          @if (error()) {
            <p class="mb-4 font-body text-sm text-sanctum-burgundy">{{ error() }}</p>
          }
          <div class="flex justify-end">
            <button sanctumBtn variant="primary" size="md" [disabled]="!canSend() || sending()" (click)="send()">
              {{ sending() ? 'Sending…' : 'Send' }}
            </button>
          </div>
        </sanctum-card>
      }
    </section>
  `,
})
export class ClergyNotify {
  protected readonly auth = inject(AuthService);
  protected readonly role = inject(RoleService);
  private readonly messaging = inject(MessagingService);
  private readonly seo = inject(SeoService);

  protected readonly cats = NOTIFICATION_CATEGORIES;
  protected readonly category = signal<NotificationCategory>('parish-news');
  protected readonly title = signal('');
  protected readonly body = signal('');
  protected readonly sending = signal(false);
  protected readonly result = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly loading = signal(true);

  protected readonly canSend = computed(
    () => this.title().trim().length > 0 && this.body().trim().length > 0,
  );

  constructor() {
    this.seo.set({
      title: 'Send a Notification',
      description: 'Broadcast a push notification to the parish.',
      path: '/clergy/notify',
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
      if (this.auth.signedIn()) await this.role.refresh();
    } catch {
      /* ignore */
    } finally {
      this.loading.set(false);
    }
  }

  protected async send(): Promise<void> {
    if (!this.canSend() || this.sending()) return;
    this.sending.set(true);
    this.result.set(null);
    this.error.set(null);
    try {
      const r = await this.messaging.broadcast(this.category(), this.title(), this.body());
      this.result.set(
        r.subscribers === 0
          ? 'No one is subscribed to that category yet.'
          : `Sent to ${r.sent} of ${r.subscribers} subscriber(s).`,
      );
      this.title.set('');
      this.body.set('');
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Could not send. Please try again.');
    } finally {
      this.sending.set(false);
    }
  }
}
