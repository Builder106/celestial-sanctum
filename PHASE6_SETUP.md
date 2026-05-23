# Phase 6 setup — Brevo + Vercel env vars

The `/contact` form and the footer newsletter signup are wired to two Vercel
serverless functions ([`api/contact.ts`](./api/contact.ts) and
[`api/newsletter.ts`](./api/newsletter.ts)) that talk to Brevo's REST API. The
code is deployed and the forms render normally on every page, but they'll
return a graceful error until the env vars below are filled in.

## What you need from the other developer

The parish already uses Brevo for newsletters. From them, get:

1. **Brevo API key** with these permissions:
   - `Transactional Emails: Send a transactional email`
   - `Contacts: Create or update a contact`
2. **Newsletter contact list ID** — a numeric ID. Find it in Brevo dashboard
   under **Contacts → Lists** (click into "Sanctum News" or whichever the
   parish list is named — the ID shows in the URL: `/contact/list/<id>`).
3. **A verified sender email** — Brevo refuses to send mail from unverified
   senders. The other developer has likely already verified a sender for
   newsletter use; reuse that one. e.g. `no-reply@celestialsanctumparish.org`
   or whatever they set up.

## Set the env vars on Vercel

In https://vercel.com/Builder106/celestial-sanctum/settings/environment-variables,
add the following (all four for both Production and Preview environments):

| Name | Value | Notes |
|---|---|---|
| `BREVO_API_KEY` | (from step 1 above) | Same key for both endpoints |
| `BREVO_SENDER_EMAIL` | (from step 3) | Used only by /api/contact |
| `BREVO_NEWSLETTER_LIST_ID` | (from step 2) | Used only by /api/newsletter |
| `BREVO_SENDER_NAME` | `Celestial Sanctum Parish` | Optional; defaults shown if omitted |
| `CONTACT_RECIPIENT` | `celestialsanctumparish@gmail.com` | Optional; defaults shown if omitted |

After saving, redeploy production (Vercel does this automatically on the next
push, or click "Redeploy" in the dashboard).

## Test locally

To exercise the functions on `localhost`, you need `vercel dev` (not
`npm start`, which only runs Angular SSR and skips the functions):

```bash
vercel link    # one-time, links the local repo to the Vercel project
vercel env pull .env.local    # downloads the env vars you set above
vercel dev     # starts both Angular SSR + the /api/* functions on :3000
```

Open `http://localhost:3000/contact`, fill the form, submit. You should
get the "Message received" confirmation and an email arrives at
`celestialsanctumparish@gmail.com`. Try the footer newsletter form on any
page — visitor email should appear in the Brevo contact list.

## What the endpoints do

### POST /api/contact

Body: `{ name, email, topic, message, honeypot }`. Server-side validates
required fields + email format + topic against an allowlist. If the
honeypot field is non-empty, returns 200 silently (the bot doesn't learn
it was caught). On success, sends a transactional email via Brevo with:

- **From:** `BREVO_SENDER_NAME <BREVO_SENDER_EMAIL>`
- **Reply-To:** the visitor's email and name (so parish can reply directly)
- **To:** `CONTACT_RECIPIENT`
- **Subject:** `[<topic>] Parish website — <name>`
- **Body:** plain-formatted name + topic + message (HTML-escaped)

The Prayer Request topic uses the same endpoint — the topic just routes
into the subject line so the parish can filter their inbox.

### POST /api/newsletter

Body: `{ email, honeypot }`. Server-side validates email format. Calls
Brevo's `POST /v3/contacts` with the email and the list ID, using
`updateEnabled: true` so a re-signup is a no-op rather than an error.
Duplicate signups return 200 (the visitor doesn't see "already subscribed"
as a failure).

## When things go wrong

- **500 "Email backend not configured."** — env vars missing on Vercel. Re-check
  the table above and redeploy.
- **502 "Could not send message right now."** — Brevo rejected the call.
  Check the Vercel function logs (`vercel logs <deployment-url>`); usually a
  sender-not-verified error or a rate limit hit.
- **Form spinner forever** — check browser DevTools Network. The function
  must return JSON; if Vercel is returning HTML (404), the `api/` folder isn't
  being picked up.

## Future hardening (not blocking)

- Add Vercel BotID for form anti-bot beyond the honeypot
- Add rate limiting via Vercel Firewall (free tier: 5 rules)
- Move from a generic sender to a verified parish domain (improves
  deliverability + Sender Score)
- Add an unsubscribe link in newsletter broadcasts (Brevo handles this in
  their templates, but the parish needs to use Brevo's broadcast UI to send)
