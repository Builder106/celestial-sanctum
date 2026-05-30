import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Icon, IconName } from '../ui/icon';

interface TabItem {
  label: string;
  path: string;
  icon: IconName;
  /** When true, only matches the exact path. Used for the Home tab so it
   *  doesn't light up on every nested route. */
  exact?: boolean;
}

/**
 * Bottom tab bar shown only inside the Capacitor native shell — the
 * primary navigation surface on iOS + Android. Routes through the same
 * Angular router as the web; the tabs map to /, /watch, /calendar, /give.
 *
 * Safe-area padding uses CSS env(safe-area-inset-bottom) so the bar
 * floats above the iOS home indicator + Android gesture pill without
 * extra config. iOS's status bar at the top is handled by the parish
 * header (we keep the wordmark visible).
 *
 * The "More" affordance for About / Visit / Contact / Choir / CZM /
 * Constitution is the mobile menu drawer the parish header already has;
 * native users tap the hamburger icon up top to reach it. That keeps
 * the tab bar at four focused items rather than burying primary actions
 * behind a "More" tab.
 */
@Component({
  selector: 'sanctum-mobile-tab-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
    <nav
      class="fixed bottom-0 left-0 right-0 z-40 bg-sanctum-paper border-t border-sanctum-rule"
      style="padding-bottom: env(safe-area-inset-bottom, 0px);"
      aria-label="Primary mobile navigation"
    >
      <ul class="flex justify-around items-stretch h-[60px]">
        @for (tab of tabs; track tab.path) {
          <li class="flex-1">
            <a
              [routerLink]="tab.path"
              routerLinkActive="text-sanctum-burgundy"
              [routerLinkActiveOptions]="{ exact: !!tab.exact }"
              #rla="routerLinkActive"
              class="h-full flex flex-col items-center justify-center gap-1 text-sanctum-muted transition-colors"
              [class.text-sanctum-burgundy]="rla.isActive"
            >
              <sanctum-icon [name]="tab.icon" [size]="22" />
              <span class="font-body text-[10px] uppercase tracking-[0.15em] font-semibold">
                {{ tab.label }}
              </span>
            </a>
          </li>
        }
      </ul>
    </nav>
  `,
  styles: `:host { display: contents; }`,
})
export class MobileTabBar {
  protected readonly tabs: readonly TabItem[] = [
    { label: 'Home', path: '/', icon: 'church', exact: true },
    { label: 'Watch', path: '/watch', icon: 'play' },
    { label: 'Calendar', path: '/calendar', icon: 'calendar' },
    { label: 'Give', path: '/give', icon: 'heart' },
  ];
}
