import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/firebase/auth.service';
import { RoleService } from '../../core/firebase/role.service';
import { RequestService, type ParishRequest } from '../../core/firebase/request.service';
import { SeoService } from '../../core/seo/seo.service';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumButton } from '../../shared/ui/button';
import { Card } from '../../shared/ui/card';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { SanctumMark } from '../../shared/ui/sanctum-mark';
import { ConfirmService } from '../../shared/ui/confirm';
import { relativeTime } from '../prayers/prayer.util';

/**
 * Clergy inbox — the confidential member→clergy requests (pastoral + service).
 *
 * Clergy-only: the component gates on RoleService, and the Firestore rules deny
 * the list query to anyone who isn't clergy regardless. Loads after hydration.
 */
@Component({
  selector: 'sanctum-clergy-inbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Card, Display, Eyebrow, SanctumButton, SanctumMark, SanctumReveal],
  template: `
    <section sanctumReveal class="pt-24 md:pt-32 pb-10 px-6 max-w-3xl mx-auto text-center">
      <div class="flex justify-center mb-6"><sanctum-mark [size]="52" /></div>
      <sanctum-eyebrow class="mb-5">Clergy</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-6"><h1>Requests <span class="italic text-sanctum-burgundy">inbox.</span></h1></sanctum-display>
    </section>

    <section class="px-6 pb-24 max-w-2xl mx-auto">
      @if (loading()) {
        <p class="text-center font-body text-sanctum-muted py-16">Loading…</p>
      } @else if (!auth.signedIn()) {
        <sanctum-card variant="cream" class="block text-center">
          <p class="font-body text-base text-sanctum-ink/85 mb-5">Sign in with a clergy account to view the inbox.</p>
          <a sanctumBtn variant="primary" size="sm" routerLink="/profile">Sign in</a>
        </sanctum-card>
      } @else if (!role.isClergy()) {
        <sanctum-card variant="cream" class="block text-center">
          <p class="font-body text-base text-sanctum-ink/85 mb-2">This inbox is for parish clergy.</p>
          <p class="font-body text-sm text-sanctum-muted mb-5">
            If you'd like to reach the clergy, send a request from Pastoral Care.
          </p>
          <a sanctumBtn variant="primary" size="sm" routerLink="/pastoral">Pastoral Care</a>
        </sanctum-card>
      } @else if (list().length === 0) {
        <div class="text-center py-16">
          <div class="flex justify-center mb-5"><sanctum-mark [size]="40" tone="mono-gold" /></div>
          <p class="font-body text-lg text-sanctum-muted">No requests yet.</p>
        </div>
      } @else {
        <div class="flex flex-col gap-5">
          @for (r of list(); track r.id) {
            <sanctum-card variant="paper" class="block">
              <div class="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <span class="font-body text-[11px] uppercase tracking-[0.22em] font-semibold text-sanctum-blue">
                  {{ r.category }} · {{ r.kind }}
                </span>
                <span
                  class="font-body text-[11px] uppercase tracking-[0.18em]"
                  [class.text-sanctum-gold]="r.status === 'new'"
                  [class.text-sanctum-muted]="r.status !== 'new'"
                >
                  {{ r.status === 'new' ? 'New' : 'Handled' }}
                </span>
              </div>
              <p class="font-body text-base text-sanctum-ink leading-relaxed whitespace-pre-line mb-4">
                {{ r.message }}
              </p>
              <div class="font-body text-sm text-sanctum-muted space-y-0.5 mb-4">
                <p>From: {{ r.name }}@if (r.createdAt) { · {{ rel(r.createdAt) }} }</p>
                @if (r.authorEmail) {
                  <p>
                    Email:
                    <a [href]="'mailto:' + r.authorEmail" class="text-sanctum-blue hover:text-sanctum-burgundy">{{ r.authorEmail }}</a>
                  </p>
                }
                @if (r.contact) { <p>Preferred: {{ r.contact }}</p> }
              </div>
              <div class="flex items-center gap-4">
                @if (r.status === 'new') {
                  <button
                    type="button"
                    (click)="markHandled(r)"
                    class="font-body text-xs uppercase tracking-[0.18em] text-sanctum-gold hover:text-sanctum-burgundy transition-colors"
                  >
                    Mark handled
                  </button>
                }
                <button
                  type="button"
                  (click)="remove(r)"
                  class="font-body text-xs uppercase tracking-[0.18em] text-sanctum-muted hover:text-sanctum-burgundy transition-colors"
                >
                  Delete
                </button>
              </div>
            </sanctum-card>
          }
        </div>
      }
    </section>
  `,
})
export class ClergyInbox {
  protected readonly auth = inject(AuthService);
  private readonly confirmSvc = inject(ConfirmService);
  protected readonly role = inject(RoleService);
  private readonly requests = inject(RequestService);
  private readonly seo = inject(SeoService);

  protected readonly list = signal<ParishRequest[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.seo.set({
      title: 'Clergy Inbox',
      description: 'Parish clergy request inbox.',
      path: '/clergy/inbox',
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
      // Wait for Firebase to restore the session before deciding clergy status.
      for (let i = 0; i < 50 && !this.auth.ready(); i++) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (this.auth.signedIn()) {
        await this.role.refresh();
        if (this.role.isClergy()) {
          this.list.set(await this.requests.listInbox());
        }
      }
    } catch {
      /* ignore — non-clergy reads are denied by the rules */
    } finally {
      this.loading.set(false);
    }
  }

  protected async markHandled(r: ParishRequest): Promise<void> {
    try {
      await this.requests.markHandled(r.id);
      this.list.update((l) =>
        l.map((x) => (x.id === r.id ? { ...x, status: 'handled' as const } : x)),
      );
    } catch {
      /* ignore */
    }
  }

  protected async remove(r: ParishRequest): Promise<void> {
    const ok = await this.confirmSvc.confirm({
      message: 'Delete this request?',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await this.requests.remove(r.id);
      this.list.update((l) => l.filter((x) => x.id !== r.id));
    } catch {
      /* ignore */
    }
  }
}
