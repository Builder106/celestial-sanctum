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
import { DevotionalService, type Devotional } from '../../core/firebase/devotional.service';
import { MessagingService } from '../../core/firebase/messaging.service';
import { SeoService } from '../../core/seo/seo.service';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumButton } from '../../shared/ui/button';
import { Card } from '../../shared/ui/card';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { SanctumMark } from '../../shared/ui/sanctum-mark';

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Clergy devotional editor — publish the daily devotional in-app.
 *
 * Clergy-only (gated on RoleService + enforced by the Firestore rules). Writes
 * to the `devotionals` collection that the member reader displays.
 */
@Component({
  selector: 'sanctum-clergy-devotional',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Card, Display, Eyebrow, SanctumButton, SanctumMark, SanctumReveal],
  template: `
    <section sanctumReveal class="pt-24 md:pt-32 pb-10 px-6 max-w-3xl mx-auto text-center">
      <div class="flex justify-center mb-6"><sanctum-mark [size]="52" /></div>
      <sanctum-eyebrow class="mb-5">Clergy</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-6"><h1>Write a <span class="italic text-sanctum-burgundy">devotional.</span></h1></sanctum-display>
    </section>

    <section class="px-6 pb-24 max-w-2xl mx-auto">
      @if (loading()) {
        <p class="text-center font-body text-sanctum-muted py-16">Loading…</p>
      } @else if (!auth.signedIn()) {
        <sanctum-card variant="cream" class="block text-center">
          <p class="font-body text-base text-sanctum-ink/85 mb-5">Sign in with a clergy account to publish a devotional.</p>
          <a sanctumBtn variant="primary" size="sm" routerLink="/profile">Sign in</a>
        </sanctum-card>
      } @else if (!role.isClergy()) {
        <sanctum-card variant="cream" class="block text-center">
          <p class="font-body text-base text-sanctum-ink/85 mb-2">Publishing devotionals is for parish clergy.</p>
          <a sanctumBtn variant="primary" size="sm" routerLink="/devotional">Read today's devotional</a>
        </sanctum-card>
      } @else {
        <sanctum-card variant="paper" class="block mb-8">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <label class="block">
              <span class="font-body text-xs uppercase tracking-[0.22em] text-sanctum-gold font-semibold">Date</span>
              <input
                type="date"
                [value]="date()"
                (input)="date.set($any($event.target).value)"
                class="mt-2 w-full rounded-sm border border-sanctum-rule bg-sanctum-cream/40 p-3 font-body text-base text-sanctum-ink focus:border-sanctum-gold focus:outline-none"
              />
            </label>
            <label class="block">
              <span class="font-body text-xs uppercase tracking-[0.22em] text-sanctum-gold font-semibold">Scripture reference</span>
              <input
                type="text"
                [value]="reference()"
                (input)="reference.set($any($event.target).value)"
                placeholder="e.g. Psalm 23:1"
                class="mt-2 w-full rounded-sm border border-sanctum-rule bg-sanctum-cream/40 p-3 font-body text-base text-sanctum-ink placeholder:text-sanctum-muted focus:border-sanctum-gold focus:outline-none"
              />
            </label>
          </div>
          <label class="block mb-4">
            <span class="font-body text-xs uppercase tracking-[0.22em] text-sanctum-gold font-semibold">Title</span>
            <input
              type="text"
              [value]="title()"
              (input)="title.set($any($event.target).value)"
              placeholder="Devotional title"
              class="mt-2 w-full rounded-sm border border-sanctum-rule bg-sanctum-cream/40 p-3 font-body text-base text-sanctum-ink placeholder:text-sanctum-muted focus:border-sanctum-gold focus:outline-none"
            />
          </label>
          <label class="block mb-5">
            <span class="font-body text-xs uppercase tracking-[0.22em] text-sanctum-gold font-semibold">Reflection</span>
            <textarea
              [value]="body()"
              (input)="body.set($any($event.target).value)"
              rows="8"
              placeholder="Write the day's reflection…"
              class="mt-2 w-full resize-none rounded-sm border border-sanctum-rule bg-sanctum-cream/40 p-4 font-body text-base text-sanctum-ink placeholder:text-sanctum-muted focus:border-sanctum-gold focus:outline-none"
            ></textarea>
          </label>
          <label class="flex items-center gap-2 mb-4 cursor-pointer select-none">
            <input
              type="checkbox"
              [checked]="notify()"
              (change)="notify.set($any($event.target).checked)"
              class="accent-sanctum-burgundy h-4 w-4"
            />
            <span class="font-body text-sm text-sanctum-muted">Notify devotional subscribers when published</span>
          </label>
          @if (notice()) { <p class="mb-4 font-body text-sm text-sanctum-gold font-semibold">{{ notice() }}</p> }
          @if (error()) { <p class="mb-4 font-body text-sm text-sanctum-burgundy">{{ error() }}</p> }
          <div class="flex justify-end">
            <button sanctumBtn variant="primary" size="md" [disabled]="!canPublish() || publishing()" (click)="publish()">
              {{ publishing() ? 'Publishing…' : 'Publish' }}
            </button>
          </div>
        </sanctum-card>

        @if (recent().length > 0) {
          <p class="font-body text-xs uppercase tracking-[0.22em] text-sanctum-muted font-semibold mb-4">Recent</p>
          <div class="flex flex-col gap-3">
            @for (d of recent(); track d.id) {
              <sanctum-card variant="cream" class="block">
                <div class="flex items-center justify-between gap-3">
                  <div>
                    <p class="font-display text-lg text-sanctum-ink">{{ d.title }}</p>
                    <p class="font-body text-xs uppercase tracking-[0.18em] text-sanctum-muted mt-1">
                      {{ d.date }}@if (d.reference) { · {{ d.reference }} }
                    </p>
                  </div>
                  <button
                    type="button"
                    (click)="remove(d)"
                    class="shrink-0 font-body text-xs uppercase tracking-[0.18em] text-sanctum-muted hover:text-sanctum-burgundy transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </sanctum-card>
            }
          </div>
        }
      }
    </section>
  `,
})
export class ClergyDevotional {
  protected readonly auth = inject(AuthService);
  protected readonly role = inject(RoleService);
  private readonly devotionals = inject(DevotionalService);
  private readonly messaging = inject(MessagingService);
  private readonly seo = inject(SeoService);

  protected readonly date = signal(todayKey());
  protected readonly title = signal('');
  protected readonly reference = signal('');
  protected readonly body = signal('');
  protected readonly publishing = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);
  protected readonly notify = signal(true);
  protected readonly recent = signal<Devotional[]>([]);
  protected readonly loading = signal(true);

  protected readonly canPublish = computed(
    () => this.title().trim().length > 0 && this.body().trim().length > 0 && this.date().length > 0,
  );

  constructor() {
    this.seo.set({
      title: 'Write a Devotional',
      description: 'Publish the daily devotional.',
      path: '/clergy/devotional',
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
          this.recent.set(await this.devotionals.recent());
        }
      }
    } catch {
      /* ignore */
    } finally {
      this.loading.set(false);
    }
  }

  protected async publish(): Promise<void> {
    if (!this.canPublish() || this.publishing()) return;
    this.publishing.set(true);
    this.error.set(null);
    this.notice.set(null);
    const devTitle = this.title().trim();
    try {
      await this.devotionals.create({
        date: this.date(),
        title: this.title(),
        reference: this.reference(),
        body: this.body(),
      });
      this.recent.set(await this.devotionals.recent());

      let message = 'Published.';
      if (this.notify()) {
        // Auto-trigger: notify members subscribed to "daily-devotional".
        // Best-effort — a notify failure must not undo the publish.
        try {
          const r = await this.messaging.broadcast(
            'daily-devotional',
            'Daily Devotional',
            devTitle || "Today's devotional is ready.",
          );
          message +=
            r.subscribers > 0
              ? ` Notified ${r.sent} of ${r.subscribers} subscriber(s).`
              : ' No devotional subscribers yet.';
        } catch {
          message += ' (Couldn’t send the notification.)';
        }
      }
      this.notice.set(message);
      this.title.set('');
      this.reference.set('');
      this.body.set('');
    } catch {
      this.error.set('Couldn’t publish. Please try again.');
    } finally {
      this.publishing.set(false);
    }
  }

  protected async remove(d: Devotional): Promise<void> {
    if (typeof window !== 'undefined' && !window.confirm('Delete this devotional?')) return;
    try {
      await this.devotionals.remove(d.id);
      this.recent.update((l) => l.filter((x) => x.id !== d.id));
    } catch {
      this.error.set('Couldn’t delete. Please try again.');
    }
  }
}
