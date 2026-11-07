import {defineField, defineType} from 'sanity'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {slugField, webflowIdField} from '../objects/shared'

/** Webflow "Blog Posts" collection. URL: /post/<slug> */
export const post = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Images'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'content', validation: (rule) => rule.required()}),
    {...slugField(), group: 'content'},
    defineField({
      name: 'publishedAt',
      type: 'datetime',
      group: 'content',
      description: 'Used for sorting. Migrated from the Webflow publish date.',
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: 'category',
      type: 'reference',
      to: [{type: 'blogCategory'}],
      group: 'content',
    }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'Appears on the blog grid. Also the fallback SEO description.',
    }),
    defineField({
      name: 'readTime',
      type: 'string',
      group: 'content',
      description: 'e.g. "5 min read"',
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      group: 'content',
      initialValue: false,
      description: 'Featured posts are pinned at the top of the blog page',
    }),
    defineField({name: 'body', type: 'richText', group: 'content'}),
    defineField({
      name: 'mainImage',
      type: 'image',
      group: 'media',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', title: 'Alternative text', type: 'string'})],
    }),
    defineField({
      name: 'thumbnailImage',
      type: 'image',
      group: 'media',
      description: 'Smaller crop used on the blog grid. Falls back to the main image.',
      options: {hotspot: true},
    }),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
    webflowIdField,
  ],
  orderings: [
    {title: 'Newest first', name: 'publishedDesc', by: [{field: 'publishedAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', subtitle: 'category.title', media: 'mainImage'},
  },
})
