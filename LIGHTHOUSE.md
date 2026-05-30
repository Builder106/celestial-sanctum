# Lighthouse audit — 2026-05-29

Re-audit run on every public route after a heavy round of additions
since the Phase-7 baseline (Sanity-driven content, YouTube + iCal
feeds, search palette, CZM microsite, choir page, PayPal pass, mobile
SPA-nav fallbacks).

## Scores

Run via Chrome DevTools MCP, desktop emulation, navigation mode.

| Route | Accessibility | Best Practices | SEO | Agentic |
|---|---|---|---|---|
| `/` | 96 | 100 | 100 | 100 |
| `/visit` | 96 | 100 | 100 | 100 |
| `/about` | 96 | 100 | 100 | 100 |
| `/watch` | 96 | 77 | 100 | 100 |
| `/calendar` | 96 | 100 | 100 | 90 |
| `/give` | 96 | 100 | 100 | 92 |
| `/contact` | 96 | 100 | 100 | 100 |
| `/choir` | 96 | 100 | 100 | 100 |
| `/czm` | 95 | 77 | 100 | 93 |

Performance not included — the audit tool excludes performance
category by design. Worth a separate `performance_start_trace` pass
if Web Vitals on the deployed site become a concern.

## Findings

### Universal — affects every route via the global header

These are the two failures dragging Accessibility from 100 → 96 on
every page. Both originate in the search bar added to the parish
header and the home-link wordmark. Fixed in the same commit as this
doc:

1. **color-contrast on `⌘K` kbd in the search bar.**
   The kbd carried `text-sanctum-muted/80` against a cream background
   — effective ratio fell below WCAG AA 4.5:1. Bumped to full
   `text-sanctum-muted`.
2. **label-content-name-mismatch on home link + search button.**
   The home link's `aria-label="Celestial Sanctum Parish — home"`
   contained "Parish" but the visible wordmark reads "Celestial
   Sanctum" + "Bloomington · California" — voice-control users
   couldn't say "click Celestial Sanctum Parish" because the visible
   text didn't include "Parish." Trimmed aria-label to `"Celestial
   Sanctum — home"`. The search button had `aria-label="Search the
   parish (Cmd+K)"` which didn't lexically match the visible
   "Search the parish… ⌘K" content. Removed the aria-label so the
   button's accessible name derives from its visible content; the
   `title` attribute carries the same hover hint for pointer users.

Expected impact after redeploy: every route lifts to a11y 100.

### Per-route — accepted tradeoffs

- **`/watch` Best Practices 77** — Spotify embed sets `sp_t` and
  `sp_landing` third-party cookies. Accepted at Phase 7 in exchange
  for the in-place player UX (`SpotifyEmbed` source comment captures
  the rationale). No change.
- **`/czm` Best Practices 77** — same Spotify cookies on the four
  podcast embeds (Kindling, Jehovah Rabboni, Symbols of Spirituality,
  Heresies). Same accepted tradeoff.

### Per-route — open items

- **`/calendar` CLS 0.172, `/give` CLS 0.154, `/czm` CLS similar.**
  All above Google's "Good" threshold of 0.1, all below the "Failing"
  threshold of 0.25. Likely sources: webfont swap shifting display
  copy, the agenda card growing in height as events populate, the
  Spotify embed expanding on CZM. The audit tool doesn't surface
  per-element layout-shift breakdown (performance details are
  excluded from lighthouse_audit). A follow-up pass using
  `performance_start_trace` would point at the exact culprits.
  Candidate fixes once identified: pin minimum heights on the agenda
  + Spotify card wrappers, ship `font-display: optional` on Cormorant
  + Inter, or preload the most-used variants.
- **`/calendar` + `/give` + `/czm` Agentic 90-93.** "Agentic Browsing"
  is a newer Lighthouse category that scores how machine-readable the
  page is (semantic landmarks, ARIA roles, microdata). The drop from
  100 is in the same ballpark as the CLS dip — likely the iframe
  embeds (Spotify, Google Calendar previously) interfering with
  landmark detection. Worth a closer look but not failing.

## Next steps

- **Done in this pass:** universal header a11y fixes.
- **Defer:** CLS investigation + performance trace (need a separate
  `performance_start_trace` run, and the fixes are font/layout work
  that should be batched).
- **Don't fight:** Spotify third-party cookies on `/watch` + `/czm`
  — the parish wants the branded player visible on page load; that
  was already settled at Phase 7.
