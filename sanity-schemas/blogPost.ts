import { defineField, defineType } from 'sanity';

export const blogPost = defineType({
  name: 'csBlogPost',
  title: 'Blog Post',
  type: 'document',
  // One doc per published blog teaser. /watch lists the most recent 5
  // ordered by publishDate desc. external href points at the full post on
  // the existing parish WordPress (transitional — eventual goal is to move
  // the body into PortableText here too).
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'href',
      title: 'External URL',
      type: 'url',
      description: 'Full post on the parish WordPress (or wherever the body lives until we migrate it here).',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish date',
      type: 'date',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'displayDate',
      title: 'Display date',
      type: 'string',
      description: 'Formatted for display. e.g. "May 22, 2026"',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      initialValue: 'Sanctum Parish',
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'imageUrl',
      title: 'Cover image URL',
      type: 'url',
      description: 'External image (e.g. from the WordPress feed) or a Sanity-hosted asset URL.',
    }),
  ],
  orderings: [
    { title: 'Publish date, newest first', name: 'publishDateDesc', by: [{ field: 'publishDate', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', subtitle: 'displayDate', media: 'imageUrl' },
  },
});
