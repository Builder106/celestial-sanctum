# JOURNAL — Celestial Sanctum

> Dated log of decisions, pivots, incidents, and quotes worth remembering. Not
> a changelog (commit messages are that) and not a ticket tracker — this
> captures the human context that disappears within weeks. Reverse-chronological.
> Tag with `#decision` / `#pivot` / `#incident` / `#quote` / `#feedback` /
> `#milestone`. One paragraph max per entry.

## 2026-06-04 — Web push never actually worked — missing service worker #incident

Setting up the end-to-end notification test surfaced that web push could never
have fired: FCM's `getToken()` requires a `/firebase-messaging-sw.js` service
worker, and the project had none — a web member's "Enable notifications" would
have failed silently at token registration. Generated it from
`gen-firebase-env.mjs` (same pattern as the env module: public config inlined
from `NG_APP_FIREBASE_*`, gitignored, regenerated every build, pinned to the
installed Firebase version) — a minimal SW that inits messaging so `getToken`
works and notification-payload messages auto-display in the background (no
`onBackgroundMessage`, to avoid duplicate notifications). Native push is
unaffected (the Capacitor plugin owns the token). iOS still needs an APNs key.

## 2026-06-03 — Push notification delivery wired via a Vercel API route #milestone #decision

Wired the send-side of notifications. Clients can't push to other devices
(needs the Admin SDK), and the Firebase project is on the free Spark plan (no
Cloud Functions), so the sender is a Vercel serverless function — `api/notify.ts`
— using `firebase-admin`: it verifies the caller's ID token, re-checks the
clergy role server-side, queries `notificationPrefs` for everyone subscribed to
a category, and sends an FCM multicast. Chose Vercel over upgrading to Blaze for
Cloud Functions (stays $0). Trigger is a clergy broadcast screen (`/clergy/notify`)
now; automatic event-triggers are the deferred half of "both." Two secrets the
user provided live only in Vercel env (never in git): `FIREBASE_SERVICE_ACCOUNT`
(the Admin key — also gitignored the downloaded `*firebase-adminsdk*.json` the
moment it landed in the repo folder, before it could be committed to the public
repo) and the web-push `NG_APP_FIREBASE_VAPID_KEY`. Still pending for real
delivery: members opting in, mobile rebuilds, and an APNs key for iOS.

## 2026-06-03 — Six member features shipped behind a clergy/congregation role model #milestone #decision

Built out the member area in one pass (everything except logistics, which needs
parish-staff input): testimonies (mark a prayer answered → `/testimonies`),
encouragement notes under prayers, confidential pastoral requests + a
service/sacrament booking form (both → one `/clergy/inbox`), a daily devotional
with an in-app clergy editor + a per-member reading streak, and
notification-category preferences (finishing the half-wired `messaging.service`).
The spine is a Firestore role model: clergy are a `roles/{uid}` doc (the legacy
`admins` doc still counts), checked by an `isClergy()` rules helper + a
signal-based `RoleService` — chose console-managed Firestore docs over Auth
custom claims for hand-managed clergy (no Admin SDK, instantly editable). Per the
user's calls: confidential requests are readable by all clergy (not
shepherd-only), and the devotional is authored in-app (not Sanity). Added an auth
`ready` flag so member-gated screens can tell "still resolving" from "signed
out." All six compile clean; rules + the testimonies index deployed in one batch.

## 2026-06-02 — Prayer wall shipped; member directory deferred (doxxing) #milestone #decision

Built the first member feature — a Firestore-backed prayer wall at `/prayers`:
public read, signed-in members post (with an anonymous toggle), tap "I prayed"
once each, report, and delete their own; moderators (members in `/admins`) delete
any. Stood up the Firestore layer from scratch — `FirestoreService` with
auto-detect long-polling (the default WebChannel transport stalls in the
Capacitor WebView, same class as the Auth hang), security rules, `firebase.json`
— keeping user-generated content in Firestore and Sanity reserved for editorial
content. The "I prayed" counter is guarded server-side by a rules invariant: the
+1 only commits when the same write creates the member's own `prayedBy` marker
that didn't exist before, so it's one tap per member, ever. Deferred the parish
*directory*: the user flagged that a member-to-member roster "could lead to
doxxing" — which is right — so only a curated leadership/ministries directory
(Sanity, no member PII) is even on the table, and that's filed for later. Profile
copy updated to drop the directory promise.

## 2026-06-02 — Android app verified on emulator; branded sign-in renders #milestone #incident

Brought the app up on Android for the first time (Pixel AVD, API 35, JDK 21) to
confirm the Google/Apple sign-in logos render like they now do on iOS.
`gradlew assembleDebug` succeeded in 3m22s; the app boots to the celestial-blue
hero and the Profile tab shows the multicolor Google "G" and the Apple mark on
the two sign-in buttons — parity with iOS. Two log red herrings worth
remembering: a `FATAL EXCEPTION` in `com.google.android.gms.persistent`
(`NetworkCapability 37 out of range`, thrown during FCM push registration) reads
like an app crash but is a bundled-Play-Services-vs-emulator-platform bug — it
kills a GMS service, not the app (which stays alive and focused); and the
`/_vercel/insights/script.js` 404s are expected (those resolve only behind
Vercel's edge). Also: the first `monkey`-based launch left focus on the
launcher — an explicit `am start -n …/.MainActivity` was needed. Getting here at
all required a disk cleanup first: the emulator needs 7.4 GB free and the
Drive-hosted project had the machine ~97% full (cleared Claude/Docker orphans +
unused Android system images to reach 28 GB).

## 2026-06-02 — Google sign-in hung in the Capacitor webview #incident

Member sign-in (the new Profile tab) shipped, but "Continue with Google"
finished Google's OAuth (token + profile fetched, per the device log) then
stalled forever on "Signing in…" — a pending promise, no error. Two compounding
causes: I'd set `skipNativeAuth: false` (the plugin attempted a redundant
native-Firebase sign-in that never resolved), and `getAuth()`'s default
popup-redirect resolver hangs in the WKWebView (it waits on an `authDomain`
iframe that never loads), so `signInWithCredential` sat pending. Took two failed
guesses — the iOS JS console isn't in `os_log` and `--console` only catches
stderr; an on-screen step indicator finally pinpointed the stuck await. Fix:
`skipNativeAuth: true` + native `initializeAuth(app, { persistence:
indexedDBLocalPersistence })` (no resolver); web keeps `getAuth()` for the popup
fallback. Google sign-in now completes end-to-end on the simulator.

## 2026-06-01 — Native shell verified on simulator; Firebase launch-crash #incident #milestone

First real run of the iOS app on a simulator (Xcode 26.5, iPhone 17) crashed
instantly: `@capacitor-firebase/authentication`'s native `load()` calls
`FirebaseApp.configure()` unconditionally, which throws with no
`GoogleService-Info.plist` — so the native app was un-launchable, contradicting
MOBILE.md's "no-op when unconfigured" line (true for the JS services, false for
the native plugin). Provisioned a real Firebase project, registered the iOS app
(`org.celestialsanctumparish.app`), and referenced the plist in the App target
via the `xcodeproj` gem (the project isn't a synchronized group, so it needed an
explicit reference). App now boots clean — native HOME/WATCH/CALENDAR/GIVE tab
bar, sutana hero, live Sanity content, countdown. The plist is gitignored (the
public repo carries the API key). Aside: building inside Google Drive filled the
disk mid-build (Firebase SPM clones are multi-GB); cleared ~5 GB of regenerable
Xcode/SwiftPM caches to finish — native builds really shouldn't live in Drive.

## 2026-05-30 — CI now gates on unit + E2E, not just build #decision #incident

The CI job was named "Build + test" but only ran the build — the Vitest unit
spec and the Playwright QA suite never executed. Split it into three parallel
jobs (build / unit / E2E); E2E self-boots `ng serve` and renders against the
public Sanity dataset, so it needs no CI secrets. Verifying the suite first
surfaced a real test bug: the shared "I see the heading" step ran `.or()` on
two single-element locators, which on /visit resolved to two nodes (hero `<h1>`
plus a `<p>` echoing the phrase) and tripped Playwright strict-mode — fixed
with an outer `.first()`; suite is now 10/10. Twist: that same parens path
(`My Drive (yvaughan@…)`) breaks Vitest's spec discovery locally, so the unit
spec had *never actually run* — and the first real CI run caught two latent
bugs in it: `detectChanges()` threw NG05105 (no animations provider for the
`@routeFade` trigger), and it asserted home-route text that isn't in the
shell. Rewrote the spec to render-free logic checks (`bareChrome` +
`prepareRoute`); all three jobs (build / unit / E2E) now green on `main`.

## 2026-05-30 — Dependabot's TypeScript 6 bump can't satisfy Angular 21 #incident #decision

Dependabot's weekly dev-tooling PR (#8) kept bundling a `typescript` 5.9 → 6.0
major that Angular 21 forbids — `@angular/build` and `@angular/compiler-cli`
pin `typescript >=5.9 <6.0`, so `npm ci` died with ERESOLVE before the build
ran and the PR sat red for days. Closed #8 and added a Dependabot `ignore` for
`typescript` semver-majors until Angular ships TS 6 support (v22+). The grouped
jsdom 28→29 bump was collateral and will return on its own once it's no longer
chained to the blocked TS major. Lesson: group bumps are only as mergeable as
their most-constrained member.

## 2026-05-30 — Native shell: tab bar + CCC-seal app icon #milestone

Capacitor builds now ship the parish shell adapted for iOS / Android.
A `PlatformService` exposes `Capacitor.isNativePlatform()` as the gate;
when true, `App.html` swaps the parish footer for a fixed bottom
`MobileTabBar` (Home / Watch / Calendar / Give) and the header hides
its desktop nav + Contact cluster — the hamburger drawer still opens
the full menu so About / Visit / Contact / Choir / CZM / Constitution
remain reachable. A `pb-mobile-tabs` utility (60px + safe-area-bottom)
keeps trailing content above the bar over the iOS home indicator and
Android gesture pill. `@capacitor/assets` generated 104 platform
icons + splashes (87 Android, 10 iOS, 7 PWA) from a 1024×1024 source
built by rasterizing the existing `cccIcon.svg` and compositing onto
the parish cream `#FBF8F1` — matches the live site's apple-touch-icon
precedent. **Why:** the tab-bar surface is the only native pattern
iOS users will recognize as a "real app"; without it the build still
feels like a wrapped website. **How to apply:** any future
parish-specific surface (push registration UI, native-only flows)
gates on `PlatformService.isNative`, not on user-agent sniffing or
viewport width — the same web bundle ships in three places (web,
iOS, Android) and the platform service is the single discriminator.

## 2026-05-29 — Drop the One-time / Monthly toggle on /give #decision

User asked the right question: do we really need separate buttons when
PayPal handles that on its page? Answer was no. Both tabs had been
routing to the same hosted button anyway; the only thing the toggle
flipped was a couple of words in the help text. Two control surfaces
for the same decision felt like the site was pretending to do work
PayPal already does. **Why:** post-toggle the page is honest — one
amount picker, one CTA, one line of help copy that names both options
("On PayPal's page, enter $25. Tick 'Make this a monthly donation' if
you'd like recurring"). **How to apply:** when a third-party flow
exposes a control we'd duplicate, defer to theirs; surface awareness
in copy instead of building a parallel UI.

## 2026-05-29 — /give without parish PayPal dashboard access #pivot

The first PayPal pass assumed parish-side dashboard access for two
things: (1) creating a dedicated Subscribe button for monthly giving,
(2) flipping per-button settings to remove the "Make this a monthly
donation" checkbox + allow URL-passed amounts. User confirmed they
don't have access. Two behaviors live on the parish's existing button
that we can't override: monthly checkbox always shows; URL `amount=`
gets ignored. Pivoted from "build around two PayPal buttons" to "build
honest copy around the one PayPal button, name both behaviors in the
help text." PAYPAL_SETUP.md rewritten from action-list to state-of-
the-world reference: documents the three PayPal-side behaviors with
exact dashboard paths to fix them if access ever opens up.

## 2026-05-29 — Mobile SPA-nav TransferState miss #incident

User report: feeds on /watch and /calendar disappear when arriving via
the hamburger menu; full reload brings them back. Mobile-only in
practice because that's where hamburger-nav dominates, but the gap
exists on every form factor. Root cause: prerendered routes ship feed
data via TransferState only on initial SSR'd load — when Angular
routes client-side to a new page, TransferState is empty for that
route, both services returned null, and the components rendered their
"Couldn't load" fallback. Fix landed two Vercel functions
(`/api/calendar`, `/api/youtube`) that mirror the SSR-time fetch/parse
logic and return JSON. Both services grew a third resolution path:
TransferState → direct fetch (server) → /api/* fallback (browser
without TransferState). Edge cache on both functions
(`s-maxage=300, stale-while-revalidate=600`) keeps load off the
upstream Google/YouTube endpoints. **How to apply:** any future
SSR-fetched data source needs a same-origin API endpoint for the
SPA-nav case; the "direct upstream fetch on browser" path won't work
(CORS, in the calendar case also dynamic-import shape).

## 2026-05-29 — Parish-wide ⌘K search palette #decision #milestone

User asked for a search bar and floated semantic / hybrid / fuzzy as
options. Recommended client-side fuzzy (MiniSearch) over hosted
services (Typesense, Algolia) because the parish corpus is ~100
documents and the bottleneck wasn't algorithm sophistication — it was
whether to stand up infrastructure at all. Built the palette: ⌘K
opens a Spotlight-style overlay, results grouped by kind (Pages,
Sections, Blog posts, Videos, Podcasts, Music, Events, Documents),
keyboard nav (↑↓/Enter/Esc). Static corpus is hand-curated in
[src/app/core/search/search.corpus.ts](src/app/core/search/search.corpus.ts)
and packed with synonyms (shepherd/pastor, sutana/robe, Luli/grace)
since the term list is small. Dynamic corpus (blog posts, YouTube
videos, calendar events) merges in from the existing services'
TransferState payloads. MiniSearch is dynamic-imported so the 20KB
chunk only ships if a visitor actually opens the palette — confirmed
zero references in the prerendered HTML. **Why:** at ~100 documents,
vector search would have been infrastructure for the sake of it; the
right call is to defer that decision to when the parish has a sermon
transcript archive that actually benefits from semantic matching.

## 2026-05-29 — Celestial Zeitgeist Ministries as a bare-chrome microsite #decision

CZM is the parish's youth-led evangelical media ministry; the live
site at celestialsanctumparish.org/czm intentionally contrasts the
parish's cream cathedral aesthetic with dark navy + electric blue.
Recreating it under /czm needed an architectural call: flatten CZM
into the parish chrome (consistent but wrong feeling), or let it ship
its own complete shell. Picked the latter via a new `App.BARE_ROUTES`
mechanism — the root layout reads the current URL and conditionally
suppresses `<sanctum-header>` / `<sanctum-footer>` for any path in
that list. CZM renders its own dark header + footer, with a "← Parish
site" pill in the nav so visitors aren't trapped. Palette tokens
(navy / electric blue / cream) live as CSS custom props scoped to the
component host so they don't leak into Tailwind's global theme.
**How to apply:** when a sub-site needs its own visual identity, the
BARE_ROUTES escape hatch keeps it under the same domain + routing
without flattening it into the parent design system.

## 2026-05-29 — Sanctum Choir gets its own /choir page #milestone

Parish wanted to recreate celestialsanctumparish.org/sanctumchoir. The
choir is part of the parish's core identity (not a youth-led offshoot
like CZM), so it stays in the cream/Cormorant cathedral chrome rather
than getting CZM-style microsite treatment. Yoruba praise lyric "Ohun
ta ni ju wura lo." anchors the hero — a song worth more than gold.
Featured release card ("Praises in Diverse Spaces", March 2024) +
Ju Wura music video embed + 5-platform "Listen anywhere" grid lifted
from the live site. The brand-icon library grew four new glyphs
(Apple Music, Deezer, Audiomack, Amazon Music) so every platform pill
gets a real mark rather than a single-letter monogram fallback. Cross-
link card on /about#choir mirrors the doctrine + CZM card patterns so
all three "go deeper" hooks read as one design family.

## 2026-05-29 — Link the CCC Constitution PDF prominently #feedback

First pass put the constitution link as an inline sentence at the
bottom of the /about Doctrine section. User: "I want a more prominent
link." Replaced with a card — Sanctum mark + "Canonical source"
eyebrow + Cormorant heading + explainer + primary burgundy button +
"PDF · 66 pages · opens in a new tab" affordance. **How to apply:**
when a reference document matters enough to surface in-context, a
proper card beats an inline link even on a cathedral-restrained site.

## 2026-05-28 — Embed the parish YouTube channel feed on /watch #milestone

Parish asked for their @cccSanctumParish channel feed embedded on the
Watch & Listen page. Resolved the handle to channel ID
UCJJ7ccMcbuv-1LIxBuVCg0w by curling the channel page with a browser
User-Agent (YouTube serves a 0-byte body to vanilla curl). Same
SSR-parse pattern as the new calendar agenda: fetch the public RSS
endpoint at SSR time, parse with a tiny inline regex parser (eight
fields, stable Atom schema — no XML dep needed), ship the top 9
through TransferState. SanctumYouTubeFeed renders a 3-col grid of
cards with thumbnails, Cormorant titles, gold relative-date eyebrows,
and a burgundy hover play affordance. Each card opens YouTube in a
new tab — deliberately not embedded iframes per-card since that's
9× third-party iframes which would tank Lighthouse Best Practices.
Slots between the 24/7 livestream section and the blog list. Verified
in the prerendered HTML: 9 video titles, 9 distinct hqdefault.jpg
thumbnail URLs, TransferState payload present.

## 2026-05-28 — Drop the Google Calendar iframe for an SSR-parsed agenda #pivot

The iframe embed populated with real events fine, but it dragged
Google's chrome (gray Today/nav bar, Google Sans typography, blue
event dots, "Add to Google Calendar" link, "Google Calendar" wordmark)
across the cross-origin boundary where parish CSS couldn't touch it.
Customization ceiling was URL params (bgcolor, color, week-start),
external wrapper styling, and a CSS filter on the iframe element —
which were enough to make the wrapper look parish-made but couldn't
restyle anything inside. User read the result as "no custom styling."

Swapped for an iCal-fed agenda. New CalendarService fetches the public
iCal endpoint (no API key — calendar's `Make available to public`
toggle is the only auth), parses with ical.js inside the SSR worker,
expands recurring events for the next ~120 days, ships the next 50
through TransferState. ical.js is dynamic-imported so the 80KB chunk
lives in the server bundle only — browsers never download it because
hydration reads pre-parsed events from the inlined JSON. SanctumAgenda
renders the list with Cormorant + Inter, sanctum-gold time labels,
sanctum-blue date eyebrows. Lighthouse sees the agenda on first paint;
no client fetch, no iframe load.

Caught a real bug during the build: my recurring-event expansion was
capping at MAX_EVENTS=50 per event but counting *past* occurrences
toward the cap. For a weekly Bible class that started in 2024, the
iterator burned all 50 slots on past dates before reaching today, so
the agenda came out empty for every recurring series. Fix: skip past
occurrences in the loop without counting them, and add a separate
WALK_CAP iteration ceiling as backstop. After the fix, the prerender
shows 50 events across 11 distinct series.

## 2026-05-28 — Migrate /calendar from Tockify to Google Calendar #pivot

Tockify was the live site's calendar embed but the slug never resolved
after the parish handed off the project, and the Tockify free tier
caps at a small number of events. Parish already owns
`celestialsanctumparish@gmail.com` and uses Google Calendar to manage
the week, so the embed now points at that public calendar — zero new
account, zero ongoing cost, integrates with every visitor's calendar
client through the standard public-URL subscription. Replaced
sanctum-tockify-embed (script-injection + slug + loading state) with
sanctum-google-calendar-embed (one iframe). Page also picked up a
small "Add the parish calendar" link so visitors can subscribe in
their own client. Parish-side setup is a one-time toggle in Google
Calendar to make the calendar public; documented in CALENDAR_SETUP.md.

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
