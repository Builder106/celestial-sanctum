import type { VercelRequest, VercelResponse } from '@vercel/node';

// POST /api/newsletter — adds an email to the parish's Brevo contact list
// for "Sanctum News" newsletter.
//
// Env vars:
//   BREVO_API_KEY              — Brevo API key with contacts permission
//   BREVO_NEWSLETTER_LIST_ID   — numeric ID of the existing Sanctum News list
//
// Brevo returns 204 No Content when a contact is created. If the email
// already exists in the list, Brevo returns 400 with code "duplicate_parameter" —
// we treat that as a success from the user's perspective (they're already
// subscribed; surfacing an error would be confusing).

interface NewsletterPayload {
  email?: string;
  honeypot?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body as NewsletterPayload;

  if (body.honeypot && body.honeypot.length > 0) {
    res.status(200).json({ ok: true });
    return;
  }

  const email = (body.email ?? '').trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Please enter a valid email.' });
    return;
  }

  const apiKey = process.env['BREVO_API_KEY'];
  const listIdRaw = process.env['BREVO_NEWSLETTER_LIST_ID'];
  const listId = listIdRaw ? Number(listIdRaw) : NaN;

  if (!apiKey || !Number.isInteger(listId)) {
    console.error('[api/newsletter] BREVO_API_KEY or BREVO_NEWSLETTER_LIST_ID not configured');
    res.status(500).json({ error: 'Newsletter backend not configured.' });
    return;
  }

  try {
    const brevo = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        email,
        listIds: [listId],
        updateEnabled: true,
      }),
    });

    // 201 Created on new contact; 204 No Content also acceptable.
    if (brevo.status === 201 || brevo.status === 204) {
      res.status(200).json({ ok: true });
      return;
    }

    // Duplicate is fine from the visitor's perspective.
    if (brevo.status === 400) {
      const payload = await brevo.json().catch(() => ({}));
      if (payload?.code === 'duplicate_parameter') {
        res.status(200).json({ ok: true, alreadySubscribed: true });
        return;
      }
    }

    const text = await brevo.text();
    console.error('[api/newsletter] Brevo error', brevo.status, text);
    res.status(502).json({ error: 'Could not subscribe right now.' });
  } catch (err) {
    console.error('[api/newsletter] fetch failed', err);
    res.status(502).json({ error: 'Could not subscribe right now.' });
  }
}
