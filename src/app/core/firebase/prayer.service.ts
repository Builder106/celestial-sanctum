import { Injectable, inject } from '@angular/core';
import {
  type DocumentData,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';
import { RoleService } from './role.service';

export interface Prayer {
  id: string;
  text: string;
  authorUid: string;
  /** Display name, or null when the member posted anonymously. */
  authorName: string | null;
  isAnonymous: boolean;
  prayedCount: number;
  createdAt: Date | null;
  /** Set when the author marks the prayer answered → it moves to Testimonies. */
  answered: boolean;
  answeredAt: Date | null;
}

export interface Encouragement {
  id: string;
  text: string;
  authorUid: string;
  authorName: string | null;
  createdAt: Date | null;
}

/**
 * Prayer-wall data access (Firestore `prayers` collection).
 *
 * Public read; signed-in members create, "pray" (once each, enforced by the
 * security rules' marker invariant), report, and delete their own. Admins
 * (members with an /admins/{uid} doc) delete any. All methods no-op / return
 * empties when Firestore is unavailable (SSR / unconfigured).
 */
@Injectable({ providedIn: 'root' })
export class PrayerService {
  private readonly firestore = inject(FirestoreService);
  private readonly auth = inject(AuthService);
  private readonly role = inject(RoleService);

  /** Latest prayers, newest first. Returns [] on the server / unconfigured. */
  async list(max = 50): Promise<Prayer[]> {
    const db = this.firestore.db();
    if (!db) return [];
    const snap = await getDocs(
      query(collection(db, 'prayers'), orderBy('createdAt', 'desc'), limit(max)),
    );
    return snap.docs.map((d) => this.toPrayer(d.id, d.data()));
  }

  /** Post a prayer as the current member. Throws if signed out / unavailable. */
  async add(text: string, isAnonymous: boolean): Promise<Prayer> {
    const db = this.firestore.db();
    const user = this.auth.user();
    if (!db || !user) throw new Error('Not signed in');
    const trimmed = text.trim();
    const authorName = isAnonymous ? null : user.displayName || 'A member';
    const ref = await addDoc(collection(db, 'prayers'), {
      text: trimmed,
      authorUid: user.uid,
      authorName,
      isAnonymous,
      prayedCount: 0,
      createdAt: serverTimestamp(),
    });
    return {
      id: ref.id,
      text: trimmed,
      authorUid: user.uid,
      authorName,
      isAnonymous,
      prayedCount: 0,
      createdAt: new Date(),
      answered: false,
      answeredAt: null,
    };
  }

  /** Answered prayers (testimonies), most-recently-answered first. */
  async listTestimonies(max = 50): Promise<Prayer[]> {
    const db = this.firestore.db();
    if (!db) return [];
    const snap = await getDocs(
      query(
        collection(db, 'prayers'),
        where('answered', '==', true),
        orderBy('answeredAt', 'desc'),
        limit(max),
      ),
    );
    return snap.docs.map((d) => this.toPrayer(d.id, d.data()));
  }

  /** Author marks their own prayer answered → it becomes a testimony. */
  async markAnswered(prayerId: string): Promise<void> {
    const db = this.firestore.db();
    if (!db) throw new Error('Firestore unavailable');
    await updateDoc(doc(db, 'prayers', prayerId), {
      answered: true,
      answeredAt: serverTimestamp(),
    });
  }

  /**
   * Record that the current member prayed for a request — once each. Creates
   * the member's prayedBy marker and increments the counter atomically.
   * Returns true if this call counted a new prayer, false if they'd already
   * prayed (so callers don't double-count the on-screen number).
   */
  async pray(prayerId: string): Promise<boolean> {
    const db = this.firestore.db();
    const user = this.auth.user();
    if (!db || !user) throw new Error('Not signed in');
    const prayerRef = doc(db, 'prayers', prayerId);
    const markerRef = doc(db, 'prayers', prayerId, 'prayedBy', user.uid);
    return runTransaction(db, async (tx) => {
      const marker = await tx.get(markerRef);
      if (marker.exists()) return false; // already prayed — no double count
      tx.set(markerRef, { at: serverTimestamp() });
      tx.update(prayerRef, { prayedCount: increment(1) });
      return true;
    });
  }

  /** Of the given prayers, the IDs the current member has already prayed for. */
  async prayedPrayerIds(prayerIds: readonly string[]): Promise<Set<string>> {
    const db = this.firestore.db();
    const user = this.auth.user();
    if (!db || !user || prayerIds.length === 0) return new Set();
    const results = await Promise.all(
      prayerIds.map(async (id) => {
        try {
          return (await getDoc(doc(db, 'prayers', id, 'prayedBy', user.uid))).exists() ? id : null;
        } catch {
          return null;
        }
      }),
    );
    return new Set(results.filter((id): id is string => id !== null));
  }

  /** Whether the current member already prayed for this request. */
  async hasPrayed(prayerId: string): Promise<boolean> {
    const db = this.firestore.db();
    const user = this.auth.user();
    if (!db || !user) return false;
    return (await getDoc(doc(db, 'prayers', prayerId, 'prayedBy', user.uid))).exists();
  }

  /** Flag a prayer for clergy review. */
  async report(prayerId: string): Promise<void> {
    const db = this.firestore.db();
    const user = this.auth.user();
    if (!db || !user) throw new Error('Not signed in');
    await addDoc(collection(db, 'reports'), {
      prayerId,
      reporterUid: user.uid,
      createdAt: serverTimestamp(),
    });
  }

  /** Delete a prayer (author or admin, per the security rules). */
  async remove(prayerId: string): Promise<void> {
    const db = this.firestore.db();
    if (!db) throw new Error('Firestore unavailable');
    await deleteDoc(doc(db, 'prayers', prayerId));
  }

  /** Encouragement notes under a prayer, oldest first. */
  async listEncouragements(prayerId: string, max = 100): Promise<Encouragement[]> {
    const db = this.firestore.db();
    if (!db) return [];
    const snap = await getDocs(
      query(
        collection(db, 'prayers', prayerId, 'encouragements'),
        orderBy('createdAt', 'asc'),
        limit(max),
      ),
    );
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        text: data['text'] ?? '',
        authorUid: data['authorUid'] ?? '',
        authorName: data['authorName'] ?? null,
        createdAt: data['createdAt']?.toDate?.() ?? null,
      };
    });
  }

  /** Add an encouragement note to a prayer (signed-in members). */
  async addEncouragement(prayerId: string, text: string): Promise<Encouragement> {
    const db = this.firestore.db();
    const user = this.auth.user();
    if (!db || !user) throw new Error('Not signed in');
    const trimmed = text.trim();
    const authorName = user.displayName || 'A member';
    const ref = await addDoc(collection(db, 'prayers', prayerId, 'encouragements'), {
      text: trimmed,
      authorUid: user.uid,
      authorName,
      createdAt: serverTimestamp(),
    });
    return { id: ref.id, text: trimmed, authorUid: user.uid, authorName, createdAt: new Date() };
  }

  /** Delete an encouragement (author or clergy). */
  async removeEncouragement(prayerId: string, encId: string): Promise<void> {
    const db = this.firestore.db();
    if (!db) throw new Error('Firestore unavailable');
    await deleteDoc(doc(db, 'prayers', prayerId, 'encouragements', encId));
  }

  /** Whether the current member is clergy/staff (can moderate any prayer). */
  async isAdmin(): Promise<boolean> {
    return this.role.checkClergy();
  }

  private toPrayer(id: string, d: DocumentData): Prayer {
    return {
      id,
      text: d['text'] ?? '',
      authorUid: d['authorUid'] ?? '',
      authorName: d['authorName'] ?? null,
      isAnonymous: !!d['isAnonymous'],
      prayedCount: d['prayedCount'] ?? 0,
      createdAt: d['createdAt']?.toDate?.() ?? null,
      answered: !!d['answered'],
      answeredAt: d['answeredAt']?.toDate?.() ?? null,
    };
  }
}
