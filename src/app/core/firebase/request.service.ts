import { Injectable, inject } from '@angular/core';
import {
  type DocumentData,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import { AuthService } from './auth.service';
import { FirestoreService } from './firestore.service';

export type RequestCategory = 'pastoral' | 'service';

export interface ParishRequest {
  id: string;
  category: RequestCategory;
  kind: string;
  message: string;
  name: string;
  contact: string | null;
  authorUid: string;
  authorEmail: string | null;
  status: 'new' | 'handled';
  createdAt: Date | null;
}

/**
 * Member→clergy requests (Firestore `requests` collection).
 *
 * Two flavours share one collection + one inbox: `pastoral` (private prayer /
 * counseling / visit) and `service` (naming, wedding, thanksgiving…). Members
 * create their own; clergy read all + mark handled; authors read/delete their
 * own. Confidential — never publicly readable. Security enforced by rules.
 */
@Injectable({ providedIn: 'root' })
export class RequestService {
  private readonly firestore = inject(FirestoreService);
  private readonly auth = inject(AuthService);

  /** Submit a request to the clergy. Throws if signed out / unavailable. */
  async submit(input: {
    category: RequestCategory;
    kind: string;
    message: string;
    contact?: string | null;
  }): Promise<void> {
    const db = this.firestore.db();
    const user = this.auth.user();
    if (!db || !user) throw new Error('Not signed in');
    await addDoc(collection(db, 'requests'), {
      category: input.category,
      kind: input.kind,
      message: input.message.trim(),
      name: user.displayName || 'A member',
      contact: input.contact?.trim() || null,
      authorUid: user.uid,
      authorEmail: user.email ?? null,
      status: 'new',
      createdAt: serverTimestamp(),
    });
  }

  /** Clergy inbox — all requests, newest first. The list query is denied by
   *  the rules for non-clergy (so callers should guard on the role first). */
  async listInbox(max = 100): Promise<ParishRequest[]> {
    const db = this.firestore.db();
    if (!db) return [];
    const snap = await getDocs(
      query(collection(db, 'requests'), orderBy('createdAt', 'desc'), limit(max)),
    );
    return snap.docs.map((d) => this.toRequest(d.id, d.data()));
  }

  /** Clergy marks a request handled. */
  async markHandled(id: string): Promise<void> {
    const db = this.firestore.db();
    if (!db) throw new Error('Firestore unavailable');
    await updateDoc(doc(db, 'requests', id), { status: 'handled' });
  }

  /** Delete a request (author or clergy). */
  async remove(id: string): Promise<void> {
    const db = this.firestore.db();
    if (!db) throw new Error('Firestore unavailable');
    await deleteDoc(doc(db, 'requests', id));
  }

  private toRequest(id: string, d: DocumentData): ParishRequest {
    return {
      id,
      category: d['category'] === 'service' ? 'service' : 'pastoral',
      kind: d['kind'] ?? 'other',
      message: d['message'] ?? '',
      name: d['name'] ?? 'A member',
      contact: d['contact'] ?? null,
      authorUid: d['authorUid'] ?? '',
      authorEmail: d['authorEmail'] ?? null,
      status: d['status'] === 'handled' ? 'handled' : 'new',
      createdAt: d['createdAt']?.toDate?.() ?? null,
    };
  }
}
