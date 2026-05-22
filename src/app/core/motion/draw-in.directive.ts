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
 * Pattern D — SVG stroke-dashoffset draw-in for the Sanctum mark.
 * Apply to a `<sanctum-mark>` element (host must contain an `<svg>` with
 * stroked paths). Each stroked path animates serially: outer arc → middle arc
 * → inner arc → flame → cross. Filled elements fade in last.
 *
 * Use on the FIRST Sanctum mark on a page. Subsequent marks should use
 * [sanctumReveal] for a calm fade instead.
 *
 * Set [breathe]="true" to keep the mark gently breathing (scale 1 ↔ 1.015)
 * after the draw-in completes — useful for marks in long-lived chrome (header,
 * hero) where the mark should feel alive rather than placed.
 */
@Directive({
  selector: '[sanctumDrawIn]',
  standalone: true,
})
export class SanctumDrawIn implements AfterViewInit, OnDestroy {
  /** After draw-in completes, infinitely scale 1 ↔ 1.015 over 8 seconds. */
  readonly breathe = input<boolean>(true);

  private host = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (prefersReducedMotion()) return;

    const svg = this.host.nativeElement.querySelector('svg');
    if (!svg) return;

    type StrokedElement = SVGPathElement | SVGLineElement;
    const allShapes: StrokedElement[] = Array.from(svg.querySelectorAll('path, line'));

    const strokedPaths: StrokedElement[] = allShapes.filter((el: StrokedElement) => {
      const fill = el.getAttribute('fill');
      return fill === null || fill === 'none';
    });

    const filledPaths: StrokedElement[] = allShapes.filter((el: StrokedElement) => {
      const fill = el.getAttribute('fill');
      return fill !== null && fill !== 'none';
    });

    // Pre-set the drawn state to invisible.
    for (const path of strokedPaths) {
      const length = this.getPathLength(path);
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    }
    for (const path of filledPaths) {
      path.style.opacity = '0';
    }

    this.observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;

        const { animate } = await import('motion');

        // Animate stroked paths serially.
        const perPathDuration = 0.35;
        const overlap = 0.12;
        for (let i = 0; i < strokedPaths.length; i++) {
          const path = strokedPaths[i];
          animate(
            path,
            { strokeDashoffset: [path.style.strokeDashoffset, '0'] },
            {
              duration: perPathDuration,
              ease: EASING.reverentOut,
              delay: i * (perPathDuration - overlap),
            },
          );
        }

        // Fade filled paths in at the end.
        const fillDelay = strokedPaths.length * (perPathDuration - overlap);
        if (filledPaths.length) {
          animate(
            filledPaths,
            { opacity: [0, 1] },
            {
              duration: 0.35,
              ease: EASING.reverentOut,
              delay: fillDelay,
            },
          );
        }

        // Idle breathe: after the full draw-in completes, start an infinite
        // gentle scale on the whole SVG. Subtle enough to read as "alive."
        if (this.breathe()) {
          const totalDrawIn = fillDelay + 0.35;
          setTimeout(() => {
            animate(
              svg,
              { scale: [1, 1.015, 1] },
              {
                duration: 8,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatType: 'loop',
              },
            );
          }, totalDrawIn * 1000);
        }

        this.observer?.disconnect();
        this.observer = null;
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.2 },
    );

    this.observer.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  /** Get the length of a stroked SVG element. Falls back gracefully for `<line>`. */
  private getPathLength(el: SVGPathElement | SVGLineElement): number {
    if ('getTotalLength' in el && typeof el.getTotalLength === 'function') {
      try {
        return el.getTotalLength();
      } catch {
        // fall through
      }
    }
    if (el.tagName === 'line') {
      const line = el as SVGLineElement;
      const dx = line.x2.baseVal.value - line.x1.baseVal.value;
      const dy = line.y2.baseVal.value - line.y1.baseVal.value;
      return Math.hypot(dx, dy);
    }
    return 100;
  }
}
