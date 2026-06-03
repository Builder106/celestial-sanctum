import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/firebase/auth.service';
import { RequestService } from '../../core/firebase/request.service';
import { SeoService } from '../../core/seo/seo.service';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumButton } from '../../shared/ui/button';
import { Card } from '../../shared/ui/card';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { SanctumMark } from '../../shared/ui/sanctum-mark';

const KINDS = [
  { value: 'naming', label: 'Naming ceremony' },
  { value: 'matrimony', label: 'Holy matrimony (wedding)' },
  { value: 'thanksgiving', label: 'Thanksgiving service' },
  { value: 'dedication', label: 'Child dedication' },
  { value: 'house-blessing', label: 'House blessing' },
  { value: 'funeral', label: 'Funeral or memorial' },
  { value: 'other', label: 'Another service' },
] as const;

/**
 * Request a parish service / sacrament — naming, matrimony, thanksgiving, etc.
 *
 * Writes to the shared `requests` collection with category 'service'; lands in
 * the same clergy inbox as pastoral requests. Sign-in required.
 */
@Component({
  selector: 'sanctum-service-request',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Card, Display, Eyebrow, SanctumButton, SanctumMark, SanctumReveal],
  template: `
    <section sanctumReveal class="pt-24 md:pt-32 pb-10 px-6 max-w-2xl mx-auto text-center">
      <div class="flex justify-center mb-6"><sanctum-mark [size]="52" /></div>
      <sanctum-eyebrow class="mb-5">Sacraments &amp; Services</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-6">
        <h1>Request a <span class="italic text-sanctum-burgundy">service.</span></h1>
      </sanctum-display>
      <p class="font-body text-lg text-sanctum-muted leading-relaxed max-w-xl mx-auto">
        Ask the clergy to arrange a naming, matrimony, thanksgiving, dedication, and more. Tell us
        the details and your preferred date — the clergy will follow up to confirm.
      </p>
    </section>

    <section class="px-6 pb-24 max-w-xl mx-auto">
      @if (!auth.signedIn()) {
        <sanctum-card variant="cream" class="block text-center">
          <p class="font-body text-base text-sanctum-ink/85 mb-5">
            Sign in to request a parish service.
          </p>
          <a sanctumBtn variant="primary" size="md" routerLink="/profile">Sign in</a>
        </sanctum-card>
      } @else if (submitted()) {
        <sanctum-card variant="paper" class="block text-center">
          <div class="flex justify-center mb-5"><sanctum-mark [size]="44" tone="mono-gold" /></div>
          <p class="font-body text-lg text-sanctum-ink mb-2">Your request has been received.</p>
          <p class="font-body text-sm text-sanctum-muted mb-6">
            The clergy will follow up to arrange the details. Grace and peace.
          </p>
          <a sanctumBtn variant="ghost" size="sm" routerLink="/profile">Back to profile</a>
        </sanctum-card>
      } @else {
        <sanctum-card variant="paper" class="block">
          <label class="block mb-5">
            <span class="font-body text-xs uppercase tracking-[0.22em] text-sanctum-gold font-semibold">
              Which service?
            </span>
            <select
              [value]="kind()"
              (change)="kind.set($any($event.target).value)"
              class="mt-3 w-full rounded-sm border border-sanctum-rule bg-sanctum-cream/40 p-3 font-body text-base text-sanctum-ink focus:border-sanctum-gold focus:outline-none"
            >
              @for (k of kinds; track k.value) {
                <option [value]="k.value">{{ k.label }}</option>
              }
            </select>
          </label>
          <label class="block mb-5">
            <span class="font-body text-xs uppercase tracking-[0.22em] text-sanctum-gold font-semibold">
              Details
            </span>
            <textarea
              [value]="message()"
              (input)="message.set($any($event.target).value)"
              [attr.maxlength]="2000"
              rows="5"
              placeholder="Names involved, your preferred date, and any details…"
              class="mt-3 w-full resize-none rounded-sm border border-sanctum-rule bg-sanctum-cream/40 p-4 font-body text-base text-sanctum-ink placeholder:text-sanctum-muted focus:border-sanctum-gold focus:outline-none"
            ></textarea>
          </label>
          <label class="block mb-5">
            <span class="font-body text-xs uppercase tracking-[0.22em] text-sanctum-gold font-semibold">
              Preferred contact (optional)
            </span>
            <input
              [value]="contact()"
              (input)="contact.set($any($event.target).value)"
              type="text"
              placeholder="Phone or email"
              class="mt-3 w-full rounded-sm border border-sanctum-rule bg-sanctum-cream/40 p-3 font-body text-base text-sanctum-ink placeholder:text-sanctum-muted focus:border-sanctum-gold focus:outline-none"
            />
          </label>
          @if (error()) {
            <p class="mb-4 font-body text-sm text-sanctum-burgundy">{{ error() }}</p>
          }
          <div class="flex justify-end">
            <button
              sanctumBtn
              variant="primary"
              size="md"
              [disabled]="!canSend() || sending()"
              (click)="send()"
            >
              {{ sending() ? 'Sending…' : 'Send request' }}
            </button>
          </div>
        </sanctum-card>
      }
    </section>
  `,
})
export class ServiceRequest {
  protected readonly auth = inject(AuthService);
  private readonly requests = inject(RequestService);
  private readonly seo = inject(SeoService);

  protected readonly kinds = KINDS;
  protected readonly kind = signal<string>('naming');
  protected readonly message = signal('');
  protected readonly contact = signal('');
  protected readonly sending = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly canSend = computed(() => this.message().trim().length > 0);

  constructor() {
    this.seo.set({
      title: 'Request a Service',
      description:
        'Request a parish service or sacrament from Celestial Sanctum Parish — naming, matrimony, thanksgiving, dedication, and more.',
      path: '/request-service',
      noindex: true,
    });
    this.auth.init();
  }

  protected async send(): Promise<void> {
    if (!this.canSend() || this.sending()) return;
    this.sending.set(true);
    this.error.set(null);
    try {
      await this.requests.submit({
        category: 'service',
        kind: this.kind(),
        message: this.message(),
        contact: this.contact(),
      });
      this.submitted.set(true);
    } catch {
      this.error.set('Your request didn’t send. Please try again.');
    } finally {
      this.sending.set(false);
    }
  }
}
