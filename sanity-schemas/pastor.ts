import { defineField, defineType } from 'sanity';

export const pastor = defineType({
  name: 'csPastor',
  title: 'Pastor',
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
      title: 'Pastor letter — pull quote',
      type: 'string',
      description: 'Big serif phrase opening the letter. e.g. "This is your house."',
    }),
    defineField({
      name: 'letterBody',
      title: 'Pastor letter — body',
      type: 'array',
      of: [{ type: 'block', styles: [{ title: 'Paragraph', value: 'normal' }], lists: [] }],
    }),
    defineField({
      name: 'signature',
      title: 'Letter signature',
      type: 'string',
      description: 'Sign-off line. e.g. "— The Pastor"',
    }),
  ],
  preview: {
    select: { title: 'name', media: 'portrait' },
  },
});
