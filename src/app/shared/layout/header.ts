import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../ui/icon';
import { SanctumMark } from '../ui/sanctum-mark';
import { PlatformService } from '../../core/platform/platform.service';
import { SearchService } from '../../core/search/search.service';
import { SessionState } from '../../core/firebase/session-state.service';
import { PRIMARY_NAV } from './nav-data';

@Component({
  selector: 'sanctum-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon, SanctumMark],
  template: `
    <header
      class="sticky top-0 left-0 w-full z-40 bg-sanctum-cream/85 backdrop-blur-md border-b border-sanctum-rule"
    >
      <!-- Header row stretches edge-to-edge so the wordmark sits near the
           viewport's left margin on wide monitors (was previously pinned
           inside max-w-6xl, which left a big empty gutter on ultrawide).
           Padding controls inset; the rest of the page still uses
           max-w-6xl for body content + footer. -->
      <div class="pl-4 pr-6 md:pl-6 md:pr-10 py-5 flex justify-between items-center gap-6">
        <a
          routerLink="/"
          class="group flex items-center gap-4 text-sanctum-ink"
          (click)="closeMobile()"
          aria-label="Celestial Sanctum — home"
        >
          <sanctum-mark [size]="52" class="shrink-0 transition-transform duration-300 group-hover:scale-105" />
          <span class="hidden sm:flex flex-col leading-none">
            <span class="font-display font-semibold uppercase text-xl md:text-[22px] tracking-[0.18em] text-sanctum-ink whitespace-nowrap">
              Celestial Sanctum
            </span>
            <span class="mt-2.5 font-body text-[10px] md:text-[11px] font-semibold uppercase tracking-[0.35em] text-sanctum-blue">
              Bloomington · California
            </span>
          </span>
        </a>

        @if (!isNative) {
        <nav class="hidden lg:flex items-center gap-1" aria-label="Primary">
          @for (item of nav; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="text-sanctum-burgundy after:scale-x-100"
              [routerLinkActiveOptions]="{ exact: item.path === '/' }"
              class="relative whitespace-nowrap px-3 py-2 font-body text-xs uppercase tracking-[0.2em] font-semibold text-sanctum-ink hover:text-sanctum-burgundy transition-colors after:absolute after:left-3 after:right-3 after:bottom-1 after:h-px after:bg-sanctum-gold after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="hidden lg:flex items-center gap-3">
          <!-- Compact search trigger (also ⌘K). aria-label provides the
               accessible name; title shows the shortcut hint on hover. -->
          <button
            type="button"
            (click)="openSearch()"
            title="Search · ⌘K"
            aria-label="Search the parish"
            class="group p-2 text-sanctum-ink hover:text-sanctum-burgundy transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="18" height="18" aria-hidden="true" class="transition-transform duration-200 ease-out motion-safe:group-hover:scale-110 motion-safe:group-active:scale-95">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <a
            routerLink="/contact"
            class="inline-flex items-center gap-1.5 whitespace-nowrap font-body text-xs uppercase tracking-[0.2em] font-semibold text-sanctum-blue hover:text-sanctum-burgundy transition-colors"
          >
            Contact
            <sanctum-icon name="chevron-right" [size]="12" />
          </a>

          <a
            routerLink="/profile"
            class="inline-flex items-center gap-1.5 whitespace-nowrap font-body text-xs uppercase tracking-[0.2em] font-semibold text-sanctum-ink hover:text-sanctum-burgundy transition-colors"
            [attr.aria-label]="session.signedIn() ? 'Your profile' : 'Sign in'"
          >
            @if (session.signedIn() && session.photoURL()) {
              <img
                [src]="session.photoURL()"
                referrerpolicy="no-referrer"
                alt=""
                class="w-7 h-7 rounded-full object-cover border border-sanctum-rule"
              />
            } @else {
              <sanctum-icon name="user" [size]="16" />
              {{ session.signedIn() ? 'Profile' : 'Sign in' }}
            }
          </a>
        </div>
        }

        <div class="lg:hidden flex items-center gap-1">
          <button
            type="button"
            (click)="openSearch()"
            class="p-2 text-sanctum-ink"
            aria-label="Search the parish"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          <button
            type="button"
            class="p-2 text-sanctum-ink"
            [attr.aria-expanded]="mobileOpen()"
            aria-label="Open menu"
            aria-controls="mobile-menu"
            (click)="toggleMobile()"
          >
            <sanctum-icon [name]="mobileOpen() ? 'close' : 'menu'" [size]="22" />
          </button>
        </div>
      </div>
    </header>

    @if (mobileOpen()) {
      <div
        id="mobile-menu"
        class="fixed inset-0 top-[71px] z-30 bg-sanctum-cream/98 backdrop-blur-md lg:hidden overflow-y-auto"
      >
        <nav class="max-w-6xl mx-auto px-6 py-10 flex flex-col gap-1" aria-label="Mobile">
          @for (item of nav; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="text-sanctum-burgundy"
              [routerLinkActiveOptions]="{ exact: item.path === '/' }"
              class="block py-5 font-display text-3xl text-sanctum-ink hover:text-sanctum-burgundy transition-colors border-b border-sanctum-rule"
              (click)="closeMobile()"
            >
              {{ item.label }}
            </a>
          }
          <a
            routerLink="/contact"
            class="block py-5 font-display text-3xl text-sanctum-blue hover:text-sanctum-burgundy transition-colors border-b border-sanctum-rule"
            (click)="closeMobile()"
          >
            Contact
          </a>
          <a
            routerLink="/profile"
            class="block py-5 font-display text-3xl text-sanctum-ink hover:text-sanctum-burgundy transition-colors border-b border-sanctum-rule"
            (click)="closeMobile()"
          >
            {{ session.signedIn() ? 'Profile' : 'Sign in' }}
          </a>
        </nav>
      </div>
    }
  `,
})
export class Header {
  private readonly search = inject(SearchService);
  private readonly platform = inject(PlatformService);
  protected readonly session = inject(SessionState);
  protected readonly nav = PRIMARY_NAV;
  protected readonly mobileOpen = signal(false);

  /** True inside the Capacitor native shell. Hides the desktop nav cluster
   *  + Contact link because those routes live in the bottom tab bar; the
   *  mobile hamburger stays so secondary routes (About, Visit, Contact,
   *  Choir, CZM, Constitution) remain reachable. */
  protected readonly isNative = this.platform.isNative;

  protected toggleMobile() {
    this.mobileOpen.update((v) => !v);
  }

  protected closeMobile() {
    this.mobileOpen.set(false);
  }

  /** Opens the global search palette (also reachable via ⌘K). The mobile
   *  menu closes first so the palette isn't covered by the slide-out. */
  protected async openSearch(): Promise<void> {
    this.closeMobile();
    await this.search.openPalette();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMobile();
  }
}
