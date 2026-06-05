import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/firebase/auth.service';
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
 * Notification preferences — the member picks which categories they want, and
 * (optionally) enables push on this device. Saved to `notificationPrefs/{uid}`;
 * the backend reads it to target sends. Sign-in required.
 */
@Component({
  selector: 'sanctum-notifications',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Card, Display, Eyebrow, SanctumButton, SanctumMark, SanctumReveal],
  template: `
    <section sanctumReveal class="pt-24 md:pt-32 pb-10 px-6 max-w-2xl mx-auto text-center">
      <div class="flex justify-center mb-6"><sanctum-mark [size]="52" /></div>
      <sanctum-eyebrow class="mb-5">Notifications</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-6"><h1>Stay in the <span class="italic text-sanctum-burgundy">loop.</span></h1></sanctum-display>
      <p class="font-body text-lg text-sanctum-muted leading-relaxed max-w-xl mx-auto">
        Choose what the parish notifies you about. You're in control — change it anytime.
      </p>
    </section>

    <section class="px-6 pb-24 max-w-xl mx-auto">
      @if (loading()) {
        <p class="text-center font-body text-sanctum-muted py-16">Loading…</p>
      } @else if (!auth.signedIn()) {
        <sanctum-card variant="cream" class="block text-center">
          <p class="font-body text-base text-sanctum-ink/85 mb-5">Sign in to manage your notifications.</p>
          <a sanctumBtn variant="primary" size="md" routerLink="/profile">Sign in</a>
        </sanctum-card>
      } @else {
        <sanctum-card variant="paper" class="block mb-6">
          @if (messaging.token()) {
            <p class="font-body text-sm text-sanctum-gold font-semibold">
              ✓ Push notifications are on for this device.
            </p>
          } @else {
            <p class="font-body text-base text-sanctum-ink/85 mb-4">
              Turn on push notifications to receive the alerts you choose below.
            </p>
            <button sanctumBtn variant="primary" size="md" [disabled]="enabling()" (click)="enablePush()">
              {{ enabling() ? 'Enabling…' : 'Enable notifications' }}
            </button>
            @if (pushError()) {
              <p class="mt-3 font-body text-sm text-sanctum-burgundy">{{ pushError() }}</p>
            }
          }
        </sanctum-card>

        <div class="flex flex-col gap-3">
          @for (c of cats; track c.id) {
            <label
              class="flex items-start gap-3 p-4 rounded-sm border border-sanctum-rule bg-sanctum-paper cursor-pointer"
            >
              <input
                type="checkbox"
                [checked]="categories()[c.id]"
                (change)="toggle(c.id)"
                class="mt-1 accent-sanctum-burgundy h-4 w-4 shrink-0"
              />
              <span>
                <span class="block font-body text-sm font-semibold text-sanctum-ink">{{ c.label }}</span>
                <span class="block font-body text-sm text-sanctum-muted">{{ c.description }}</span>
              </span>
            </label>
          }
        </div>

        @if (saved()) {
          <p class="mt-5 text-center font-body text-sm text-sanctum-gold font-semibold">
            Preferences saved.
          </p>
        }
      }
    </section>
  `,
})
export class Notifications {
  protected readonly auth = inject(AuthService);
  protected readonly messaging = inject(MessagingService);
  private readonly seo = inject(SeoService);

  protected readonly cats = NOTIFICATION_CATEGORIES;
  protected readonly categories = signal<Record<NotificationCategory, boolean>>(
    this.messaging.emptyPrefs(),
  );
  protected readonly loading = signal(true);
  protected readonly enabling = signal(false);
  protected readonly saved = signal(false);
  protected readonly pushError = signal<string | null>(null);

  constructor() {
    this.seo.set({
      title: 'Notifications',
      description: 'Manage your Celestial Sanctum Parish notification preferences.',
      path: '/notifications',
      noindex: true,
    });
    this.auth.init();
    afterNextRender(() => void this.load());
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    try {
      for (let i = 0; i < 50 && !this.auth.ready(); i++) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (this.auth.signedIn()) {
        this.categories.set(await this.messaging.loadPrefs());
        // If this device already has OS permission, silently (re)register the
        // FCM token so the "on" state reflects a real token — and so any prior
        // subscription saved without one (the old permission-only path) heals.
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            const token = await this.messaging.requestAndRegister();
            if (token) await this.persist();
          } catch {
            /* unsupported / blocked — the UI falls back to the Enable button */
          }
        }
      }
    } catch {
      /* ignore */
    } finally {
      this.loading.set(false);
    }
  }

  protected async enablePush(): Promise<void> {
    if (this.enabling()) return;
    this.enabling.set(true);
    this.pushError.set(null);
    try {
      const token = await this.messaging.requestAndRegister();
      if (token) {
        await this.persist();
      } else {
        this.pushError.set('Couldn’t turn on notifications. Please try again.');
      }
    } catch (e) {
      this.pushError.set(
        e instanceof Error ? e.message : 'Couldn’t turn on notifications. Please try again.',
      );
    } finally {
      this.enabling.set(false);
    }
  }

  protected async toggle(id: NotificationCategory): Promise<void> {
    this.categories.update((c) => ({ ...c, [id]: !c[id] }));
    await this.persist();
  }

  private async persist(): Promise<void> {
    try {
      await this.messaging.savePrefs(this.categories());
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2000);
    } catch {
      /* ignore */
    }
  }
}
