import { defineField, defineType } from 'sanity';

export const siteSettings = defineType({
  name: 'csSiteSettings',
  title: 'Site Settings',
  type: 'document',
  // Singleton — only one of these in the dataset.
  fields: [
    defineField({ name: 'parishName', title: 'Parish name', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'parishAddress', title: 'Address', type: 'string' }),
    defineField({ name: 'parishPhone', title: 'Phone', type: 'string' }),
    defineField({ name: 'parishEmail', title: 'Email', type: 'string' }),
  ],
});
