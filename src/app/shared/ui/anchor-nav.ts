import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SanctumSelect } from './select';

export interface AnchorItem {
  id: string;
  label: string;
}

@Component({
  selector: 'sanctum-anchor-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SanctumSelect],
  template: `
    <nav
      class="hidden lg:block sticky top-32 self-start"
      aria-label="In this page"
    >
      <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-muted font-semibold mb-5">
        In this page
      </p>
      <ul class="space-y-1 list-none">
        @for (item of items(); track item.id) {
          <li>
            <a
              [href]="'#' + item.id"
              (click)="scrollTo($event, item.id)"
              [class]="
                'block py-1.5 pl-4 -ml-px border-l font-body text-sm transition-colors duration-300 ' +
                (item.id === activeId()
                  ? 'border-sanctum-burgundy text-sanctum-burgundy font-semibold'
                  : 'border-sanctum-rule text-sanctum-muted hover:text-sanctum-ink hover:border-sanctum-gold')
              "
            >
              {{ item.label }}
            </a>
          </li>
        }
      </ul>
    </nav>

    <!-- Mobile fallback: select dropdown -->
    <div class="lg:hidden sticky top-[71px] z-20 -mx-6 px-6 py-4 bg-sanctum-cream/90 backdrop-blur-md border-b border-sanctum-rule">
      <sanctum-select
        tone="paper"
        ariaLabel="Jump to section"
        placeholder="Jump to section…"
        [options]="jumpOptions()"
        [value]="jumpValue()"
        (valueChange)="jumpTo($event)"
      />
    </div>
  `,
})
export class AnchorNav implements AfterViewInit, OnDestroy {
  readonly items = input.required<AnchorItem[]>();

  protected readonly jumpOptions = computed(() =>
    this.items().map((i) => ({ value: i.id, label: i.label })),
  );
  protected readonly jumpValue = signal('');
  protected readonly activeId = signal<string>('');
  private platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    queueMicrotask(() => this.setupObserver());
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  protected scrollTo(event: MouseEvent, id: string): void {
    event.preventDefault();
    if (!isPlatformBrowser(this.platformId)) return;
    const el = document.getElementById(id);
    if (!el) return;
    // Account for sticky header (~80px) when calculating scroll target
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
    this.activeId.set(id);
  }

  protected jumpTo(id: string): void {
    // Reset to the placeholder so the control reads "Jump to section…" again.
    this.jumpValue.set('');
    if (!id || !isPlatformBrowser(this.platformId)) return;
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: 'smooth' });
    history.replaceState(null, '', `#${id}`);
    this.activeId.set(id);
  }

  private setupObserver(): void {
    const sections = this.items()
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    if (!sections.length) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length) {
          this.activeId.set(visible[0].target.id);
        }
      },
      {
        rootMargin: '-30% 0px -60% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    );

    sections.forEach((s) => this.observer!.observe(s));
  }
}
