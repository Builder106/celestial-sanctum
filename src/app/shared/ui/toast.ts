import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';

export interface Toast {
  id: number;
  title: string;
  body: string;
}

/**
 * In-app toast notifications. Used to surface foreground push messages (the OS
 * shows background ones), but generic enough for any transient notice.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly items = signal<Toast[]>([]);
  readonly toasts = this.items.asReadonly();
  private seq = 0;

  show(title: string, body = '', ms = 6000): void {
    const id = ++this.seq;
    this.items.update((t) => [...t, { id, title: title || 'Notification', body }]);
    if (typeof window !== 'undefined') {
      setTimeout(() => this.dismiss(id), ms);
    }
  }

  dismiss(id: number): void {
    this.items.update((t) => t.filter((x) => x.id !== id));
  }
}

/** Root-level host that renders active toasts. Mounted once in app.html. */
@Component({
  selector: 'sanctum-toasts',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed z-50 top-4 right-4 left-4 sm:left-auto sm:w-96 flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
    >
      @for (t of toast.toasts(); track t.id) {
        <div
          class="pointer-events-auto bg-sanctum-paper border border-sanctum-gold/50 rounded-sm shadow-[0_12px_30px_-8px_rgba(26,22,18,0.18)] p-4 flex items-start gap-3"
          role="status"
        >
          <span class="mt-1.5 h-2 w-2 rounded-full bg-sanctum-gold shrink-0"></span>
          <div class="flex-1 min-w-0">
            <p class="font-display text-base text-sanctum-ink leading-snug">{{ t.title }}</p>
            @if (t.body) {
              <p class="mt-0.5 font-body text-sm text-sanctum-muted leading-snug">{{ t.body }}</p>
            }
          </div>
          <button
            type="button"
            (click)="toast.dismiss(t.id)"
            aria-label="Dismiss"
            class="shrink-0 -mr-1 -mt-1 px-2 text-sanctum-muted hover:text-sanctum-ink transition-colors font-body text-xl leading-none"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
})
export class Toasts {
  protected readonly toast = inject(ToastService);
}
