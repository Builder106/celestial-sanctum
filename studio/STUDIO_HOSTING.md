# Hosting the Studio at `admin.celestialsanctumparish.org`

The Sanity-hosted Studio (`celestial-sanctum.sanity.studio`) only allows
`*.sanity.studio` URLs. To put the Studio under the parish's own domain we
self-host it as a separate Vercel project pointing at this `studio/`
directory.

The public Angular site stays in its own Vercel project (root of repo).
This folder becomes a second project. One repo, two projects, two
domains.

## One-time setup

### 1. Create the Vercel project

In the Vercel dashboard:

1. **New Project** → import the `Builder106/celestial-sanctum` repo
   (already connected from the public site).
2. **Project name**: `celestial-sanctum-studio`
3. **Framework Preset**: Other
4. **Root Directory**: `studio` (click "Edit" and type `studio`)
5. **Build & Output Settings** — leave on defaults. The repo's
   `studio/vercel.json` already pins:
   - Build command: `npm run build`
   - Output directory: `dist`
   - SPA rewrites so deep links resolve to `index.html`
6. **Environment variables**: none needed — the Studio reads
   `projectId` / `dataset` from the static config.
7. **Deploy**.

After the first deploy, the Studio is live at
`celestial-sanctum-studio.vercel.app`.

### 2. Point `admin.` at it

Once DNS access for `celestialsanctumparish.org` is in place:

1. In **Vercel** → `celestial-sanctum-studio` → **Settings → Domains**:
   add `admin.celestialsanctumparish.org`. Vercel will show the CNAME
   target to use (typically `cname.vercel-dns.com`).
2. In **the registrar's DNS panel** for `celestialsanctumparish.org`,
   add a CNAME record:
   - Name: `admin`
   - Type: `CNAME`
   - Value: the target Vercel showed in step 1
   - TTL: default (3600)
3. Wait for propagation (usually <10 minutes). Vercel will auto-issue
   the TLS cert.

### 3. Allow the new origin in Sanity

The Sanity Content Lake checks the request origin against an allowlist
before letting a Studio read or write. Add the new domain:

1. https://www.sanity.io/manage/project/jsf7d3td/api/cors
2. **Add CORS origin** → `https://admin.celestialsanctumparish.org`
3. Tick **Allow credentials** (the Studio uses auth cookies)

Also add the preview Vercel domain so the project's auto-generated URLs
work for testing:
- `https://celestial-sanctum-studio.vercel.app`
- (optional) `https://*-celestial-sanctum-studio.vercel.app` if you'd
  like every preview branch to work too

### 4. Sanity-side cleanup

The old Sanity-hosted Studio at `celestial-sanctum.sanity.studio` keeps
working but is now redundant. Either:
- Leave it as a fallback (zero cost, parish admins can still reach it
  if DNS is misbehaving), or
- Run `npx sanity undeploy` from `studio/` to take it down.

Recommendation: leave it up until the new flow has run for a couple of
weeks without issue, then undeploy.

## How deploys work after setup

- Every push to `main` that touches anything inside `studio/` triggers a
  rebuild in the `celestial-sanctum-studio` Vercel project.
- The public site project (`celestial-sanctum`) ignores `studio/` since
  its root is the repo root and its build config doesn't pull from
  `studio/`. The two projects are independent.
- The publish-hook flow (Sanity → `/api/sanity-publish-hook` on the
  public site → empty commit → Vercel rebuild) is unaffected by Studio
  hosting. Editing content in Studio still rebuilds the public site,
  not the Studio itself.

## Troubleshooting

- **Studio loads but can't read content** → CORS origin missing in step
  3. Check the browser console for the rejected origin and add it.
- **Studio loads but shows blank navbar** → favicon path. The icon is
  served from `/static/favicon.svg`; if that 404s, the CCC seal is
  missing from `studio/static/`.
- **Deploy succeeds but visiting a deep URL like
  `/structure/csHomepage;homepage` 404s** → SPA rewrites in
  `studio/vercel.json` are wrong or stripped. The rewrite should send
  all non-asset paths to `/index.html`.
- **DNS shows the right CNAME but Vercel says "Invalid Configuration"**
  → wait. Cert provisioning can lag the DNS check by a few minutes.
