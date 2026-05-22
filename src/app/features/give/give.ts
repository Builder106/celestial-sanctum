import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
        <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-blue font-semibold mb-6 text-center">
          Suggested amount
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
              \${{ amount }}
            </button>
          }
          <button
            type="button"
            class="py-5 border font-body text-sm uppercase tracking-wider font-medium transition-all duration-300 col-span-2 md:col-span-1"
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

        <a
          [href]="paypalUrl()"
          target="_blank"
          rel="noopener noreferrer"
          class="w-full inline-flex items-center justify-center gap-3 px-9 py-5 bg-sanctum-burgundy text-sanctum-cream font-body text-sm font-medium tracking-[0.18em] uppercase hover:bg-sanctum-ink transition-colors"
        >
          <sanctum-icon name="heart" [size]="18" />
          Continue to PayPal
          <sanctum-icon name="arrow-up-right" [size]="14" />
        </a>

        <p class="font-body text-xs text-sanctum-muted text-center mt-5 leading-relaxed">
          You'll be redirected to PayPal's secure checkout. You can enter any
          amount you'd like there, regardless of the suggestion above.
        </p>
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
  /** PayPal hosted button ID — extracted from the live celestialsanctumparish.org/give.php */
  private readonly paypalButtonId = 'XWNJRKDNUUTFU';

  protected readonly presetAmounts = [5, 10, 25, 100];
  protected readonly selectedAmount = signal<number | 'custom'>(25);

  protected selectAmount(amount: number | 'custom'): void {
    this.selectedAmount.set(amount);
  }

  protected paypalUrl(): string {
    const base = `https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=${this.paypalButtonId}`;
    const a = this.selectedAmount();
    return typeof a === 'number' ? `${base}&amount=${a}` : base;
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
