import { ChangeDetectionStrategy, Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { Icon } from '../../shared/ui/icon';
import { SanctumMark } from '../../shared/ui/sanctum-mark';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumCascade } from '../../core/motion/cascade.directive';
import { SanctumDrawIn } from '../../core/motion/draw-in.directive';
import { SanctumCiteRule } from '../../core/motion/cite-rule.directive';

interface UseOfFunds {
  title: string;
  body: string;
}

@Component({
  selector: 'sanctum-give',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Display, Eyebrow, Icon, SanctumCascade, SanctumCiteRule, SanctumDrawIn, SanctumMark, SanctumReveal],
  template: `
    <!-- Page hero -->
    <section sanctumCascade stagger="spaced" class="pt-24 md:pt-32 pb-12 px-6 max-w-6xl mx-auto">
      <sanctum-eyebrow class="mb-6">Support the parish</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-8 max-w-4xl">
        <h1>
          Give as the Lord
          <span class="italic text-sanctum-burgundy">has prospered you.</span>
        </h1>
      </sanctum-display>
      <p class="font-body text-xl text-sanctum-muted leading-relaxed max-w-2xl">
        Every contribution helps in the furtherance of the gospel message,
        outreach, and building projects. Our church is thankful for any amount.
      </p>
    </section>

    <div class="flex justify-center py-12 md:py-16">
      <sanctum-mark sanctumDrawIn [size]="56" />
    </div>

    <!-- Donate via PayPal -->
    <section id="donate" class="scroll-mt-28 py-12 md:py-16 px-6 max-w-4xl mx-auto">
      <header sanctumReveal class="mb-10 text-center">
        <sanctum-eyebrow class="mb-4">Give online</sanctum-eyebrow>
        <sanctum-display size="lg" class="mb-5">
          <h2>
            Donate via
            <span class="italic text-sanctum-burgundy">PayPal.</span>
          </h2>
        </sanctum-display>
        <p class="font-body text-base md:text-lg text-sanctum-muted leading-relaxed max-w-2xl mx-auto">
          Choose a suggested amount, or enter any amount you'd like on PayPal's
          secure page. No PayPal account required — pay with any card.
        </p>
      </header>

      <!-- Amount selector -->
      <div sanctumReveal [delay]="150" class="bg-sanctum-paper border border-sanctum-rule rounded-sm p-8 md:p-12 max-w-2xl mx-auto">
        <!-- Frequency toggle: one-time vs monthly. Recurring is gated on
             the parish creating a subscription button in their PayPal
             Business account and providing its hosted_button_id (see
             PAYPAL_SETUP.md). Until that ID is in place, the "Monthly"
             tab stays clickable but the CTA gracefully points visitors
             at the contact form rather than a broken PayPal URL. -->
        <div class="flex items-center justify-center mb-8">
          <div class="inline-flex p-1 bg-sanctum-cream border border-sanctum-rule rounded-sm" role="tablist" aria-label="Donation frequency">
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="frequency() === 'once'"
              (click)="setFrequency('once')"
              class="px-5 py-2 font-body text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
              [class.bg-sanctum-burgundy]="frequency() === 'once'"
              [class.text-sanctum-cream]="frequency() === 'once'"
              [class.text-sanctum-muted]="frequency() !== 'once'"
              [class.hover:text-sanctum-ink]="frequency() !== 'once'"
            >
              One-time
            </button>
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="frequency() === 'monthly'"
              (click)="setFrequency('monthly')"
              class="px-5 py-2 font-body text-xs uppercase tracking-[0.2em] font-semibold transition-colors"
              [class.bg-sanctum-burgundy]="frequency() === 'monthly'"
              [class.text-sanctum-cream]="frequency() === 'monthly'"
              [class.text-sanctum-muted]="frequency() !== 'monthly'"
              [class.hover:text-sanctum-ink]="frequency() !== 'monthly'"
            >
              Monthly
            </button>
          </div>
        </div>

        <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-blue font-semibold mb-6 text-center">
          {{ frequency() === 'monthly' ? 'Suggested monthly amount' : 'Suggested amount' }}
        </p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          @for (amount of presetAmounts; track amount) {
            <button
              type="button"
              class="py-5 border font-display text-2xl font-medium transition-all duration-300"
              [class.border-sanctum-burgundy]="selectedAmount() === amount"
              [class.bg-sanctum-burgundy]="selectedAmount() === amount"
              [class.text-sanctum-cream]="selectedAmount() === amount"
              [class.border-sanctum-rule]="selectedAmount() !== amount"
              [class.text-sanctum-ink]="selectedAmount() !== amount"
              [class.hover:border-sanctum-gold]="selectedAmount() !== amount"
              (click)="selectAmount(amount)"
            >
              \${{ amount }}<span class="font-body text-sm font-normal text-current/70 ml-1">{{ frequency() === 'monthly' ? '/mo' : '' }}</span>
            </button>
          }
          <button
            type="button"
            class="py-5 border font-body text-sm uppercase tracking-wider font-medium transition-all duration-300 col-span-2 md:col-span-4"
            [class.border-sanctum-burgundy]="selectedAmount() === 'custom'"
            [class.bg-sanctum-burgundy]="selectedAmount() === 'custom'"
            [class.text-sanctum-cream]="selectedAmount() === 'custom'"
            [class.border-sanctum-rule]="selectedAmount() !== 'custom'"
            [class.text-sanctum-ink]="selectedAmount() !== 'custom'"
            [class.hover:border-sanctum-gold]="selectedAmount() !== 'custom'"
            (click)="selectAmount('custom')"
          >
            Other amount
          </button>
        </div>

        @if (paypalUrl()) {
          <a
            [href]="paypalUrl()"
            target="_blank"
            rel="noopener noreferrer"
            class="w-full inline-flex items-center justify-center gap-3 px-9 py-5 bg-sanctum-burgundy text-sanctum-cream font-body text-sm font-medium tracking-[0.18em] uppercase hover:bg-sanctum-ink transition-colors"
          >
            <sanctum-icon name="heart" [size]="18" />
            {{ frequency() === 'monthly' ? 'Subscribe via PayPal' : 'Continue to PayPal' }}
            <sanctum-icon name="arrow-up-right" [size]="14" />
          </a>
          <p class="font-body text-xs text-sanctum-muted text-center mt-5 leading-relaxed">
            @if (frequency() === 'monthly') {
              You'll be redirected to PayPal's secure checkout to start your
              monthly gift. Cancel anytime in your PayPal account.
            } @else {
              You'll be redirected to PayPal's secure checkout. You can enter any
              amount you'd like there, regardless of the suggestion above.
            }
          </p>
        } @else {
          <!-- Monthly giving placeholder: shown when the recurring hosted
               button ID hasn't been provided yet. Routes visitors at the
               contact form so the parish can set up recurring manually
               in the interim. -->
          <a
            routerLink="/contact"
            queryParamsHandling="merge"
            [queryParams]="{ topic: 'Monthly giving' }"
            class="w-full inline-flex items-center justify-center gap-3 px-9 py-5 border border-sanctum-burgundy text-sanctum-burgundy font-body text-sm font-medium tracking-[0.18em] uppercase hover:bg-sanctum-burgundy hover:text-sanctum-cream transition-colors"
          >
            <sanctum-icon name="heart" [size]="18" />
            Contact us to set up monthly giving
            <sanctum-icon name="arrow-up-right" [size]="14" />
          </a>
          <p class="font-body text-xs text-sanctum-muted text-center mt-5 leading-relaxed">
            Monthly giving via PayPal is being set up. Until it goes live,
            email the parish and we'll start a recurring gift with you
            directly — usually same day.
          </p>
        }
      </div>
    </section>

    <div sanctumReveal distance="whisper" class="flex justify-center py-16 md:py-20">
      <sanctum-mark [size]="56" />
    </div>

    <!-- Where the money goes -->
    <section id="impact" class="scroll-mt-28 py-12 md:py-16 px-6 max-w-6xl mx-auto">
      <header sanctumReveal class="mb-12 max-w-2xl">
        <sanctum-eyebrow class="mb-4">What your giving supports</sanctum-eyebrow>
        <sanctum-display size="lg" class="mb-5">
          <h2>
            For the furtherance
            <span class="italic text-sanctum-burgundy">of the gospel.</span>
          </h2>
        </sanctum-display>
      </header>

      <div sanctumCascade stagger="default" class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        @for (item of useOfFunds; track item.title) {
          <article>
            <p class="font-display italic text-2xl text-sanctum-burgundy mb-4">
              {{ item.title }}
            </p>
            <p class="font-body text-base text-sanctum-muted leading-relaxed">
              {{ item.body }}
            </p>
          </article>
        }
      </div>
    </section>

    <div sanctumReveal distance="whisper" class="flex justify-center py-16 md:py-20">
      <sanctum-mark [size]="56" />
    </div>

    <!-- Scripture + closing prayer -->
    <section class="py-20 md:py-28 px-6">
      <div sanctumCascade stagger="default" class="max-w-3xl mx-auto text-center">
        <p class="font-body text-xs uppercase tracking-[0.4em] text-sanctum-gold font-semibold mb-8">
          <span sanctumCiteRule>Galatians 6 : 9</span>
        </p>
        <blockquote class="font-display italic text-3xl md:text-5xl text-sanctum-ink leading-[1.15] tracking-[-0.01em] mb-12">
          Let us not become weary in doing good, for at the proper time we will
          reap a harvest if we do not give up.
        </blockquote>
        <p class="font-body text-base md:text-lg text-sanctum-muted leading-relaxed max-w-xl mx-auto">
          Our church is thankful for any amount in financial assistance we
          receive. Our prayer is that the Lord Jesus blesses you abundantly. Amen.
        </p>
      </div>
    </section>

    <!-- Other ways to give -->
    <section class="bg-sanctum-paper border-y border-sanctum-rule py-20 md:py-24 px-6">
      <div class="max-w-4xl mx-auto">
        <header sanctumReveal class="mb-10 text-center">
          <sanctum-eyebrow class="mb-4">Beyond PayPal</sanctum-eyebrow>
          <sanctum-display size="md">
            <h2>Other ways to give.</h2>
          </sanctum-display>
        </header>

        <div sanctumCascade stagger="default" class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="p-8 border border-sanctum-rule bg-sanctum-cream/60 rounded-sm">
            <p class="font-display italic text-2xl text-sanctum-burgundy mb-4">In person</p>
            <p class="font-body text-base text-sanctum-muted leading-relaxed mb-4">
              Bring a tithe envelope to Sunday service or any weeknight gathering.
              Speak with the deacons after worship.
            </p>
            <a routerLink="/visit" class="font-body text-xs uppercase tracking-[0.22em] font-semibold text-sanctum-blue hover:text-sanctum-burgundy transition-colors">
              Plan a visit →
            </a>
          </div>
          <div class="p-8 border border-sanctum-rule bg-sanctum-cream/60 rounded-sm">
            <p class="font-display italic text-2xl text-sanctum-burgundy mb-4">By mail</p>
            <p class="font-body text-base text-sanctum-muted leading-relaxed mb-4">
              Make checks payable to <em class="not-italic font-semibold text-sanctum-ink">Celestial Sanctum Parish</em>. Mail to 11750 Cedar Avenue, Bloomington, CA 92316.
            </p>
            <a href="tel:909-996-2397" class="font-body text-xs uppercase tracking-[0.22em] font-semibold text-sanctum-blue hover:text-sanctum-burgundy transition-colors">
              Call · 909.996.2397 →
            </a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Give {
  private readonly seo = inject(SeoService);
  constructor() {
    this.seo.set({
      title: 'Give',
      description: 'Support the work of Celestial Sanctum Parish. Secure online giving via PayPal — preset amounts or custom, one-time or recurring.',
      path: '/give',
    });
  }

  /**
   * PayPal hosted button IDs.
   *
   * `oneTime` — the existing "Donate" button on the parish's PayPal
   * Business account. ID lifted from the live celestialsanctumparish.org
   * /give.php. Verify periodically (see PAYPAL_SETUP.md → "Verify the
   * existing donate button").
   *
   * `monthly` — a Subscribe button the parish needs to create in PayPal
   * Business and paste here. Until it's set, the monthly tab on /give
   * gracefully points visitors at the contact form instead of building
   * a broken PayPal URL.
   */
  private readonly paypalButtons = {
    oneTime: 'XWNJRKDNUUTFU',
    monthly: null as string | null,
  };

  protected readonly presetAmounts = [5, 10, 25, 100];
  protected readonly selectedAmount = signal<number | 'custom'>(25);
  protected readonly frequency = signal<'once' | 'monthly'>('once');

  private readonly platformId = inject(PLATFORM_ID);

  /** Returns a PayPal checkout URL for the current selection, or null when
   *  the recurring button hasn't been provisioned yet (the template then
   *  swaps in a contact-the-parish CTA). */
  protected readonly paypalUrl = computed<string | null>(() => {
    const buttonId =
      this.frequency() === 'monthly'
        ? this.paypalButtons.monthly
        : this.paypalButtons.oneTime;
    if (!buttonId) return null;

    // PayPal's modern Donate flow lives at /donate?hosted_button_id=… —
    // the legacy /cgi-bin/webscr?cmd=_s-xclick form still works but
    // gets auto-redirected, which strips some query params along the
    // way (verified: a `return=` URL on the legacy form sometimes
    // doesn't survive the redirect). Hit the modern endpoint directly.
    const params = new URLSearchParams({
      hosted_button_id: buttonId,
      currency_code: 'USD',
    });
    const amount = this.selectedAmount();
    if (typeof amount === 'number') params.set('amount', amount.toString());

    // Pass a return URL so PayPal lands the donor on /give/thank-you
    // after a successful payment. PayPal honors this only if the
    // hosted button is configured to "let merchant specify URL" —
    // see PAYPAL_SETUP.md. Only emit on the browser since we need an
    // absolute origin and SSR can't construct one; the prerendered
    // HTML omits these params and Angular's signal re-evaluation
    // adds them once the browser hydrates.
    if (isPlatformBrowser(this.platformId)) {
      const origin = window.location.origin;
      params.set('return', `${origin}/give/thank-you`);
      params.set('cancel_return', `${origin}/give`);
    }

    return `https://www.paypal.com/donate?${params.toString()}`;
  });

  protected selectAmount(amount: number | 'custom'): void {
    this.selectedAmount.set(amount);
  }

  protected setFrequency(value: 'once' | 'monthly'): void {
    this.frequency.set(value);
  }

  protected readonly useOfFunds: UseOfFunds[] = [
    {
      title: 'Gospel ministry',
      body: 'Sunday worship, the Thursday vigil, weekday services — the rhythm of the parish runs because of consistent support. Hymnals, candles, sacramental supplies, the choir.',
    },
    {
      title: 'Outreach',
      body: 'Reflecting the compassion demonstrated by Jesus — fundraising and resource distribution to serve the poor and assist those in need, locally and beyond.',
    },
    {
      title: 'Building projects',
      body: 'The sanctuary itself, the grounds, the fellowship hall — keeping the doors of 11750 Cedar Avenue open requires ongoing care and investment.',
    },
  ];
}
