import { defineArrayMember, defineField, defineType } from 'sanity';

export const aboutSection = defineType({
  name: 'csAboutSection',
  title: 'About Section',
  type: 'document',
  // Seven of these — Story, Mission, Shepherd, Doctrine, Mode of Worship,
  // Ministries, Choir — rendered as one long scrolling page at /about with a
  // sticky right-rail TOC.
  fields: [
    defineField({
      name: 'order',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers render first. Story=10, Mission=20, etc. — leave gaps for inserts.',
      validation: (r) => r.required().integer(),
    }),
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      type: 'slug',
      description: 'URL fragment for /about#<anchorId>. Lowercase, kebab-case.',
      options: { source: 'label', maxLength: 40 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'label',
      title: 'Sidebar label',
      type: 'string',
      description: 'Short label shown in the sticky right-rail TOC. e.g. "The Story"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'eyebrow',
      title: 'Section eyebrow',
      type: 'string',
      description: 'Small caps line above the heading. Often same as the label.',
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'text',
      rows: 2,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'scripture',
      title: 'Scripture citation',
      type: 'string',
      description: 'Optional small ornament line. e.g. "Isaiah 61" or "Colossians 3 : 16"',
    }),
    defineField({
      name: 'paragraphs',
      title: 'Body paragraphs',
      type: 'array',
      description: 'Plain prose. Use Items below for term/definition lists.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{ title: 'Paragraph', value: 'normal' }],
          lists: [],
          marks: { decorators: [{ title: 'Italic', value: 'em' }] },
        }),
      ],
    }),
    defineField({
      name: 'items',
      title: 'Items (term + definition)',
      type: 'array',
      description: 'Optional definition list. Renders below paragraphs.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'aboutItem',
          fields: [
            defineField({ name: 'term', title: 'Term', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'definition', title: 'Definition', type: 'text', rows: 4, validation: (r) => r.required() }),
          ],
          preview: {
            select: { title: 'term', subtitle: 'definition' },
          },
        }),
      ],
    }),
  ],
  orderings: [
    { title: 'Display order', name: 'orderAsc', by: [{ field: 'order', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'label', subtitle: 'heading', order: 'order' },
    prepare: ({ title, subtitle, order }) => ({
      title: `${order ?? '?'}. ${title}`,
      subtitle,
    }),
  },
});
