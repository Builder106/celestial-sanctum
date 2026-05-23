import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Icon } from '../ui/icon';
import { SanctumButton } from '../ui/button';
import { Hairline } from '../ui/hairline';
import { SanctumMark } from '../ui/sanctum-mark';
import { SanityService } from '../../core/sanity/sanity.service';
import {
  FOOTER_CONTACT,
  FOOTER_QUICKLINKS,
  FOOTER_RESOURCES,
  SOCIALS,
} from './nav-data';

type NewsletterState = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'sanctum-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, Icon, SanctumButton, Hairline, SanctumMark],
  template: `
    <footer class="relative border-t border-sanctum-rule bg-sanctum-cream pt-24 pb-12">
      <div class="max-w-6xl mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
        <div class="md:col-span-5">
          <a routerLink="/" class="flex items-center gap-3 text-sanctum-ink mb-6">
            <sanctum-mark [size]="48" />
            <span class="font-display italic text-2xl font-medium tracking-tight leading-none">
              Celestial Sanctum Parish
            </span>
          </a>
          <p class="font-body text-base text-sanctum-muted leading-relaxed mb-6 max-w-md">
            A parish under the Celestial Church of Christ — winning and nurturing
            souls for the kingdom of God since 1999.
          </p>
          <address class="not-italic font-body text-sm space-y-3 text-sanctum-muted">
            <p class="flex items-start gap-3">
              <span class="text-sanctum-gold mt-0.5"><sanctum-icon name="map-pin" [size]="16" /></span>
              <span class="text-sanctum-ink">
                {{ streetAddress() }}<br />
                {{ cityRegion() }}
              </span>
            </p>
            <p class="flex items-center gap-3">
              <span class="text-sanctum-gold"><sanctum-icon name="phone" [size]="16" /></span>
              <a
                [href]="'tel:' + phoneHref()"
                class="text-sanctum-ink hover:text-sanctum-burgundy transition-colors"
              >
                {{ phone() }}
              </a>
            </p>
            <p class="flex items-center gap-3">
              <span class="text-sanctum-gold"><sanctum-icon name="mail" [size]="16" /></span>
              <a
                [href]="'mailto:' + email()"
                class="text-sanctum-ink hover:text-sanctum-burgundy transition-colors break-all"
              >
                {{ email() }}
              </a>
            </p>
          </address>
        </div>

        <div class="md:col-span-3">
          <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-blue font-semibold mb-5">
            About
          </p>
          <ul class="space-y-3">
            @for (link of quickLinks; track link.path) {
              <li>
                <a
                  [routerLink]="link.path.split('#')[0]"
                  [fragment]="link.path.split('#')[1]"
                  class="font-body text-sm text-sanctum-ink hover:text-sanctum-burgundy transition-colors"
                >
                  {{ link.label }}
                </a>
              </li>
            }
          </ul>
        </div>

        <div class="md:col-span-4">
          <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-blue font-semibold mb-5">
            Stay In Touch
          </p>
          <p class="font-body text-sm text-sanctum-muted leading-relaxed mb-5">
            Subscribe to Sanctum News for upcoming events, devotionals, and
            choir releases.
          </p>
          @if (newsletterState() === 'sent') {
            <p class="font-body text-sm text-sanctum-ink leading-relaxed mb-8 p-4 border border-sanctum-gold rounded-sm">
              You're on the list. Watch your inbox.
            </p>
          } @else {
            <form class="flex flex-col gap-3 mb-8" (submit)="onNewsletterSubmit($event)">
              <label class="sr-only" for="newsletter-email">Email address</label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                [(ngModel)]="newsletterEmail"
                class="w-full px-4 py-3 bg-sanctum-paper border border-sanctum-rule rounded-sm font-body text-sm text-sanctum-ink placeholder:text-sanctum-muted/60 focus:outline-none focus:border-sanctum-gold transition-colors"
              />
              <!-- Honeypot, hidden from real users -->
              <input
                class="hidden"
                tabindex="-1"
                autocomplete="off"
                aria-hidden="true"
                name="website"
                [(ngModel)]="newsletterHoneypot"
              />
              <button
                sanctumBtn
                type="submit"
                size="sm"
                variant="primary"
                [disabled]="newsletterState() === 'sending'"
              >
                @if (newsletterState() === 'sending') { Subscribing… }
                @else { Subscribe }
              </button>
              @if (newsletterState() === 'error') {
                <p class="font-body text-xs text-sanctum-burgundy">
                  Something went wrong. Try again in a moment.
                </p>
              }
            </form>
          }

          <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-blue font-semibold mb-4">
            Follow
          </p>
          <div class="flex flex-wrap items-center gap-2">
            @for (s of socials; track s.url) {
              <a
                [href]="s.url"
                target="_blank"
                rel="noopener noreferrer"
                [attr.aria-label]="s.label"
                class="w-10 h-10 inline-flex items-center justify-center rounded-full border border-sanctum-rule text-sanctum-muted hover:text-sanctum-burgundy hover:border-sanctum-gold transition-colors"
              >
                <sanctum-icon [name]="s.icon" [size]="16" />
              </a>
            }
          </div>
        </div>
      </div>

      <div class="max-w-6xl mx-auto px-6 md:px-10 mt-16">
        <sanctum-hairline tone="rule" width="full" />
      </div>

      <div
        class="max-w-6xl mx-auto px-6 md:px-10 mt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 font-body text-xs text-sanctum-muted"
      >
        <p>© {{ year() }} Celestial Sanctum Parish. All rights reserved.</p>
        <div class="flex gap-6">
          <a routerLink="/about" fragment="story" class="hover:text-sanctum-ink transition-colors">About</a>
          <a routerLink="/contact" class="hover:text-sanctum-ink transition-colors">Contact</a>
          <a routerLink="/__styleguide" class="hover:text-sanctum-ink transition-colors">Design System</a>
        </div>
      </div>
    </footer>
  `,
})
export class Footer {
  private readonly sanity = inject(SanityService);
  private readonly settingsData = toSignal(this.sanity.siteSettings(), { initialValue: null });

  protected readonly socials = SOCIALS;
  protected readonly quickLinks = FOOTER_QUICKLINKS;
  protected readonly resources = FOOTER_RESOURCES;
  protected readonly year = signal(new Date().getFullYear());

  protected readonly streetAddress = computed(() => this.settingsData()?.streetAddress ?? FOOTER_CONTACT.address);
  protected readonly cityRegion = computed(() => this.settingsData()?.cityRegion ?? FOOTER_CONTACT.city);
  protected readonly phone = computed(() => this.settingsData()?.parishPhone ?? FOOTER_CONTACT.phone);
  protected readonly phoneHref = computed(() => this.settingsData()?.parishPhoneHref ?? FOOTER_CONTACT.phoneHref);
  protected readonly email = computed(() => this.settingsData()?.parishEmail ?? FOOTER_CONTACT.email);

  protected newsletterEmail = '';
  protected newsletterHoneypot = '';
  protected readonly newsletterState = signal<NewsletterState>('idle');

  protected async onNewsletterSubmit(event: SubmitEvent): Promise<void> {
    event.preventDefault();
    if (this.newsletterHoneypot) return;
    const email = this.newsletterEmail.trim();
    if (!email) return;

    this.newsletterState.set('sending');
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, honeypot: this.newsletterHoneypot }),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      this.newsletterState.set('sent');
    } catch {
      this.newsletterState.set('error');
    }
  }
}
