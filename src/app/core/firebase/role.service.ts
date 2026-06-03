import { Injectable, effect, inject, signal } from '@angular/core';
import { doc, getDoc } from 'firebase/firestore';

import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';

/**
 * Member role lookup — distinguishes clergy/staff from the congregation.
 *
 * Clergy are designated by a `roles/{uid}` document (preferred) or a legacy
 * `admins/{uid}` document, both added from the Firebase console and never
 * client-writable. Everyone signed in without such a doc is a regular
 * congregant. The Firestore security rules enforce the same check server-side
 * (`isClergy()`); this service is for showing/hiding clergy-only UI.
 */
@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly firestore = inject(FirestoreService);
  private readonly auth = inject(AuthService);

  private readonly clergy = signal(false);
  /** Whether the current member is clergy/staff. Drives clergy-only UI. */
  readonly isClergy = this.clergy.asReadonly();

  constructor() {
    // Keep the clergy flag in sync with auth — refresh on sign-in, clear on
    // sign-out. (Runs browser-side; auth.user() is null during SSR.)
    effect(() => {
      if (this.auth.user()) void this.refresh();
      else this.clergy.set(false);
    });
  }

  /** Load the current member's role into the isClergy signal. Safe to call on
   *  sign-in / page load; no-ops on the server. */
  async refresh(): Promise<void> {
    this.clergy.set(await this.checkClergy());
  }

  /** Clears the cached role (call on sign-out). */
  reset(): void {
    this.clergy.set(false);
  }

  /** One-shot clergy check (used by services + guards). */
  async checkClergy(): Promise<boolean> {
    const db = this.firestore.db();
    const user = this.auth.user();
    if (!db || !user) return false;
    try {
      if ((await getDoc(doc(db, 'roles', user.uid))).exists()) return true;
      return (await getDoc(doc(db, 'admins', user.uid))).exists();
    } catch {
      return false;
    }
  }
}
