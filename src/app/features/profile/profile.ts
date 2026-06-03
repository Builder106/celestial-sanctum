import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/firebase/auth.service';
import { RoleService } from '../../core/firebase/role.service';
import { SeoService } from '../../core/seo/seo.service';
import { SanctumButton } from '../../shared/ui/button';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { Icon } from '../../shared/ui/icon';
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
    <section
      sanctumReveal
      class="pt-24 md:pt-32 pb-24 px-6 max-w-xl mx-auto min-h-[70vh] flex flex-col justify-center"
    >
      @if (auth.signedIn()) {
        @let u = auth.user();
        <div class="bg-sanctum-paper border border-sanctum-rule rounded-sm p-8 md:p-10 text-center">
          <div class="flex justify-center mb-6">
            @if (u?.photoURL) {
              <img
                [src]="u?.photoURL"
                alt=""
                referrerpolicy="no-referrer"
                class="w-20 h-20 rounded-full object-cover border border-sanctum-rule"
              />
            } @else {
              <sanctum-mark [size]="56" />
            }
          </div>
          <sanctum-eyebrow class="mb-4">Signed in</sanctum-eyebrow>
          <sanctum-display size="md" class="mb-2">
            <h1>{{ u?.displayName || 'Welcome' }}</h1>
          </sanctum-display>
          @if (u?.email) {
            <p class="font-body text-base text-sanctum-muted mb-8">{{ u?.email }}</p>
          }
          <p class="font-body text-sm text-sanctum-muted leading-relaxed mb-8 max-w-sm mx-auto">
            The parish prayer wall is open — share a request and hold others up in
            prayer. Thank you for being part of the parish.
          </p>
          <div class="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            <a sanctumBtn variant="primary" size="sm" routerLink="/prayers">Prayer Wall</a>
            <a sanctumBtn variant="ghost" size="sm" routerLink="/devotional">Daily devotional</a>
            <a sanctumBtn variant="ghost" size="sm" routerLink="/pastoral">Contact clergy</a>
            <a sanctumBtn variant="ghost" size="sm" routerLink="/request-service">Request a service</a>
            <a sanctumBtn variant="ghost" size="sm" routerLink="/notifications">Notifications</a>
            @if (role.isClergy()) {
              <a sanctumBtn variant="ghost" size="sm" routerLink="/clergy/inbox">Clergy inbox</a>
              <a sanctumBtn variant="ghost" size="sm" routerLink="/clergy/devotional">Write devotional</a>
              <a sanctumBtn variant="ghost" size="sm" routerLink="/clergy/notify">Send notification</a>
            }
            <button sanctumBtn variant="ghost" size="sm" (click)="signOut()">Sign out</button>
          </div>
        </div>
      } @else {
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
