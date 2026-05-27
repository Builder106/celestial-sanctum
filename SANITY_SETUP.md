# Sanity setup

Steps to finish wiring Phase 5. After these steps the homepage's hero,
mission, shepherd's letter, and Sunday rhythm will be edited from the Sanity
Studio instead of being hardcoded.

## 1. Create the Sanity project

From the repo root:

```bash
npm create sanity@latest -- \
  --output-path studio \
  --dataset production \
  --template clean \
  --typescript
```

The CLI will prompt you to sign in (browser-based OAuth — Google or GitHub).
Pick **"Create new project"**, name it `celestial-sanctum`, accept the free
plan. The CLI scaffolds `studio/` and prints a `projectId`. **Copy it.**

## 2. Point the Studio at the shared schemas

Edit [`studio/sanity.config.ts`](./studio/sanity.config.ts) — replace the
default `schema.types: []` with an import from the schemas already in this
repo:

```ts
import { schemaTypes } from '../sanity-schemas';

export default defineConfig({
  // ...the existing projectId/dataset block stays as-is
  schema: { types: schemaTypes },
  // ...the existing plugins block stays as-is
});
```

## 3. Wire the project ID into the Angular app

Edit [`src/app/core/sanity/sanity.config.ts`](./src/app/core/sanity/sanity.config.ts):

```ts
export const sanityConfig = {
  projectId: '<paste-from-step-1>',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
} as const;
```

The project ID is non-secret (it's exposed in the client bundle), so it's
checked in plainly. If you'd rather not, swap it for a build-time `process.env`
read.

## 4. Allow the Vercel + localhost origins to read the CDA

In [sanity.io/manage](https://www.sanity.io/manage), open the new project, go
to **API → CORS origins**, and add:

- `http://localhost:4200`
- `https://celestial-sanctum.vercel.app`
- (eventually) `https://celestialsanctumparish.org`

No credentials needed for any of them — these are public reads.

## 5. Seed the homepage entry

```bash
cd studio
npm install
npm run dev
```

The Studio opens at `http://localhost:3333`. In the sidebar:

1. **Site Settings** — create one. Fill in parish name / address / phone /
   email.
2. **Shepherd** — create one. Add a portrait, the "This is your house." pull
   quote, the letter body, and the signature.
3. **Homepage** — create one. Copy the hero / mission / Sunday-rhythm strings
   from the current hardcoded fallback in
   [`src/app/features/home/home.ts`](./src/app/features/home/home.ts) (the
   `FALLBACK` constant at the top). Publish.

## 6. Deploy the Studio

```bash
cd studio
npx sanity deploy
```

Pick a Studio hostname (e.g. `celestial-sanctum`). The Studio is now live at
`https://celestial-sanctum.sanity.studio` for editors to use without running
anything locally.

## 7. Verify

`npm run build` from the repo root, then `vercel deploy --prod --yes`. The
homepage should read its hero, mission, Sunday rhythm, and shepherd's letter
from Sanity. If the CMS fetch fails for any reason (CORS, network, project
ID typo), the page silently falls back to the hardcoded `FALLBACK` block —
nothing breaks.

## What's left (future Phase 5 increments)

- `/about` long-form page → `csAboutSection` documents (Story, Mission,
  Doctrine, Mode of Worship, Ministries, Choir, Shepherd)
- `/watch` blog posts → `csBlogPost`
- `serviceTime` documents driving the `/visit` schedule
- The burgundy "Find us in Bloomington" closer → `csSiteSettings`-backed
  fields

## Auto-rebuild on publish (via GitHub empty commit)

Sanity publishes go through `/api/sanity-publish-hook` which creates a
descriptive empty commit on `main`. Vercel's git integration then deploys
the new commit, giving the parish a real audit trail in `git log` plus
accurate labels in the Vercel deployment list (`CMS: published
csHomepage/homepage` instead of the stale last-code-commit message).

**One-time setup** (after the function lands in production):

1. **GitHub PAT** — https://github.com/settings/personal-access-tokens/new
   - Fine-grained token name: `Celestial Sanctum CMS publish`
   - Expiration: 1 year (set a calendar reminder to rotate)
   - Repository access: **Only select repositories** → `celestial-sanctum`
   - Permissions → Repository permissions → **Contents: Read and write**
   - Generate, **copy** the `github_pat_…` value

2. **Vercel env var** — https://vercel.com/Builder106/celestial-sanctum/settings/environment-variables
   - Name: `GITHUB_PUBLISH_TOKEN`
   - Value: paste the PAT from step 1
   - Environments: Production (+ Preview if you want the hook live there too)
   - Save, then redeploy or wait for the next deploy to pick it up

3. **(Optional) Sanity webhook secret** — same env-vars page on Vercel
   - Name: `SANITY_WEBHOOK_SECRET`
   - Value: any 32+ char random string (e.g. `openssl rand -hex 32`)
   - Save. The function will validate HMAC signatures when this is set.

4. **Repoint the Sanity webhook** — https://www.sanity.io/manage/project/jsf7d3td/api/webhooks
   - Edit the existing "Vercel Deploy" webhook
   - Change URL from the Vercel deploy hook to:
     `https://celestial-sanctum.vercel.app/api/sanity-publish-hook`
   - (If you set `SANITY_WEBHOOK_SECRET`) paste the same secret into the
     webhook's **Secret** field
   - Save

5. **Test** — open Studio, edit any doc, click **Publish**. Within ~10s
   you should see a new commit on `main` with message
   `CMS: published <type>/<id>` (visible via `git log` or in the
   Vercel deployment list). The build takes ~60-90s; reload the live
   site after that and the change is there.

**Disable the old deploy hook** once the new flow is verified — leave it
in Vercel's settings (in case you want to fall back) but don't point
Sanity at it.
