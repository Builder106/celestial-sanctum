import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'sanctum-tockify-embed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!calendarSlug()) {
      <div
        class="w-full min-h-[360px] flex flex-col items-center justify-center text-center px-6 py-16 bg-sanctum-paper border border-sanctum-rule rounded-sm"
        role="status"
      >
        <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-blue font-semibold mb-4">Calendar pending</p>
        <p class="font-body text-sanctum-muted max-w-md leading-relaxed">
          The Tockify event calendar will appear here once the parish supplies a
          calendar short-name. The legacy site embeds a slug that no longer
          resolves; we're keeping Tockify and awaiting the right short-name.
        </p>
      </div>
    } @else {
      <div class="w-full min-h-[600px] bg-sanctum-paper border border-sanctum-rule rounded-sm overflow-hidden">
        @if (loading()) {
          <div class="w-full min-h-[600px] flex items-center justify-center" aria-live="polite">
            <div class="text-center">
              <div class="inline-block w-8 h-8 border-2 border-sanctum-gold border-t-transparent rounded-full animate-spin mb-4"></div>
              <p class="font-body text-sm text-sanctum-muted">Loading calendar…</p>
            </div>
          </div>
        }
        <div
          [attr.data-tockify-component]="'calendar'"
          [attr.data-tockify-calendar]="calendarSlug()"
          [style.display]="loading() ? 'none' : 'block'"
        ></div>
      </div>
    }
  `,
})
export class TockifyEmbed implements OnInit, OnDestroy {
  readonly calendarSlug = input<string | null>(null);

  protected readonly loading = signal(true);
  private platformId = inject(PLATFORM_ID);
  private scriptEl: HTMLScriptElement | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.calendarSlug()) return;
    queueMicrotask(() => this.injectScript());
  }

  ngOnDestroy(): void {
    if (this.scriptEl?.parentNode) {
      this.scriptEl.parentNode.removeChild(this.scriptEl);
    }
  }

  private injectScript(): void {
    if (typeof document === 'undefined') return;
    if (document.querySelector('script[data-sanctum-tockify]')) {
      this.loading.set(false);
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://public.tockify.com/browser/embed.js';
    s.async = true;
    s.dataset['sanctumTockify'] = 'true';
    s.onload = () => this.loading.set(false);
    s.onerror = () => this.loading.set(false);
    document.body.appendChild(s);
    this.scriptEl = s;
  }
}
