import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';

export interface SanctumSelectOption {
  value: string;
  label: string;
}

let nextId = 0;

/**
 * A parish-styled dropdown that replaces the native `<select>`, whose popup is
 * drawn by the OS and clashes with the cream/ink aesthetic. Renders as an
 * accessible listbox: arrow/Home/End to move, Enter/Space to choose, Escape or
 * an outside click to dismiss. DOM focus stays on the trigger button and the
 * active option is tracked via `aria-activedescendant`.
 *
 * The options panel only renders client-side (open() starts false), so there's
 * nothing for SSR hydration to mismatch on.
 */
@Component({
  selector: 'sanctum-select',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="toggle()"
        (keydown)="onKeydown($event)"
        aria-haspopup="listbox"
        [attr.aria-expanded]="open()"
        [attr.aria-label]="ariaLabel()"
        [attr.aria-activedescendant]="open() ? optionId(activeIndex()) : null"
        class="flex w-full items-center justify-between gap-3 rounded-sm border p-3 font-body text-base text-sanctum-ink transition-colors focus:outline-none"
        [class]="toneClass()"
        [class.border-sanctum-gold]="open()"
        [class.border-sanctum-rule]="!open()"
      >
        <span [class.text-sanctum-muted]="!selectedLabel()">{{ selectedLabel() || placeholder() }}</span>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="shrink-0 text-sanctum-muted transition-transform duration-200"
          [class.rotate-180]="open()"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      @if (open()) {
        <ul
          role="listbox"
          [attr.aria-label]="ariaLabel()"
          class="sanctum-select-panel absolute left-0 right-0 z-30 mt-2 max-h-72 overflow-auto rounded-sm border border-sanctum-rule bg-sanctum-paper py-1 shadow-lg shadow-sanctum-ink/10"
        >
          @for (o of options(); track o.value; let i = $index) {
            <li
              [id]="optionId(i)"
              role="option"
              [attr.aria-selected]="o.value === value()"
              (click)="choose(o.value)"
              (mouseenter)="activeIndex.set(i)"
              class="flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 font-body text-base transition-colors"
              [class.bg-sanctum-cream]="i === activeIndex()"
              [class.text-sanctum-burgundy]="o.value === value()"
              [class.font-semibold]="o.value === value()"
              [class.text-sanctum-ink]="o.value !== value()"
            >
              <span>{{ o.label }}</span>
              @if (o.value === value()) {
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="shrink-0"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .sanctum-select-panel {
      transform-origin: top;
      animation: sanctum-select-in 130ms ease-out;
    }
    @keyframes sanctum-select-in {
      from {
        opacity: 0;
        transform: translateY(-4px) scaleY(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scaleY(1);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .sanctum-select-panel {
        animation: none;
      }
    }
  `,
})
export class SanctumSelect {
  readonly options = input.required<readonly SanctumSelectOption[]>();
  readonly value = model<string>('');
  readonly placeholder = input('Select…');
  readonly ariaLabel = input<string | null>(null);
  /** Background variant to match the surrounding fields. */
  readonly tone = input<'cream' | 'cream-solid' | 'paper'>('cream');

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly uid = `sanctum-select-${nextId++}`;

  protected readonly selectedLabel = computed(
    () => this.options().find((o) => o.value === this.value())?.label ?? '',
  );
  protected readonly toneClass = computed(() => {
    switch (this.tone()) {
      case 'paper':
        return 'bg-sanctum-paper';
      case 'cream-solid':
        return 'bg-sanctum-cream';
      default:
        return 'bg-sanctum-cream/40';
    }
  });

  protected optionId(i: number): string {
    return `${this.uid}-opt-${i}`;
  }

  protected toggle(): void {
    if (this.open()) this.close();
    else this.openPanel();
  }

  protected close(): void {
    this.open.set(false);
  }

  protected choose(v: string): void {
    this.value.set(v);
    this.close();
  }

  private openPanel(): void {
    const idx = this.options().findIndex((o) => o.value === this.value());
    this.activeIndex.set(idx >= 0 ? idx : 0);
    this.open.set(true);
  }

  protected onKeydown(e: KeyboardEvent): void {
    const opts = this.options();
    if (!this.open()) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        this.openPanel();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.activeIndex.update((i) => Math.min(i + 1, opts.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.activeIndex.update((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        this.activeIndex.set(0);
        break;
      case 'End':
        e.preventDefault();
        this.activeIndex.set(opts.length - 1);
        break;
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const o = opts[this.activeIndex()];
        if (o) this.choose(o.value);
        break;
      }
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  @HostListener('document:pointerdown', ['$event'])
  protected onDocumentPointerDown(e: PointerEvent): void {
    if (this.open() && !this.host.nativeElement.contains(e.target as Node)) {
      this.close();
    }
  }
}
