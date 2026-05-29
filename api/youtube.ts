import type { VercelRequest, VercelResponse } from '@vercel/node';

// GET /api/youtube — fetches the parish's public YouTube channel Atom
// feed, parses the entries with a tiny inline regex parser (the schema
// is small and stable, an XML lib would be pure bloat), returns the
// next 9 newest videos as JSON.
//
// Why this endpoint exists alongside the SSR-time fetch in YouTubeService:
// the same SPA-navigation gap as /api/calendar. Visitors who land on
// /watch first get the videos from TransferState; visitors who navigate
// in via the SPA router need this fallback because TransferState is
// empty during client-side route changes.

interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
  description: string;
  views?: number;
}

const CHANNEL_ID = 'UCJJ7ccMcbuv-1LIxBuVCg0w';
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const MAX_VIDEOS = 9;

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const videos = await fetchAndParse();
    // YouTube updates the feed within minutes of an upload; a 5-minute
    // edge cache balances freshness against load on YouTube's CDN.
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).json({ videos });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error('[api/youtube] fetch/parse failed:', detail);
    res.status(502).json({ error: 'YouTube unavailable', detail });
  }
}

async function fetchAndParse(): Promise<YouTubeVideo[]> {
  const res = await fetch(FEED_URL, {
    // YouTube serves an empty body to vanilla User-Agents.
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CelestialSanctumBot/1.0)' },
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`YouTube feed HTTP ${res.status}`);
  }
  const xml = await res.text();
  return parseFeed(xml).slice(0, MAX_VIDEOS);
}

function parseFeed(xml: string): YouTubeVideo[] {
  const videos: YouTubeVideo[] = [];
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
  return videos.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

function pick(haystack: string, re: RegExp): string | undefined {
  return re.exec(haystack)?.[1];
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}
