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
    path: 'give/thank-you',
    loadComponent: () => import('./features/give/thank-you').then((m) => m.GiveThankYou),
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'czm',
    loadComponent: () => import('./features/czm/czm').then((m) => m.Czm),
  },
  {
    path: 'choir',
    loadComponent: () => import('./features/choir/choir').then((m) => m.Choir),
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile').then((m) => m.Profile),
  },
  {
    path: 'prayers',
    loadComponent: () => import('./features/prayers/prayers').then((m) => m.PrayerWall),
  },
  {
    path: 'testimonies',
    loadComponent: () => import('./features/testimonies/testimonies').then((m) => m.Testimonies),
  },
  {
    path: 'pastoral',
    loadComponent: () => import('./features/pastoral/pastoral').then((m) => m.Pastoral),
  },
  {
    path: 'request-service',
    loadComponent: () => import('./features/services/services').then((m) => m.ServiceRequest),
  },
  {
    path: 'devotional',
    loadComponent: () => import('./features/devotional/devotional').then((m) => m.DevotionalPage),
  },
  {
    path: 'notifications',
    loadComponent: () =>
      import('./features/notifications/notifications').then((m) => m.Notifications),
  },
  {
    path: 'clergy',
    loadComponent: () => import('./features/clergy/dashboard').then((m) => m.ClergyDashboard),
  },
  {
    path: 'clergy/inbox',
    loadComponent: () => import('./features/clergy/inbox').then((m) => m.ClergyInbox),
  },
  {
    path: 'clergy/devotional',
    loadComponent: () => import('./features/clergy/devotional').then((m) => m.ClergyDevotional),
  },
  {
    path: 'clergy/notify',
    loadComponent: () => import('./features/clergy/notify').then((m) => m.ClergyNotify),
  },
  { path: '**', loadComponent: placeholder, title: 'Not Found — Celestial Sanctum Parish' },
];
