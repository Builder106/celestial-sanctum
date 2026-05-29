import { Routes } from '@angular/router';

const placeholder = () =>
  import('./features/coming-soon/coming-soon').then((m) => m.ComingSoon);

// Per-route `title` fields are intentionally omitted on pages where the
// component sets its own SEO via SeoService — Angular's default
// TitleStrategy runs AFTER the component constructor and would otherwise
// overwrite the service's title. Routes without SeoService (styleguide,
// 404 placeholder) keep their router title as the only signal.
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },
  {
    path: '__styleguide',
    loadComponent: () =>
      import('./features/styleguide/styleguide').then((m) => m.Styleguide),
    title: 'Design System — Celestial Sanctum Parish',
  },
  {
    path: 'visit',
    loadComponent: () => import('./features/visit/visit').then((m) => m.Visit),
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
  },
  {
    path: 'watch',
    loadComponent: () => import('./features/watch/watch').then((m) => m.Watch),
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar').then((m) => m.Calendar),
  },
  {
    path: 'give',
    loadComponent: () => import('./features/give/give').then((m) => m.Give),
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'czm',
    loadComponent: () => import('./features/czm/czm').then((m) => m.Czm),
  },
  { path: '**', loadComponent: placeholder, title: 'Not Found — Celestial Sanctum Parish' },
];
