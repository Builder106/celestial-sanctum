import { Injectable, inject, signal } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { type Messaging, getMessaging, getToken, onMessage } from 'firebase/messaging';

import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';
import { FirestoreService } from './firestore.service';
import { firebaseVapidKey } from './firebase.config';

export type NotificationCategory =
  | 'service-reminder'
  | 'choir-release'
  | 'new-sermon'
  | 'parish-news'
  | 'daily-devotional';

export const NOTIFICATION_CATEGORIES: readonly { id: NotificationCategory; label: string; description: string }[] = [
  { id: 'service-reminder', label: 'Service reminders', description: 'Sunday worship + Thursday midnight vigil.' },
  { id: 'choir-release', label: 'Choir releases', description: 'New EPs, singles, and music videos.' },
  { id: 'new-sermon', label: 'New sermons', description: 'When a sermon hits the parish YouTube.' },
  { id: 'parish-news', label: 'Parish news', description: 'Special services, announcements, and harvests.' },
  { id: 'daily-devotional', label: 'Daily devotional', description: "A nudge when the day's devotional is posted." },
] as const;

/**
 * Push-notification subscription management.
 *
 * Bridges Firebase Cloud Messaging for both surfaces:
 * - Native (Capacitor): @capacitor-firebase/messaging asks the OS for
 *   permission, registers an APNs/FCM token, and emits notifications
 *   via plugin events.
 * - Web: Firebase's web SDK requests permission via the Notification
 *   API and registers a service worker token (requires the VAPID key
 *   from Firebase Console).
 *
 * Token registration sends the resulting FCM token to our backend
 * (POST /api/push/register — TODO when push fully wires up) along
 * with the user's category preferences. The backend stores
 * `{ token, userId?, categories: [] }` in Firestore so the publish
 * webhook from Sanity (or wherever the notification originates)
 * can query the right segment when sending.
 */
@Injectable({ providedIn: 'root' })
export class MessagingService {
  private readonly firebase = inject(FirebaseService);
  private readonly firestore = inject(FirestoreService);
  private readonly auth = inject(AuthService);

  /** Last registered FCM token. Cleared on permission revoke. */
  readonly token = signal<string | null>(null);

  /** Permission status: 'default' = not asked yet, 'granted', 'denied'. */
  readonly permission = signal<NotificationPermission>('default');

  /**
   * Request OS-level notification permission, then register a token
   * with FCM. Idempotent — calling twice returns the cached token.
   */
  async requestAndRegister(): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      // Native: plugin handles APNs auth + token registration in one
      // call. Permission prompt is OS-native (iOS pre-permission alert
      // is the app's UX, not our concern at this layer).
      const perm = await FirebaseMessaging.requestPermissions();
      this.permission.set(perm.receive === 'granted' ? 'granted' : 'denied');
      if (perm.receive !== 'granted') return null;
      const result = await FirebaseMessaging.getToken();
      this.token.set(result.token);
      return result.token;
    }

    // Web: needs the messaging instance, service worker registration,
    // and VAPID key. Service worker registration is left to the
    // consumer (typically in app.config.ts or main.ts) — by the time
    // requestAndRegister is called, a SW should be active.
    const messaging = this.messaging();
    if (!messaging || !firebaseVapidKey) return null;
    const granted = await Notification.requestPermission();
    this.permission.set(granted);
    if (granted !== 'granted') return null;
    const token = await getToken(messaging, { vapidKey: firebaseVapidKey });
    this.token.set(token);
    return token;
  }

  /**
   * Subscribe to foreground notifications (the OS handles
   * background ones — this only fires when the app is in the
   * foreground). Consumers can call this to surface in-app toasts
   * or update a notifications list.
   */
  onForeground(handler: (data: Record<string, string>) => void): () => void {
    if (Capacitor.isNativePlatform()) {
      const sub = FirebaseMessaging.addListener('notificationReceived', (evt) => {
        handler((evt.notification.data ?? {}) as Record<string, string>);
      });
      return () => {
        void sub.then((s) => s.remove());
      };
    }
    const messaging = this.messaging();
    if (!messaging) return () => undefined;
    return onMessage(messaging, (payload) => {
      handler((payload.data ?? {}) as Record<string, string>);
    });
  }

  /** Load the member's saved notification category preferences. */
  async loadPrefs(): Promise<Record<NotificationCategory, boolean>> {
    const empty = this.emptyPrefs();
    const db = this.firestore.db();
    const user = this.auth.user();
    if (!db || !user) return empty;
    try {
      const cats =
        (await getDoc(doc(db, 'notificationPrefs', user.uid))).data()?.['categories'] ?? {};
      const out = { ...empty };
      for (const c of NOTIFICATION_CATEGORIES) out[c.id] = !!cats[c.id];
      return out;
    } catch {
      return empty;
    }
  }

  /** Persist the member's category preferences + current device token. The
   *  backend reads `notificationPrefs/{uid}` to target the right segment. */
  async savePrefs(categories: Record<NotificationCategory, boolean>): Promise<void> {
    const db = this.firestore.db();
    const user = this.auth.user();
    if (!db || !user) throw new Error('Not signed in');
    await setDoc(
      doc(db, 'notificationPrefs', user.uid),
      { categories, token: this.token(), updatedAt: serverTimestamp() },
      { merge: true },
    );
  }

  emptyPrefs(): Record<NotificationCategory, boolean> {
    const out = {} as Record<NotificationCategory, boolean>;
    for (const c of NOTIFICATION_CATEGORIES) out[c.id] = false;
    return out;
  }

  /** Clergy-only: broadcast a push to everyone subscribed to a category. Calls
   *  the /api/notify Vercel function with the caller's Firebase ID token; the
   *  server enforces the clergy check. */
  async broadcast(
    category: NotificationCategory,
    title: string,
    body: string,
  ): Promise<{ sent: number; failed: number; subscribers: number }> {
    const user = this.auth.user();
    if (!user) throw new Error('Not signed in');
    const idToken = await user.getIdToken();
    // In the Capacitor webview the app is served from localhost, so target the
    // deployed origin explicitly; on the web a same-origin relative URL works.
    const base = Capacitor.isNativePlatform() ? 'https://celestial-sanctum.vercel.app' : '';
    const res = await fetch(`${base}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
      body: JSON.stringify({ category, title, body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ?? 'Send failed');
    return data as { sent: number; failed: number; subscribers: number };
  }

  private messaging(): Messaging | null {
    const app = this.firebase.app();
    if (!app) return null;
    try {
      return getMessaging(app);
    } catch {
      // Browser doesn't support FCM (Safari < 16.4, older Firefox,
      // etc.). Caller's null-check handles this gracefully.
      return null;
    }
  }
}
