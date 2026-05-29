# PayPal setup — `/give` donation flow

The `/give` page uses **PayPal hosted buttons** to take donations. The
button-creation and account-level settings live in the parish's
PayPal Business account; the website only knows the `hosted_button_id`
for each button. This doc captures the parish-side actions the site
depends on.

## What's wired today

- **One-time giving** — hosted button `XWNJRKDNUUTFU` (the existing
  donate button from celestialsanctumparish.org/give.php). Preset
  amounts: $5 / $10 / $25 / $100, plus "Other amount" that lets the
  donor enter any amount on PayPal's page.
- **Monthly giving** — UI is built (the One-time / Monthly toggle on
  `/give`) but the hosted button ID isn't set yet. Until it is, the
  "Monthly" tab gracefully routes visitors to the contact form with
  the topic pre-filled.
- **Post-payment landing** — `/give/thank-you` is built and the site
  passes `return` + `cancel_return` URLs through to PayPal. PayPal
  only honors these if the hosted button is configured to "let
  merchant specify URL" — see step 3.

## Step 0 — Clean up the existing donate button's settings

The existing `XWNJRKDNUUTFU` button currently has two quirks that
surface on PayPal's checkout page and confuse donors:

1. **"Make this a monthly donation" checkbox** appears on every
   checkout (including when the donor came from the One-time tab).
   This is because the button was originally created with "accept
   recurring donations" ticked.
2. **Pre-selected amount doesn't carry over** — donors who picked
   `$5` on `/give` land on a PayPal page showing `$0` and have to
   re-enter the amount. The site DOES pass `&amount=5` in the URL,
   but PayPal ignores it unless the button allows preset amounts via
   URL.

Fix both in one visit to PayPal Business:

1. **Pay & Get Paid** → **PayPal buttons** → click the existing
   `Donate` button (the one whose ID starts with `XWNJRKDNUUTFU`).
2. Click **Edit button**.
3. In the **Donation amount** section:
   - Select **Donors enter their own amount or click a preset
     amount**, OR
   - Select **A fixed amount** if you want $5/$10/$25/$100 baked
     into the button (we'd then drop our URL-level amount param
     since PayPal would override it).
   - Easiest path: pick **Donors enter their own amount** and tick
     **Allow amount to be passed in URL** (or whatever the equivalent
     option is named in PayPal's UI). That makes `&amount=5` honored.
4. In **Customize advanced features** → **Show recurring option to
   donor**: untick this. The dedicated monthly Subscribe button
   (step 2 below) is the home for recurring donations; donors on the
   One-time tab shouldn't see the checkbox.
5. Save. PayPal MAY issue a new `hosted_button_id` after saving
   (older buttons sometimes do); if so, paste the new ID into
   [src/app/features/give/give.ts](./src/app/features/give/give.ts)
   at `paypalButtons.oneTime` and commit.

## Step 1 — Verify the existing one-time button (one-time, ~5 minutes)

Confirm `XWNJRKDNUUTFU` still routes to the right PayPal account and
the right designation. The button was lifted from the live site months
ago; PayPal accounts occasionally get reorganized, payment methods
get disconnected, or the button gets archived.

1. From a personal browser (not signed into the parish PayPal):
   - Open <https://celestial-sanctum.vercel.app/give>
   - Pick `$5`, click **Continue to PayPal**
   - On PayPal's page, complete the payment using a card or your own
     PayPal account
2. Within ~1 minute:
   - The parish's PayPal Business account should receive a $5
     notification email
   - The donor (you) should receive a PayPal receipt
3. Once verified, refund the test transaction from PayPal Business →
   Activity → the test payment → **Issue refund**

If anything goes wrong (no email, payment lands in a different
account, designation is wrong), the button needs to be re-created.
Open PayPal Business → **Pay & Get Paid** → **PayPal buttons** →
**Create new button** with type **Donate**, then paste the new ID
into [src/app/features/give/give.ts](./src/app/features/give/give.ts)
at `paypalButtons.oneTime`.

## Step 2 — Create the subscription (monthly) button

This unlocks the "Monthly" tab on `/give`.

1. Sign into PayPal Business as the parish.
2. **Pay & Get Paid** → **PayPal buttons** → **Create new button**.
3. Choose button type **Subscribe** (not "Donate" — donate buttons
   don't support recurring billing).
4. Fill in:
   - **Item name**: `Monthly gift — Celestial Sanctum Parish`
   - **Billing amount**: leave blank so the donor can pick (the site's
     amount selector pre-fills this via `amount=` URL param)
   - **Billing cycle**: `1 month`
   - **Billing for how long**: `Until subscriber cancels`
   - **Currency**: `USD`
5. Under **Customize advanced features**, tick:
   - Allow donor to change amount on PayPal page
   - Show "Save my country" → **No** (donors are mostly US)
   - **Allow donor to specify a URL** — leave it set so the
     site-supplied `return` and `cancel_return` URLs work (see step 3)
6. **Create button**. PayPal shows an HTML snippet — copy the
   `hosted_button_id` value out of it (looks like `XXXXXXXXXXXXX`).
7. Open
   [src/app/features/give/give.ts](./src/app/features/give/give.ts)
   and paste the ID into `paypalButtons.monthly`:
   ```ts
   private readonly paypalButtons = {
     oneTime: 'XWNJRKDNUUTFU',
     monthly: 'YOUR_NEW_ID_HERE',
   };
   ```
8. Commit and push. Within ~90s the deploy lands and the Monthly tab
   becomes active.

## Step 3 — Configure return URLs on both buttons

This is what makes donors land on `/give/thank-you` after they pay,
instead of PayPal's generic confirmation.

1. PayPal Business → **Account Settings** → **Website Payments** →
   **Website Preferences** → **Update**.
2. **Auto Return**: turn ON.
3. **Return URL**: `https://celestialsanctumparish.org/give/thank-you`
   (use the production parish domain, not the Vercel preview URL).
4. **Save**.

That setting applies to every hosted button on the account. The site
also passes per-payment `return` + `cancel_return` URLs in the
checkout URL — those override the account-level setting per payment.

## Step 4 — Designations (future)

When the parish wants donors to designate gifts (general fund /
building fund / outreach / etc.), each designation gets its own
hosted button. Repeat step 2 for each designation, add the IDs to a
new `paypalButtons.byDesignation` map in `give.ts`, and surface a
designation picker on `/give`. Out of scope for the current pass —
ping the dev when ready.

## Troubleshooting

- **Donor reports "button didn't go to PayPal"** → most likely the
  hosted button was archived in PayPal. Re-run step 1; if the
  payment doesn't land, recreate the button per step 1's "anything
  goes wrong" note.
- **Donor reports "I paid but didn't get to the thank-you page"** →
  the return URL isn't configured. Check step 3 is done and the
  button is set to "let merchant specify URL" (step 2 → advanced
  features) on the specific button that took the payment.
- **Monthly tab still says "Contact us…" after step 2** → the
  `paypalButtons.monthly` constant is still null. Make sure step 2
  finishes with the deploy (commit + push, wait ~90s for Vercel).
