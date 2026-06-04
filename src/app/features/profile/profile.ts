import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/firebase/auth.service';
import { RoleService } from '../../core/firebase/role.service';
import { SeoService } from '../../core/seo/seo.service';
import { SanctumButton } from '../../shared/ui/button';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { Icon, type IconName } from '../../shared/ui/icon';
import { SanctumMark } from '../../shared/ui/sanctum-mark';
import { SanctumReveal } from '../../core/motion/reveal.directive';

/**
 * Member sign-in surface — the Profile tab in the native shell.
 *
 * Signed out: Google + Apple sign-in (Apple is required on iOS by App
 * Store HIG 4.8 once any social provider is offered; it lights up once
 * the Apple provider + capability are configured). Signed in: the
 * member's identity + sign-out, and a link into the prayer wall. The
 * member directory is deferred (doxxing risk — see JOURNAL).
 */
@Component({
  selector: 'sanctum-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Display, Eyebrow, Icon, SanctumButton, SanctumMark, SanctumReveal],
  template: `
    <section sanctumReveal class="pt-24 md:pt-32 pb-24 px-6">
      @if (auth.signedIn()) {
        @let u = auth.user();
        <div class="max-w-2xl mx-auto">
          <!-- Identity header -->
          <div
            class="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left gap-5 pb-8 mb-8 border-b border-sanctum-rule"
          >
            @if (u?.photoURL) {
              <img
                [src]="u?.photoURL"
                alt=""
                referrerpolicy="no-referrer"
                class="w-16 h-16 rounded-full object-cover border border-sanctum-rule shrink-0"
              />
            } @else {
              <sanctum-mark [size]="52" />
            }
            <div class="min-w-0">
              <sanctum-eyebrow class="mb-2">Signed in</sanctum-eyebrow>
              <sanctum-display size="sm" class="mb-1">
                <h1>{{ u?.displayName || 'Welcome' }}</h1>
              </sanctum-display>
              @if (u?.email) {
                <p class="font-body text-sm text-sanctum-muted truncate">{{ u?.email }}</p>
              }
            </div>
          </div>

          <!-- Member actions -->
          <sanctum-eyebrow class="mb-4">Your parish</sanctum-eyebrow>
          <div class="grid gap-3 sm:grid-cols-2">
            @for (a of actions; track a.path) {
              <a
                [routerLink]="a.path"
                class="group flex items-start gap-4 p-5 rounded-sm border border-sanctum-rule bg-sanctum-paper hover:border-sanctum-gold hover:shadow-sm transition-all"
              >
                <span
                  class="flex items-center justify-center w-10 h-10 rounded-full bg-sanctum-cream text-sanctum-burgundy shrink-0"
                >
                  <sanctum-icon [name]="a.icon" [size]="18" />
                </span>
                <span class="min-w-0">
                  <span class="flex items-center gap-1.5 font-body text-base font-semibold text-sanctum-ink">
                    {{ a.label }}
                    <sanctum-icon
                      name="arrow-right"
                      [size]="14"
                      class="text-sanctum-gold opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                    />
                  </span>
                  <span class="mt-0.5 block font-body text-sm text-sanctum-muted leading-snug">{{ a.desc }}</span>
                </span>
              </a>
            }
          </div>

          <!-- Clergy tools — set apart by role -->
          @if (role.isClergy()) {
            <div class="mt-10 pt-8 border-t border-sanctum-rule">
              <sanctum-eyebrow class="mb-4">Parish leadership</sanctum-eyebrow>
              <a
                routerLink="/clergy"
                class="group flex items-start gap-4 p-5 rounded-sm border border-sanctum-blue/30 bg-sanctum-blue/5 hover:border-sanctum-blue hover:shadow-sm transition-all"
              >
                <span
                  class="flex items-center justify-center w-10 h-10 rounded-full bg-sanctum-blue/10 text-sanctum-blue shrink-0"
                >
                  <sanctum-icon name="church" [size]="18" />
                </span>
                <span class="min-w-0">
                  <span class="flex items-center gap-1.5 font-body text-base font-semibold text-sanctum-ink">
                    Clergy dashboard
                    <sanctum-icon
                      name="arrow-right"
                      [size]="14"
                      class="text-sanctum-blue opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                    />
                  </span>
                  <span class="mt-0.5 block font-body text-sm text-sanctum-muted leading-snug">
                    Pastoral requests, prayer-wall reports, devotionals, and broadcasts.
                  </span>
                </span>
              </a>
            </div>
          }

          <!-- Sign out — quiet, separated -->
          <div class="mt-10 pt-6 border-t border-sanctum-rule flex justify-center">
            <button sanctumBtn variant="ghost" size="sm" (click)="signOut()">Sign out</button>
          </div>
        </div>
      } @else {
        <div class="max-w-xl mx-auto min-h-[60vh] flex flex-col justify-center">
        <div class="text-center mb-10">
          <div class="flex justify-center mb-6"><sanctum-mark [size]="56" /></div>
          <sanctum-eyebrow class="mb-4">Parish members</sanctum-eyebrow>
          <sanctum-display size="lg" class="mb-4"><h1>Sign in</h1></sanctum-display>
          <p class="font-body text-lg text-sanctum-muted leading-relaxed max-w-md mx-auto">
            Sign in to your parish account to share on the community prayer wall.
          </p>
        </div>

        <div class="flex flex-col items-stretch gap-3 max-w-xs mx-auto w-full">
          <button
            sanctumBtn
            variant="primary"
            size="lg"
            [disabled]="busy() !== null"
            (click)="signIn('google')"
          >
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-sm bg-white shrink-0">
              <sanctum-icon name="google" [size]="16" />
            </span>
            {{ busy() === 'google' ? 'Signing in…' : 'Continue with Google' }}
          </button>
          <button
            sanctumBtn
            variant="ghost"
            size="lg"
            [disabled]="busy() !== null"
            (click)="signIn('apple')"
          >
            <sanctum-icon name="apple" [size]="18" />
            {{ busy() === 'apple' ? 'Signing in…' : 'Continue with Apple' }}
          </button>
        </div>

        @if (error()) {
          <p class="mt-6 text-center font-body text-sm text-sanctum-burgundy max-w-xs mx-auto">
            {{ error() }}
          </p>
        }
        </div>
      }
    </section>
  `,
})
export class Profile {
  protected readonly auth = inject(AuthService);
  protected readonly role = inject(RoleService);
  private readonly seo = inject(SeoService);

  protected readonly busy = signal<'google' | 'apple' | null>(null);
  protected readonly error = signal<string | null>(null);

  /** Member entry points, rendered as the dashboard action tiles. */
  protected readonly actions: readonly { path: string; icon: IconName; label: string; desc: string }[] =
    [
      { path: '/prayers', icon: 'heart', label: 'Prayer Wall', desc: 'Share a request or hold others up in prayer.' },
      { path: '/devotional', icon: 'pen', label: 'Daily devotional', desc: "Today's reading and your reflection streak." },
      { path: '/pastoral', icon: 'mail', label: 'Contact clergy', desc: 'Send a private note to the parish clergy.' },
      { path: '/request-service', icon: 'calendar', label: 'Request a service', desc: 'Baptisms, weddings, blessings, and intentions.' },
      { path: '/notifications', icon: 'bell', label: 'Notifications', desc: 'Choose what the parish notifies you about.' },
    ];

  constructor() {
    this.seo.set({
      title: 'Member Sign-In',
      description:
        'Sign in to your Celestial Sanctum Parish member account. Prayer wall and parish directory coming soon.',
      path: '/profile',
    });
    // Pick up an existing session on mount (no-ops on the server / when
    // Firebase isn't configured).
    this.auth.init();
  }

  protected async signIn(provider: 'google' | 'apple'): Promise<void> {
    if (this.busy()) return;
    this.error.set(null);
    this.busy.set(provider);
    try {
      if (provider === 'google') {
        await this.auth.signInWithGoogle();
      } else {
        await this.auth.signInWithApple();
      }
    } catch {
      this.error.set(
        provider === 'apple'
          ? 'Apple sign-in isn’t available yet — please use Google for now.'
          : 'Sign-in didn’t complete. Please try again.',
      );
    } finally {
      this.busy.set(null);
    }
  }

  protected async signOut(): Promise<void> {
    try {
      await this.auth.signOut();
    } catch {
      /* best-effort: native plugin sign-out can throw when no session */
    }
  }
}
