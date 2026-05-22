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
 * Scripture-citation underline — adds a thin gold underline that draws
 * left-to-right beneath the host element when scrolled into view. A small
 * ceremonial mark beneath citations like "John 1 : 46" or "Galatians 6 : 9".
 *
 *   <p sanctumCiteRule>John 1 : 46</p>
 */
@Directive({
  selector: '[sanctumCiteRule]',
  standalone: true,
  host: {
    '[class.sanctum-cite]': 'true',
  },
})
export class SanctumCiteRule implements AfterViewInit, OnDestroy {
  /** Delay before the underline begins drawing, in ms. */
  readonly delay = input<number>(0);

  private host = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (prefersReducedMotion()) {
      // Reduced motion: show the underline at full width immediately.
      this.host.nativeElement.classList.add('sanctum-cite-drawn');
      return;
    }

    this.observer = new IntersectionObserver(
      async (entries) => {
        if (!entries[0]?.isIntersecting) return;

        const { animate } = await import('motion');
        const el = this.host.nativeElement;

        // Create the rule as an inline-block ::after equivalent via a child
        // element (we don't want to fight CSS pseudo-elements from the
        // directive). Add it as a sibling element absolutely positioned.
        animate(
          el,
          { '--sanctum-cite-rule-scale': [0, 1] },
          {
            duration: 0.7,
            ease: EASING.reverentOut,
            delay: this.delay() / 1000,
          },
        );

        this.observer?.disconnect();
        this.observer = null;
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.5 },
    );

    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
