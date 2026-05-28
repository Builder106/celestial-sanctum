# Calendar setup — Google Calendar publishing

The `/calendar` page renders the parish's Google Calendar (owned by
`celestialsanctumparish@gmail.com`) as an iframe embed via
[`sanctum-google-calendar-embed`](./src/app/shared/embeds/google-calendar-embed.ts).
The iframe loads on every visit, but it will show **"Could not be
displayed"** until the calendar itself is set to public. That's a
one-time toggle from the parish's Gmail account.

This replaces the prior Tockify embed. The slug never resolved and
Tockify itself is paid past a free tier; Google Calendar costs nothing,
the parish already owns the account, and it integrates with every
calendar client a visitor might use.

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

That's it. Refresh `/calendar` on the site within ~1 minute and the
embed should render the parish's events. The "Add the parish calendar"
link below the iframe lets visitors subscribe in their own
Google/Apple/Outlook client.

## Adding events

Use Google Calendar normally — phone, web, whatever's easiest. Events
created on `celestialsanctumparish@gmail.com`'s primary calendar show
up on the site within a few minutes. No site rebuild required; the
iframe re-queries Google on every page load.

For recurring weekly services (Sunday worship, Monday Bible study,
Thursday vigil, etc.), **don't** add them to Google Calendar — those
are hard-coded as cards on the same page (the "Weekly rhythm" section).
The Google embed is for one-offs: special vigils, baptisms, harvests,
choir release days, holiday services.

If a weekly service time genuinely changes, edit the `weekly` array in
[src/app/features/calendar/calendar.ts](./src/app/features/calendar/calendar.ts)
and re-deploy. (Or — if this becomes frequent — promote the weekly
schedule to a Sanity document; ping the dev.)

## Troubleshooting

- **"Could not be displayed"** in the iframe → calendar isn't public.
  Re-check step 3 above and confirm **Make available to public** is
  ticked with **See all event details**. Google sometimes takes a
  minute to propagate the setting.
- **Events visible to logged-in admins but blank for signed-out
  visitors** → access permission is set to "See only free/busy"
  instead of "See all event details". Toggle the dropdown.
- **Wrong timezone displayed** → the embed pins `America/Los_Angeles`.
  If the parish ever relocates, edit the `timezone` input on
  `<sanctum-google-calendar-embed>` in calendar.ts.
- **"Add the parish calendar" link 404s for a visitor** → they're
  signed in to a Google account that doesn't have permission. Public
  calendars work without sign-in; if Google is challenging them,
  it's usually a stale session. Open in an incognito window to confirm.
