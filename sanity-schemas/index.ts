import { aboutSection } from './aboutSection';
import { homepage } from './homepage';
import { pastor } from './pastor';
import { siteSettings } from './siteSettings';

// Schemas the Sanity Studio loads via its `schema.types` config.
// Imported by studio/sanity.config.ts (created by `npm create sanity@latest`).
// All celestial-sanctum types are `cs`-prefixed to keep them visually distinct
// from any other Sanity datasets you may share an account with.
export const schemaTypes = [siteSettings, homepage, pastor, aboutSection];
