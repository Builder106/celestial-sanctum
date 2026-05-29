import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { SanctumButton } from '../../shared/ui/button';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { Icon } from '../../shared/ui/icon';
import { SanctumMark } from '../../shared/ui/sanctum-mark';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumCascade } from '../../core/motion/cascade.directive';
import { SanctumDrawIn } from '../../core/motion/draw-in.directive';
import { SanctumCiteRule } from '../../core/motion/cite-rule.directive';

/**
 * Post-PayPal landing for successful donations.
 *
 * PayPal hosted buttons can be configured to redirect donors back to a
 * merchant URL after checkout completes. We point both the `return` and
 * `cancel_return` params at parish-side pages (`/give/thank-you` for
 * success, `/give` for cancel) so visitors never end up on PayPal's
 * generic confirmation. The redirect only fires if the button is set
 * to "let merchant specify URL" in its PayPal settings — see
 * PAYPAL_SETUP.md → "Configure return URLs".
 *
 * `<meta name="robots" content="noindex">` is set via SeoService so
 * search engines don't index transient post-donation pages.
 */
@Component({
  selector: 'sanctum-give-thank-you',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Display, Eyebrow, Icon, SanctumButton, SanctumCascade, SanctumCiteRule, SanctumDrawIn, SanctumMark, SanctumReveal],
  template: `
    <section sanctumCascade stagger="spaced" class="pt-24 md:pt-32 pb-12 px-6 max-w-3xl mx-auto text-center">
      <div class="flex justify-center mb-10">
        <sanctum-mark sanctumDrawIn [size]="80" />
      </div>
      <sanctum-eyebrow class="mb-6">Your gift is received</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-8">
        <h1>
          Thank you for
          <span class="italic text-sanctum-burgundy">supporting the parish.</span>
        </h1>
      </sanctum-display>
      <p class="font-body text-xl text-sanctum-muted leading-relaxed max-w-2xl mx-auto">
        PayPal has emailed you a receipt for your records. The Sanctum
        family is grateful — every gift goes toward gospel ministry,
        outreach, and keeping the doors of 11750 Cedar Avenue open.
      </p>
    </section>

    <div sanctumReveal distance="whisper" class="flex justify-center py-12 md:py-16">
      <sanctum-mark [size]="48" tone="mono-gold" />
    </div>

    <!-- Scripture -->
    <section class="py-12 md:py-16 px-6">
      <div sanctumReveal class="max-w-2xl mx-auto text-center">
        <p class="font-body text-xs uppercase tracking-[0.4em] text-sanctum-gold font-semibold mb-8">
          <span sanctumCiteRule>2 Corinthians 9 : 7</span>
        </p>
        <blockquote class="font-display italic text-2xl md:text-4xl text-sanctum-ink leading-[1.2] tracking-[-0.01em]">
          Each of you should give what you have decided in your heart to
          give, not reluctantly or under compulsion, for God loves a
          cheerful giver.
        </blockquote>
      </div>
    </section>

    <div sanctumReveal distance="whisper" class="flex justify-center py-12 md:py-16">
      <sanctum-mark [size]="40" />
    </div>

    <!-- What's next -->
    <section class="py-16 md:py-20 px-6 bg-sanctum-paper border-y border-sanctum-rule">
      <div sanctumCascade stagger="default" class="max-w-4xl mx-auto">
        <header sanctumReveal class="mb-10 text-center">
          <sanctum-eyebrow class="mb-4">While you're here</sanctum-eyebrow>
          <sanctum-display size="md">
            <h2>Stay in the rhythm.</h2>
          </sanctum-display>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <article class="p-7 border border-sanctum-rule bg-sanctum-cream/60 rounded-sm">
            <p class="font-display italic text-xl text-sanctum-burgundy mb-3">Plan a visit</p>
            <p class="font-body text-sm text-sanctum-muted leading-relaxed mb-5">
              Sunday worship runs 10 AM to 2 PM. The Thursday midnight vigil
              is open to all. Come as you are.
            </p>
            <a
              routerLink="/visit"
              class="font-body text-xs uppercase tracking-[0.22em] font-semibold text-sanctum-blue hover:text-sanctum-burgundy transition-colors"
            >
              See service times →
            </a>
          </article>

          <article class="p-7 border border-sanctum-rule bg-sanctum-cream/60 rounded-sm">
            <p class="font-display italic text-xl text-sanctum-burgundy mb-3">Sanctum News</p>
            <p class="font-body text-sm text-sanctum-muted leading-relaxed mb-5">
              A short weekly email with upcoming services, devotionals, and
              choir releases. Subscribe from the footer.
            </p>
            <a
              routerLink="/"
              fragment="footer"
              class="font-body text-xs uppercase tracking-[0.22em] font-semibold text-sanctum-blue hover:text-sanctum-burgundy transition-colors"
            >
              Subscribe →
            </a>
          </article>

          <article class="p-7 border border-sanctum-rule bg-sanctum-cream/60 rounded-sm">
            <p class="font-display italic text-xl text-sanctum-burgundy mb-3">Watch the latest</p>
            <p class="font-body text-sm text-sanctum-muted leading-relaxed mb-5">
              Recent sermons and Bible classes from the parish YouTube,
              plus the Sanctum Podcast on Spotify.
            </p>
            <a
              routerLink="/watch"
              class="font-body text-xs uppercase tracking-[0.22em] font-semibold text-sanctum-blue hover:text-sanctum-burgundy transition-colors"
            >
              Watch & Listen →
            </a>
          </article>
        </div>
      </div>
    </section>

    <!-- Closing CTA back to giving -->
    <section class="py-20 md:py-24 px-6">
      <div sanctumReveal class="max-w-2xl mx-auto text-center">
        <p class="font-body text-base md:text-lg text-sanctum-muted leading-relaxed mb-8">
          If you'd like to give again or set up monthly support, the
          giving page is one click away.
        </p>
        <a sanctumBtn variant="ghost" routerLink="/give">
          Back to giving
        </a>
      </div>
    </section>
  `,
})
export class GiveThankYou {
  private readonly seo = inject(SeoService);
  constructor() {
    this.seo.set({
      title: 'Thank you for your gift',
      description: 'Your gift to Celestial Sanctum Parish has been received. Thank you for supporting gospel ministry, outreach, and the doors of 11750 Cedar Avenue.',
      path: '/give/thank-you',
      noindex: true,
    });
  }
}
