import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon } from '../ui/icon';
import { SanctumMark } from '../ui/sanctum-mark';
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
      <div class="max-w-6xl mx-auto px-6 md:px-10 py-5 flex justify-between items-center gap-6">
        <a
          routerLink="/"
          class="group flex items-center gap-4 text-sanctum-ink"
          (click)="closeMobile()"
          aria-label="Celestial Sanctum Parish — home"
        >
          <sanctum-mark [size]="52" class="shrink-0 transition-transform duration-300 group-hover:scale-105" />
          <span class="hidden sm:flex flex-col leading-none">
            <span class="font-display italic text-2xl md:text-[28px] font-medium tracking-[-0.015em] text-sanctum-ink">
              Celestial Sanctum
            </span>
            <span class="mt-1.5 font-display italic text-base md:text-lg font-normal tracking-wide text-sanctum-burgundy">
              Parish
            </span>
          </span>
        </a>

        <nav class="hidden lg:flex items-center gap-1" aria-label="Primary">
          @for (item of nav; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="text-sanctum-burgundy after:scale-x-100"
              [routerLinkActiveOptions]="{ exact: item.path === '/' }"
              class="relative px-4 py-2 font-body text-xs uppercase tracking-[0.22em] font-semibold text-sanctum-ink hover:text-sanctum-burgundy transition-colors after:absolute after:left-4 after:right-4 after:bottom-1 after:h-px after:bg-sanctum-gold after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <a
          routerLink="/contact"
          class="hidden lg:inline-flex items-center gap-2 font-body text-xs uppercase tracking-[0.22em] font-semibold text-sanctum-blue hover:text-sanctum-burgundy transition-colors"
        >
          Contact
          <sanctum-icon name="chevron-right" [size]="12" />
        </a>

        <button
          type="button"
          class="lg:hidden p-2 text-sanctum-ink"
          [attr.aria-expanded]="mobileOpen()"
          aria-label="Open menu"
          aria-controls="mobile-menu"
          (click)="toggleMobile()"
        >
          <sanctum-icon [name]="mobileOpen() ? 'close' : 'menu'" [size]="22" />
        </button>
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
        </nav>
      </div>
    }
  `,
})
export class Header {
  protected readonly nav = PRIMARY_NAV;
  protected readonly mobileOpen = signal(false);

  protected toggleMobile() {
    this.mobileOpen.update((v) => !v);
  }

  protected closeMobile() {
    this.mobileOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMobile();
  }
}
