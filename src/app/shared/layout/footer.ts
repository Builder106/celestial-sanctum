import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../ui/icon';
import { SanctumButton } from '../ui/button';
import { Hairline } from '../ui/hairline';
import { SanctumMark } from '../ui/sanctum-mark';
import {
  FOOTER_CONTACT,
  FOOTER_QUICKLINKS,
  FOOTER_RESOURCES,
  SOCIALS,
} from './nav-data';

@Component({
  selector: 'sanctum-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, SanctumButton, Hairline, SanctumMark],
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
                {{ contact.address }}<br />
                {{ contact.city }}
              </span>
            </p>
            <p class="flex items-center gap-3">
              <span class="text-sanctum-gold"><sanctum-icon name="phone" [size]="16" /></span>
              <a
                [href]="'tel:' + contact.phoneHref"
                class="text-sanctum-ink hover:text-sanctum-burgundy transition-colors"
              >
                {{ contact.phone }}
              </a>
            </p>
            <p class="flex items-center gap-3">
              <span class="text-sanctum-gold"><sanctum-icon name="mail" [size]="16" /></span>
              <a
                [href]="'mailto:' + contact.email"
                class="text-sanctum-ink hover:text-sanctum-burgundy transition-colors break-all"
              >
                {{ contact.email }}
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
          <form class="flex flex-col gap-3 mb-8" (submit)="$event.preventDefault()">
            <label class="sr-only" for="newsletter-email">Email address</label>
            <input
              id="newsletter-email"
              type="email"
              required
              placeholder="you@example.com"
              class="w-full px-4 py-3 bg-sanctum-paper border border-sanctum-rule rounded-sm font-body text-sm text-sanctum-ink placeholder:text-sanctum-muted/60 focus:outline-none focus:border-sanctum-gold transition-colors"
            />
            <button sanctumBtn type="submit" size="sm" variant="primary">
              Subscribe
            </button>
          </form>

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
  protected readonly contact = FOOTER_CONTACT;
  protected readonly socials = SOCIALS;
  protected readonly quickLinks = FOOTER_QUICKLINKS;
  protected readonly resources = FOOTER_RESOURCES;
  protected readonly year = signal(new Date().getFullYear());
}
