import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'csSiteSettings',
  title: 'Site Settings',
  type: 'document',
  // Singleton — every page reads from this. Address splits into street +
  // city so the footer can render them on separate lines, and phoneHref is
  // the tel:-safe variant ("909-996-2397") next to the display phone
  // ("909.996.2397"). mapsQuery is the URL-encoded address used by every
  // "Get Directions" link.
  fields: [
    defineField({ name: 'parishName', title: 'Parish name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'streetAddress', title: 'Street address', type: 'string', description: 'e.g. "11750 Cedar Avenue"' }),
    defineField({ name: 'cityRegion', title: 'City + region', type: 'string', description: 'e.g. "Bloomington, CA 92316"' }),
    defineField({ name: 'parishPhone', title: 'Phone (display)', type: 'string', description: 'Formatted for reading. e.g. "909.996.2397"' }),
    defineField({ name: 'parishPhoneHref', title: 'Phone (tel: link)', type: 'string', description: 'Dialable format. e.g. "909-996-2397"' }),
    defineField({ name: 'parishEmail', title: 'Email', type: 'string' }),
    defineField({ name: 'mapsQuery', title: 'Maps query', type: 'string', description: 'URL-encoded address. e.g. "11750+Cedar+Avenue+Bloomington+CA+92316"' }),
  ],
});
