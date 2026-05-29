/**
 * One indexable document in the parish search corpus.
 *
 * A "document" can be a whole page, a section anchored within a page, a
 * blog post, a YouTube video, a calendar event, or a podcast show. The
 * `kind` discriminator drives both the icon shown in the result row and
 * the visual chip / grouping in the palette.
 *
 * The `body` field is what MiniSearch tokenizes for full-text matching;
 * keep it dense with the terms a visitor would actually type (synonyms,
 * Yoruba words, English translations, ministry names) rather than the
 * polished prose that appears on the page itself.
 */
export interface SearchDoc {
  id: string;
  title: string;
  body: string;
  /** Small label rendered above the title in the result row (e.g. "About", "Choir"). */
  eyebrow?: string;
  /** Click target. Internal routes start with "/"; external URLs (Spotify
   *  artist pages, YouTube channel) get a "↗" affordance and open in a
   *  new tab. */
  url: string;
  /** External URLs render an out-of-site indicator and target=_blank. */
  external?: boolean;
  kind: SearchDocKind;
}

export type SearchDocKind =
  | 'page'
  | 'section'
  | 'blog'
  | 'video'
  | 'event'
  | 'podcast'
  | 'release'
  | 'doc';
