# YouTube setup — channel feed on `/watch`

The "Recent uploads" section on the [/watch](https://celestial-sanctum.vercel.app/watch)
page renders cards for the most recent videos posted to the parish
YouTube channel ([@cccSanctumParish](https://www.youtube.com/@cccSanctumParish)).
Each card is a thumbnail + title + relative publish date, linking out to
YouTube on click.

The site fetches the channel's public RSS feed during SSR, parses it
with a tiny inline regex parser, and renders the cards using parish
typography. No API key, no embed, no third-party iframe — just an HTTP
request to a public Atom feed that YouTube serves for every channel.

## How it stays current

- YouTube updates the channel RSS feed within a few minutes of any new
  upload, deletion, or visibility change.
- The site renders the feed at SSR time and embeds the parsed result in
  the page HTML for Lighthouse + SEO.
- New videos appear on the site **on the next deploy**, not instantly.
  Trigger one by publishing any Sanity document or pushing any commit
  to `main`.

If the parish wants new videos to surface within minutes instead of on
the next deploy, ping the dev — the right move is a Vercel cron that
re-deploys every few hours, or upgrading the site to use Vercel's
incremental cache. Both are small changes.

## One-time setup

None. The channel is already public, which is enough. The site has the
channel ID hardcoded — `UCJJ7ccMcbuv-1LIxBuVCg0w`, resolved from the
`@cccSanctumParish` handle.

## If the parish ever changes the channel

The channel ID is hardcoded in
[src/app/core/youtube/youtube.service.ts](./src/app/core/youtube/youtube.service.ts)
at the top of the file (`CHANNEL_ID`). To swap to a different channel:

1. Open the new channel's page in a browser at
   `https://www.youtube.com/@<new-handle>`.
2. View source and search for `channelId":"UC` — that's the underlying
   ID.
3. Replace `CHANNEL_ID` in `youtube.service.ts`. Commit.

The handle (`@cccSanctumParish`) is also referenced in `watch.ts` for
the "Subscribe on YouTube" and "All videos on YouTube" buttons. Update
those at the same time if the handle changes.

## Troubleshooting

- **Section shows "Couldn't load the latest videos right now"** → the
  RSS fetch failed during the last deploy. YouTube very rarely returns
  errors; this usually self-resolves on the next deploy. If it
  persists, check Vercel's runtime logs for `[YouTubeService]`
  warnings.
- **A new video is missing from the cards** → the feed only returns the
  channel's most recent ~15 uploads. The site shows the most recent 9
  of those. Older videos are reachable via the "All videos on YouTube"
  button below the grid.
- **A thumbnail is broken** → YouTube sometimes takes a few minutes
  after upload to generate the high-quality thumbnail. The fallback URL
  `https://i.ytimg.com/vi/<VIDEO_ID>/hqdefault.jpg` always works.
- **Wrong video order** → the service sorts newest-first based on the
  feed's `<published>` timestamp. If a video appears out of order, it's
  almost certainly that YouTube set its publish date to a manual past
  date (re-upload, scheduled-publish, etc.). That's how YouTube itself
  treats the video too.
