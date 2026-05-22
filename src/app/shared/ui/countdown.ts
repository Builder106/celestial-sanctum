import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'sanctum-countdown',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (style()) {
      @case ('inline') {
        <span class="font-mono tabular-nums" [attr.aria-label]="ariaLabel()">
          {{ days() }} : {{ hours() }} : {{ minutes() }} : {{ seconds() }}
        </span>
      }
      @case ('blocks') {
        <div class="inline-flex items-end gap-3 md:gap-4" [attr.aria-label]="ariaLabel()" role="timer">
          @for (unit of units; track unit.key) {
            <div class="flex flex-col items-center">
              <span
                class="font-display text-4xl md:text-5xl text-sanctum-ink tabular-nums leading-none"
              >
                {{ unit.value() }}
              </span>
              <span class="mt-2 font-body text-[10px] uppercase tracking-[0.3em] text-sanctum-muted">
                {{ unit.label }}
              </span>
            </div>
          }
        </div>
      }
    }
  `,
  styles: `
    :host { display: inline-flex; }
  `,
})
export class Countdown implements OnInit, OnDestroy {
  readonly timezone = input<string>('America/Los_Angeles');
  readonly targetHour = input<number>(10);
  readonly targetDayOfWeek = input<number>(0);
  readonly style = input<'inline' | 'blocks'>('inline');

  protected readonly days = signal('—');
  protected readonly hours = signal('—');
  protected readonly minutes = signal('—');
  protected readonly seconds = signal('—');

  protected readonly units = [
    { key: 'days', label: 'Days', value: this.days },
    { key: 'hours', label: 'Hours', value: this.hours },
    { key: 'minutes', label: 'Min', value: this.minutes },
    { key: 'seconds', label: 'Sec', value: this.seconds },
  ];

  protected readonly ariaLabel = computed(() => {
    if (this.days() === '—') return 'Time until next worship service';
    return `${this.days()} days, ${this.hours()} hours, ${this.minutes()} minutes, ${this.seconds()} seconds until next worship service`;
  });

  private platformId = inject(PLATFORM_ID);
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.tick();
    this.timer = setInterval(() => this.tick(), 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  private tick(): void {
    const remaining = this.nextOccurrence().getTime() - Date.now();
    if (remaining <= 0) {
      this.days.set('00');
      this.hours.set('00');
      this.minutes.set('00');
      this.seconds.set('00');
      return;
    }
    const d = Math.floor(remaining / 86_400_000);
    const h = Math.floor((remaining % 86_400_000) / 3_600_000);
    const m = Math.floor((remaining % 3_600_000) / 60_000);
    const s = Math.floor((remaining % 60_000) / 1000);
    this.days.set(this.pad(d));
    this.hours.set(this.pad(h));
    this.minutes.set(this.pad(m));
    this.seconds.set(this.pad(s));
  }

  private pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  private nextOccurrence(): Date {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {
        timeZone: this.timezone(),
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
        .formatToParts(new Date())
        .map((p) => [p.type, p.value]),
    );
    const dowMap: Record<string, number> = {
      Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
    };
    const currentDow = dowMap[parts['weekday'] as string];
    const currentHr = parseInt(parts['hour'] as string, 10);
    const currentMin = parseInt(parts['minute'] as string, 10);
    const currentSec = parseInt(parts['second'] as string, 10);
    const targetHr = this.targetHour();
    const targetDow = this.targetDayOfWeek();

    let daysToAdd: number;
    if (currentDow === targetDow) {
      daysToAdd = currentHr < targetHr ? 0 : 7;
    } else {
      daysToAdd = (targetDow - currentDow + 7) % 7;
    }
    const secsSinceMidnight = currentHr * 3600 + currentMin * 60 + currentSec;
    const totalSecsRemaining =
      daysToAdd * 86_400 + (targetHr * 3600 - secsSinceMidnight);
    return new Date(Date.now() + totalSecsRemaining * 1000);
  }
}
