# Contributing

Thanks for your interest in `celestial-sanctum`. This document covers how to
set up a development environment, the conventions the codebase follows,
and what's in scope (and what isn't).

## Dev setup

**Prerequisites:**

- Node.js `>=24` (Angular 21 CLI requires it — see `package.json` `engines`)
- npm `>=11`
- A modern browser for testing (Chrome / Safari / Firefox)
- (Optional) The Vercel CLI for deploys: `npm i -g vercel`

**Bootstrap:**

```bash
git clone https://github.com/Builder106/celestial-sanctum.git
cd celestial-sanctum
npm install
npm start
```

The Angular dev server starts on `http://localhost:4200` with SSR enabled.
Hot module replacement is on.

## Common commands

| Command | What it does |
|---|---|
| `npm start` | `ng serve` — dev server with HMR on port 4200 |
| `npm run build` | Production build + SSR + prerender (output in `dist/`) |
| `npm test` | Vitest unit-test suite |
| `npm run watch` | Dev build that watches for changes |
| `vercel deploy --prod` | Push current `dist/` straight to production |

## Project structure

```
src/app/
├── core/motion/           # Animation directives (sanctumReveal, sanctumCascade,
│                          # sanctumDrawIn, sanctumLetterReveal, sanctumCiteRule)
├── shared/
│   ├── ui/                # Design-system primitives: Button (directive), Card,
│   │                      # Display, Eyebrow, Icon, Quote, SanctumMark, etc.
│   ├── layout/            # Header, Footer, nav-data
│   └── embeds/            # Spotify, YouTube, Tockify, Map
└── features/              # One folder per route — home, visit, about, watch,
                           # calendar, give, contact, styleguide, coming-soon
```

The design system + animation system are documented at `/__styleguide` on the
running site — that route mounts a showcase of every primitive in every variant.
Open `http://localhost:4200/__styleguide` after `npm start`.

## Project-specific guardrails

- **Light/warm aesthetic only.** The dark "Afro-Celestial Noir" direction was
  explored and rejected in early development; don't propose dark-mode redesigns
  for this site. The Reverent Minimalism palette (cream / paper / ink /
  burgundy / gold / celestial-blue) is the agreed direction.
- **Content matches the live parish.** `celestialsanctumparish.org` is the
  source of truth for copy, imagery, scripture citations, schedule, and PayPal
  account. Don't fabricate parish details; verify against the live site.
- **Respect `prefers-reduced-motion`.** Every motion directive bails out when
  the OS-level reduced-motion signal is set. Don't override this for visitors.
  A `?motion=force` query param is available for testing/demos only.
- **No dependencies on heavy frameworks beyond what's in `package.json`.**
  Motion One is the animation runtime; don't pull in Framer Motion / GSAP /
  Lottie unless there's a concrete need none of the existing tools can meet.
- **Sanity is the CMS, not Contentful.** Phase 5 started against Contentful and
  pivoted to Sanity once it became clear the existing Contentful org was
  locked to an unrelated project. Don't reintroduce `@contentful/*` packages.
  Schemas live in [`sanity-schemas/`](./sanity-schemas/) and are loaded by the
  Studio scaffold in `studio/`. See [SANITY_SETUP.md](./SANITY_SETUP.md).
- **SSR-safety required.** Every directive and component must work under
  Angular SSR. Use `isPlatformBrowser(this.platformId)` guards around any
  `window`, `document`, or `localStorage` access. The build runs
  `ng run celestial-sanctum:prerender` which will fail if anything references
  browser-only globals during render.
- **Component selector prefix is `sanctum-`.** Directives use the `sanctum`
  camelCase prefix (e.g. `sanctumBtn`, `sanctumReveal`). Don't add
  unprefixed selectors.

## Commit-message convention

Single-line summary in the imperative (~60 chars), optionally followed by a
blank line + a body of paragraphs / bullets explaining *why*. No
conventional-commit `type:` prefixes — the body carries the meaning.

Good:
```
Fix mobile hero crop to show the sister's face

The previous object-position: 65% 30% worked on desktop (full image
width visible) but cropped the wrong slice on portrait mobile. Now
uses a responsive Tailwind class: object-[85%_25%] on mobile,
md:object-[65%_30%] above.
```

Bad:
```
fix: hero
```

## Pull request process

1. Branch from `main`. Name the branch after the feature or fix:
   `mobile-hero-crop`, `add-tockify-slug`, etc.
2. Keep PRs focused. A new page is one PR; a refactor of the button system is
   another; don't bundle them.
3. Run `npm run build` locally before pushing — the prerender step catches a
   lot of SSR issues that `npm start` doesn't.
4. CI (`.github/workflows/ci.yml`) builds and tests on every push and PR.
   Preview URLs come from Vercel's git integration and appear in the PR
   thread once the Vercel build completes (separate from GitHub Actions).
5. Merge to `main` deploys to production via Vercel's git integration.

## Out of scope

Don't open PRs for these — they'll be closed:

- **Dark-mode variants of the existing pages.** See above.
- **Switching the animation library.** Motion One was chosen deliberately
  (~5kB lazy-loaded vs alternatives). Migration would be a larger discussion.
- **Tracking/analytics beyond Vercel's first-party tools.** No GA4, no Mixpanel,
  no third-party pixel trackers — the parish hasn't asked for it and we
  shouldn't add it speculatively.
- **Adding extra CMS adapters.** Sanity is the chosen CMS. PRs adding
  Strapi/Prismic/Hygraph adapters won't be considered until there's a stated
  reason to migrate off Sanity.
- **PRs from automated tooling that don't include human-readable PR
  descriptions** explaining the change.

## License

MIT. See [LICENSE](LICENSE).
