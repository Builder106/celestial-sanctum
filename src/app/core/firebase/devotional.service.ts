import { Injectable, inject } from '@angular/core';
import {
  type DocumentData,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';

export interface Devotional {
  id: string;
  /** The day it's for, as YYYY-MM-DD. */
  date: string;
  title: string;
  reference: string;
  body: string;
  authorName: string;
  createdAt: Date | null;
}

export interface ReadState {
  streak: number;
  lastReadDate: string | null;
  readToday: boolean;
}

/** Local YYYY-MM-DD for a date. */
function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Daily devotional (Firestore `devotionals`) + per-member read streak
 * (`devotionalReads/{uid}`).
 *
 * Devotionals are public read, clergy-authored (in-app editor). The streak doc
 * is self-owned — members advance their own consecutive-day count.
 */
@Injectable({ providedIn: 'root' })
export class DevotionalService {
  private readonly firestore = inject(FirestoreService);
  private readonly auth = inject(AuthService);

  /** The most recent devotional (today's if published, else the latest). */
  async latest(): Promise<Devotional | null> {
    const db = this.firestore.db();
    if (!db) return null;
    const snap = await getDocs(
      query(collection(db, 'devotionals'), orderBy('date', 'desc'), limit(1)),
    );
    const d = snap.docs[0];
    return d ? this.toDevotional(d.id, d.data()) : null;
  }

  /** Recent devotionals, newest first. */
  async recent(max = 14): Promise<Devotional[]> {
    const db = this.firestore.db();
    if (!db) return [];
    const snap = await getDocs(
      query(collection(db, 'devotionals'), orderBy('date', 'desc'), limit(max)),
    );
    return snap.docs.map((x) => this.toDevotional(x.id, x.data()));
  }

  /** Publish a devotional (clergy). */
  async create(input: {
    date: string;
    title: string;
    reference: string;
    body: string;
  }): Promise<void> {
    const db = this.firestore.db();
    const user = this.auth.user();
    if (!db || !user) throw new Error('Not signed in');
    await addDoc(collection(db, 'devotionals'), {
      date: input.date,
      title: input.title.trim(),
      reference: input.reference.trim(),
      body: input.body.trim(),
      authorUid: user.uid,
      authorName: user.displayName || 'Clergy',
      createdAt: serverTimestamp(),
    });
  }

  /** Delete a devotional (clergy). */
  async remove(id: string): Promise<void> {
    const db = this.firestore.db();
    if (!db) throw new Error('Firestore unavailable');
    await deleteDoc(doc(db, 'devotionals', id));
  }

  /** The member's current read streak. */
  async readState(): Promise<ReadState> {
    const db = this.firestore.db();
    const user = this.auth.user();
    if (!db || !user) return { streak: 0, lastReadDate: null, readToday: false };
    try {
      const data = (await getDoc(doc(db, 'devotionalReads', user.uid))).data();
      const lastReadDate = data?.['lastReadDate'] ?? null;
      return {
        streak: data?.['streak'] ?? 0,
        lastReadDate,
        readToday: lastReadDate === dateKey(new Date()),
      };
    } catch {
      return { streak: 0, lastReadDate: null, readToday: false };
    }
  }

  /** Record that the member read today's devotional; advances the streak. */
  async markReadToday(): Promise<ReadState> {
    const db = this.firestore.db();
    const user = this.auth.user();
    if (!db || !user) throw new Error('Not signed in');
    const today = dateKey(new Date());
    const yesterday = dateKey(new Date(Date.now() - 86_400_000));
    const ref = doc(db, 'devotionalReads', user.uid);
    const data = (await getDoc(ref)).data();
    const lastReadDate = data?.['lastReadDate'] ?? null;
    const prevStreak: number = data?.['streak'] ?? 0;
    let streak: number;
    if (lastReadDate === today) streak = prevStreak || 1;
    else if (lastReadDate === yesterday) streak = prevStreak + 1;
    else streak = 1;
    const longest = Math.max(data?.['longest'] ?? 0, streak);
    await setDoc(ref, { lastReadDate: today, streak, longest });
    return { streak, lastReadDate: today, readToday: true };
  }

  private toDevotional(id: string, d: DocumentData): Devotional {
    return {
      id,
      date: d['date'] ?? '',
      title: d['title'] ?? '',
      reference: d['reference'] ?? '',
      body: d['body'] ?? '',
      authorName: d['authorName'] ?? 'Clergy',
      createdAt: d['createdAt']?.toDate?.() ?? null,
    };
  }
}
