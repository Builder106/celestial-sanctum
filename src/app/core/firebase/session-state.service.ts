import { Injectable, signal } from '@angular/core';

/**
 * A lightweight, Firebase-free mirror of the current auth session.
 *
 * AuthService (which pulls in firebase/auth) writes to this on every auth-state
 * change; eager consumers like the header read it instead of injecting
 * AuthService directly, so firebase/auth stays out of the initial bundle.
 */
@Injectable({ providedIn: 'root' })
export class SessionState {
  readonly signedIn = signal(false);
  readonly photoURL = signal<string | null>(null);
  readonly displayName = signal<string | null>(null);

  set(user: { photoURL: string | null; displayName: string | null } | null): void {
    this.signedIn.set(!!user);
    this.photoURL.set(user?.photoURL ?? null);
    this.displayName.set(user?.displayName ?? null);
  }
}
