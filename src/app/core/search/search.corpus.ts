import type { SearchDoc } from './search.types';

/**
 * Hand-curated static corpus of pages, sections, and key resources on
 * the parish site. The dynamic corpus (blog posts from Sanity, YouTube
 * uploads from the RSS feed, calendar events from the iCal feed) gets
 * merged in by SearchService at runtime.
 *
 * Conventions when adding entries:
 * - `body` is for MiniSearch's index — pack it with synonyms, Yoruba
 *   words, ministry aliases, and any other term a visitor might type.
 *   It's NOT shown to the user; the `eyebrow` + `title` are.
 * - `id`s are stable so MiniSearch's incremental index reuses them.
 * - Sections that live on long-form pages use `/page#anchor` URLs so
 *   the result lands the visitor in the right scroll position.
 */
export const STATIC_CORPUS: readonly SearchDoc[] = [
  // ---------- Pages ----------
  {
    id: 'page-home',
    title: 'You are welcome to Sanctum Parish',
    body: 'home welcome Sunday worship Celestial Church of Christ Bloomington California parish',
    eyebrow: 'Home',
    url: '/',
    kind: 'page',
  },
  {
    id: 'page-visit',
    title: 'Plan your visit',
    body: 'visit first-time visitor newcomer guest Sunday service what to expect dress code parking children',
    eyebrow: 'Visit',
    url: '/visit',
    kind: 'page',
  },
  {
    id: 'page-about',
    title: 'About Celestial Sanctum Parish',
    body: 'about parish history mission shepherd doctrine ministries choir',
    eyebrow: 'About',
    url: '/about',
    kind: 'page',
  },
  {
    id: 'page-watch',
    title: 'Watch & Listen',
    body: 'watch listen media Spotify podcast YouTube livestream livestream hymns blog devotional sermons videos',
    eyebrow: 'Watch & Listen',
    url: '/watch',
    kind: 'page',
  },
  {
    id: 'page-calendar',
    title: 'Parish calendar',
    body: 'calendar events schedule weekly services Sunday Monday Tuesday Wednesday Thursday Friday Saturday vigil Bible study',
    eyebrow: 'Calendar',
    url: '/calendar',
    kind: 'page',
  },
  {
    id: 'page-give',
    title: 'Give',
    body: 'give donate donation tithe offering PayPal support parish',
    eyebrow: 'Give',
    url: '/give',
    kind: 'page',
  },
  {
    id: 'page-contact',
    title: 'Contact the parish',
    body: 'contact phone email address directions location prayer request reach us message',
    eyebrow: 'Contact',
    url: '/contact',
    kind: 'page',
  },
  {
    id: 'page-choir',
    title: 'The Sanctum Choir',
    body: 'choir Sanctum Choir Ohun ta ni ju wura lo music EP Praises in Diverse Spaces Ju Wura Yoruba',
    eyebrow: 'Choir',
    url: '/choir',
    kind: 'page',
  },
  {
    id: 'page-czm',
    title: 'Celestial Zeitgeist Ministries',
    body: 'CZM Celestial Zeitgeist Ministries youth evangelism media ministry podcasts modern',
    eyebrow: 'Ministries',
    url: '/czm',
    kind: 'page',
  },

  // ---------- About anchor sections ----------
  {
    id: 'section-about-story',
    title: 'Our story',
    body: '1999 founded Rancho Cucamonga history parish gathering small living rooms relocated Bloomington',
    eyebrow: 'About · Story',
    url: '/about#story',
    kind: 'section',
  },
  {
    id: 'section-about-mission',
    title: 'Our mission',
    body: 'mission statement nurturing souls kingdom of God winning souls Christ',
    eyebrow: 'About · Mission',
    url: '/about#mission',
    kind: 'section',
  },
  {
    id: 'section-about-shepherd',
    title: 'The shepherd',
    body: 'shepherd pastor leader congregation lead parish minister',
    eyebrow: 'About · Shepherd',
    url: '/about#shepherd',
    kind: 'section',
  },
  {
    id: 'section-about-doctrine',
    title: 'Doctrine — what we believe',
    body: 'doctrine beliefs faith Luli grace covenant Jesus Christ triune God Father Son Holy Spirit five ministries apostles prophets evangelists pastors teachers Holy Spirit gifts charismatic prayer holiness',
    eyebrow: 'About · Doctrine',
    url: '/about#doctrine',
    kind: 'section',
  },
  {
    id: 'section-about-worship',
    title: 'Mode of worship',
    body: 'mode of worship sutana attire white robe head covering altar candlesticks seven spirits incense water sprinkling kneeling bowing posture',
    eyebrow: 'About · Mode of Worship',
    url: '/about#mode-of-worship',
    kind: 'section',
  },
  {
    id: 'section-about-ministries',
    title: 'Ministries',
    body: 'ministries youth ministry women ministry outreach ministry evangelism ministry CZM Celestial Zeitgeist',
    eyebrow: 'About · Ministries',
    url: '/about#ministries',
    kind: 'section',
  },
  {
    id: 'section-about-choir',
    title: 'The Choir',
    body: 'choir Sanctum Choir songs Lord Jesus genres music',
    eyebrow: 'About · Choir',
    url: '/about#choir',
    kind: 'section',
  },

  // ---------- Watch & Listen anchor sections ----------
  {
    id: 'section-watch-podcast',
    title: 'Sanctum Podcast',
    body: 'podcast Sanctum Podcast Spotify episodes conversations devotionals',
    eyebrow: 'Watch · Podcast',
    url: '/watch#podcast',
    kind: 'section',
  },
  {
    id: 'section-watch-livestream',
    title: '24/7 livestream — CCC hymns',
    body: 'livestream YouTube live 24/7 hymns Yoruba English Celestial Church of Christ original songs',
    eyebrow: 'Watch · Livestream',
    url: '/watch#livestream',
    kind: 'section',
  },
  {
    id: 'section-watch-videos',
    title: 'Recent uploads',
    body: 'YouTube videos uploads sermons Bible class vigil Sunday sermon recordings',
    eyebrow: 'Watch · Videos',
    url: '/watch#videos',
    kind: 'section',
  },
  {
    id: 'section-watch-blog',
    title: 'Sanctum Blog',
    body: 'blog devotionals writing articles posts',
    eyebrow: 'Watch · Blog',
    url: '/watch#blog',
    kind: 'section',
  },

  // ---------- Choir release ----------
  {
    id: 'release-praises-in-diverse-spaces',
    title: 'Praises in Diverse Spaces',
    body: 'EP album release Sanctum Choir March 2024 Spotify Apple Music Deezer Audiomack Amazon Music streaming',
    eyebrow: 'Choir · Release · March 2024',
    url: '/choir#featured',
    kind: 'release',
  },
  {
    id: 'video-ju-wura',
    title: 'Ju Wura — Harvest of Metanoia',
    body: 'Ju Wura music video Sanctum Choir Harvest Metanoia Visuals YouTube',
    eyebrow: 'Choir · Music video',
    url: '/choir#video',
    kind: 'video',
  },

  // ---------- CZM podcasts ----------
  {
    id: 'podcast-kindling',
    title: 'The Kindling Podcast',
    body: 'Kindling Podcast CZM Celestial Zeitgeist Bible Celestial Church of Christ Christian faith deep conversations',
    eyebrow: 'CZM · Podcast',
    url: '/czm#podcasts',
    kind: 'podcast',
  },
  {
    id: 'podcast-jehovah-rabboni',
    title: 'Jehovah Rabboni',
    body: 'Jehovah Rabboni CZM Celestial Zeitgeist life faith Christian walk biblical topics CCC',
    eyebrow: 'CZM · Podcast',
    url: '/czm#podcasts',
    kind: 'podcast',
  },
  {
    id: 'podcast-symbols-of-spirituality',
    title: 'Symbols of Spirituality',
    body: 'Symbols of Spirituality CZM Celestial Zeitgeist symbolic objects Celestial Church of Christ Bible',
    eyebrow: 'CZM · Podcast',
    url: '/czm#podcasts',
    kind: 'podcast',
  },
  {
    id: 'podcast-heresies',
    title: 'Heresies',
    body: 'Heresies CZM Celestial Zeitgeist church history heresy docetism Christianity',
    eyebrow: 'CZM · Podcast',
    url: '/czm#podcasts',
    kind: 'podcast',
  },

  // ---------- Key documents ----------
  {
    id: 'doc-ccc-constitution',
    title: 'CCC Constitution (PDF)',
    body: 'constitution deed Celestial Church of Christ 1980 governing document foundation history tenets sacraments structure administration ranks robes',
    eyebrow: 'Document · PDF · 66 pages',
    url: '/ccc_constitution.pdf',
    external: true,
    kind: 'doc',
  },
];
