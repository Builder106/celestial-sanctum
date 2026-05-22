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
import { DISTANCE, DURATION, EASING, STAGGER, prefersReducedMotion } from './tokens';

/**
 * Pattern B (and C, when `immediate=true`) — sibling stagger reveal.
 * Hides every direct-element child until parent scrolls into view, then
 * animates each in turn with a configurable stagger.
 *
 * Usage:
 *   <ul sanctumCascade>...</ul>
 *   <div sanctumCascade stagger="spaced" duration="long">
 *     <h1>Sanctum parish.</h1>
 *     ...
 *   </div>
 */
@Directive({
  selector: '[sanctumCascade]',
  standalone: true,
})
export class SanctumCascade implements AfterViewInit, OnDestroy {
  readonly delay = input<number>(0);
  readonly duration = input<'short' | 'medium' | 'long'>('medium');
  readonly distance = input<'whisper' | 'speak' | 'pulpit'>('speak');
  readonly stagger = input<'tight' | 'default' | 'spaced'>('default');

  private host = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (prefersReducedMotion()) return;
    // Hide direct children immediately to avoid a flash of fully-painted
    // content. Have to do this synchronously in the constructor so it happens
    // before browser paint.
    const children = Array.from(this.host.nativeElement.children) as HTMLElement[];
    for (const c of children) {
      c.style.opacity = '0';
      c.style.willChange = 'opacity, transform';
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (prefersReducedMotion()) return;

    const distance = DISTANCE[this.distance()];
    const children = Array.from(this.host.nativeElement.children) as HTMLElement[];
    for (const c of children) {
      c.style.transform = `translateY(${distance}px)`;
    }

    this.observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        const { animate, stagger } = await import('motion');
        const duration = DURATION[this.duration()];
        const staggerSecs = STAGGER[this.stagger()];

        animate(
          children,
          { opacity: [0, 1], transform: [`translateY(${distance}px)`, 'translateY(0px)'] },
          {
            duration,
            ease: EASING.reverentOut,
            delay: stagger(staggerSecs, { startDelay: this.delay() / 1000 }),
          },
        ).finished.then(() => {
          for (const c of children) c.style.willChange = '';
        });

        this.observer?.disconnect();
        this.observer = null;
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    );

    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
