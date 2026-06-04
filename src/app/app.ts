import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  afterNextRender,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { Header } from './shared/layout/header';
import { Footer } from './shared/layout/footer';
import { MobileTabBar } from './shared/layout/mobile-tab-bar';
import { SearchPalette } from './shared/search/search-palette';
import { PlatformService } from './core/platform/platform.service';
import { ToastService, Toasts } from './shared/ui/toast';
import { ConfirmDialog } from './shared/ui/confirm';
import { routeFade } from './core/motion/route-animations';

@Component({
  selector: 'sanctum-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Footer, MobileTabBar, SearchPalette, Toasts, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.css',
  animations: [routeFade],
})
export class App {
  private readonly router = inject(Router);
  private readonly platformService = inject(PlatformService);
  private readonly toast = inject(ToastService);
  private readonly injector = inject(Injector);

  constructor() {
    // Surface foreground pushes as in-app toasts (the OS / FCM service worker
    // shows background ones). MessagingService is dynamically imported so
    // firebase/messaging stays out of the initial bundle; browser-only, and a
    // no-op until a token is registered.
    afterNextRender(async () => {
      // Restore the session app-wide (so the header reflects signed-in state
      // via SessionState) and wire foreground push toasts. Both services are
      // dynamically imported so firebase stays out of the initial bundle.
      const [{ AuthService }, { MessagingService }] = await Promise.all([
        import('./core/firebase/auth.service'),
        import('./core/firebase/messaging.service'),
      ]);
      this.injector.get(AuthService).init();
      this.injector
        .get(MessagingService)
        .onForeground((m) => this.toast.show(m.title ?? 'Notification', m.body ?? ''));
    });
  }

  /** True inside the Capacitor native shell. Swaps the parish footer for
   *  a bottom tab bar; the parish header hides its desktop nav since the
   *  same routes live in the tab bar. */
  protected readonly isNative = this.platformService.isNative;

  /**
   * Routes that opt out of the parish header/footer shell — sub-microsites
   * that ship their own complete chrome. /czm (Celestial Zeitgeist
   * Ministries) is the youth-led evangelism ministry, intentionally styled
   * dark navy/electric blue to contrast the parish's cream cathedral
   * aesthetic.
   */
  private static readonly BARE_ROUTES = ['/czm'];

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** True when the current route ships its own chrome and the parish
   *  header/footer should be suppressed. */
  protected readonly bareChrome = computed(() => {
    const url = (this.currentUrl() || '/').split('?')[0].split('#')[0];
    return App.BARE_ROUTES.some((r) => url === r || url.startsWith(r + '/'));
  });

  /** Returns a stable identifier per route so the `routeFade` trigger fires on navigation. */
  protected prepareRoute(outlet: RouterOutlet): string {
    return outlet.isActivated ? outlet.activatedRoute.snapshot.url.join('/') || 'home' : '';
  }
}
