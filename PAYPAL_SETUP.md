# PayPal setup — `/give` donation flow

The `/give` page routes donors to the parish's existing PayPal donate
button (`hosted_button_id=XWNJRKDNUUTFU`). The button itself lives in
the parish's PayPal Business account; the site can only build URLs
that point at it.

## What's wired today

- **The donate button supports both one-time and monthly donations
  natively** — PayPal's checkout page includes a "Make this a monthly
  donation" checkbox the donor ticks if they want recurring. The site
  doesn't try to split these into two flows; one CTA, one URL, the
  donor picks frequency on PayPal.
- **Suggested amounts** ($5 / $10 / $25 / $100 + Other) render as
  visual anchors. The donor types the amount on PayPal's page — the
  button doesn't currently honor URL-passed `amount=` values.
- A line of help copy below the CTA names the selected suggestion and
  tells the donor how to enable recurring on PayPal's page if they
  want it.
- `/give/thank-you` exists and the site passes `return` URLs to
  PayPal. They only take effect if Auto Return is enabled on the
  parish's PayPal account (Account Settings → Website Payments →
  Auto Return). Until then, PayPal's generic confirmation is what
  donors see post-payment.

## Known PayPal-side behaviors

These are configurations on the parish's PayPal button that the site
can't override. Surfaced here so they're documented; only matter if
parish access becomes available later.

1. **The monthly checkbox shows on every checkout.** Donors arriving
   from the One-time tab still see the "Make this a monthly donation"
   checkbox. Fix from PayPal Business → PayPal buttons → edit
   `XWNJRKDNUUTFU` → Customize advanced features → untick "Show
   recurring option to donor". Site copy already tells the donor to
   leave it unchecked when they came from the One-time tab.
2. **Amount doesn't pre-fill on PayPal.** The donate page opens with
   `$0` regardless of which suggested amount the donor clicked. Fix
   from PayPal Business → same edit screen → Donation amount →
   switch to "Donors enter their own amount" and tick the option that
   allows URL-passed amounts. Site copy already tells the donor what
   amount to enter.
3. **No return URL after payment.** Donor lands on PayPal's generic
   thank-you. Fix from PayPal Business → Account Settings → Website
   Payments → Auto Return → ON, with the return URL set to
   `https://celestialsanctumparish.org/give/thank-you`. Site already
   passes that URL on every checkout, so the moment Auto Return is on,
   the redirect starts working without a code change.

## If a parish admin later opens the dashboard

Walk them through:
1. **Verify the existing button still works** — small $1 test
   transaction from a personal browser → confirm the parish account
   receives the email + receipt arrives at the donor → refund.
2. **Fix the three behaviors above** if desired.
3. **Optional:** create a dedicated `Subscribe` button for monthly
   giving (separate `hosted_button_id`). If they do, ping the dev so
   the site can swap from "one button + checkbox" to "two buttons,
   no checkbox" — cleaner UX, no copy guidance needed.

## Designations (future)

When designated giving is wanted (general fund / building fund /
outreach / etc.), each designation gets its own hosted button in
PayPal. Out of scope for the current pass.
