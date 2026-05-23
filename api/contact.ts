import type { VercelRequest, VercelResponse } from '@vercel/node';

// POST /api/contact — receives the contact form, forwards it to the parish
// via Brevo's transactional email API. Used by both the General/Visit/
// Volunteer/Other topics AND the Prayer Request topic — there is no
// separate prayer endpoint; the topic is just a routing hint in the
// subject line.
//
// Env vars (set in Vercel project settings):
//   BREVO_API_KEY        — Brevo API key with transactional permission
//   BREVO_SENDER_EMAIL   — verified sender (e.g. "no-reply@<parish-domain>")
//   BREVO_SENDER_NAME    — optional display name (defaults to "Celestial Sanctum Parish")
//   CONTACT_RECIPIENT    — recipient inbox (defaults to celestialsanctumparish@gmail.com)

interface ContactPayload {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
  honeypot?: string;
}

const ALLOWED_TOPICS = new Set(['General', 'First-Time Visit', 'Prayer Request', 'Volunteer', 'Other']);
const MAX_NAME = 200;
const MAX_MESSAGE = 5000;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body as ContactPayload;

  // Honeypot — silently accept and discard. Bot doesn't learn it was caught.
  if (body.honeypot && body.honeypot.length > 0) {
    res.status(200).json({ ok: true });
    return;
  }

  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();
  const topic = (body.topic ?? 'General').trim();
  const message = (body.message ?? '').trim();

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Name, email, and message are required.' });
    return;
  }
  if (name.length > MAX_NAME || message.length > MAX_MESSAGE) {
    res.status(400).json({ error: 'Message too long.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Email looks malformed.' });
    return;
  }
  if (!ALLOWED_TOPICS.has(topic)) {
    res.status(400).json({ error: 'Invalid topic.' });
    return;
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME ?? 'Celestial Sanctum Parish';
  const recipient = process.env.CONTACT_RECIPIENT ?? 'celestialsanctumparish@gmail.com';

  if (!apiKey || !senderEmail) {
    // Surface as 500 so the form's error state triggers; the parish phone
    // number on the contact page becomes the fallback channel.
    console.error('[api/contact] BREVO_API_KEY or BREVO_SENDER_EMAIL not configured');
    res.status(500).json({ error: 'Email backend not configured.' });
    return;
  }

  const subject = `[${topic}] Parish website — ${name}`;
  const htmlBody = [
    `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p>`,
    `<p><strong>Topic:</strong> ${escapeHtml(topic)}</p>`,
    `<hr />`,
    `<p>${escapeHtml(message).replace(/\n/g, '<br />')}</p>`,
  ].join('\n');

  try {
    const brevo = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: recipient }],
        replyTo: { email, name },
        subject,
        htmlContent: htmlBody,
      }),
    });

    if (!brevo.ok) {
      const text = await brevo.text();
      console.error('[api/contact] Brevo error', brevo.status, text);
      res.status(502).json({ error: 'Could not send message right now.' });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[api/contact] fetch failed', err);
    res.status(502).json({ error: 'Could not send message right now.' });
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
