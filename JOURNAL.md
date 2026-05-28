# JOURNAL — Celestial Sanctum

> Dated log of decisions, pivots, incidents, and quotes worth remembering. Not
> a changelog (commit messages are that) and not a ticket tracker — this
> captures the human context that disappears within weeks. Reverse-chronological.
> Tag with `#decision` / `#pivot` / `#incident` / `#quote` / `#feedback` /
> `#milestone`. One paragraph max per entry.

## 2026-05-28 — Self-host Sanity Studio for parish-branded admin URL #decision

The default Sanity-hosted Studio lives at `celestial-sanctum.sanity.studio`,
which is fine but reads as a developer tool to a parish admin. Asked
"abstract Sanity away and build a custom admin UI on the church site?"
and the answer was no — reimplementing rich-text editing, image cropping,
draft/publish, revision history, role auth and asset management for
visual coherence alone is many weeks of work that nobody would notice.
Middle path: keep Sanity Studio, rebrand it (parish title, CCC seal,
cream/ink/blue/gold theme tokens, structure that pins singletons), and
self-host on Vercel under `admin.celestialsanctumparish.org`. Sanity's
managed hosting is locked to `*.sanity.studio` so the custom domain
requires self-hosting either way — turned that constraint into the
catalyst for the rebrand. Studio code now in `studio/` builds a static
SPA via `sanity build`; a second Vercel project (`celestial-sanctum-studio`,
root dir `studio/`) will own the admin domain. DNS for
`celestialsanctumparish.org` is still pending so this lands once
registrar access is in hand.

## 2026-05-28 — Sanity → relay → descriptive Vercel deploy is live #milestone #incident

End-to-end CMS-publish-to-deploy is verified working. The Vercel
deployment list now shows `CMS: published csHomepage/homepage` as a real
Production build, distinct from the surrounding code commits — so future
parish edits in Sanity Studio will leave a legible audit trail in
`git log` and in the Vercel dashboard. Two real bugs surfaced during the
build: (1) every `api/` function was crashing with
`FUNCTION_INVOCATION_FAILED` because `tsconfig.json` has
`"module": "preserve"` (emits ES `import` syntax in compiled `.js`) but
`package.json` had no `"type": "module"`, so Node treated the output as
CommonJS and threw `SyntaxError`. Fixed by adding `type: module`. (2)
HMAC validation against Sanity's `sanity-webhook-signature` header was
permanently 401-ing because Vercel's `@vercel/node` auto-parses JSON
bodies before the handler — `JSON.stringify(req.body)` can't reproduce
the exact bytes Sanity signed. Swapped for a static `X-Webhook-Secret`
header check with constant-time compare. Same security posture (random
POSTs get rejected), no body-reconstruction problem.

## 2026-05-23 — Lighthouse 100s across six of seven routes #milestone

Phase 7 wrapped with verified Lighthouse scores via Chrome DevTools MCP:
home / about / visit / calendar / give / contact all hit 100/100/100/100
(accessibility / best-practices / SEO / agentic-browsing). `/watch` lands at
100/77/100/100 — the Best Practices ding is Spotify's embed setting `sp_t`
and `sp_landing` third-party cookies, which can't be fixed without a
click-to-load facade refactor. Real-user metrics on `/`: LCP 457 ms,
CLS 0.00, TTFB 164 ms. Deferred the facade as polish.

## 2026-05-23 — Brevo for both transactional + newsletter #decision

Phase 6 form backends were going to use Resend for the contact form and
something else for the newsletter list. Pivoted to Brevo for everything
because the other parish developer already uses Brevo for the current
newsletter — one provider, one API key, no double-vendor headache. Code
ships against Brevo's REST API directly (no SDK, lighter function bundle).
Waiting on the other dev to share the API key, sender email, and list ID
before forms actually send mail; until then they fall through to a
graceful error state.

## 2026-05-23 — Dotted Sanity IDs auto-create unshippable releases #incident

About-page docs imported as `about.story`, `about.choir`, etc. — looked
like normal IDs, were actually parsed by Sanity as `versions.<release>.
<doc>` because the dot is reserved. Studio's "published" perspective
showed them via a pinned release; public REST API returned empty. Burned
~90 minutes diagnosing (CDN cache → drafts vs published → release
versioning). Made it worse: shipping a release is a paid feature, so on
the free plan dotted-ID docs are silently unshippable. Rebuild with
`about-story` etc. and they imported as published directly. Saved
[[sanity-gotchas]] memory + a warning comment in studio/build-seed.mjs.

## 2026-05-23 — Simplify CI to build-only; Vercel handles deploys #decision

Original `.github/workflows/deploy.yml` had build-and-test +
deploy-preview + deploy-production jobs. Both deploy jobs failed every
run because Vercel secrets (TOKEN/ORG_ID/PROJECT_ID) were never wired,
and Vercel's own git integration was deploying the whole time anyway.
Replaced with `ci.yml` (build + artifact upload only) — one source of
truth for deploys, no secrets to rotate, no two-pipeline race.

## 2026-05-22 — Phase 5 pivot from Contentful to Sanity #pivot

Original plan called for Contentful. Discovered on first contact that the
existing Contentful org's single Community-tier space was already used by
an unrelated project (STAIJA/dynamerge), and the single sandbox env was
used by their staging. Both new-space and new-env creation hit quota
errors. User decided "I don't wanna risk mixing them together. Let's use
a different CMS." Picked Sanity for the generous free tier, polished
editor UI, and no shared-org risk. Saved [[celestial-sanctum-cms-choice]]
memory for future agents.

## 2026-05-22 — Angular SSR + non-HttpClient fetch is invisible to the stability gate #incident

Wired Sanity into the homepage, deployed, view-source still rendered the
hardcoded fallback. Spent ~60 minutes adding diagnostic logs to the
`SanityService` before noticing the SSR fetch fired but never logged
success — Angular's SSR engine serialized the HTML before the
`@sanity/client` Promise resolved, because only `HttpClient` calls
register as pending tasks automatically. Fix: `PendingTasks.add()` per
fetch with a `finalize` release. Saved [[angular-ssr-pendingtasks]] for
the next agent who wires axios/raw-fetch/etc. into SSR.

## 2026-05-22 — Reverent Minimalism over "Afro-Celestial Noir" #pivot

First design pass shipped a dark, photography-heavy direction called
"Afro-Celestial Noir." User looked at it and said:

> On second thought, scrap this redesign and plan another. It doesn't
> feel like an improvement over the current one.

Restarted with peer research across 12 church sites — Cathedral, Anglican,
Baptist, African Pentecostal, Black Methodist. Converged on a light/warm
palette (cream / ink / burgundy / brass-gold / celestial-blue), Cormorant
Garamond + Inter type pair, generous whitespace. The CCC-specific
photography (white sutana on celestial-blue grounds) remained the
non-negotiable anchor.

## 2026-05-22 — Standard repo baseline applied #milestone

Brought the repo up to the global CLAUDE.md baseline: README banner
(light/dark variants via `<picture>`), shields.io badges, mermaid SSR
flow diagram, LICENSE, CONTRIBUTING.md, Dependabot config, GitHub
Actions, custom SVG favicon + 180×180 apple-touch-icon, Vercel Analytics
+ Speed Insights wired into bootstrapApplication.

## 2026-05-21 — Phase 0 scaffold #milestone

Angular 21 SSR + Tailwind v4 + plain-CSS theme tokens (`.tailwind.css`
with `@theme` block; no SCSS to avoid `@import` conflicts). Initial
Contentful SDK pulled in (later replaced — see 2026-05-22 pivot). First
Vercel deploy lived at `celestial-sanctum.vercel.app`. Repo at
`github.com/Builder106/celestial-sanctum`.

---

## Placeholder entries — fill in when context shows up

These slots need information only you can provide. Fill each in with a
real paragraph once the answer lands; the dates can be approximate.

### [date] — Pastor name + portrait #decision

The homepage "Pastor's letter" section, the `/about#shepherd` section,
and the Sanity `csPastor` document all currently use placeholders
("The Pastor", silhouette SVG). Need real name, short bio, portrait
photo (any aspect ratio — Sanity Studio's hotspot tool crops to round).
Document the source of the photo (parish-supplied vs. commissioned).

### [date] — Mission phrase confirmation #decision

Hero currently uses "You are welcome to Sanctum parish." lifted verbatim
from the live celestialsanctumparish.org. If the pastor wants a
different mission phrase for the rebuild, capture the conversation here
(when, who decided, what the original alternatives were) so future agents
don't second-guess it.

### [date] — DNS holder + cutover date #decision

Phase 8 is blocked on registrar access for celestialsanctumparish.org.
When the cutover finally happens, document: who controls the DNS, what
the old WordPress site was doing on the day of cutover (parallel run? hard
cut?), whether any post-cutover 404s came in from the .php redirects in
`vercel.json`, and what the parish's "the new site is live" announcement
looked like.

### [date] — Brevo credentials received #milestone

When the other developer hands over the Brevo API key, sender email, and
contact list ID, log the date, the verified sender domain (so future
agents know which from-address the parish uses), and the first
successful send through the contact form.
