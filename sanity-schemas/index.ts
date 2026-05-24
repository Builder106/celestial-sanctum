import { aboutSection } from './aboutSection';
import { blogPost } from './blogPost';
import { homepage } from './homepage';
import { shepherd } from './shepherd';
import { siteSettings } from './siteSettings';
import { visitPage } from './visitPage';

// Schemas the Sanity Studio loads via its `schema.types` config.
// Imported by studio/sanity.config.ts (created by `npm create sanity@latest`).
// All celestial-sanctum types are `cs`-prefixed to keep them visually distinct
// from any other Sanity datasets you may share an account with.
export const schemaTypes = [siteSettings, homepage, shepherd, aboutSection, visitPage, blogPost];
