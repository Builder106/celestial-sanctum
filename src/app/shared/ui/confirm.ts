import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  Injectable,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { SanctumButton } from './button';

export interface ConfirmOptions {
  /** The question / body text. */
  message: string;
  /** Optional heading above the message. */
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` reserved for destructive actions (currently styled the same). */
  tone?: 'default' | 'danger';
}

interface PendingConfirm {
  message: string;
  title?: string;
  confirmLabel: string;
  cancelLabel: string;
  tone: 'default' | 'danger';
}

/**
 * Promise-based confirmation dialog — a parish-styled replacement for the
 * browser's native `window.confirm()`, whose OS chrome breaks the cream/ink
 * aesthetic. Call `confirm(opts)` and await the boolean; the single
 * `<sanctum-confirm />` host (mounted in app.html) renders the modal.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly request = signal<PendingConfirm | null>(null);
  readonly current = this.request.asReadonly();
  private resolver: ((value: boolean) => void) | null = null;

  confirm(opts: ConfirmOptions): Promise<boolean> {
    // No DOM on the server — never assume a destructive "yes".
    if (typeof window === 'undefined') return Promise.resolve(false);
    // Resolve any dialog already open (shouldn't happen, but stay consistent).
    this.resolver?.(false);
    this.request.set({
      message: opts.message,
      title: opts.title,
      confirmLabel: opts.confirmLabel ?? 'Confirm',
      cancelLabel: opts.cancelLabel ?? 'Cancel',
      tone: opts.tone ?? 'default',
    });
    return new Promise<boolean>((resolve) => {
      this.resolver = resolve;
    });
  }

  /** Internal — called by the dialog host. */
  resolve(value: boolean): void {
    this.resolver?.(value);
    this.resolver = null;
    this.request.set(null);
  }
}

@Component({
  selector: 'sanctum-confirm',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SanctumButton],
  template: `
    @if (confirm.current(); as r) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center px-6">
        <div
          class="sanctum-confirm-backdrop absolute inset-0 bg-sanctum-ink/40 backdrop-blur-[2px]"
          (click)="cancel()"
          aria-hidden="true"
        ></div>
        <div
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="r.title ?? r.message"
          class="sanctum-confirm-panel relative w-full max-w-md rounded-sm border border-sanctum-rule bg-sanctum-paper p-7 shadow-[0_24px_60px_-12px_rgba(26,22,18,0.35)]"
        >
          @if (r.title) {
            <h2 class="mb-2 font-display text-2xl text-sanctum-ink">{{ r.title }}</h2>
          }
          <p class="font-body text-base text-sanctum-ink/85 leading-relaxed">{{ r.message }}</p>
          <div class="mt-7 flex justify-end gap-3">
            <button sanctumBtn variant="ghost" size="sm" (click)="cancel()">{{ r.cancelLabel }}</button>
            <button #confirmBtn sanctumBtn variant="primary" size="sm" (click)="ok()">
              {{ r.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .sanctum-confirm-backdrop {
      animation: sanctum-confirm-fade 150ms ease-out;
    }
    .sanctum-confirm-panel {
      animation: sanctum-confirm-pop 170ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes sanctum-confirm-fade {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
    @keyframes sanctum-confirm-pop {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.97);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .sanctum-confirm-backdrop,
      .sanctum-confirm-panel {
        animation: none;
      }
    }
  `,
})
export class ConfirmDialog {
  protected readonly confirm = inject(ConfirmService);
  private readonly confirmBtn = viewChild<ElementRef<HTMLButtonElement>>('confirmBtn');
  private lastFocused: HTMLElement | null = null;

  constructor() {
    // Move focus to the confirm button when the dialog opens; restore it to
    // whatever was focused before once it closes.
    effect(() => {
      const open = this.confirm.current();
      const btn = this.confirmBtn()?.nativeElement;
      if (open && btn) {
        this.lastFocused = (document.activeElement as HTMLElement) ?? null;
        btn.focus();
      } else if (!open && this.lastFocused) {
        this.lastFocused.focus();
        this.lastFocused = null;
      }
    });
  }

  protected ok(): void {
    this.confirm.resolve(true);
  }

  protected cancel(): void {
    this.confirm.resolve(false);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.confirm.current()) this.cancel();
  }
}
