import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AnchorItem, AnchorNav } from '../../shared/ui/anchor-nav';
import { SanctumButton } from '../../shared/ui/button';
import { Display } from '../../shared/ui/display';
import { Eyebrow } from '../../shared/ui/eyebrow';
import { Icon } from '../../shared/ui/icon';
import { SanctumMark } from '../../shared/ui/sanctum-mark';
import { SanctumReveal } from '../../core/motion/reveal.directive';
import { SanctumCascade } from '../../core/motion/cascade.directive';
import { SanctumDrawIn } from '../../core/motion/draw-in.directive';
import { SanctumCiteRule } from '../../core/motion/cite-rule.directive';
import { blockToPlainText } from '../../core/sanity/portable-text';
import { SanityService } from '../../core/sanity/sanity.service';
import { SeoService } from '../../core/seo/seo.service';

// Local shape — flattened paragraphs (string[]) so the template stays simple.
// Sanity returns paragraphs as PortableText blocks; we flatten in the computed.
interface AboutSection {
  id: string;
  label: string;
  eyebrow: string;
  heading: string;
  paragraphs: string[];
  list?: { term: string; definition: string }[];
  scripture?: string;
}

const FALLBACK: AboutSection[] = [
  {
    id: 'story',
    label: 'The Story',
    eyebrow: 'The Story',
    heading: 'Celestial Sanctum Parish, meaning "heavenly sanctuary."',
    paragraphs: [
      'Celestial Sanctum Parish, meaning "heavenly sanctuary," operates under the Celestial Church of Christ banner. The shepherd received this name through prophecy in April 1992, though the church didn\'t physically exist until 1999. It began in a small home room in Rancho Cucamonga, California, and is now established in Bloomington.',
      'The parish emphasizes biblical roots from both Old and New Testaments, professing Jesus Christ as our Lord and savior and the redeemer of mankind. It operates as a charismatic church where the Holy Spirit\'s power is central — the faith\'s practices divinely revealed rather than traditionally structured.',
      'Members are encouraged to actively participate in ministries and grow spiritually through engagement rather than casual worship. Prayer forms a core practice, with weekday services, vigils, and intercessory prayer gatherings. The parish positions itself as a place for divine intervention and miraculous experiences — a place to experience spiritual anointing and draw closer to God.',
    ],
  },
  {
    id: 'mission',
    label: 'Mission',
    eyebrow: 'Mission',
    heading: 'To win and nurture souls for the kingdom of God — and shine light into darkness.',
    scripture: 'Isaiah 61',
    paragraphs: [
      'The church\'s primary purpose is to win and nurture souls for God\'s kingdom. We describe ourselves as a church that carries the cross of Jesus and shines light into darkness — referencing our hymn about kindling light in the world\'s darkness.',
      'Sanctum Parish draws its mission from Isaiah 61, interpreting our call to include preaching to the poor, healing the brokenhearted, proclaiming liberty to captives, and comforting those who mourn. We frame our work as offering beauty for ashes and transforming spiritual heaviness into praise.',
      'Celestial Sanctum Parish operates as an extension of the Celestial Church of Christ, with a stated mandate to cleanse the world. The parish is located in Bloomington, California.',
    ],
  },
  {
    id: 'shepherd',
    label: 'Shepherd',
    eyebrow: 'Shepherd',
    heading: 'A shepherd for the parish.',
    paragraphs: [
      'The parish welcomes visitors as part of the Celestial Church of Christ, located at 11750 Cedar Avenue in Bloomington. The shepherd leads the congregation in winning and nurturing souls for the kingdom of God while carrying forward the Christian message.',
      'The parish emphasizes spiritual growth through multiple ministries, fellowship opportunities, and educational content — an active presence across the podcast, blog, and weekly community gatherings.',
    ],
  },
  {
    id: 'doctrine',
    label: 'Doctrine',
    eyebrow: 'Doctrine',
    heading: 'God is holy and demands that those who worship him must also be holy.',
    paragraphs: [],
    list: [
      { term: 'Luli — grace', definition: 'The church\'s cornerstone principle is Luli, meaning grace. This reflects the covenant through Jesus Christ, emphasizing that salvation through the grace of God is central to the parish\'s teachings.' },
      { term: 'The Triune God', definition: 'We affirm belief in a triune God: God the Father, Jesus Christ the Son, and the Holy Spirit.' },
      { term: 'Five ministries', definition: 'Drawing from Ephesians, we recognize five essential ministry roles — apostles, prophets, evangelists, pastors, and teachers — as integral to complete church function.' },
      { term: 'Holy Spirit gifts', definition: 'As a charismatic congregation, we believe the Holy Spirit\'s gifts remain active today, just as documented in biblical accounts. Members actively demonstrate these spiritual gifts in contemporary worship.' },
      { term: 'Prayer', definition: 'The parish prioritizes prayer as transformative and effective. Regular prayer gatherings occur throughout the week, with believers encouraged to petition God through consistent intercession.' },
      { term: 'Holiness', definition: 'God is holy and demands that those who worship him must also be holy, adhering to specific tenets established through Holy Spirit guidance.' },
    ],
  },
  {
    id: 'mode-of-worship',
    label: 'Mode of Worship',
    eyebrow: 'Mode of Worship',
    heading: 'These garments symbolize heavenly citizenship and the biblical attire of saints.',
    paragraphs: [
      'The parish describes its worship practices as divinely revealed and biblically grounded — unconventional in appearance, ancient in pattern.',
    ],
    list: [
      { term: 'Attire', definition: 'Members remove their shoes; women wear head coverings. White robes called sutanas are encouraged but optional. According to the church, these garments symbolize heavenly citizenship and the biblical attire of saints.' },
      { term: 'Altar and candlesticks', definition: 'The altar represents God\'s throne and features seven lit candlesticks symbolizing the seven spirits of God, as described in Revelation.' },
      { term: 'Incense', definition: 'Incense is used during prayer and worship for sanctification, representing both prayer and God\'s presence.' },
      { term: 'Water sprinkling', definition: 'Water sprinkling serves as a purification tool, paralleling Old Testament blood sacrifices and New Testament redemption through Christ\'s blood.' },
      { term: 'Posture', definition: 'The church emphasizes humble worship through kneeling, bowing, and lifting hands in prayer — supported by numerous biblical references throughout the Old and New Testaments.' },
    ],
  },
  {
    id: 'ministries',
    label: 'Ministries',
    eyebrow: 'Ministries',
    heading: 'Let the word of God dwell richly in you.',
    scripture: 'Colossians 3 : 16',
    paragraphs: [
      'Members are encouraged to participate in one or more ministry programs designed to strengthen faith and foster fellowship.',
    ],
    list: [
      { term: 'Youth Ministry', definition: 'Biblical guidance to young church members, helping them navigate education, relationships, and social challenges through Christian doctrine and teachings.' },
      { term: 'Women Ministry', definition: 'Counseling services, prayer meetings, and Bible studies every Saturday at 5 PM — women gathering to discuss relevant topics and concerns.' },
      { term: 'Outreach Ministry', definition: 'Serving the poor and assisting those in need through fundraising and resource distribution, reflecting the compassion demonstrated by Jesus.' },
      { term: 'Evangelism Ministry', definition: 'Based on the Great Commission — "go out into the world and make disciples" (Matthew 28:19). Community outreach, the church blog, the monthly biblical digest, and Bible classes every Monday at 8 PM.' },
    ],
  },
  {
    id: 'choir',
    label: 'The Choir',
    eyebrow: 'The Choir',
    heading: 'We write and sing songs to praise the Lord Jesus.',
    paragraphs: [
      'The Sanctum Choir is the official choir of CCC Sanctum Parish in Bloomington, California. Our purpose centers on writing and performing music that praises Jesus Christ across multiple musical genres — music is a universal language.',
      'The choir launched an EP titled "Praises in Diverse Spaces" on March 1, 2024, available across streaming platforms including Spotify, Apple Music, Deezer, Audiomack, and Amazon Music.',
    ],
  },
];

@Component({
  selector: 'sanctum-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnchorNav, Display, Eyebrow, Icon, RouterLink, SanctumButton, SanctumCascade, SanctumCiteRule, SanctumDrawIn, SanctumMark, SanctumReveal],
  template: `
    <!-- Page hero (compact) -->
    <section sanctumCascade stagger="spaced" class="pt-24 md:pt-32 pb-12 px-6 max-w-6xl mx-auto">
      <sanctum-eyebrow class="mb-6">About the parish</sanctum-eyebrow>
      <sanctum-display size="xl" class="mb-8 max-w-4xl">
        <h1>
          A heavenly sanctuary
          <span class="italic text-sanctum-burgundy">in Bloomington.</span>
        </h1>
      </sanctum-display>
      <p class="font-body text-xl text-sanctum-muted leading-relaxed max-w-2xl">
        Celestial Sanctum Parish — "heavenly sanctuary" — operates under the
        Celestial Church of Christ banner. The name came through prophecy in
        April 1992; the parish itself opened in 1999.
      </p>
    </section>

    <!-- Long-form body with sticky TOC -->
    <div class="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-32">
      <aside class="lg:col-span-3">
        <sanctum-anchor-nav [items]="anchors()" />
      </aside>

      <article class="lg:col-span-9 max-w-prose">
        @for (section of sections(); track section.id; let i = $index) {
          @if (i > 0) {
            <div sanctumReveal distance="whisper" class="flex justify-center py-20">
              <sanctum-mark [size]="56" />
            </div>
          } @else {
            <div sanctumDrawIn class="flex justify-center pb-12 hidden">
              <sanctum-mark [size]="56" />
            </div>
          }
          <section [id]="section.id" sanctumReveal class="scroll-mt-28">
            <sanctum-eyebrow tone="gold" class="mb-4">
              {{ section.eyebrow }}
            </sanctum-eyebrow>
            <h2 class="font-display text-3xl md:text-5xl text-sanctum-ink leading-[1.1] tracking-[-0.01em] mb-10">
              {{ section.heading }}
            </h2>

            @if (section.scripture) {
              <p class="font-body text-xs uppercase tracking-[0.3em] text-sanctum-gold font-semibold mb-8">
                <span sanctumCiteRule>{{ section.scripture }}</span>
              </p>
            }

            @if (section.paragraphs.length) {
              <div class="space-y-6 font-body text-base md:text-lg text-sanctum-ink/85 leading-[1.75]" [class.mb-12]="section.list">
                @for (para of section.paragraphs; track $index) {
                  <p>{{ para }}</p>
                }
              </div>
            }

            @if (section.list) {
              <dl class="space-y-8">
                @for (item of section.list; track item.term) {
                  <div>
                    <dt class="font-display italic text-2xl text-sanctum-burgundy mb-2">
                      {{ item.term }}
                    </dt>
                    <dd class="font-body text-base md:text-lg text-sanctum-ink/85 leading-[1.75]">
                      {{ item.definition }}
                    </dd>
                  </div>
                }
              </dl>
            }

            <!-- Sanctum Choir callout — gated to the Choir section. The
                 dedicated /choir page expands on the choir's identity,
                 releases, and platform links. Card chrome mirrors the
                 Doctrine + CZM cards on this page for consistency, just
                 with the choir portrait in place of an abstract mark. -->
            @if (section.id === 'choir') {
              <aside
                class="mt-14 md:mt-16 bg-sanctum-paper border border-sanctum-gold/60 rounded-sm overflow-hidden shadow-[0_6px_24px_-12px_rgba(26,22,18,0.18)]"
              >
                <div class="flex flex-col md:flex-row md:items-stretch">
                  <div class="md:w-2/5 shrink-0 bg-sanctum-cream">
                    <img
                      src="/img/sanctum-choir.jpg"
                      alt="The CCC Sanctum Choir in white sutanas and gold sashes."
                      width="1000"
                      height="1000"
                      class="w-full h-full object-cover aspect-square md:aspect-auto"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div class="flex-1 p-7 md:p-9">
                    <p class="font-body text-[11px] md:text-xs uppercase tracking-[0.3em] text-sanctum-blue font-semibold mb-3">
                      Sanctum Choir
                    </p>
                    <h3 class="font-display text-2xl md:text-3xl text-sanctum-ink leading-[1.15] mb-3 tracking-[-0.01em]">
                      Praises in
                      <span class="italic text-sanctum-burgundy">Diverse Spaces.</span>
                    </h3>
                    <p class="font-body text-base md:text-lg text-sanctum-ink/85 leading-[1.7] mb-6 max-w-xl">
                      The choir's most recent EP, released March 1, 2024 — and
                      the official Sanctum Choir presence across Spotify, Apple
                      Music, Deezer, Audiomack, and Amazon Music.
                    </p>
                    <a
                      sanctumBtn
                      variant="primary"
                      size="md"
                      routerLink="/choir"
                    >
                      Visit the choir
                      <sanctum-icon name="arrow-up-right" [size]="14" class="inline-block ml-2 align-[-2px]" />
                    </a>
                  </div>
                </div>
              </aside>
            }

            <!-- Celestial Zeitgeist Ministries callout — the parish's
                 youth-led evangelical media ministry. Gated to the
                 Ministries section so it surfaces alongside the other
                 ministries instead of competing for attention elsewhere.
                 Visually echoes the doctrine card pattern but in CZM's
                 own dark navy / electric blue so visitors get a hint of
                 the microsite's distinct identity before clicking
                 through. -->
            @if (section.id === 'ministries') {
              <aside
                class="mt-14 md:mt-16 relative overflow-hidden rounded-sm p-7 md:p-9 bg-[#08111d] text-white shadow-[0_10px_32px_-16px_rgba(11,26,46,0.4)]"
              >
                <div
                  class="absolute right-[-80px] top-[-80px] w-72 h-72 rounded-full bg-[#3BA0E8]/20 blur-3xl pointer-events-none"
                  aria-hidden="true"
                ></div>
                <div class="relative flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
                  <img
                    src="/img/czm-logo.png"
                    alt=""
                    width="64"
                    height="64"
                    class="rounded-full shrink-0 drop-shadow-[0_0_16px_rgba(59,160,232,0.4)]"
                    decoding="async"
                  />
                  <div class="flex-1 min-w-0">
                    <p
                      class="font-body text-[11px] md:text-xs uppercase tracking-[0.3em] text-[#3BA0E8] font-semibold mb-3"
                    >
                      Youth-led media
                    </p>
                    <h3
                      class="font-display text-2xl md:text-3xl text-white leading-[1.15] mb-3 tracking-[-0.01em]"
                    >
                      Celestial Zeitgeist
                      <span class="italic text-[#3BA0E8]">Ministries.</span>
                    </h3>
                    <p
                      class="font-body text-base md:text-lg text-white/70 leading-[1.7] mb-6 max-w-xl"
                    >
                      The parish's youth-led evangelical media ministry —
                      podcasts, conversations, and video content cutting
                      through the ideas of the current era to direct focus
                      to faith in Christ.
                    </p>
                    <a
                      routerLink="/czm"
                      class="inline-flex items-center gap-2 px-5 py-3 rounded-sm bg-gradient-to-r from-[#3BA0E8] to-[#5FB8F3] text-white font-semibold text-sm hover:shadow-[0_8px_24px_-8px_rgba(59,160,232,0.6)] transition-shadow"
                    >
                      Visit CZM
                      <sanctum-icon name="arrow-up-right" [size]="14" class="inline-block ml-1 align-[-2px]" />
                    </a>
                  </div>
                </div>
              </aside>
            }

            <!-- Canonical-source card, gated to the Doctrine section so it
                 reads as a "read the full thing" affordance attached to
                 the parish's belief summary. The PDF is the official 1980
                 deed of constitution of the Celestial Church of Christ. -->
            @if (section.id === 'doctrine') {
              <aside
                class="mt-14 md:mt-16 bg-sanctum-paper border border-sanctum-gold/60 rounded-sm p-7 md:p-9 shadow-[0_6px_24px_-12px_rgba(26,22,18,0.18)]"
              >
                <div class="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
                  <sanctum-mark [size]="64" tone="default" class="shrink-0" />
                  <div class="flex-1 min-w-0">
                    <p
                      class="font-body text-[11px] md:text-xs uppercase tracking-[0.3em] text-sanctum-blue font-semibold mb-3"
                    >
                      Canonical source
                    </p>
                    <h3
                      class="font-display text-2xl md:text-3xl text-sanctum-ink leading-[1.15] mb-3 tracking-[-0.01em]"
                    >
                      The CCC Deed of
                      <span class="italic text-sanctum-burgundy">Constitution.</span>
                    </h3>
                    <p
                      class="font-body text-base md:text-lg text-sanctum-ink/85 leading-[1.7] mb-6 max-w-xl"
                    >
                      The full governing document of the Celestial Church of Christ —
                      foundation history, tenets, mode of worship, sacraments, structure,
                      and ranks. Promulgated 29 March 1980.
                    </p>
                    <a
                      sanctumBtn
                      variant="primary"
                      size="md"
                      href="/ccc_constitution.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Read the Constitution
                      <sanctum-icon
                        name="arrow-up-right"
                        [size]="16"
                        class="inline-block ml-2 align-[-3px]"
                      />
                    </a>
                    <p class="mt-3 font-body text-xs text-sanctum-muted">
                      PDF · 66 pages · opens in a new tab
                    </p>
                  </div>
                </div>
              </aside>
            }
          </section>
        }

        <!-- Closing CTA -->
        <div sanctumCascade stagger="default" class="flex flex-col items-center text-center pt-24">
          <sanctum-mark [size]="56" />
          <p class="font-display italic text-2xl md:text-3xl text-sanctum-ink leading-snug mt-12 mb-8 max-w-md">
            The doors are open. Come and see for yourself.
          </p>
          <div class="flex flex-wrap gap-3 justify-center">
            <a sanctumBtn variant="primary" href="/visit">Plan Your Visit</a>
            <a sanctumBtn variant="ghost" href="/contact">Contact Us</a>
          </div>
        </div>
      </article>
    </div>
  `,
})
export class About {
  private readonly sanity = inject(SanityService);
  private readonly cmsSections = toSignal(this.sanity.aboutSections(), { initialValue: null });
  private readonly seo = inject(SeoService);
  constructor() {
    this.seo.set({
      title: 'About',
      description: 'The story, mission, doctrine, mode of worship, and ministries of Celestial Sanctum Parish — a heavenly sanctuary in Bloomington, California since 1999.',
      path: '/about',
    });
  }

  protected readonly sections = computed<readonly AboutSection[]>(() => {
    const fromCms = this.cmsSections();
    if (!fromCms || fromCms.length === 0) return FALLBACK;
    return fromCms.map((s) => ({
      id: s.anchorId,
      label: s.label,
      eyebrow: s.eyebrow,
      heading: s.heading,
      scripture: s.scripture,
      paragraphs: (s.paragraphs ?? []).map(blockToPlainText).filter((p) => p.length > 0),
      list: s.items && s.items.length > 0 ? s.items : undefined,
    }));
  });

  protected readonly anchors = computed<AnchorItem[]>(() =>
    this.sections().map((s) => ({ id: s.id, label: s.label })),
  );
}
