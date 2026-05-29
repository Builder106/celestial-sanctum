export interface NavItem {
  label: string;
  path: string;
}

export const PRIMARY_NAV: readonly NavItem[] = [
  { label: 'Visit', path: '/visit' },
  { label: 'About', path: '/about' },
  { label: 'Watch & Listen', path: '/watch' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Give', path: '/give' },
];

export const FOOTER_QUICKLINKS: readonly NavItem[] = [
  { label: 'Story', path: '/about#story' },
  { label: 'Mission', path: '/about#mission' },
  { label: 'Doctrine', path: '/about#doctrine' },
  { label: 'Mode of Worship', path: '/about#mode-of-worship' },
  { label: 'Ministries', path: '/about#ministries' },
  { label: 'Choir', path: '/about#choir' },
];

export const FOOTER_RESOURCES: readonly NavItem[] = [
  { label: 'Podcast', path: '/watch#podcast' },
  { label: 'Blog', path: '/watch#blog' },
  { label: 'News', path: '/watch#news' },
  { label: 'CCC Constitution (PDF)', path: '/ccc_constitution.pdf' },
];

export const FOOTER_CONTACT = {
  address: '11750 Cedar Avenue',
  city: 'Bloomington, CA 92316',
  phone: '909.996.2397',
  phoneHref: '909-996-2397',
  email: 'celestialsanctumparish@gmail.com',
};

export interface SocialLink {
  label: string;
  url: string;
  icon: 'facebook' | 'instagram' | 'twitter' | 'youtube' | 'vimeo' | 'spotify';
}

export const SOCIALS: readonly SocialLink[] = [
  { label: 'Facebook', url: 'https://www.facebook.com/celestialsanctumparish', icon: 'facebook' },
  { label: 'Twitter', url: 'https://twitter.com/SanctumParish', icon: 'twitter' },
  { label: 'Instagram', url: 'https://instagram.com/sanctumparish', icon: 'instagram' },
  { label: 'YouTube', url: 'https://youtube.com/user/cccSanctumParish', icon: 'youtube' },
  { label: 'Vimeo', url: 'https://vimeo.com/celestialsanctumparish', icon: 'vimeo' },
  { label: 'Spotify', url: 'https://open.spotify.com/show/0lQ2H8kaRG8nl6InuGUcC6', icon: 'spotify' },
];
