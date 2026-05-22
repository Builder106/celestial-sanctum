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
import { DISTANCE, DURATION, EASING, prefersReducedMotion } from './tokens';

/**
 * Pattern A — single-element reveal on scroll into view.
 *
 * Usage:
 *   <section sanctumReveal>...</section>
 *   <h2 sanctumReveal distance="pulpit" duration="long">...</h2>
 *   <p sanctumReveal [delay]="200">...</p>
 *
 * Sets initial state (opacity 0, translateY) in the constructor so SSR-rendered
 * content paints invisible until JS hydrates and the IntersectionObserver fires.
 * If JS is disabled or `prefers-reduced-motion: reduce`, content is shown in
 * final state immediately (no flash of invisible content).
 */
@Directive({
  selector: '[sanctumReveal]',
  standalone: true,
})
export class SanctumReveal implements AfterViewInit, OnDestroy {
  readonly delay = input<number>(0);
  readonly duration = input<'short' | 'medium' | 'long'>('medium');
  readonly distance = input<'whisper' | 'speak' | 'pulpit'>('speak');

  private host = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (prefersReducedMotion()) return;
    // Hide before AfterViewInit so the IntersectionObserver doesn't see content jumping.
    const el = this.host.nativeElement;
    el.style.opacity = '0';
    el.style.willChange = 'opacity, transform';
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (prefersReducedMotion()) return;

    const el = this.host.nativeElement;
    const distance = DISTANCE[this.distance()];
    el.style.transform = `translateY(${distance}px)`;

    this.observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        // Defer import so motion is only loaded when needed and stays out of SSR.
        const { animate } = await import('motion');

        const duration = DURATION[this.duration()];
        animate(
          el,
          { opacity: [0, 1], transform: [`translateY(${distance}px)`, 'translateY(0px)'] },
          {
            duration,
            ease: EASING.reverentOut,
            delay: this.delay() / 1000,
          },
        ).finished.then(() => {
          el.style.willChange = '';
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
