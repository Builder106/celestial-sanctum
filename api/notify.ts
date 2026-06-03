import type { VercelRequest, VercelResponse } from '@vercel/node';
import { type App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldPath, getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// POST /api/notify — clergy-only push broadcast.
//
// Verifies the caller's Firebase ID token + clergy role, collects the FCM
// device tokens of everyone subscribed to the chosen category (from
// notificationPrefs), and sends an FCM multicast. Clients cannot send to other
// devices, so this server-side sender (Admin SDK) is required.
//
// Env vars (Vercel project settings):
//   FIREBASE_SERVICE_ACCOUNT — the Admin SDK service-account JSON (the whole
//     file's contents), from Firebase Console → Project Settings →
//     Service accounts → Generate new private key.

const CATEGORIES = new Set(['service-reminder', 'choir-release', 'new-sermon', 'parish-news']);
const MAX_TITLE = 120;
const MAX_BODY = 500;

interface NotifyPayload {
  category?: string;
  title?: string;
  body?: string;
}

function adminApp(): App {
  const apps = getApps();
  if (apps.length > 0) return apps[0] as App;
  const raw = process.env['FIREBASE_SERVICE_ACCOUNT'];
  if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT not set');
  return initializeApp({ credential: cert(JSON.parse(raw)) });
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  let app: App;
  try {
    app = adminApp();
  } catch (err) {
    console.error('[api/notify] admin init failed', err);
    res.status(500).json({ error: 'Push backend not configured.' });
    return;
  }

  // Verify the caller's identity.
  const header = req.headers.authorization ?? '';
  const idToken = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!idToken) {
    res.status(401).json({ error: 'Missing auth token.' });
    return;
  }
  let uid: string;
  try {
    uid = (await getAuth(app).verifyIdToken(idToken)).uid;
  } catch {
    res.status(401).json({ error: 'Invalid auth token.' });
    return;
  }

  const db = getFirestore(app);

  // Clergy check — a roles/{uid} or legacy admins/{uid} doc.
  const [roleDoc, adminDoc] = await Promise.all([
    db.doc(`roles/${uid}`).get(),
    db.doc(`admins/${uid}`).get(),
  ]);
  if (!roleDoc.exists && !adminDoc.exists) {
    res.status(403).json({ error: 'Clergy only.' });
    return;
  }

  const body = (req.body ?? {}) as NotifyPayload;
  const category = (body.category ?? '').trim();
  const title = (body.title ?? '').trim();
  const message = (body.body ?? '').trim();
  if (!CATEGORIES.has(category)) {
    res.status(400).json({ error: 'Invalid category.' });
    return;
  }
  if (!title || !message) {
    res.status(400).json({ error: 'Title and message are required.' });
    return;
  }
  if (title.length > MAX_TITLE || message.length > MAX_BODY) {
    res.status(400).json({ error: 'Title or message too long.' });
    return;
  }

  // Collect subscriber tokens for the category.
  const snap = await db
    .collection('notificationPrefs')
    .where(new FieldPath('categories', category), '==', true)
    .get();
  const tokens: string[] = [];
  snap.forEach((d) => {
    const token = d.get('token');
    if (typeof token === 'string' && token.length > 0) tokens.push(token);
  });

  if (tokens.length === 0) {
    res.status(200).json({ sent: 0, failed: 0, subscribers: 0 });
    return;
  }

  // Send the multicast in batches of 500 (FCM's per-call limit).
  const messaging = getMessaging(app);
  let sent = 0;
  let failed = 0;
  let stale = 0;
  try {
    for (let i = 0; i < tokens.length; i += 500) {
      const batch = tokens.slice(i, i + 500);
      const resp = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: { title, body: message },
        data: { category },
      });
      sent += resp.successCount;
      failed += resp.failureCount;
      for (const r of resp.responses) {
        const code = r.error?.code ?? '';
        if (
          code.includes('registration-token-not-registered') ||
          code.includes('invalid-argument')
        ) {
          stale += 1;
        }
      }
    }
  } catch (err) {
    console.error('[api/notify] send failed', err);
    res.status(502).json({ error: 'Could not send notifications right now.' });
    return;
  }

  res.status(200).json({ sent, failed, subscribers: tokens.length, stale });
}
