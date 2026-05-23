import { defineArrayMember, defineField, defineType } from 'sanity';

export const homepage = defineType({
  name: 'csHomepage',
  title: 'Homepage',
  type: 'document',
  // Singleton — only one of these. Holds every editable string on /.
  fields: [
    defineField({
      name: 'heroEyebrow',
      title: 'Hero eyebrow',
      type: 'string',
      description: 'Small caps line above the headline. e.g. "Celestial Church of Christ · Bloomington, CA"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'heroLead',
      title: 'Hero lead-in',
      type: 'string',
      description: 'Italic phrase that precedes the headline. e.g. "You are welcome to"',
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline',
      type: 'string',
      description: 'The big serif headline. e.g. "Sanctum parish."',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'heroSubcopy',
      title: 'Hero subcopy',
      type: 'text',
      rows: 3,
      description: 'One- or two-sentence paragraph under the headline.',
    }),
    defineField({
      name: 'missionEyebrow',
      title: 'Mission eyebrow',
      type: 'string',
      description: 'Small caps line above the mission quote. e.g. "Our Mission"',
    }),
    defineField({
      name: 'missionQuote',
      title: 'Mission quote',
      type: 'text',
      rows: 4,
      description: 'The serif blockquote in the mission section.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'sundayRhythm',
      title: 'A Sunday at Sanctum',
      type: 'array',
      description: 'Three columns describing the rhythm of Sunday: arrive, worship, fellowship.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'sundayBlock',
          fields: [
            defineField({ name: 'time', title: 'Time', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'heading', title: 'Heading', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'body', title: 'Body', type: 'text', rows: 4, validation: (r) => r.required() }),
          ],
          preview: {
            select: { title: 'heading', subtitle: 'time' },
          },
        }),
      ],
      validation: (r) => r.length(3).error('Sunday rhythm needs exactly three blocks.'),
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Homepage' }),
  },
});
