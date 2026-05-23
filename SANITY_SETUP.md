# Sanity setup

Steps to finish wiring Phase 5. After these steps the homepage's hero,
mission, pastor's letter, and Sunday rhythm will be edited from the Sanity
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
2. **Pastor** — create one. Add a portrait, the "This is your house." pull
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
homepage should read its hero, mission, Sunday rhythm, and pastor's letter
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
