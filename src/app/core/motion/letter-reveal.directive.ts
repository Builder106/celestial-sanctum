import {
  AfterViewInit,
  Directive,
  ElementRef,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EASING, prefersReducedMotion } from './tokens';

/**
 * Per-letter reveal — splits the host text into per-letter spans and
 * animates each one fading and lifting into view in turn. No mask, no
 * `overflow: hidden`: italic flourishes and descenders are never clipped.
 *
 * Words are wrapped in `inline-block; white-space: nowrap` containers so
 * the browser only breaks lines at word boundaries — never mid-letter.
 *
 *   <h1 sanctumLetterReveal>Sanctum parish.</h1>
 */
@Directive({
  selector: '[sanctumLetterReveal]',
  standalone: true,
})
export class SanctumLetterReveal implements AfterViewInit, OnDestroy {
  /** Per-letter stagger in ms. Default 50. */
  readonly letterStagger = input<number>(50);
  /** Delay before the reveal begins, in ms. */
  readonly delay = input<number>(0);
  /** Per-letter animation duration in ms. Default 700. */
  readonly letterDuration = input<number>(700);

  private host = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (prefersReducedMotion()) return;
    // Hide the unsplit text immediately so it doesn't flash before
    // ngAfterViewInit replaces innerHTML with the per-letter spans.
    this.host.nativeElement.style.visibility = 'hidden';
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (prefersReducedMotion()) return;

    const el = this.host.nativeElement;
    const text = el.textContent ?? '';
    if (!text.trim()) {
      el.style.visibility = 'visible';
      return;
    }

    // Tokenize into words + whitespace runs. Wrap each word as
    // `inline-block; white-space: nowrap` so lines can only break at word
    // boundaries. Inside each word, every letter is its own inline-block
    // span that starts invisible + slightly translated downward.
    el.innerHTML = '';
    const letters: HTMLElement[] = [];
    const tokens: string[] = text.split(/(\s+)/);

    for (const token of tokens) {
      if (!token) continue;
      if (/^\s+$/.test(token)) {
        el.appendChild(document.createTextNode(token));
        continue;
      }

      const wordWrapper = document.createElement('span');
      wordWrapper.style.display = 'inline-block';
      wordWrapper.style.whiteSpace = 'nowrap';

      const wordChars: string[] = Array.from(token);
      for (const char of wordChars) {
        const span = document.createElement('span');
        span.style.display = 'inline-block';
        span.style.opacity = '0';
        span.style.transform = 'translateY(0.4em)';
        span.style.willChange = 'opacity, transform';
        span.textContent = char;

        wordWrapper.appendChild(span);
        letters.push(span);
      }

      el.appendChild(wordWrapper);
    }

    el.style.visibility = 'visible';

    this.observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0]?.isIntersecting) return;

        const { animate, stagger } = await import('motion');
        animate(
          letters,
          {
            opacity: [0, 1],
            transform: ['translateY(0.4em)', 'translateY(0)'],
          },
          {
            duration: this.letterDuration() / 1000,
            ease: EASING.reverentOut,
            delay: stagger(this.letterStagger() / 1000, {
              startDelay: this.delay() / 1000,
            }),
          },
        ).finished.then(() => {
          for (const letter of letters) {
            letter.style.willChange = '';
            letter.style.transform = '';
          }
        });

        this.observer?.disconnect();
        this.observer = null;
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
