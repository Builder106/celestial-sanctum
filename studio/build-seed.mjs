// Regenerates studio/seed.ndjson from the prose below.
// Run: `node build-seed.mjs` (from studio/), then
//      `npx sanity dataset import seed.ndjson production --replace`
//
// Hand-writing NDJSON is fiddly because JSON.stringify is the only safe
// way to escape apostrophes, em-dashes, and quotes inside the parish copy.
// This script keeps the source readable (plain template literals) and lets
// us regenerate the whole dataset deterministically if it ever drifts.
//
// Once Sanity is the source of truth (entries edited via the Studio), this
// file becomes a fallback for fresh dataset bootstraps — not the day-to-day
// editing surface.
//
// ⚠ Document _id gotcha: avoid dots in custom _ids. Sanity reserves the dot
// as a separator for its release-versioning ID pattern (versions.<release>.
// <doc>). IDs like `about.choir` get auto-detected as documents inside a
// release called "about", which makes them invisible to the public API
// until the release ships. Worse, shipping a release is a paid-tier
// feature, so on the free plan dotted-ID docs are effectively unshippable.
//
// All IDs in this file use hyphens, e.g. `about-story` / `about-choir`.
// Any new doc types added here should follow the same convention.
// (An earlier import of about.* docs left orphan versioned entries in
// the dataset; they're invisible to the public API and harmless.)

import { writeFile } from 'node:fs/promises';

// ─── Portable Text helpers ──────────────────────────────────────────────────

let blockCounter = 0;

const block = (text) => {
  const k = `b${++blockCounter}`;
  return {
    _type: 'block',
    _key: k,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `${k}s`, text, marks: [] }],
  };
};

const paragraphs = (...texts) => texts.map(block);

const item = (term, definition) => ({
  _type: 'aboutItem',
  _key: term.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32),
  term,
  definition,
});

const aboutSection = ({ id, order, label, eyebrow, heading, scripture, paragraphs: paras, items }) => ({
  // Hyphens, not dots — dots trigger Sanity's release-versioning detection
  // (see the gotcha comment at the top of this file).
  _id: `about-${id}`,
  _type: 'csAboutSection',
  order,
  anchorId: { _type: 'slug', current: id },
  label,
  eyebrow,
  heading,
  ...(scripture && { scripture }),
  ...(paras && paras.length > 0 && { paragraphs: paras }),
  ...(items && items.length > 0 && { items }),
});

// ─── Documents ──────────────────────────────────────────────────────────────

const docs = [
  {
    _id: 'siteSettings',
    _type: 'csSiteSettings',
    parishName: 'Celestial Sanctum Parish',
    parishAddress: '11750 Cedar Avenue, Bloomington, CA 92316',
    parishPhone: '',
    parishEmail: '',
  },

  {
    _id: 'homepage',
    _type: 'csHomepage',
    heroEyebrow: 'Celestial Church of Christ · Bloomington, CA',
    heroLead: 'You are welcome to',
    heroHeadline: 'Sanctum parish.',
    heroSubcopy: 'A parish of the Celestial Church of Christ, keeping vigil in Bloomington since 1999. Come as you are.',
    missionEyebrow: 'Our Mission',
    missionQuote: 'The church exists to win and nurture souls for the kingdom of God — to carry the cross of Jesus, lift it high, and make Him known.',
    sundayRhythm: [
      { _key: 'arrive', _type: 'sundayBlock', time: '10 AM', heading: 'Arrive', body: "Doors open at half past nine. You don't need to wear a sutana — come as you are, find a seat anywhere, and let the choir set the tone." },
      { _key: 'worship', _type: 'sundayBlock', time: '11 AM', heading: 'Worship', body: 'Songs in Yoruba and English, scripture readings, prayer, the message. Communion the first Sunday of every month.' },
      { _key: 'fellowship', _type: 'sundayBlock', time: '1 PM', heading: 'Fellowship', body: "After service we gather for food and conversation. If you're new, stay for it — it's how the parish makes room for you." },
    ],
  },

  {
    _id: 'pastor',
    _type: 'csPastor',
    name: 'The Pastor',
    letterPullQuote: '"This is your house."',
    letterBody: paragraphs(
      "Whether you've worshipped with us for years or are visiting for the first time, this is your house. Our parish keeps the rhythm — Sunday worship, the Thursday vigil, the choir's hymns in Yoruba and English — and it's here for you to step into at any time.",
      'If you carry a question, a grief, or a thanksgiving, bring it. The doors are open.',
    ),
    signature: '— The Pastor',
  },

  aboutSection({
    id: 'story',
    order: 10,
    label: 'The Story',
    eyebrow: 'The Story',
    heading: 'Celestial Sanctum Parish, meaning "heavenly sanctuary."',
    paragraphs: paragraphs(
      'Celestial Sanctum Parish, meaning "heavenly sanctuary," operates under the Celestial Church of Christ banner. The shepherd received this name through prophecy in April 1992, though the church didn\'t physically exist until 1999. It began in a small home room in Rancho Cucamonga, California, and is now established in Bloomington.',
      "The parish emphasizes biblical roots from both Old and New Testaments, professing Jesus Christ as our Lord and savior and the redeemer of mankind. It operates as a charismatic church where the Holy Spirit's power is central — the faith's practices divinely revealed rather than traditionally structured.",
      'Members are encouraged to actively participate in ministries and grow spiritually through engagement rather than casual worship. Prayer forms a core practice, with weekday services, vigils, and intercessory prayer gatherings. The parish positions itself as a place for divine intervention and miraculous experiences — a place to experience spiritual anointing and draw closer to God.',
    ),
  }),

  aboutSection({
    id: 'mission',
    order: 20,
    label: 'Mission',
    eyebrow: 'Mission',
    heading: 'To win and nurture souls for the kingdom of God — and shine light into darkness.',
    scripture: 'Isaiah 61',
    paragraphs: paragraphs(
      "The church's primary purpose is to win and nurture souls for God's kingdom. We describe ourselves as a church that carries the cross of Jesus and shines light into darkness — referencing our hymn about kindling light in the world's darkness.",
      'Sanctum Parish draws its mission from Isaiah 61, interpreting our call to include preaching to the poor, healing the brokenhearted, proclaiming liberty to captives, and comforting those who mourn. We frame our work as offering beauty for ashes and transforming spiritual heaviness into praise.',
      'Celestial Sanctum Parish operates as an extension of the Celestial Church of Christ, with a stated mandate to cleanse the world. The parish is located in Bloomington, California.',
    ),
  }),

  aboutSection({
    id: 'shepherd',
    order: 30,
    label: 'Shepherd',
    eyebrow: 'Shepherd',
    heading: 'A pastor for the parish.',
    paragraphs: paragraphs(
      'The parish welcomes visitors as part of the Celestial Church of Christ, located at 11750 Cedar Avenue in Bloomington. The pastor leads the congregation in winning and nurturing souls for the kingdom of God while carrying forward the Christian message.',
      'The parish emphasizes spiritual growth through multiple ministries, fellowship opportunities, and educational content — an active presence across the podcast, blog, and weekly community gatherings.',
    ),
  }),

  aboutSection({
    id: 'doctrine',
    order: 40,
    label: 'Doctrine',
    eyebrow: 'Doctrine',
    heading: 'God is holy and demands that those who worship him must also be holy.',
    items: [
      item('Luli — grace', "The church's cornerstone principle is Luli, meaning grace. This reflects the covenant through Jesus Christ, emphasizing that salvation through the grace of God is central to the parish's teachings."),
      item('The Triune God', 'We affirm belief in a triune God: God the Father, Jesus Christ the Son, and the Holy Spirit.'),
      item('Five ministries', 'Drawing from Ephesians, we recognize five essential ministry roles — apostles, prophets, evangelists, pastors, and teachers — as integral to complete church function.'),
      item('Holy Spirit gifts', "As a charismatic congregation, we believe the Holy Spirit's gifts remain active today, just as documented in biblical accounts. Members actively demonstrate these spiritual gifts in contemporary worship."),
      item('Prayer', 'The parish prioritizes prayer as transformative and effective. Regular prayer gatherings occur throughout the week, with believers encouraged to petition God through consistent intercession.'),
      item('Holiness', 'God is holy and demands that those who worship him must also be holy, adhering to specific tenets established through Holy Spirit guidance.'),
    ],
  }),

  aboutSection({
    id: 'mode-of-worship',
    order: 50,
    label: 'Mode of Worship',
    eyebrow: 'Mode of Worship',
    heading: 'These garments symbolize heavenly citizenship and the biblical attire of saints.',
    paragraphs: paragraphs(
      'The parish describes its worship practices as divinely revealed and biblically grounded — unconventional in appearance, ancient in pattern.',
    ),
    items: [
      item('Attire', 'Members remove their shoes; women wear head coverings. White robes called sutanas are encouraged but optional. According to the church, these garments symbolize heavenly citizenship and the biblical attire of saints.'),
      item('Altar and candlesticks', "The altar represents God's throne and features seven lit candlesticks symbolizing the seven spirits of God, as described in Revelation."),
      item('Incense', "Incense is used during prayer and worship for sanctification, representing both prayer and God's presence."),
      item('Water sprinkling', "Water sprinkling serves as a purification tool, paralleling Old Testament blood sacrifices and New Testament redemption through Christ's blood."),
      item('Posture', 'The church emphasizes humble worship through kneeling, bowing, and lifting hands in prayer — supported by numerous biblical references throughout the Old and New Testaments.'),
    ],
  }),

  aboutSection({
    id: 'ministries',
    order: 60,
    label: 'Ministries',
    eyebrow: 'Ministries',
    heading: 'Let the word of God dwell richly in you.',
    scripture: 'Colossians 3 : 16',
    paragraphs: paragraphs(
      'Members are encouraged to participate in one or more ministry programs designed to strengthen faith and foster fellowship.',
    ),
    items: [
      item('Youth Ministry', 'Biblical guidance to young church members, helping them navigate education, relationships, and social challenges through Christian doctrine and teachings.'),
      item('Women Ministry', 'Counseling services, prayer meetings, and Bible studies every Saturday at 5 PM — women gathering to discuss relevant topics and concerns.'),
      item('Outreach Ministry', 'Serving the poor and assisting those in need through fundraising and resource distribution, reflecting the compassion demonstrated by Jesus.'),
      item('Evangelism Ministry', 'Based on the Great Commission — "go out into the world and make disciples" (Matthew 28:19). Community outreach, the church blog, the monthly biblical digest, and Bible classes every Monday at 8 PM.'),
    ],
  }),

  aboutSection({
    id: 'choir',
    order: 70,
    label: 'The Choir',
    eyebrow: 'The Choir',
    heading: 'We write and sing songs to praise the Lord Jesus.',
    paragraphs: paragraphs(
      'The Sanctum Choir is the official choir of CCC Sanctum Parish in Bloomington, California. Our purpose centers on writing and performing music that praises Jesus Christ across multiple musical genres — music is a universal language.',
      'The choir launched an EP titled "Praises in Diverse Spaces" on March 1, 2024, available across streaming platforms including Spotify, Apple Music, Deezer, Audiomack, and Amazon Music.',
    ),
  }),
];

// ─── Write ──────────────────────────────────────────────────────────────────

const ndjson = docs.map((d) => JSON.stringify(d)).join('\n') + '\n';
await writeFile(new URL('./seed.ndjson', import.meta.url), ndjson);
console.log(`Wrote ${docs.length} documents to seed.ndjson`);
