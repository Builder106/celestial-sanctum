import { Injectable, computed, inject, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
  type Auth,
  type User,
  GoogleAuthProvider,
  OAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithCredential,
  signOut as fbSignOut,
} from 'firebase/auth';

import { FirebaseService } from './firebase.service';

/**
 * Member authentication for the parish app.
 *
 * Two sign-in surfaces, one auth identity:
 * - Web (PWA or browser): redirects to Google's / Apple's hosted
 *   sign-in pages via Firebase Auth's web SDK.
 * - Native (Capacitor iOS / Android): the @capacitor-firebase/
 *   authentication plugin opens the platform-native sign-in sheets
 *   (Sign in with Apple's native sheet on iOS, Google's One-Tap
 *   account picker on Android), then hands the resulting credential
 *   to Firebase Auth's web SDK so the resolved User object is the
 *   same in both code paths.
 *
 * Sign in with Apple is required on iOS App Store review IF the app
 * offers any third-party social auth (Google in our case) — Apple's
 * Human Interface Guidelines section 4.8. Both buttons need to be
 * surfaced in the UI on iOS.
 *
 * Member-only features (prayer wall, directory) will check `user()`
 * for non-null before exposing. v1 ships the auth foundation; those
 * features ship in v2.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebase = inject(FirebaseService);

  private readonly userState = signal<User | null>(null);

  /** Current signed-in user, or null. Drives member-gated UI. */
  readonly user = computed(() => this.userState());
  /** Convenience flag for `@if` guards. */
  readonly signedIn = computed(() => this.userState() !== null);

  private subscribed = false;

  /**
   * Begin listening to auth-state changes. Idempotent — safe to call
   * from multiple components. Called automatically on first sign-in
   * attempt but components can call directly if they want to react
   * to existing sessions on mount.
   */
  init(): void {
    const auth = this.auth();
    if (!auth || this.subscribed) return;
    this.subscribed = true;
    onAuthStateChanged(auth, (u) => this.userState.set(u));
  }

  async signInWithGoogle(): Promise<void> {
    const auth = this.auth();
    if (!auth) return;

    if (Capacitor.isNativePlatform()) {
      // Native: capacitor-firebase plugin opens the Google One-Tap
      // / account-picker sheet, returns an ID token we exchange for
      // a Firebase credential.
      const result = await FirebaseAuthentication.signInWithGoogle();
      const idToken = result.credential?.idToken;
      if (!idToken) throw new Error('Google sign-in returned no idToken');
      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);
    } else {
      // Web: capacitor-firebase plugin falls back to Firebase Auth's
      // signInWithPopup under the hood when running outside Capacitor.
      await FirebaseAuthentication.signInWithGoogle();
    }
    this.init();
  }

  async signInWithApple(): Promise<void> {
    const auth = this.auth();
    if (!auth) return;

    if (Capacitor.isNativePlatform()) {
      // iOS: native Sign in with Apple sheet. Android: OAuth flow
      // through Apple's web sign-in page (still works, less elegant
      // — Apple doesn't offer a native Android SDK).
      const result = await FirebaseAuthentication.signInWithApple();
      const idToken = result.credential?.idToken;
      const rawNonce = result.credential?.nonce;
      if (!idToken) throw new Error('Apple sign-in returned no idToken');
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({ idToken, rawNonce });
      await signInWithCredential(auth, credential);
    } else {
      await FirebaseAuthentication.signInWithApple();
    }
    this.init();
  }

  async signOut(): Promise<void> {
    const auth = this.auth();
    if (!auth) return;
    // Native plugin sign-out cleans up the platform credential cache
    // (otherwise the Sign in with Apple sheet stays "remembered" on
    // the device); we then call Firebase's web SDK sign-out so the
    // User object held in the JS app also clears.
    await FirebaseAuthentication.signOut().catch(() => undefined);
    await fbSignOut(auth);
  }

  private auth(): Auth | null {
    const app = this.firebase.app();
    return app ? getAuth(app) : null;
  }
}
