import { defineField, defineType } from 'sanity';

// "Shepherd" is the Celestial Church of Christ's term for the leader of a
// congregation. Previously this type was csPastor; renamed for theological
// accuracy. The old csPastor docs in the dataset are orphaned (the query
// in SanityService now matches csShepherd only).
export const shepherd = defineType({
  name: 'csShepherd',
  title: 'Shepherd',
  type: 'document',
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'portrait',
      title: 'Portrait',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'letterPullQuote',
      title: 'Shepherd letter — pull quote',
      type: 'string',
      description: 'Big serif phrase opening the letter. e.g. "This is your house."',
    }),
    defineField({
      name: 'letterBody',
      title: 'Shepherd letter — body',
      type: 'array',
      of: [{ type: 'block', styles: [{ title: 'Paragraph', value: 'normal' }], lists: [] }],
    }),
    defineField({
      name: 'signature',
      title: 'Letter signature',
      type: 'string',
      description: 'Sign-off line. e.g. "— The Shepherd"',
    }),
  ],
  preview: {
    select: { title: 'name', media: 'portrait' },
  },
});
