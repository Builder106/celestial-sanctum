import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BlogCard } from '../../shared/ui/blog-card';
import { SanctumButton } from '../../shared/ui/button';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumCascade } from '../../core/motion/cascade.directive';
import { SanctumDrawIn } from '../../core/motion/draw-in.directive';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { Icon } from '../../shared/ui/icon';
import { SanctumMark } from '../../shared/ui/sanctum-mark';
import { SpotifyEmbed } from '../../shared/embeds/spotify-embed';
import { YouTubeEmbed } from '../../shared/embeds/youtube-embed';

interface BlogPost {
  title: string;
  href: string;
  date: string;
  author: string;
  excerpt: string;
  imageUrl: string;
}

interface SubscribeChannel {
  label: string;
  detail: string;
  href: string;
  icon: 'spotify' | 'youtube' | 'mail' | 'pen';
}

@Component({
  selector: 'sanctum-watch',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BlogCard, Display, Eyebrow, Icon, SanctumButton, SanctumCascade, SanctumDrawIn, SanctumMark, SanctumReveal, SpotifyEmbed, YouTubeEmbed],
  template: `
    <!-- Page hero -->
    <section sanctumCascade stagger="spaced" class="pt-24 md:pt-32 pb-12 px-6 max-w-6xl mx-auto">
      <sanctum-eyebrow class="mb-6">Watch &amp; Listen</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-8 max-w-4xl">
        <h1>
          The parish lives
          <span class="italic text-sanctum-burgundy">online too.</span>
        </h1>
      </sanctum-display>
      <p class="font-body text-xl text-sanctum-muted leading-relaxed max-w-2xl">
        A 24/7 livestream of CCC hymns, the Sanctum Podcast on Spotify, and the
        Sanctum Blog's long-form devotionals — three ways to keep the parish in
        your week between Sundays.
      </p>
    </section>

    <div class="flex justify-center py-12 md:py-16">
      <sanctum-mark sanctumDrawIn [size]="56" />
    </div>

    <!-- Podcast -->
    <section id="podcast" class="scroll-mt-28 py-12 md:py-16 px-6 max-w-5xl mx-auto">
      <header sanctumReveal class="mb-10 max-w-2xl">
        <sanctum-eyebrow class="mb-4">Sanctum Podcast</sanctum-eyebrow>
        <sanctum-display size="lg" class="mb-5">
          <h2>
            Devotionals,
            <span class="italic text-sanctum-burgundy">in your ears.</span>
          </h2>
        </sanctum-display>
        <p class="font-body text-base md:text-lg text-sanctum-muted leading-relaxed">
          Spiritual devotionals, biblical teachings, and prophetic reflections —
          drop in for the latest episode or work through the back catalogue at
          your own pace. New episodes weekly.
        </p>
      </header>
      <div sanctumReveal [delay]="150">
        <sanctum-spotify-embed
          showId="0lQ2H8kaRG8nl6InuGUcC6"
          title="CCC Sanctum Podcast"
          [height]="352"
        />
      </div>
      <div sanctumReveal [delay]="250" class="mt-8">
        <a
          sanctumBtn
          variant="ghost"
          href="https://open.spotify.com/show/0lQ2H8kaRG8nl6InuGUcC6"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open on Spotify
        </a>
      </div>
    </section>

    <div sanctumReveal distance="whisper" class="flex justify-center py-16 md:py-20">
      <sanctum-mark [size]="56" />
    </div>

    <!-- 24/7 Livestream -->
    <section id="livestream" class="scroll-mt-28 py-12 md:py-16 px-6 max-w-5xl mx-auto">
      <header sanctumReveal class="mb-10 max-w-2xl">
        <sanctum-eyebrow class="mb-4">24/7 Livestream</sanctum-eyebrow>
        <sanctum-display size="lg" class="mb-5">
          <h2>
            CCC Original Songs
            <span class="italic text-sanctum-burgundy">&amp; Hymns.</span>
          </h2>
        </sanctum-display>
        <p class="font-body text-base md:text-lg text-sanctum-muted leading-relaxed">
          A continuous stream of Celestial Church of Christ original songs and
          hymns — sung in Yoruba, English, and the languages of the diaspora.
          The vigil never quite ends.
        </p>
      </header>
      <div sanctumReveal [delay]="150">
        <sanctum-youtube-embed
          videoId="MybSY9EjesQ"
          title="Celestial Church of Christ Original Songs and Hymns — 24/7 Livestream"
          [live]="true"
        />
      </div>
      <div sanctumReveal [delay]="250" class="mt-8">
        <a
          sanctumBtn
          variant="ghost"
          href="https://youtube.com/user/cccSanctumParish"
          target="_blank"
          rel="noopener noreferrer"
        >
          Subscribe on YouTube
        </a>
      </div>
    </section>

    <div sanctumReveal distance="whisper" class="flex justify-center py-16 md:py-20">
      <sanctum-mark [size]="56" />
    </div>

    <!-- Blog -->
    <section id="blog" class="scroll-mt-28 py-12 md:py-16 px-6 max-w-6xl mx-auto">
      <header sanctumReveal class="mb-12 md:mb-16 max-w-2xl">
        <sanctum-eyebrow class="mb-4">Sanctum Blog</sanctum-eyebrow>
        <sanctum-display size="lg" class="mb-5">
          <h2>
            Long-form
            <span class="italic text-sanctum-burgundy">devotionals.</span>
          </h2>
        </sanctum-display>
        <p class="font-body text-base md:text-lg text-sanctum-muted leading-relaxed">
          Teaching, exposition, and reflection on biblical principles — written
          for slow reading on a quiet morning.
        </p>
      </header>

      <!-- Featured (first) post — full-width -->
      @if (posts[0]; as featured) {
        <sanctum-blog-card
          sanctumReveal
          duration="long"
          class="block mb-16"
          [featured]="true"
          [title]="featured.title"
          [href]="featured.href"
          [date]="featured.date"
          [author]="featured.author"
          [excerpt]="featured.excerpt"
          [imageUrl]="featured.imageUrl"
        />
      }

      <!-- Remaining posts in 2-col grid -->
      <div sanctumCascade stagger="default" class="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-16">
        @for (post of posts.slice(1); track post.href) {
          <sanctum-blog-card
            [title]="post.title"
            [href]="post.href"
            [date]="post.date"
            [author]="post.author"
            [excerpt]="post.excerpt"
            [imageUrl]="post.imageUrl"
          />
        }
      </div>

      <div sanctumReveal class="mt-16 text-center">
        <a
          sanctumBtn
          variant="ghost"
          href="https://www.celestialsanctumparish.org/blog/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Browse the full archive
        </a>
        <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-muted mt-4">
          Nine pages of writing &amp; counting
        </p>
      </div>
    </section>

    <!-- Subscribe — full-bleed burgundy -->
    <section class="relative bg-sanctum-burgundy text-sanctum-cream overflow-hidden py-24 md:py-32 px-6 mt-24">
      <div
        class="absolute inset-0 opacity-10 pointer-events-none"
        aria-hidden="true"
        style='background-image: url("data:image/svg+xml,%3Csvg viewBox=%270 0 400 400%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%272%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E");'
      ></div>
      <div class="relative max-w-5xl mx-auto">
        <div sanctumReveal class="flex justify-center mb-10">
          <sanctum-mark [size]="56" tone="light" />
        </div>
        <div sanctumReveal [delay]="150" class="text-center mb-12 md:mb-16">
          <p class="font-body text-xs uppercase tracking-[0.4em] text-sanctum-gold font-semibold mb-6">
            Stay connected
          </p>
          <h2
            class="font-display italic font-medium text-sanctum-cream tracking-[-0.02em] leading-[0.95]"
            style="font-size: clamp(2.75rem, 7vw, 5rem);"
          >
            Subscribe everywhere.
          </h2>
        </div>

        <div sanctumCascade stagger="tight" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          @for (channel of subscribe; track channel.href) {
            <a
              [href]="channel.href"
              target="_blank"
              rel="noopener noreferrer"
              class="group block px-6 py-8 border border-sanctum-cream/25 hover:border-sanctum-gold hover:bg-sanctum-cream/5 transition-colors rounded-sm"
            >
              <span class="text-sanctum-gold inline-flex mb-5 transition-transform group-hover:scale-110">
                <sanctum-icon [name]="channel.icon" [size]="28" />
              </span>
              <p class="font-display text-xl text-sanctum-cream mb-1 font-medium">
                {{ channel.label }}
              </p>
              <p class="font-body text-sm text-sanctum-cream/70 leading-snug">
                {{ channel.detail }}
              </p>
            </a>
          }
        </div>
      </div>
    </section>
  `,
})
export class Watch {
  protected readonly posts: BlogPost[] = [
    {
      title: 'Going Under and Coming Up New: The Beautiful Meaning of Baptism',
      href: 'https://www.celestialsanctumparish.org/blog/2026/05/22/going-under-and-coming-up-new-the-beautiful-meaning-of-baptism/',
      date: 'May 22, 2026',
      author: 'Sanctum Parish',
      excerpt:
        "Baptism is so much more than a church tradition — it's a profound, personal declaration of faith that marks the beginning of your new life in Christ.",
      imageUrl:
        'https://i0.wp.com/celestialsanctumparish.org/blog/wp-content/uploads/2026/05/featured-1779465650399.jpg?resize=780%2C437&ssl=1',
    },
    {
      title: 'Bending Low to Rise High: Why Humility is the Heart of the Christian Life',
      href: 'https://www.celestialsanctumparish.org/blog/2026/05/20/bending-low-to-rise-high-why-humility-is-the-heart-of-the-christian-life/',
      date: 'May 20, 2026',
      author: 'Sanctum Parish',
      excerpt:
        'In a world that celebrates self-promotion and personal glory, God invites us into something far more beautiful — the quiet, powerful grace of humility.',
      imageUrl:
        'https://i0.wp.com/celestialsanctumparish.org/blog/wp-content/uploads/2026/05/featured-1779292848042.jpg?resize=780%2C437&ssl=1',
    },
    {
      title: 'When Fear Knocks on Your Door: How Faith Answers',
      href: 'https://www.celestialsanctumparish.org/blog/2026/05/18/when-fear-knocks-on-your-door-how-faith-answers/',
      date: 'May 18, 2026',
      author: 'Sanctum Parish',
      excerpt:
        'Fear has a way of showing up uninvited — but so does God. Discover how faith in His Word can silence the loudest fears and anchor your heart in His perfect peace.',
      imageUrl:
        'https://i0.wp.com/celestialsanctumparish.org/blog/wp-content/uploads/2026/05/featured-1779120053031.jpg?resize=780%2C437&ssl=1',
    },
    {
      title: "Welcome Home: What the Prodigal Son Teaches Us About God's Relentless Love",
      href: 'https://www.celestialsanctumparish.org/blog/2026/05/15/welcome-home-what-the-prodigal-son-teaches-us-about-gods-relentless-love/',
      date: 'May 15, 2026',
      author: 'Sanctum Parish',
      excerpt:
        "The parable of the prodigal son isn't just a story about a wayward child — it's a portrait of a Father who never stops watching the road, waiting for you to come home.",
      imageUrl:
        'https://i0.wp.com/celestialsanctumparish.org/blog/wp-content/uploads/2026/05/featured-1778860847714.jpg?resize=780%2C437&ssl=1',
    },
    {
      title: 'Blessed Are You: How the Beatitudes Speak Directly to Your Life Today',
      href: 'https://www.celestialsanctumparish.org/blog/2026/05/13/blessed-are-you-how-the-beatitudes-speak-directly-to-your-life-today/',
      date: 'May 13, 2026',
      author: 'Sanctum Parish',
      excerpt:
        "Jesus' Beatitudes aren't just ancient poetry — they're a living blueprint for the kind of heart God is shaping in each of us.",
      imageUrl:
        'https://i0.wp.com/celestialsanctumparish.org/blog/wp-content/uploads/2026/05/featured-1778688041791.jpg?resize=780%2C437&ssl=1',
    },
  ];

  protected readonly subscribe: SubscribeChannel[] = [
    {
      label: 'Spotify',
      detail: 'Sanctum Podcast',
      href: 'https://open.spotify.com/show/0lQ2H8kaRG8nl6InuGUcC6',
      icon: 'spotify',
    },
    {
      label: 'YouTube',
      detail: 'cccSanctumParish — livestream & sermons',
      href: 'https://youtube.com/user/cccSanctumParish',
      icon: 'youtube',
    },
    {
      label: 'RSS',
      detail: 'FeedBurner — blog as a feed',
      href: 'https://feeds.feedburner.com/celestialsanctumparish/mLqB',
      icon: 'pen',
    },
    {
      label: 'Sanctum News',
      detail: 'Email newsletter — weekly',
      href: '/contact',
      icon: 'mail',
    },
  ];
}
