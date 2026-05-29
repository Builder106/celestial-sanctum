import {
  Injectable,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type MiniSearchType from 'minisearch';

import { CalendarService } from '../calendar/calendar.service';
import { SanityService } from '../sanity/sanity.service';
import { YouTubeService } from '../youtube/youtube.service';
import { STATIC_CORPUS } from './search.corpus';
import type { SearchDoc, SearchDocKind } from './search.types';

export interface SearchResultRow extends SearchDoc {
  /** MiniSearch relevance score; higher = better. */
  score: number;
}

export interface SearchResultGroup {
  kind: SearchDocKind;
  /** Sort order shown in the palette (lower first). */
  order: number;
  /** Plural label, e.g. "Pages", "Sermons", "Events". */
  label: string;
  rows: SearchResultRow[];
}

const GROUP_LABELS: Record<SearchDocKind, { label: string; order: number }> = {
  page: { label: 'Pages', order: 1 },
  section: { label: 'Sections', order: 2 },
  blog: { label: 'Blog posts', order: 3 },
  video: { label: 'Videos', order: 4 },
  podcast: { label: 'Podcasts', order: 5 },
  release: { label: 'Music', order: 6 },
  event: { label: 'Events', order: 7 },
  doc: { label: 'Documents', order: 8 },
};

/**
 * In-memory fuzzy-search over the parish corpus, powered by MiniSearch.
 *
 * MiniSearch is dynamic-imported on first init() call so its ~25KB
 * lands in a lazy chunk — visitors who never open the search palette
 * never download it. Once initialized, subsequent searches are
 * synchronous and run entirely in the browser; no server, no network.
 *
 * The static corpus is loaded immediately; dynamic documents (Sanity
 * blog posts, recent YouTube videos, upcoming calendar events) get
 * folded in when their respective services resolve their TransferState
 * payloads. The service tolerates either source not being available —
 * a fresh search index always works against whatever's loaded so far.
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly sanity = inject(SanityService);
  private readonly youtube = inject(YouTubeService);
  private readonly calendar = inject(CalendarService);

  /** Built lazily on first init(); shared across the app afterward. */
  private engine: MiniSearchType<SearchDoc> | null = null;
  /** Resolves when init() finishes; further init() calls await it. */
  private initPromise: Promise<void> | null = null;

  /** Is the index ready for queries? Drives the palette's "loading…" pill. */
  readonly ready = signal(false);

  /** Whether the palette overlay is visible. The header button and the
   *  ⌘K shortcut both toggle this; the palette UI subscribes. */
  readonly open = signal(false);

  /** Active query text; updated by the palette's input. */
  readonly query = signal('');

  /** Search results, recomputed whenever the query or index changes. */
  readonly results = computed<SearchResultGroup[]>(() => {
    const q = this.query().trim();
    if (!q || !this.engine || !this.ready()) return [];
    const hits = this.engine.search(q, {
      boost: { title: 2.5, eyebrow: 1.5 },
      fuzzy: 0.2,
      prefix: true,
      combineWith: 'AND',
    });
    return groupHits(hits);
  });

  /**
   * Lazy-init: dynamic-imports MiniSearch, builds the index with the
   * static corpus + whatever dynamic data has already resolved. Safe
   * to call multiple times — the first call seeds the singleton, the
   * rest no-op (or refresh dynamic docs).
   */
  async init(): Promise<void> {
    if (!this.isBrowser) return;
    if (this.initPromise) {
      await this.initPromise;
      return;
    }
    this.initPromise = this.doInit();
    await this.initPromise;
  }

  /** Open the palette, lazy-init'ing the index on first call. */
  async openPalette(): Promise<void> {
    await this.init();
    this.open.set(true);
  }

  /** Close the palette and clear the active query. */
  closePalette(): void {
    this.open.set(false);
    this.query.set('');
  }

  /** Toggle the palette. The header button + ⌘K shortcut both call this. */
  async togglePalette(): Promise<void> {
    if (this.open()) {
      this.closePalette();
    } else {
      await this.openPalette();
    }
  }

  private async doInit(): Promise<void> {
    // Lazy chunk — the entire minisearch module only ships if a visitor
    // opens the palette.
    const { default: MiniSearch } = await import('minisearch');

    this.engine = new MiniSearch<SearchDoc>({
      fields: ['title', 'body', 'eyebrow'],
      storeFields: ['title', 'eyebrow', 'url', 'kind', 'external'],
      searchOptions: {
        boost: { title: 2.5, eyebrow: 1.5 },
        fuzzy: 0.2,
        prefix: true,
      },
    });
    this.engine.addAll(STATIC_CORPUS as SearchDoc[]);
    this.ready.set(true);

    // Best-effort merge of dynamic documents. We don't block on these —
    // the static corpus is searchable immediately, and dynamic docs
    // get folded in as they resolve. If any fetch is still pending
    // (or already failed), we just skip its contribution.
    await Promise.allSettled([
      this.mergeDynamic(this.collectBlogPosts()),
      this.mergeDynamic(this.collectVideos()),
      this.mergeDynamic(this.collectEvents()),
    ]);
  }

  private async mergeDynamic(promise: Promise<SearchDoc[]>): Promise<void> {
    if (!this.engine) return;
    try {
      const docs = await promise;
      if (docs.length > 0) this.engine.addAll(docs);
    } catch {
      // Already logged by the upstream service; nothing more to do here.
    }
  }

  private async collectBlogPosts(): Promise<SearchDoc[]> {
    return new Promise((resolve) => {
      this.sanity.blogPosts().subscribe({
        next: (posts) => {
          if (!posts) return resolve([]);
          resolve(
            posts.map((p, i) => ({
              id: `blog-${i}-${p.title.slice(0, 32)}`,
              title: p.title,
              body: `${p.excerpt ?? ''} ${p.author ?? ''}`,
              eyebrow: `Blog · ${p.displayDate ?? ''}`,
              url: p.href ?? '/watch#blog',
              external: !!p.href && /^https?:/.test(p.href),
              kind: 'blog' as const,
            })),
          );
        },
        error: () => resolve([]),
      });
    });
  }

  private async collectVideos(): Promise<SearchDoc[]> {
    return new Promise((resolve) => {
      this.youtube.videos().subscribe({
        next: (videos) => {
          if (!videos) return resolve([]);
          resolve(
            videos.map((v) => ({
              id: `video-${v.id}`,
              title: v.title,
              body: v.description ?? '',
              eyebrow: 'YouTube · Sanctum Parish',
              url: v.url,
              external: true,
              kind: 'video' as const,
            })),
          );
        },
        error: () => resolve([]),
      });
    });
  }

  private async collectEvents(): Promise<SearchDoc[]> {
    return new Promise((resolve) => {
      this.calendar.events().subscribe({
        next: (events) => {
          if (!events) return resolve([]);
          // De-dup recurring events by summary — a weekly Bible class
          // shouldn't fill the index with 12 identical hits.
          const seen = new Set<string>();
          const docs: SearchDoc[] = [];
          for (const e of events) {
            if (seen.has(e.summary)) continue;
            seen.add(e.summary);
            const date = new Date(e.start);
            const dateLabel = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            docs.push({
              id: `event-${e.uid}`,
              title: e.summary,
              body: `${e.location ?? ''} ${e.description ?? ''}`,
              eyebrow: `Event · Next ${dateLabel}`,
              url: '/calendar',
              kind: 'event' as const,
            });
          }
          resolve(docs);
        },
        error: () => resolve([]),
      });
    });
  }
}

function groupHits(
  hits: ReturnType<MiniSearchType<SearchDoc>['search']>,
): SearchResultGroup[] {
  const byKind = new Map<SearchDocKind, SearchResultRow[]>();
  for (const hit of hits) {
    const kind = hit['kind'] as SearchDocKind;
    const row: SearchResultRow = {
      id: hit.id as string,
      title: hit['title'] as string,
      body: '',
      eyebrow: hit['eyebrow'] as string | undefined,
      url: hit['url'] as string,
      external: hit['external'] as boolean | undefined,
      kind,
      score: hit.score,
    };
    const bucket = byKind.get(kind) ?? [];
    bucket.push(row);
    byKind.set(kind, bucket);
  }
  return [...byKind.entries()]
    .map(([kind, rows]) => ({
      kind,
      label: GROUP_LABELS[kind].label,
      order: GROUP_LABELS[kind].order,
      rows: rows.slice(0, 5),
    }))
    .sort((a, b) => a.order - b.order);
}
