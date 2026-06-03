import { Injectable, inject } from '@angular/core';
import { type Firestore, getFirestore, initializeFirestore } from 'firebase/firestore';

import { FirebaseService } from './firebase.service';

/**
 * Singleton accessor for the Firestore instance.
 *
 * Mirrors FirebaseService.app()'s browser-only contract: returns null on the
 * server and when Firebase isn't configured, so consumers (PrayerService)
 * gracefully no-op during SSR / before the parish webmaster has set up the
 * Firebase project.
 */
@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private readonly firebase = inject(FirebaseService);
  private cached: Firestore | null = null;

  db(): Firestore | null {
    const app = this.firebase.app();
    if (!app) return null;
    if (this.cached) return this.cached;
    try {
      // Auto-detect long-polling: Firestore's default WebChannel transport can
      // stall inside the Capacitor WebView network stack (the same class of
      // issue that hung Auth there). Auto-detection keeps fast WebChannel in
      // real browsers and transparently falls back to long-polling in the
      // webview.
      this.cached = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
    } catch {
      // initializeFirestore throws if Firestore was already initialized for
      // this app (HMR / repeat calls) — reuse the existing instance.
      this.cached = getFirestore(app);
    }
    return this.cached;
  }
}
