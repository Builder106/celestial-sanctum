import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'menu'
  | 'close'
  | 'chevron-down'
  | 'chevron-right'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'church'
  | 'mic'
  | 'pen'
  | 'play'
  | 'mail'
  | 'phone'
  | 'map-pin'
  | 'calendar'
  | 'heart'
  | 'bell'
  | 'user'
  | 'google'
  | 'apple'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'youtube'
  | 'vimeo'
  | 'spotify'
  | 'apple-music'
  | 'deezer'
  | 'audiomack'
  | 'amazon-music';

@Component({
  selector: 'sanctum-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-hidden]="label() ? null : true"
      [attr.aria-label]="label()"
      [attr.role]="label() ? 'img' : null"
    >
      @switch (name()) {
        @case ('menu') {
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        }
        @case ('close') {
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        }
        @case ('chevron-down') {
          <polyline points="6 9 12 15 18 9" />
        }
        @case ('chevron-right') {
          <polyline points="9 6 15 12 9 18" />
        }
        @case ('arrow-right') {
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        }
        @case ('arrow-up-right') {
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        }
        @case ('church') {
          <path d="M12 2v6" />
          <path d="M9 5h6" />
          <path d="M5 22V11l7-3 7 3v11" />
          <path d="M9 22v-6h6v6" />
        }
        @case ('mic') {
          <rect x="9" y="2" width="6" height="13" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <line x1="12" y1="18" x2="12" y2="22" />
        }
        @case ('pen') {
          <path d="M12 19l7-7 3 3-7 7-3-3z" />
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
        }
        @case ('play') {
          <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" />
        }
        @case ('mail') {
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <polyline points="3 7 12 13 21 7" />
        }
        @case ('phone') {
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        }
        @case ('map-pin') {
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        }
        @case ('calendar') {
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        }
        @case ('heart') {
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        }
        @case ('bell') {
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        }
        @case ('user') {
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        }
        @case ('google') {
          <!-- Official Google "G" (4-colour). Authored in a 48×48 space and
               scaled to fit the 24×24 viewBox; colours are fixed, not currentColor. -->
          <g transform="scale(0.5)" stroke="none">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-5.04 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </g>
        }
        @case ('apple') {
          <path
            fill="currentColor"
            stroke="none"
            d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.04.28.04.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.46z"
          />
        }
        @case ('facebook') {
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        }
        @case ('instagram') {
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        }
        @case ('twitter') {
          <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
        }
        @case ('youtube') {
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
          <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" stroke="none" />
        }
        @case ('vimeo') {
          <path d="M22 7c-.1 2-1.4 4.8-4.1 8.4-2.7 3.7-5 5.6-6.9 5.6-1.2 0-2.2-1.1-3-3.3-.5-2-1.1-4-1.6-6-.6-2.2-1.2-3.3-1.9-3.3-.2 0-.7.3-1.7 1L2 8c.8-.7 1.6-1.4 2.4-2.1 1.1-1 1.9-1.5 2.5-1.6 1.4-.1 2.2.8 2.5 2.8.3 2.2.6 3.5.7 4 .4 2 .9 3 1.4 3 .4 0 1-.6 1.8-1.9.8-1.3 1.2-2.3 1.3-3 .1-1-.3-1.5-1.2-1.5-.4 0-.9.1-1.3.3.8-2.7 2.4-4.1 4.8-4 1.8.1 2.6 1.3 2.5 3.5z" fill="currentColor" stroke="none" />
        }
        @case ('spotify') {
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14c2.5-1 5.5-1 8 .5" />
          <path d="M8 11c3-1.2 6.5-1 9.5 1" />
          <path d="M8 8c3.5-1 7.5-.5 10 1.5" />
        }
        @case ('apple-music') {
          <!-- Beamed eighth notes — Apple Music's signature mark
               (stylized double-note with a connecting beam). -->
          <path d="M9 17V5l12-2v13" />
          <circle cx="6" cy="17" r="3" fill="currentColor" stroke="none" />
          <circle cx="18" cy="15" r="3" fill="currentColor" stroke="none" />
        }
        @case ('deezer') {
          <!-- Four-bar equalizer — Deezer's iconic equalizer mark. -->
          <rect x="3" y="12" width="3" height="8" rx="0.5" fill="currentColor" stroke="none" />
          <rect x="8" y="8" width="3" height="12" rx="0.5" fill="currentColor" stroke="none" />
          <rect x="13" y="14" width="3" height="6" rx="0.5" fill="currentColor" stroke="none" />
          <rect x="18" y="4" width="3" height="16" rx="0.5" fill="currentColor" stroke="none" />
        }
        @case ('audiomack') {
          <!-- Rounded square frame with internal waveform bars — gestures
               at Audiomack's wave-in-a-card mark. -->
          <rect x="2" y="2" width="20" height="20" rx="4" />
          <line x1="6" y1="14" x2="6" y2="10" />
          <line x1="9" y1="16" x2="9" y2="8" />
          <line x1="12" y1="15" x2="12" y2="9" />
          <line x1="15" y1="17" x2="15" y2="7" />
          <line x1="18" y1="14" x2="18" y2="10" />
        }
        @case ('amazon-music') {
          <!-- Rounded rectangle with a play triangle inside + Amazon's
               signature smile arc underneath. -->
          <rect x="3" y="3" width="18" height="13" rx="3" />
          <polygon points="10,7 14,9.5 10,12" fill="currentColor" stroke="none" />
          <path d="M5 19.5c4 2.5 10 2.5 14 0" />
          <polyline points="17 18 19 19.5 17.5 21" />
        }
      }
    </svg>
  `,
  styles: `:host { display: inline-flex; line-height: 0; }`,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input<number>(20);
  readonly label = input<string | null>(null);
}
