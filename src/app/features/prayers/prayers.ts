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
import { PrayerService, type Prayer } from '../../core/firebase/prayer.service';
import { SeoService } from '../../core/seo/seo.service';
import { SanctumCascade } from '../../core/motion/cascade.directive';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumButton } from '../../shared/ui/button';
import { Card } from '../../shared/ui/card';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { Icon } from '../../shared/ui/icon';
import { SanctumMark } from '../../shared/ui/sanctum-mark';
import { MAX_PRAYER_LENGTH, relativeTime, validatePrayerText } from './prayer.util';

/**
 * Prayer Wall — the parish's member feature.
 *
 * Public read (anyone can see prayers), members post. Members may post
 * anonymously, tap "I prayed" once per request, report, and delete their own;
 * moderators (members in /admins) delete any. Data lives in Firestore; the
 * page fetches on the browser only (afterNextRender), so SSR renders the
 * signed-out shell. See firestore.rules for the security model.
 */
@Component({
  selector: 'sanctum-prayers',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    Card,
    Display,
    Eyebrow,
    Icon,
    SanctumButton,
    SanctumMark,
    SanctumCascade,
    SanctumReveal,
  ],
  template: `
    <section sanctumReveal class="pt-24 md:pt-32 pb-10 px-6 max-w-3xl mx-auto text-center">
      <div class="flex justify-center mb-6"><sanctum-mark [size]="52" /></div>
      <sanctum-eyebrow class="mb-5">Prayer Wall</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-6">
        <h1>Bear one another's <span class="italic text-sanctum-burgundy">burdens.</span></h1>
      </sanctum-display>
      <p class="font-body text-lg text-sanctum-muted leading-relaxed max-w-xl mx-auto">
        Share a prayer or a praise with the parish family. Every request is held in prayer.
      </p>
    </section>

    <section class="px-6 pb-24 max-w-2xl mx-auto">
      @if (auth.signedIn()) {
        <sanctum-card variant="paper" class="block mb-8">
          <label class="block">
            <span class="font-body text-xs uppercase tracking-[0.22em] text-sanctum-gold font-semibold">
              Share a prayer
            </span>
            <textarea
              [value]="composeText()"
              (input)="composeText.set($any($event.target).value)"
              [attr.maxlength]="maxLen"
              rows="4"
              placeholder="Write your prayer or praise…"
              class="mt-3 w-full resize-none rounded-sm border border-sanctum-rule bg-sanctum-cream/40 p-4 font-body text-base text-sanctum-ink placeholder:text-sanctum-muted focus:border-sanctum-gold focus:outline-none"
            ></textarea>
          </label>
          <div class="mt-3 flex items-center justify-between gap-4">
            <label class="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                [checked]="anon()"
                (change)="anon.set($any($event.target).checked)"
                class="accent-sanctum-burgundy h-4 w-4"
              />
              <span class="font-body text-sm text-sanctum-muted">Post anonymously</span>
            </label>
            <span class="font-body text-xs text-sanctum-muted tabular-nums">
              {{ composeText().length }} / {{ maxLen }}
            </span>
          </div>
          <div class="mt-5 flex justify-end">
            <button
              sanctumBtn
              variant="primary"
              size="md"
              [disabled]="!canPost() || posting()"
              (click)="submit()"
            >
              {{ posting() ? 'Sharing…' : 'Share prayer' }}
            </button>
          </div>
        </sanctum-card>
      } @else {
        <sanctum-card variant="cream" class="block mb-8 text-center">
          <p class="font-body text-base text-sanctum-ink/85 mb-5">
            Sign in to share a prayer request with the parish family.
          </p>
          <a sanctumBtn variant="primary" size="md" routerLink="/profile">Sign in to post</a>
        </sanctum-card>
      }

      @if (error()) {
        <p class="mb-6 text-center font-body text-sm text-sanctum-burgundy">{{ error() }}</p>
      }

      @if (loading()) {
        <p class="text-center font-body text-sanctum-muted py-16">Gathering prayers…</p>
      } @else if (list().length === 0) {
        <div class="text-center py-16">
          <div class="flex justify-center mb-5"><sanctum-mark [size]="40" tone="mono-gold" /></div>
          <p class="font-body text-lg text-sanctum-muted">Be the first to share a prayer.</p>
        </div>
      } @else {
        <div sanctumCascade stagger="tight" class="flex flex-col gap-5">
          @for (p of list(); track p.id) {
            <sanctum-card variant="paper" class="block">
              <p class="font-body text-lg text-sanctum-ink leading-relaxed whitespace-pre-line">
                {{ p.text }}
              </p>
              <div class="mt-5 flex items-center justify-between gap-4 flex-wrap">
                <p class="font-body text-xs uppercase tracking-[0.18em] text-sanctum-muted">
                  {{ p.isAnonymous ? 'Anonymous' : p.authorName || 'A member'
                  }}@if (p.createdAt) { · {{ rel(p.createdAt) }} }
                </p>
                <div class="flex items-center gap-4">
                  <button
                    type="button"
                    (click)="pray(p)"
                    [disabled]="busyPray() === p.id || prayedIds().has(p.id)"
                    [attr.aria-pressed]="prayedIds().has(p.id)"
                    class="inline-flex items-center gap-1.5 font-body text-xs uppercase tracking-[0.18em] transition-colors hover:text-sanctum-burgundy"
                    [class.text-sanctum-burgundy]="prayedIds().has(p.id)"
                    [class.text-sanctum-muted]="!prayedIds().has(p.id)"
                  >
                    <sanctum-icon name="heart" [size]="15" />
                    {{ prayedIds().has(p.id) ? 'Prayed' : 'I prayed'
                    }}@if (p.prayedCount > 0) { · {{ p.prayedCount }} }
                  </button>
                  @if (auth.signedIn()) {
                    @if (reportedIds().has(p.id)) {
                      <span class="font-body text-xs uppercase tracking-[0.18em] text-sanctum-muted">
                        Reported
                      </span>
                    } @else {
                      <button
                        type="button"
                        (click)="report(p)"
                        class="font-body text-xs uppercase tracking-[0.18em] text-sanctum-muted hover:text-sanctum-burgundy transition-colors"
                      >
                        Report
                      </button>
                    }
                  }
                  @if (canRemove(p)) {
                    <button
                      type="button"
                      (click)="remove(p)"
                      class="font-body text-xs uppercase tracking-[0.18em] text-sanctum-muted hover:text-sanctum-burgundy transition-colors"
                    >
                      Remove
                    </button>
                  }
                </div>
              </div>
            </sanctum-card>
          }
        </div>
      }
    </section>
  `,
})
export class PrayerWall {
  protected readonly auth = inject(AuthService);
  private readonly prayers = inject(PrayerService);
  private readonly seo = inject(SeoService);

  protected readonly maxLen = MAX_PRAYER_LENGTH;

  protected readonly list = signal<Prayer[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly composeText = signal('');
  protected readonly anon = signal(false);
  protected readonly posting = signal(false);

  protected readonly prayedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly reportedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly busyPray = signal<string | null>(null);
  protected readonly isAdmin = signal(false);

  protected readonly canPost = computed(() => validatePrayerText(this.composeText()) === null);

  constructor() {
    this.seo.set({
      title: 'Prayer Wall',
      description:
        'Share a prayer request or a praise with the Celestial Sanctum Parish family. Every request is held in prayer.',
      path: '/prayers',
      noindex: true,
    });
    this.auth.init();
    // Firestore is browser-only — fetch after hydration so SSR renders a shell.
    afterNextRender(() => void this.refresh());
  }

  protected rel(d: Date): string {
    return relativeTime(d);
  }

  protected async refresh(): Promise<void> {
    this.loading.set(true);
    try {
      const [items, admin] = await Promise.all([this.prayers.list(), this.prayers.isAdmin()]);
      this.list.set(items);
      this.isAdmin.set(admin);
      if (this.auth.signedIn()) {
        this.prayedIds.set(await this.prayers.prayedPrayerIds(items.map((p) => p.id)));
      }
    } catch {
      this.error.set('We couldn’t load the prayer wall just now. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  protected async submit(): Promise<void> {
    if (this.posting()) return;
    const problem = validatePrayerText(this.composeText());
    if (problem) {
      this.error.set(problem);
      return;
    }
    this.posting.set(true);
    this.error.set(null);
    try {
      const created = await this.prayers.add(this.composeText(), this.anon());
      this.list.update((l) => [created, ...l]);
      this.composeText.set('');
      this.anon.set(false);
    } catch {
      this.error.set('Your prayer didn’t post. Please try again.');
    } finally {
      this.posting.set(false);
    }
  }

  protected async pray(p: Prayer): Promise<void> {
    if (this.busyPray() || this.prayedIds().has(p.id)) return;
    if (!this.auth.signedIn()) {
      this.error.set('Sign in to pray for a request.');
      return;
    }
    this.busyPray.set(p.id);
    try {
      const counted = await this.prayers.pray(p.id);
      this.prayedIds.update((s) => new Set(s).add(p.id));
      if (counted) {
        this.list.update((l) =>
          l.map((x) => (x.id === p.id ? { ...x, prayedCount: x.prayedCount + 1 } : x)),
        );
      }
    } catch {
      /* best-effort; leave count/state unchanged on failure */
    } finally {
      this.busyPray.set(null);
    }
  }

  protected async report(p: Prayer): Promise<void> {
    if (this.reportedIds().has(p.id)) return;
    try {
      await this.prayers.report(p.id);
      this.reportedIds.update((s) => new Set(s).add(p.id));
    } catch {
      this.error.set('Couldn’t submit that report. Please try again.');
    }
  }

  protected canRemove(p: Prayer): boolean {
    return this.isAdmin() || this.auth.user()?.uid === p.authorUid;
  }

  protected async remove(p: Prayer): Promise<void> {
    if (typeof window !== 'undefined' && !window.confirm('Remove this prayer?')) return;
    try {
      await this.prayers.remove(p.id);
      this.list.update((l) => l.filter((x) => x.id !== p.id));
    } catch {
      this.error.set('Couldn’t remove that prayer. Please try again.');
    }
  }
}
