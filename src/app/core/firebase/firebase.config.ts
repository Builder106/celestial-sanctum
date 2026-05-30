import type { FirebaseOptions } from 'firebase/app';

/**
 * Firebase project configuration for the parish app.
 *
 * Values come from the Firebase Console → Project Settings → "Your apps"
 * section after the parish webmaster creates the project. Until then,
 * `isFirebaseConfigured()` returns false and the Firebase services
 * gracefully no-op — the web build still ships, the mobile app
 * scaffolds, auth-gated features just stay invisible.
 *
 * Once the webmaster provides real values, drop them into the
 * environment variables below (Vercel env-vars page for production,
 * .env.local for development). Keys are PUBLIC — they're safe to ship
 * in the client bundle since Firebase security is enforced via
 * Firestore Rules + App Check, not key secrecy.
 *
 * Env var names follow Angular's convention of NG_APP_* so they can be
 * read at build time via process.env if we add a build-time transform
 * later; for now they're sourced from a typed-shim that defaults to
 * undefined when missing.
 */

interface MaybeFirebaseEnv {
  NG_APP_FIREBASE_API_KEY?: string;
  NG_APP_FIREBASE_AUTH_DOMAIN?: string;
  NG_APP_FIREBASE_PROJECT_ID?: string;
  NG_APP_FIREBASE_STORAGE_BUCKET?: string;
  NG_APP_FIREBASE_MESSAGING_SENDER_ID?: string;
  NG_APP_FIREBASE_APP_ID?: string;
  NG_APP_FIREBASE_MEASUREMENT_ID?: string;
  NG_APP_FIREBASE_VAPID_KEY?: string;
}

// At build time these get replaced by Angular's CLI when corresponding
// env vars are set. Until the parish project is provisioned they stay
// undefined, which `isFirebaseConfigured()` treats as "not yet set".
const env: MaybeFirebaseEnv = (globalThis as { process?: { env?: MaybeFirebaseEnv } }).process?.env ?? {};

export const firebaseConfig: FirebaseOptions = {
  apiKey: env.NG_APP_FIREBASE_API_KEY ?? '',
  authDomain: env.NG_APP_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: env.NG_APP_FIREBASE_PROJECT_ID ?? '',
  storageBucket: env.NG_APP_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: env.NG_APP_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: env.NG_APP_FIREBASE_APP_ID ?? '',
  measurementId: env.NG_APP_FIREBASE_MEASUREMENT_ID,
};

/** VAPID public key from FCM Web Push configuration (Firebase Console
 *  → Project Settings → Cloud Messaging → Web configuration). Required
 *  for FCM token registration in browser contexts; not used in the
 *  native Capacitor builds (those use APNs / Android tokens directly). */
export const firebaseVapidKey: string | undefined = env.NG_APP_FIREBASE_VAPID_KEY;

export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);
}
