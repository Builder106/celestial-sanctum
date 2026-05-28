# Calendar setup — Google Calendar publishing

The `/calendar` page renders the parish's events server-side from the
public iCal feed of `celestialsanctumparish@gmail.com`. The site
fetches the feed during SSR, parses it with `ical.js`, expands
recurring events for the next ~120 days, and ships a parish-styled
agenda built out of Sanctum components ([`sanctum-agenda`](./src/app/shared/calendar/agenda.ts)).

No iframe, no Google chrome leaking through. The agenda matches the
rest of the site's typography (Cormorant for headings, Inter for body,
cathedral palette) and is part of the prerendered HTML — Lighthouse
sees it on first paint, no client-side fetch.

The earlier iframe embed and the prior Tockify embed both had the
same parish setup requirement, so the publishing toggle below hasn't
changed: until the calendar itself is set to public, the iCal feed
returns 404 and the agenda renders an empty state.

## One-time setup

Sign into Google Calendar as `celestialsanctumparish@gmail.com`, then:

1. https://calendar.google.com/calendar → ⚙️ → **Settings**
2. In the left sidebar under **Settings for my calendars**, click the
   calendar named after the parish account (the primary calendar — its
   name is usually the account display name).
3. Open **Access permissions for events**:
   - Tick **Make available to public**
   - Set the dropdown to **See all event details** (not just busy/free —
     visitors need to see what the events actually are)
   - Google will warn that anyone can find the calendar via search.
     That's the intent here — accept.
4. Open **Integrate calendar** further down the same settings page:
   - Confirm the **Calendar ID** is `celestialsanctumparish@gmail.com`.
     If a different ID shows here (e.g. a UUID), copy that value and
     update `calendarId` in
     [src/app/features/calendar/calendar.ts](./src/app/features/calendar/calendar.ts).
   - The **Public URL to this calendar** is what the "Add the parish
     calendar" link uses. No copy-paste needed — the page builds it
     from the calendar ID.

That's it. Trigger a fresh deploy (or wait for the next CMS publish to
rebuild the site) and the agenda will render the parish's events. The
"Add the parish calendar" link below the agenda lets visitors subscribe
in their own Google/Apple/Outlook client.

## Adding events

Use Google Calendar normally — phone, web, whatever's easiest. Events
created on `celestialsanctumparish@gmail.com`'s primary calendar show
up on the site **on the next rebuild**, not instantly. The agenda is
rendered server-side and embedded in the HTML for Lighthouse + SEO; if
you want a new event live immediately, trigger a deploy by publishing
any document in [the Sanity Studio](https://celestial-sanctum-studio.vercel.app)
or pushing any commit to `main`.

Recurring events are handled correctly — add a weekly Bible study on
Google Calendar, and the agenda shows every upcoming instance over the
next ~120 days. There's no need to maintain anything in code for
recurring patterns (unlike the prior "Weekly rhythm" cards, which are
still on the page above the agenda for the *canonical* weekly schedule
since those times rarely change).

If a weekly service time genuinely changes, edit the `weekly` array in
[src/app/features/calendar/calendar.ts](./src/app/features/calendar/calendar.ts)
and re-deploy. (Or — if this becomes frequent — promote the weekly
schedule to a Sanity document; ping the dev.)

## Troubleshooting

- **Agenda shows "Couldn't reach the parish calendar"** → calendar
  isn't public, so the iCal feed returns 404. Re-check step 3 above and
  confirm **Make available to public** is ticked with **See all event
  details**. Google sometimes takes a minute to propagate the setting.
- **Events visible to logged-in admins but blank to the agenda** →
  access permission is set to "See only free/busy" instead of "See all
  event details". Toggle the dropdown.
- **Wrong timezone displayed** → the agenda pins `America/Los_Angeles`.
  If the parish ever relocates, edit `TIMEZONE` in
  [src/app/shared/calendar/agenda.ts](./src/app/shared/calendar/agenda.ts).
- **A new event isn't showing up** → the agenda is server-rendered,
  so new events appear on the next deploy, not instantly. Publish any
  Sanity document or push any commit to `main` to trigger a rebuild.
- **"Add the parish calendar" link 404s for a visitor** → they're
  signed in to a Google account that doesn't have permission. Public
  calendars work without sign-in; if Google is challenging them,
  it's usually a stale session. Open in an incognito window to confirm.
