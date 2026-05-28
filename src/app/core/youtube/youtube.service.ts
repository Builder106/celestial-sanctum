import {
  Injectable,
  PendingTasks,
  PLATFORM_ID,
  TransferState,
  inject,
  makeStateKey,
} from '@angular/core';
import { isPlatformServer } from '@angular/common';
import { Observable, defer, from, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

import type { YouTubeVideo } from './youtube.types';

/**
 * The parish channel handle is `@cccSanctumParish`; YouTube's RSS endpoint
 * needs the underlying `UC...` channel ID (resolved once via the channel
 * page's HTML, hardcoded here because it's stable for the channel's
 * lifetime). The feed returns the channel's most recent 15 uploads as Atom
 * XML — no API key, no quota.
 */
const CHANNEL_ID = 'UCJJ7ccMcbuv-1LIxBuVCg0w';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

/** Cap on how many feed entries we expose to the page. YouTube currently
 *  returns 15; we render fewer because the feed sits next to a livestream
 *  embed + blog list on /watch and shouldn't dominate the scroll. */
const MAX_VIDEOS = 9;

const videosKey = makeStateKey<YouTubeVideo[]>('youtube:videos');

@Injectable({ providedIn: 'root' })
export class YouTubeService {
  private readonly transferState = inject(TransferState);
  private readonly pendingTasks = inject(PendingTasks);
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));

  /**
   * Stream of recent uploads, ordered newest first. `null` is the loading
   * / failure state — components render a calm fallback link out to the
   * channel when null so a transient outage doesn't make the section
   * disappear without explanation.
   */
  videos(): Observable<YouTubeVideo[] | null> {
    const cached = this.transferState.get<YouTubeVideo[] | null>(videosKey, null);
    if (cached !== null) {
      this.transferState.remove(videosKey);
      return of(cached);
    }
    if (!this.isServer) return of(null);

    const releaseTask = this.pendingTasks.add();
    return defer(() => from(this.fetchAndParse())).pipe(
      tap((videos) => {
        if (this.isServer) this.transferState.set(videosKey, videos);
      }),
      catchError((err: unknown) => {
        console.error('[YouTubeService] RSS fetch/parse failed:', err);
        return of(null as YouTubeVideo[] | null);
      }),
      finalize(() => releaseTask()),
    );
  }

  private async fetchAndParse(): Promise<YouTubeVideo[]> {
    const res = await fetch(FEED_URL, {
      headers: {
        // YouTube serves an empty body to suspicious-looking clients
        // (curl with no UA returns 0 bytes — verified during dev). A
        // plain browser UA is sufficient.
        'User-Agent': 'Mozilla/5.0 (compatible; CelestialSanctumBot/1.0)',
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error(`YouTube feed HTTP ${res.status}`);
    }
    const xml = await res.text();
    return parseFeed(xml).slice(0, MAX_VIDEOS);
  }
}

/**
 * Parse the YouTube channel Atom feed into a flat list of videos. The feed
 * schema is small and stable — every entry has yt:videoId, title, link,
 * published, media:thumbnail, media:description, and a media:statistics
 * views attribute. A targeted regex per field is faster, smaller, and
 * less fragile than pulling in an XML parser for the eight fields we need.
 */
function parseFeed(xml: string): YouTubeVideo[] {
  const videos: YouTubeVideo[] = [];
  // Atom entries are delimited by <entry>...</entry>; the feed-level
  // <link> and <author> sit outside <entry> blocks so we don't pick them
  // up by mistake.
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;
  while ((match = entryRe.exec(xml)) !== null) {
    const entry = match[1];
    const id = pick(entry, /<yt:videoId>([^<]+)<\/yt:videoId>/);
    if (!id) continue;
    const title = decodeEntities(pick(entry, /<title>([^<]+)<\/title>/) ?? '');
    const published = pick(entry, /<published>([^<]+)<\/published>/) ?? '';
    const description = decodeEntities(
      pick(entry, /<media:description>([\s\S]*?)<\/media:description>/) ?? '',
    );
    const thumbnailUrl =
      pick(entry, /<media:thumbnail\s+url="([^"]+)"/) ??
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    const viewsRaw = pick(entry, /<media:statistics\s+views="(\d+)"/);
    const views = viewsRaw ? Number(viewsRaw) : undefined;

    videos.push({
      id,
      title: title.trim(),
      url: `https://www.youtube.com/watch?v=${id}`,
      thumbnailUrl,
      publishedAt: published,
      description: description.trim(),
      views,
    });
  }
  // Feed comes in newest-first, but sort defensively in case YouTube ever
  // changes order.
  return videos.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

function pick(haystack: string, re: RegExp): string | undefined {
  return re.exec(haystack)?.[1];
}

/**
 * The Atom feed escapes XML metacharacters in titles and descriptions.
 * We only need the four reserved entities plus numeric character
 * references (the only ones YouTube actually emits in practice).
 */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}
