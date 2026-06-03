import { Injectable, computed, inject, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
  type Auth,
  type User,
  GoogleAuthProvider,
  OAuthProvider,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithCredential,
  signOut as fbSignOut,
} from 'firebase/auth';

import { FirebaseService } from './firebase.service';

/**
 * Member authentication for the parish app.
 *
 * Two sign-in surfaces, one auth identity:
 * - Web (PWA or browser): Firebase Auth's web SDK popup flow.
 * - Native (Capacitor iOS / Android): the @capacitor-firebase/
 *   authentication plugin opens the platform-native sign-in sheet and
 *   returns the provider credential (skipNativeAuth: true — it does not
 *   sign in to native Firebase). We hand that credential to the Firebase
 *   web SDK via signInWithCredential, so the resolved User object is the
 *   same in both code paths and drives user() / onAuthStateChanged.
 *
 * Sign in with Apple is required on iOS App Store review IF the app
 * offers any third-party social auth (Google in our case) — Apple's
 * Human Interface Guidelines section 4.8.
 *
 * Member-only features (prayer wall, directory) will check `user()`
 * for non-null before exposing. v1 ships the auth foundation; those
 * features ship in v2.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly firebase = inject(FirebaseService);

  private readonly userState = signal<User | null>(null);
  private readonly readyState = signal(false);

  /** Current signed-in user, or null. Drives member-gated UI. */
  readonly user = computed(() => this.userState());
  /** Convenience flag for `@if` guards. */
  readonly signedIn = computed(() => this.userState() !== null);
  /** True once the first auth-state callback has fired (browser only). Lets
   *  member-gated screens distinguish "still resolving" from "signed out". */
  readonly ready = computed(() => this.readyState());

  private cachedAuth: Auth | null = null;
  private subscribed = false;

  /**
   * Begin listening to auth-state changes. Idempotent — safe to call
   * from multiple components.
   */
  init(): void {
    const auth = this.auth();
    if (!auth || this.subscribed) return;
    this.subscribed = true;
    onAuthStateChanged(auth, (u) => {
      this.userState.set(u);
      this.readyState.set(true);
    });
  }

  async signInWithGoogle(): Promise<void> {
    const auth = this.auth();
    if (!auth) return;

    if (Capacitor.isNativePlatform()) {
      const result = await FirebaseAuthentication.signInWithGoogle();
      const idToken = result.credential?.idToken;
      if (!idToken) throw new Error('Google sign-in returned no idToken');
      await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
    } else {
      await FirebaseAuthentication.signInWithGoogle();
    }
    this.init();
  }

  async signInWithApple(): Promise<void> {
    const auth = this.auth();
    if (!auth) return;

    if (Capacitor.isNativePlatform()) {
      const result = await FirebaseAuthentication.signInWithApple();
      const idToken = result.credential?.idToken;
      const rawNonce = result.credential?.nonce;
      if (!idToken) throw new Error('Apple sign-in returned no idToken');
      const provider = new OAuthProvider('apple.com');
      await signInWithCredential(auth, provider.credential({ idToken, rawNonce }));
    } else {
      await FirebaseAuthentication.signInWithApple();
    }
    this.init();
  }

  async signOut(): Promise<void> {
    const auth = this.auth();
    if (!auth) return;
    // Native plugin sign-out clears the platform credential cache; then
    // Firebase's web SDK sign-out clears the JS-held User.
    await FirebaseAuthentication.signOut().catch(() => undefined);
    await fbSignOut(auth);
  }

  private auth(): Auth | null {
    const app = this.firebase.app();
    if (!app) return null;
    if (this.cachedAuth) return this.cachedAuth;
    // In the Capacitor webview, getAuth()'s default popup-redirect resolver
    // sets up an iframe against the authDomain that never settles, hanging
    // the first auth call (signInWithCredential sat pending forever). Native
    // therefore uses initializeAuth with IndexedDB persistence and no
    // resolver. Web keeps getAuth() — it needs the resolver for the
    // signInWithPopup fallback.
    if (Capacitor.isNativePlatform()) {
      try {
        this.cachedAuth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
      } catch {
        this.cachedAuth = getAuth(app);
      }
    } else {
      this.cachedAuth = getAuth(app);
    }
    return this.cachedAuth;
  }
}
