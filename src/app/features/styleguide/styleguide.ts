import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SanctumButton } from '../../shared/ui/button';
import { Card } from '../../shared/ui/card';
import { Countdown } from '../../shared/ui/countdown';
import { Display } from '../../shared/ui/display';
import { DropCap } from '../../shared/ui/drop-cap';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { Hairline } from '../../shared/ui/hairline';
import { Icon, IconName } from '../../shared/ui/icon';
import { Link } from '../../shared/ui/link';
import { Quote } from '../../shared/ui/quote';
import { SanctumMark } from '../../shared/ui/sanctum-mark';

@Component({
  selector: 'sanctum-styleguide',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Card, Countdown, Display, DropCap, Eyebrow, Hairline, Icon, Link, Quote, SanctumButton, SanctumMark],
  template: `
    <article class="max-w-6xl mx-auto px-6 md:px-10 py-24">
      <header class="mb-20 text-center">
        <sanctum-eyebrow tone="gold" class="mb-6">/__styleguide</sanctum-eyebrow>
        <sanctum-display size="xl" class="mb-6">
          <h1>Reverent Minimalism.</h1>
        </sanctum-display>
        <p class="font-body text-lg text-sanctum-muted max-w-2xl mx-auto leading-relaxed">
          Design system for Celestial Sanctum Parish — cream, ink, brass gold,
          celestial blue. Cormorant Garamond on Inter.
        </p>
      </header>

      <!-- Palette -->
      <section class="mb-24">
        <div class="flex items-baseline justify-between mb-8">
          <sanctum-eyebrow>Palette</sanctum-eyebrow>
          <sanctum-hairline tone="rule" width="lg" />
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (s of swatches; track s.token) {
            <div class="rounded-sm overflow-hidden border border-sanctum-rule">
              <div class="h-28" [style.background-color]="s.value"></div>
              <div class="p-4 bg-sanctum-paper">
                <p class="font-display text-lg text-sanctum-ink font-medium">{{ s.token }}</p>
                <p class="font-body text-xs text-sanctum-muted font-mono mt-1">{{ s.value }}</p>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Typography -->
      <section class="mb-24">
        <div class="flex items-baseline justify-between mb-8">
          <sanctum-eyebrow>Typography</sanctum-eyebrow>
          <sanctum-hairline tone="rule" width="lg" />
        </div>
        <div class="space-y-8">
          <sanctum-display size="xl"><span>Display 1 — Cormorant Garamond</span></sanctum-display>
          <sanctum-display size="lg"><span>Display 2 — large heading</span></sanctum-display>
          <sanctum-display size="md"><span>Display 3 — section heading</span></sanctum-display>
          <sanctum-display size="sm"><span>Display 4 — small heading</span></sanctum-display>
          <p class="font-body text-xl text-sanctum-ink leading-relaxed max-w-3xl">
            Body large — Inter, comfortable for hero subtitles and intro copy
            where the text needs to breathe alongside generous serif headings.
          </p>
          <p class="font-body text-base text-sanctum-ink leading-relaxed max-w-3xl">
            Body regular — the workhorse for paragraphs, descriptions, and meta
            information. Sits cleanly under display type without competing.
          </p>
          <p class="font-body text-sm text-sanctum-muted leading-relaxed max-w-3xl">
            Body small — captions and secondary text in muted warm gray.
          </p>
          <p>
            <sanctum-eyebrow>Eyebrow · label</sanctum-eyebrow>
            <sanctum-eyebrow tone="gold" class="ml-4">Eyebrow · gold</sanctum-eyebrow>
            <sanctum-eyebrow tone="muted" class="ml-4">Eyebrow · muted</sanctum-eyebrow>
          </p>
        </div>
      </section>

      <!-- Buttons -->
      <section class="mb-24">
        <div class="flex items-baseline justify-between mb-8">
          <sanctum-eyebrow>Buttons</sanctum-eyebrow>
          <sanctum-hairline tone="rule" width="lg" />
        </div>
        <p class="font-body text-xs uppercase tracking-[0.25em] text-sanctum-muted mb-3">Cream / paper backgrounds (default tone)</p>
        <div class="flex flex-wrap gap-4 items-center mb-10">
          <button sanctumBtn variant="primary">Primary</button>
          <button sanctumBtn variant="secondary">Secondary</button>
          <button sanctumBtn variant="ghost">Ghost</button>
          <button sanctumBtn variant="primary" size="sm">Small</button>
          <button sanctumBtn variant="primary" size="lg">Large</button>
          <button sanctumBtn variant="primary" disabled>Disabled</button>
          <a sanctumBtn variant="ghost" href="https://celestialsanctumparish.org" target="_blank" rel="noopener noreferrer">
            Link Out
          </a>
        </div>
        <p class="font-body text-xs uppercase tracking-[0.25em] text-sanctum-muted mb-3">Burgundy / dark backgrounds (tone="light")</p>
        <div class="flex flex-wrap gap-4 items-center bg-sanctum-burgundy p-8 rounded-sm">
          <button sanctumBtn variant="primary" tone="light">Primary</button>
          <button sanctumBtn variant="secondary" tone="light">Secondary</button>
          <button sanctumBtn variant="ghost" tone="light">Ghost</button>
          <button sanctumBtn variant="primary" tone="light" size="lg">Large</button>
        </div>
      </section>

      <!-- Links -->
      <section class="mb-24">
        <div class="flex items-baseline justify-between mb-8">
          <sanctum-eyebrow>Links</sanctum-eyebrow>
          <sanctum-hairline tone="rule" width="lg" />
        </div>
        <div class="space-y-3 font-body">
          <p><sanctum-link href="/about">Default blue link with hover underline</sanctum-link></p>
          <p><sanctum-link href="/about" tone="ink">Ink-toned link</sanctum-link></p>
          <p><sanctum-link href="/about" tone="gold" [arrow]="true">Gold link with arrow</sanctum-link></p>
          <p><sanctum-link href="https://celestialsanctumparish.org" [external]="true" [arrow]="true">External link with diagonal arrow</sanctum-link></p>
        </div>
      </section>

      <!-- Cards -->
      <section class="mb-24">
        <div class="flex items-baseline justify-between mb-8">
          <sanctum-eyebrow>Cards</sanctum-eyebrow>
          <sanctum-hairline tone="rule" width="lg" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <sanctum-card variant="paper" [lift]="true">
            <sanctum-eyebrow class="mb-4">Paper</sanctum-eyebrow>
            <h3 class="font-display text-2xl text-sanctum-ink mb-3">White surface card</h3>
            <p class="font-body text-sm text-sanctum-muted leading-relaxed">
              Default treatment — paper-white background, soft rule border, gentle
              hover lift.
            </p>
          </sanctum-card>
          <sanctum-card variant="cream">
            <sanctum-eyebrow class="mb-4">Cream</sanctum-eyebrow>
            <h3 class="font-display text-2xl text-sanctum-ink mb-3">Cream surface card</h3>
            <p class="font-body text-sm text-sanctum-muted leading-relaxed">
              Pulls back into the page color; useful for less emphasized
              groupings.
            </p>
          </sanctum-card>
          <sanctum-card variant="gold">
            <sanctum-eyebrow tone="gold" class="mb-4">Gold</sanctum-eyebrow>
            <h3 class="font-display text-2xl text-sanctum-ink mb-3">Gold-bordered card</h3>
            <p class="font-body text-sm text-sanctum-muted leading-relaxed">
              Brass-bell accent border for high-emphasis features — shepherd's
              letter, give cards.
            </p>
          </sanctum-card>
        </div>
      </section>

      <!-- Quote -->
      <section class="mb-24 py-20 border-y border-sanctum-rule">
        <div class="flex items-baseline justify-between mb-8 px-2 max-w-3xl mx-auto">
          <sanctum-eyebrow>Pulled quote</sanctum-eyebrow>
          <sanctum-hairline tone="rule" width="sm" />
        </div>
        <sanctum-quote eyebrow="Mode of Worship">
          We come in white, with candles and prayer — not for show, but because
          the liturgy was given to us this way, and tradition is how we keep our
          hands open to it.
        </sanctum-quote>
      </section>

      <!-- Sanctum mark -->
      <section class="mb-24">
        <div class="flex items-baseline justify-between mb-8">
          <sanctum-eyebrow>Sanctum Mark</sanctum-eyebrow>
          <sanctum-hairline tone="rule" width="lg" />
        </div>
        <p class="font-body text-base text-sanctum-muted mb-8 max-w-2xl">
          The Sanctum mark — three nested rainbow arcs over a candle flame and
          slender cross. CCC-specific ornament used as section dividers and the
          header brand mark.
        </p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div class="flex flex-col items-center gap-3 p-8 bg-sanctum-paper border border-sanctum-rule rounded-sm">
            <sanctum-mark [size]="80" />
            <code class="font-mono text-xs text-sanctum-muted">tone="default"</code>
          </div>
          <div class="flex flex-col items-center gap-3 p-8 bg-sanctum-paper border border-sanctum-rule rounded-sm">
            <sanctum-mark [size]="80" tone="mono-gold" />
            <code class="font-mono text-xs text-sanctum-muted">tone="mono-gold"</code>
          </div>
          <div class="flex flex-col items-center gap-3 p-8 bg-sanctum-paper border border-sanctum-rule rounded-sm">
            <sanctum-mark [size]="80" tone="mono-ink" />
            <code class="font-mono text-xs text-sanctum-muted">tone="mono-ink"</code>
          </div>
          <div class="flex flex-col items-center gap-3 p-8 bg-sanctum-burgundy rounded-sm">
            <sanctum-mark [size]="80" tone="light" />
            <code class="font-mono text-xs text-sanctum-cream/80">tone="light"</code>
          </div>
        </div>
      </section>

      <!-- Hairlines -->
      <section class="mb-24">
        <div class="flex items-baseline justify-between mb-8">
          <sanctum-eyebrow>Hairlines</sanctum-eyebrow>
          <sanctum-hairline tone="rule" width="lg" />
        </div>
        <div class="space-y-4">
          <div class="flex items-center gap-4">
            <span class="font-body text-xs text-sanctum-muted w-20">Gold</span>
            <sanctum-hairline tone="gold" width="full" />
          </div>
          <div class="flex items-center gap-4">
            <span class="font-body text-xs text-sanctum-muted w-20">Rule</span>
            <sanctum-hairline tone="rule" width="full" />
          </div>
          <div class="flex items-center gap-4">
            <span class="font-body text-xs text-sanctum-muted w-20">Ink</span>
            <sanctum-hairline tone="ink" width="full" />
          </div>
        </div>
      </section>

      <!-- Drop cap -->
      <section class="mb-24">
        <div class="flex items-baseline justify-between mb-8">
          <sanctum-eyebrow>Drop cap (long-form)</sanctum-eyebrow>
          <sanctum-hairline tone="rule" width="lg" />
        </div>
        <sanctum-drop-cap class="max-w-prose">
          The parish was founded in 1999 in Rancho Cucamonga as a small gathering
          of Celestial Church of Christ members who had been worshipping in
          living rooms and rented halls. By 2003 the congregation had outgrown
          its first space; the move to Bloomington came at the close of that
          year, and the parish has kept the building, the vigil, and the
          tradition since.
        </sanctum-drop-cap>
      </section>

      <!-- Countdown -->
      <section class="mb-24">
        <div class="flex items-baseline justify-between mb-8">
          <sanctum-eyebrow>Countdown</sanctum-eyebrow>
          <sanctum-hairline tone="rule" width="lg" />
        </div>
        <div class="space-y-10">
          <div>
            <p class="font-body text-sm text-sanctum-muted mb-3">Inline (ambient)</p>
            <p class="font-body text-base text-sanctum-ink">
              Sunday worship begins in <sanctum-countdown style="inline" />
            </p>
          </div>
          <div>
            <p class="font-body text-sm text-sanctum-muted mb-3">Blocks (prominent)</p>
            <sanctum-countdown style="blocks" />
          </div>
        </div>
      </section>

      <!-- Icons -->
      <section class="mb-24">
        <div class="flex items-baseline justify-between mb-8">
          <sanctum-eyebrow>Icons</sanctum-eyebrow>
          <sanctum-hairline tone="rule" width="lg" />
        </div>
        <div class="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
          @for (n of iconNames; track n) {
            <div class="flex flex-col items-center gap-2 p-4 bg-sanctum-paper border border-sanctum-rule rounded-sm">
              <span class="text-sanctum-blue"><sanctum-icon [name]="n" [size]="20" /></span>
              <code class="font-mono text-[10px] text-sanctum-muted">{{ n }}</code>
            </div>
          }
        </div>
      </section>
    </article>
  `,
})
export class Styleguide {
  protected readonly swatches = [
    { token: 'sanctum.cream', value: '#FBF8F1' },
    { token: 'sanctum.paper', value: '#FFFFFF' },
    { token: 'sanctum.ink', value: '#1A1612' },
    { token: 'sanctum.muted', value: '#6B6359' },
    { token: 'sanctum.blue', value: '#1E3A5F' },
    { token: 'sanctum.gold', value: '#B89253' },
    { token: 'sanctum.burgundy', value: '#730C29' },
    { token: 'sanctum.rule', value: '#E8E2D6' },
  ];

  protected readonly iconNames: IconName[] = [
    'menu',
    'close',
    'chevron-down',
    'chevron-right',
    'arrow-right',
    'arrow-up-right',
    'church',
    'mic',
    'pen',
    'play',
    'mail',
    'phone',
    'map-pin',
    'calendar',
    'heart',
    'facebook',
    'instagram',
    'twitter',
    'youtube',
    'vimeo',
    'spotify',
  ];
}
