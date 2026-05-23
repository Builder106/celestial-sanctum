import { defineArrayMember, defineField, defineType } from 'sanity';

export const visitPage = defineType({
  name: 'csVisitPage',
  title: 'Visit Page',
  type: 'document',
  // Singleton — every field on /visit lives here so the parish can edit
  // the entire page from one document. Service times are inline rather
  // than separate docs because they're a tightly-coupled weekly schedule.
  fields: [
    defineField({
      name: 'heroEyebrow',
      title: 'Hero eyebrow',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Hero headline (main)',
      type: 'string',
      description: 'First half of the hero. e.g. "Come as you are."',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'heroHeadlineItalic',
      title: 'Hero headline (italic burgundy)',
      type: 'string',
      description: 'Second half rendered italic in burgundy. e.g. "Wear what you brought."',
    }),
    defineField({
      name: 'heroSubcopy',
      title: 'Hero subcopy',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'whenEyebrow',
      title: 'When eyebrow',
      type: 'string',
    }),
    defineField({
      name: 'whenHeading',
      title: 'When heading',
      type: 'string',
    }),
    defineField({
      name: 'whenSubcopy',
      title: 'When subcopy',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'schedule',
      title: 'Weekly service schedule',
      type: 'array',
      description: '7 rows, one per day. Mark Sunday + Thursday vigil as highlight=true.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'serviceSlot',
          fields: [
            defineField({ name: 'day', title: 'Day', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'detail', title: 'Detail', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'highlight', title: 'Highlight (burgundy bar)', type: 'boolean', initialValue: false }),
          ],
          preview: {
            select: { title: 'day', subtitle: 'detail' },
          },
        }),
      ],
    }),
    defineField({
      name: 'serviceEyebrow',
      title: 'Service-elements eyebrow',
      type: 'string',
    }),
    defineField({
      name: 'serviceHeading',
      title: 'Service-elements heading (main)',
      type: 'string',
    }),
    defineField({
      name: 'serviceHeadingItalic',
      title: 'Service-elements heading (italic burgundy)',
      type: 'string',
    }),
    defineField({
      name: 'serviceIntro',
      title: 'Service-elements intro paragraph',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'serviceElements',
      title: 'Service elements',
      type: 'array',
      description: 'What visitors see during worship — shoes, sutana, candles, etc.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'serviceElement',
          fields: [
            defineField({ name: 'term', title: 'Term', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'definition', title: 'Definition', type: 'text', rows: 4, validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'term' } },
        }),
      ],
    }),
    defineField({
      name: 'faqEyebrow',
      title: 'FAQ eyebrow',
      type: 'string',
    }),
    defineField({
      name: 'faqHeading',
      title: 'FAQ heading',
      type: 'string',
    }),
    defineField({
      name: 'faqs',
      title: 'FAQs',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'visitFaq',
          fields: [
            defineField({ name: 'q', title: 'Question', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'a', title: 'Answer', type: 'text', rows: 4, validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'q' } },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: 'Visit Page' }) },
});
