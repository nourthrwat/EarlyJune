import {defineField, defineType} from 'sanity'

/** Per-document SEO overrides. Every field is optional; the frontend falls back to the document title/summary. */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  options: {collapsible: true, collapsed: true},
  fields: [
    defineField({
      name: 'title',
      description: 'Overrides the page title in search results. Keep under 60 characters.',
      type: 'string',
      validation: (rule) => rule.max(70).warning('Search engines cut titles after ~60 characters'),
    }),
    defineField({
      name: 'description',
      description: 'Shown under the title in search results. Aim for 120–160 characters.',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.max(170).warning('Search engines cut descriptions after ~160 characters'),
    }),
    defineField({
      name: 'image',
      title: 'Social share image',
      description: '1200 × 630 px recommended',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'noIndex',
      description: 'Hide this page from search engines',
      type: 'boolean',
      initialValue: false,
    }),
  ],
})
