import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { YouTubeVideo } from '../../core/youtube/youtube.types';

interface FeedCard {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  relativeDate: string;
}

const CHANNEL_URL = 'https://www.youtube.com/@cccSanctumParish';

/**
 * Grid of recent video cards from the parish YouTube channel.
 *
 * Each card is a thumbnail + title + relative publish date, linking out
 * to YouTube. We deliberately don't embed playable iframes here — that
 * would either pull in 9 third-party iframes (Lighthouse-hostile) or
 * require a click-to-load facade per card. The card grid as a "what's
 * new" surface that funnels click-through to YouTube is the same pattern
 * podcasts and Substacks use.
 *
 * Loading / failure state: when `videos` is null (SSR fetch failed or
 * hasn't resolved), the component renders a calm link out to the
 * channel directly instead of vanishing. Empty array means no uploads
 * yet — also rendered as a calm link.
 */
@Component({
  selector: 'sanctum-youtube-feed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (cards().length === 0) {
      <div
        class="w-full bg-sanctum-paper border border-sanctum-rule rounded-sm px-6 py-12 text-center"
      >
        <p class="font-body text-sm text-sanctum-muted">
          Couldn't load the latest videos right now.
          <a
            [href]="channelUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="text-sanctum-blue underline decoration-sanctum-gold/60 underline-offset-4 hover:decoration-sanctum-gold"
            >Open the channel on YouTube</a> instead.
        </p>
      </div>
    } @else {
      <ul class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        @for (card of cards(); track card.id) {
          <li>
            <a
              [href]="card.url"
              target="_blank"
              rel="noopener noreferrer"
              class="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-sanctum-gold focus-visible:ring-offset-4 focus-visible:ring-offset-sanctum-cream rounded-sm"
            >
              <div
                class="relative aspect-video w-full overflow-hidden rounded-sm border border-sanctum-rule bg-sanctum-paper"
              >
                <img
                  [src]="card.thumbnailUrl"
                  [alt]="card.title + ' — video thumbnail'"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                />
                <!-- Burgundy play affordance, fades in on hover. Cathedral
                     restraint: no big red YouTube glyph stamped permanently. -->
                <div
                  class="absolute inset-0 flex items-center justify-center bg-sanctum-ink/0 group-hover:bg-sanctum-ink/35 transition-colors duration-300"
                  aria-hidden="true"
                >
                  <span
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 inline-flex items-center justify-center w-14 h-14 rounded-full bg-sanctum-burgundy/95 text-sanctum-cream"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="currentColor"
                      class="ml-1"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </div>
              </div>
              <p
                class="mt-4 font-body text-[11px] uppercase tracking-[0.25em] text-sanctum-gold font-semibold"
              >
                {{ card.relativeDate }}
              </p>
              <h3
                class="mt-2 font-display text-lg md:text-xl text-sanctum-ink leading-snug group-hover:text-sanctum-burgundy transition-colors"
              >
                {{ card.title }}
              </h3>
            </a>
          </li>
        }
      </ul>
    }
  `,
})
export class SanctumYouTubeFeed {
  /** `null` = loading or fetch failure (renders fallback). Empty array =
   *  no uploads yet (also renders fallback). */
  readonly videos = input<YouTubeVideo[] | null>(null);

  protected readonly channelUrl = CHANNEL_URL;

  protected readonly cards = computed<FeedCard[]>(() => {
    const videos = this.videos();
    if (!videos) return [];
    return videos.map((v) => ({
      id: v.id,
      title: v.title,
      url: v.url,
      thumbnailUrl: v.thumbnailUrl,
      relativeDate: formatRelativeDate(new Date(v.publishedAt)),
    }));
  });
}

/**
 * "2 days ago" / "3 weeks ago" / "May 5, 2026" — matches the relative
 * dating most podcast platforms use. Older than 60 days flips to an
 * absolute date because "47 weeks ago" doesn't help anyone.
 */
function formatRelativeDate(d: Date): string {
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return '1 month ago';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
