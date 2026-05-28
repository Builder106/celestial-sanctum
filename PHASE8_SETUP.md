# Phase 8 setup — DNS cutover

The redesign is fully built and running at
[`celestial-sanctum.vercel.app`](https://celestial-sanctum.vercel.app),
but `celestialsanctumparish.org` still resolves to the old WordPress
site. This doc captures what needs to happen at the registrar and in
Vercel to flip the apex domain over, plus the post-cutover work that
unblocks the parish-branded admin subdomain.

## What's blocking

Access to the DNS registrar for `celestialsanctumparish.org`. Until
someone with control of that account is involved, none of the steps
below can land. Surface that ask first.

## Step 1 — Point the apex at Vercel

In the registrar's DNS panel for `celestialsanctumparish.org`:

1. Add an A record:
   - Name: `@` (or blank, depending on the registrar's UI)
   - Type: `A`
   - Value: `76.76.21.21`
   - TTL: default
2. Add a CNAME record for `www`:
   - Name: `www`
   - Type: `CNAME`
   - Value: `cname.vercel-dns.com`
   - TTL: default

In **Vercel** → `celestial-sanctum` → **Settings → Domains**:
1. **Add domain** → `celestialsanctumparish.org`
2. **Add domain** → `www.celestialsanctumparish.org`. Vercel will offer
   to redirect this to the apex — accept that.
3. Wait for the green check (cert provisioning usually takes <10 min).

The old WordPress hosting can be torn down once the cutover is verified
in a browser. Keep the WordPress export around as a backup for at least
a month.

## Step 2 — Bring up `admin.celestialsanctumparish.org` for the Studio

The Sanity Studio (parish CMS) is built in `studio/` and ready to deploy
as a second Vercel project under this subdomain. The full one-time setup
is in [`studio/STUDIO_HOSTING.md`](./studio/STUDIO_HOSTING.md). The
DNS-level steps that depend on step 1 above:

1. **Vercel** — create the `celestial-sanctum-studio` project (Root
   Directory `studio/`, see `STUDIO_HOSTING.md` for the import flow).
   First deploy lands at `celestial-sanctum-studio.vercel.app`.
2. **Vercel** → `celestial-sanctum-studio` → **Settings → Domains** →
   add `admin.celestialsanctumparish.org`.
3. **Registrar** → add a CNAME:
   - Name: `admin`
   - Type: `CNAME`
   - Value: the target Vercel showed in step 2 (typically
     `cname.vercel-dns.com`)
   - TTL: default

## Step 3 — Tell Sanity the new origins are trusted

The Sanity Content Lake checks the request origin against an allowlist
before letting the Studio read or write. Once the admin subdomain
resolves, add it to the project:

1. https://www.sanity.io/manage/project/jsf7d3td/api/cors
2. **Add CORS origin** → `https://admin.celestialsanctumparish.org`,
   tick **Allow credentials**.
3. **Add CORS origin** → `https://celestial-sanctum-studio.vercel.app`,
   tick **Allow credentials**. (This makes Vercel's auto-generated
   project URL work for testing without going through the custom domain.)

While you're in there, double-check the public site origin is also
allowed (it should already be from Phase 5):
- `https://celestialsanctumparish.org`
- `https://www.celestialsanctumparish.org`

These don't need credentials — the public site reads from the Sanity
CDN, which is open.

## Step 4 — Smoke test

1. `curl -I https://celestialsanctumparish.org` → expect `HTTP/2 200`
   served from Vercel (look for `server: Vercel` or `x-vercel-id`).
2. Open the site in a browser, navigate every top-nav route, confirm
   the CMS-driven content renders (homepage hero, about sections,
   visit page, blog posts).
3. Open `https://admin.celestialsanctumparish.org`, sign in, edit any
   field on Site Settings → **Publish**. Within ~90s, the change should
   appear on the public site.
4. Check Vercel's deployment list for the relay-function commit
   (`CMS: published csSiteSettings/siteSettings`) — that's the
   end-to-end audit trail proving the publish-hook flow survived the
   cutover.

## After cutover

- Update repo references that still hardcode `celestial-sanctum.vercel.app`
  (search the codebase — there shouldn't be many, but `vercel.json`
  redirects and the publish-hook URL in Sanity are worth a look).
- Take down or undeploy the old `celestial-sanctum.sanity.studio` once
  the parish-branded admin URL has had a couple of weeks without issue.
- Remove the old WordPress hosting after the WordPress export backup is
  verified locally.
