import type { FirebaseOptions } from 'firebase/app';
import { firebaseEnv } from './firebase.env.generated';

/**
 * Firebase project configuration for the parish app.
 *
 * Values come from the Firebase Console → Project Settings → "Your apps" and
 * are injected at build time by `scripts/gen-firebase-env.mjs`, which reads
 * `NG_APP_FIREBASE_*` from `.env.local` (development) / Vercel env (production)
 * into the generated `firebase.env.generated.ts` module. A missing var becomes
 * an empty string, and `isFirebaseConfigured()` treats that as "not yet set"
 * so the Firebase services no-op gracefully on the web.
 *
 * Keys are PUBLIC — they ship in the client bundle. Firebase security is
 * enforced via Firestore Rules + App Check + API-key restrictions, not key
 * secrecy, so the values are kept in env/Vercel (out of git) by convention,
 * not because exposure would be a breach.
 */

const env = firebaseEnv;

export const firebaseConfig: FirebaseOptions = {
  apiKey: env.NG_APP_FIREBASE_API_KEY,
  authDomain: env.NG_APP_FIREBASE_AUTH_DOMAIN,
  projectId: env.NG_APP_FIREBASE_PROJECT_ID,
  storageBucket: env.NG_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NG_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NG_APP_FIREBASE_APP_ID,
  measurementId: env.NG_APP_FIREBASE_MEASUREMENT_ID || undefined,
};

/** VAPID public key from FCM Web Push configuration (Firebase Console
 *  → Project Settings → Cloud Messaging → Web configuration). Required
 *  for FCM token registration in browser contexts; not used in the
 *  native Capacitor builds (those use APNs / Android tokens directly). */
export const firebaseVapidKey: string | undefined = env.NG_APP_FIREBASE_VAPID_KEY || undefined;

export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}
