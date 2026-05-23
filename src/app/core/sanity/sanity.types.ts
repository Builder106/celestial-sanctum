import type { PortableTextBlock } from '@portabletext/types';

// One row in the homepage's "Sunday rhythm" section.
export interface SundayBlock {
  time: string;
  heading: string;
  body: string;
}

// Homepage entry — the single, top-level singleton that holds every editable
// homepage string. Sections that are still hardcoded in the component (e.g.
// the burgundy "Find us in Bloomington" closer) get added here as Phase 5
// expands beyond the first slice.
export interface Homepage {
  heroEyebrow: string;
  heroLead: string;
  heroHeadline: string;
  heroSubcopy: string;
  missionEyebrow: string;
  missionQuote: string;
  sundayRhythm: SundayBlock[];
}

export interface Pastor {
  name: string;
  portraitUrl?: string;
  letterPullQuote: string;
  letterBody: PortableTextBlock[] | string[];
  signature: string;
}

export interface SiteSettings {
  parishName: string;
  parishAddress: string;
  parishPhone: string;
  parishEmail: string;
}
