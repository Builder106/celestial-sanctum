import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';

import { firebaseConfig, isFirebaseConfigured } from './firebase.config';

/**
 * Singleton wrapper around the Firebase JS SDK app instance.
 *
 * Lazy-initialized on first access so SSR doesn't try to spin up
 * Firebase during prerender (it doesn't need to — auth / firestore /
 * messaging are all browser-side concerns). When Firebase isn't
 * configured yet (parish webmaster hasn't created the project), this
 * service returns null and the dependent services downstream
 * (AuthService, MessagingService) gracefully no-op so the app still
 * runs in a "logged-out, no push" state.
 *
 * The downstream services should always check `app()` for null before
 * doing anything Firebase-specific.
 */
@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private cached: FirebaseApp | null = null;

  /**
   * Returns the live Firebase app instance, or null if Firebase
   * isn't configured / we're rendering on the server. Idempotent —
   * subsequent calls return the cached instance.
   */
  app(): FirebaseApp | null {
    if (!this.isBrowser) return null;
    if (!isFirebaseConfigured()) return null;
    if (this.cached) return this.cached;
    // getApps() check guards against HMR / test scenarios where the
    // default app may already exist from a previous initialize.
    const existing = getApps();
    this.cached = existing.length > 0 ? existing[0] : initializeApp(firebaseConfig);
    return this.cached;
  }
}
