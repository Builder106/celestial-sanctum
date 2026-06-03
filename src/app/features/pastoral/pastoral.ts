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
  { value: 'prayer', label: 'A private prayer request' },
  { value: 'counseling', label: 'Counseling or a conversation' },
  { value: 'visit', label: 'A visit or a call' },
  { value: 'other', label: 'Something else' },
] as const;

/**
 * Pastoral Care — a member sends a confidential request to the clergy.
 *
 * Writes to the shared `requests` collection with category 'pastoral'. Only
 * clergy (and the author) can read it — never public. Posting requires sign-in.
 */
@Component({
  selector: 'sanctum-pastoral',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Card, Display, Eyebrow, SanctumButton, SanctumMark, SanctumReveal],
  template: `
    <section sanctumReveal class="pt-24 md:pt-32 pb-10 px-6 max-w-2xl mx-auto text-center">
      <div class="flex justify-center mb-6"><sanctum-mark [size]="52" /></div>
      <sanctum-eyebrow class="mb-5">Pastoral Care</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-6">
        <h1>We're <span class="italic text-sanctum-burgundy">here for you.</span></h1>
      </sanctum-display>
      <p class="font-body text-lg text-sanctum-muted leading-relaxed max-w-xl mx-auto">
        Send a private note to the parish clergy — a prayer request, a need, or a request for a
        visit. This stays between you and the clergy.
      </p>
    </section>

    <section class="px-6 pb-24 max-w-xl mx-auto">
      @if (!auth.signedIn()) {
        <sanctum-card variant="cream" class="block text-center">
          <p class="font-body text-base text-sanctum-ink/85 mb-5">
            Sign in to send a private request to the clergy.
          </p>
          <a sanctumBtn variant="primary" size="md" routerLink="/profile">Sign in</a>
        </sanctum-card>
      } @else if (submitted()) {
        <sanctum-card variant="paper" class="block text-center">
          <div class="flex justify-center mb-5"><sanctum-mark [size]="44" tone="mono-gold" /></div>
          <p class="font-body text-lg text-sanctum-ink mb-2">Your request has been received.</p>
          <p class="font-body text-sm text-sanctum-muted mb-6">
            A member of the clergy will reach out. Grace and peace.
          </p>
          <a sanctumBtn variant="ghost" size="sm" routerLink="/profile">Back to profile</a>
        </sanctum-card>
      } @else {
        <sanctum-card variant="paper" class="block">
          <label class="block mb-5">
            <span class="font-body text-xs uppercase tracking-[0.22em] text-sanctum-gold font-semibold">
              What do you need?
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
              Your message
            </span>
            <textarea
              [value]="message()"
              (input)="message.set($any($event.target).value)"
              [attr.maxlength]="2000"
              rows="5"
              placeholder="Share as much or as little as you'd like…"
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
          <p class="font-body text-xs text-sanctum-muted mb-5">
            Only parish clergy can see this. It is never posted publicly.
          </p>
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
              {{ sending() ? 'Sending…' : 'Send to clergy' }}
            </button>
          </div>
        </sanctum-card>
      }
    </section>
  `,
})
export class Pastoral {
  protected readonly auth = inject(AuthService);
  private readonly requests = inject(RequestService);
  private readonly seo = inject(SeoService);

  protected readonly kinds = KINDS;
  protected readonly kind = signal<string>('prayer');
  protected readonly message = signal('');
  protected readonly contact = signal('');
  protected readonly sending = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly canSend = computed(() => this.message().trim().length > 0);

  constructor() {
    this.seo.set({
      title: 'Pastoral Care',
      description: 'Send a private request to the clergy of Celestial Sanctum Parish.',
      path: '/pastoral',
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
        category: 'pastoral',
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
