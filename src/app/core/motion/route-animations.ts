import { animate, query, style, transition, trigger } from '@angular/animations';

/**
 * Route crossfade: outgoing page fades out (180ms), incoming fades in (300ms).
 * Both queried elements are positioned absolutely during the transition so the
 * page height doesn't collapse mid-fade.
 *
 * Used on the `<main>` host that wraps `<router-outlet>` in `app.html`.
 */
export const routeFade = trigger('routeFade', [
  transition('* <=> *', [
    query(
      ':enter, :leave',
      [
        style({
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
        }),
      ],
      { optional: true },
    ),
    query(':enter', [style({ opacity: 0 })], { optional: true }),
    query(
      ':leave',
      [animate('180ms cubic-bezier(0.4, 0, 1, 1)', style({ opacity: 0 }))],
      { optional: true },
    ),
    query(
      ':enter',
      [animate('300ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1 }))],
      { optional: true },
    ),
  ]),
]);
