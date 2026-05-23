import { bootstrapApplication } from '@angular/platform-browser';
import { inject as injectAnalytics } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .then(() => {
    // First-party Vercel telemetry — Core Web Vitals + pageviews.
    // Browser entry only; no SSR equivalent needed.
    injectAnalytics();
    injectSpeedInsights();
  })
  .catch((err) => console.error(err));
