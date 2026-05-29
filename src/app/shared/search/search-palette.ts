import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import {
  SearchResultGroup,
  SearchResultRow,
  SearchService,
} from '../../core/search/search.service';

/**
 * Spotlight-style command palette for searching the parish corpus.
 *
 * Triggered by ⌘K / Ctrl+K globally, or by the header's search button.
 * Lives at the root layout level (rendered by App) so it overlays
 * every route. Closes on Esc, on backdrop click, or after navigating
 * to a result.
 *
 * Keyboard model:
 *   ↑ / ↓        — move selection
 *   Enter        — open selected result
 *   Esc          — close palette
 *   ⌘K / Ctrl+K  — toggle (handled in the parent via HostListener)
 */
@Component({
  selector: 'sanctum-search-palette',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] md:pt-[14vh] px-4"
        role="dialog"
        aria-modal="true"
        aria-label="Search the parish"
        (click)="onBackdropClick($event)"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-sanctum-ink/40 backdrop-blur-sm" aria-hidden="true"></div>

        <!-- Palette -->
        <div
          class="relative w-full max-w-xl bg-sanctum-paper rounded-sm border border-sanctum-gold/60 shadow-[0_24px_60px_-20px_rgba(26,22,18,0.45)] overflow-hidden"
          (click)="$event.stopPropagation()"
        >
          <!-- Input row -->
          <div class="flex items-center gap-3 px-5 py-4 border-b border-sanctum-rule">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              width="20"
              height="20"
              class="text-sanctum-muted shrink-0"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              #input
              type="text"
              [value]="query()"
              (input)="onQuery($event)"
              (keydown)="onKey($event)"
              placeholder="Search the parish…"
              class="flex-1 bg-transparent outline-none font-body text-base text-sanctum-ink placeholder:text-sanctum-muted/60"
              autocomplete="off"
              autocorrect="off"
              autocapitalize="off"
              spellcheck="false"
              aria-label="Search query"
            />
            @if (!ready()) {
              <span class="font-body text-[10px] uppercase tracking-[0.25em] text-sanctum-muted">
                Loading
              </span>
            }
            <button
              type="button"
              class="text-sanctum-muted hover:text-sanctum-burgundy transition-colors"
              (click)="close()"
              aria-label="Close search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- Results -->
          <div class="max-h-[60vh] overflow-y-auto">
            @if (query().trim() === '') {
              <p class="px-5 py-8 text-center font-body text-sm text-sanctum-muted">
                Find a page, a sermon, a podcast, a service time, or the parish constitution.
              </p>
            } @else if (groups().length === 0 && ready()) {
              <p class="px-5 py-8 text-center font-body text-sm text-sanctum-muted">
                Nothing matched "{{ query() }}".
              </p>
            } @else {
              <ul class="py-2">
                @for (group of groups(); track group.kind) {
                  <li class="px-5 pt-4 pb-2">
                    <p class="font-body text-[10px] uppercase tracking-[0.3em] text-sanctum-blue font-semibold">
                      {{ group.label }}
                    </p>
                  </li>
                  @for (row of group.rows; track row.id) {
                    <li>
                      <a
                        [attr.href]="row.url"
                        [attr.target]="row.external ? '_blank' : null"
                        [attr.rel]="row.external ? 'noopener noreferrer' : null"
                        (click)="onSelect($event, row)"
                        (mouseenter)="setActive(row.id)"
                        class="block px-5 py-3 transition-colors"
                        [class.bg-sanctum-cream]="activeId() === row.id"
                      >
                        @if (row.eyebrow) {
                          <p class="font-body text-[10px] uppercase tracking-[0.25em] text-sanctum-gold font-semibold mb-1">
                            {{ row.eyebrow }}
                          </p>
                        }
                        <p class="font-display text-lg text-sanctum-ink leading-snug">
                          {{ row.title }}
                          @if (row.external) {
                            <span class="text-sanctum-muted text-sm align-[-1px] ml-1">↗</span>
                          }
                        </p>
                      </a>
                    </li>
                  }
                }
              </ul>
            }
          </div>

          <!-- Footer hint -->
          <div class="flex items-center justify-between gap-4 px-5 py-3 border-t border-sanctum-rule bg-sanctum-cream/60">
            <div class="flex items-center gap-3 font-body text-[11px] text-sanctum-muted">
              <span class="inline-flex items-center gap-1">
                <kbd class="inline-flex items-center justify-center min-w-[18px] h-5 px-1 rounded-sm bg-sanctum-paper border border-sanctum-rule text-[10px] font-mono">↑</kbd>
                <kbd class="inline-flex items-center justify-center min-w-[18px] h-5 px-1 rounded-sm bg-sanctum-paper border border-sanctum-rule text-[10px] font-mono">↓</kbd>
                <span>navigate</span>
              </span>
              <span class="inline-flex items-center gap-1">
                <kbd class="inline-flex items-center justify-center min-w-[28px] h-5 px-1.5 rounded-sm bg-sanctum-paper border border-sanctum-rule text-[10px] font-mono">enter</kbd>
                <span>open</span>
              </span>
              <span class="inline-flex items-center gap-1">
                <kbd class="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 rounded-sm bg-sanctum-paper border border-sanctum-rule text-[10px] font-mono">esc</kbd>
                <span>close</span>
              </span>
            </div>
            <span class="font-body text-[11px] text-sanctum-muted hidden sm:inline">
              Parish search
            </span>
          </div>
        </div>
      </div>
    }
  `,
})
export class SearchPalette {
  @ViewChild('input') private inputRef?: ElementRef<HTMLInputElement>;

  protected readonly activeId = signal<string | null>(null);

  private readonly search = inject(SearchService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly open = this.search.open;
  protected readonly ready = this.search.ready;
  protected readonly query = this.search.query;
  protected readonly groups = this.search.results;

  /** Flat list of result rows in display order — drives ↑/↓ navigation. */
  private readonly flatRows = computed<SearchResultRow[]>(() =>
    this.groups().flatMap((g) => g.rows),
  );

  constructor() {
    // Auto-focus the input once the palette opens. The @if block tears
    // down + re-creates the input element on every open/close cycle, so
    // we re-focus each time the open signal flips true.
    const focusEffect = effect(() => {
      if (this.open()) {
        queueMicrotask(() => this.inputRef?.nativeElement.focus());
      }
    });
    this.destroyRef.onDestroy(() => focusEffect.destroy());

    // Close on route change so a result click that lands on the same
    // page (just a different anchor) still dismisses the palette.
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.close());
  }

  close(): void {
    this.search.closePalette();
    this.activeId.set(null);
  }

  protected onQuery(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.search.query.set(value);
    // Reset cursor to first row when the query changes.
    const first = this.flatRows()[0];
    this.activeId.set(first?.id ?? null);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close();
  }

  protected setActive(id: string): void {
    this.activeId.set(id);
  }

  protected onSelect(event: MouseEvent, row: SearchResultRow): void {
    if (row.external) return; // let the browser handle the new-tab nav
    event.preventDefault();
    this.navigate(row);
  }

  protected onKey(event: KeyboardEvent): void {
    const flat = this.flatRows();
    const current = this.activeId();
    const idx = flat.findIndex((r) => r.id === current);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const next = flat[Math.min(flat.length - 1, idx + 1)] ?? flat[0];
      if (next) this.activeId.set(next.id);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prev = flat[Math.max(0, idx - 1)] ?? flat[flat.length - 1];
      if (prev) this.activeId.set(prev.id);
    } else if (event.key === 'Enter') {
      const target = flat[idx >= 0 ? idx : 0];
      if (target) {
        event.preventDefault();
        this.activate(target);
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  private activate(row: SearchResultRow): void {
    if (row.external) {
      window.open(row.url, '_blank', 'noopener,noreferrer');
      this.close();
      return;
    }
    this.navigate(row);
  }

  private navigate(row: SearchResultRow): void {
    const [path, fragment] = row.url.split('#');
    this.router.navigate([path], fragment ? { fragment } : undefined);
    // close() also fires via the NavigationEnd subscription, but call
    // it eagerly so the palette doesn't blink during the route change.
    this.close();
  }

  @HostListener('document:keydown', ['$event'])
  protected onGlobalKey(event: KeyboardEvent): void {
    // ⌘K / Ctrl+K toggles the palette from anywhere on the site.
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      void this.search.togglePalette();
    }
  }
}
