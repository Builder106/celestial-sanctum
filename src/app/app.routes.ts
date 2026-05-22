import { Routes } from '@angular/router';

const placeholder = () =>
  import('./features/coming-soon/coming-soon').then((m) => m.ComingSoon);

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    title: 'Celestial Sanctum Parish',
  },
  {
    path: '__styleguide',
    loadComponent: () =>
      import('./features/styleguide/styleguide').then((m) => m.Styleguide),
    title: 'Design System — Celestial Sanctum',
  },
  {
    path: 'visit',
    loadComponent: () => import('./features/visit/visit').then((m) => m.Visit),
    title: 'Visit — Celestial Sanctum',
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about').then((m) => m.About),
    title: 'About — Celestial Sanctum',
  },
  {
    path: 'watch',
    loadComponent: () => import('./features/watch/watch').then((m) => m.Watch),
    title: 'Watch & Listen — Celestial Sanctum',
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar/calendar').then((m) => m.Calendar),
    title: 'Calendar — Celestial Sanctum',
  },
  {
    path: 'give',
    loadComponent: () => import('./features/give/give').then((m) => m.Give),
    title: 'Give — Celestial Sanctum',
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact').then((m) => m.Contact),
    title: 'Contact — Celestial Sanctum',
  },
  { path: '**', loadComponent: placeholder, title: 'Not Found — Celestial Sanctum' },
];
