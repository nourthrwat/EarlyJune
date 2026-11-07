import {defineArrayMember, defineField, defineType} from 'sanity'
import {UserIcon} from '@sanity/icons/User'
import {ImageIcon} from '@sanity/icons/Image'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {LockIcon} from '@sanity/icons/Lock'
import {slugField, webflowIdField} from '../objects/shared'

/** Webflow "Team Members" collection. Shown in the Team grid block (no own page). */
export const teamMember = defineType({
  name: 'teamMember',
  title: 'Team member',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    slugField('name'),
    defineField({name: 'jobTitle', type: 'string'}),
    defineField({name: 'photo', type: 'image', options: {hotspot: true}}),
    defineField({
      name: 'order',
      type: 'number',
      description: 'Lower numbers show first',
    }),
    webflowIdField,
  ],
  orderings: [{title: 'Display order', name: 'order', by: [{field: 'order', direction: 'asc'}]}],
  preview: {select: {title: 'name', subtitle: 'jobTitle', media: 'photo'}},
})

/** Webflow "Logos" collection. Client / partner logos shown in the Logo strip block. */
export const logo = defineType({
  name: 'logo',
  title: 'Client logo',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({name: 'name', type: 'string', validation: (rule) => rule.required()}),
    slugField('name'),
    defineField({
      name: 'image',
      type: 'image',
      description: 'SVG or transparent PNG',
      validation: (rule) => rule.required().warning('A logo without an image will not show'),
    }),
    defineField({name: 'url', title: 'Client website', type: 'url'}),
    webflowIdField,
  ],
  preview: {select: {title: 'name', media: 'image'}},
})

/** Webflow "FAQs" collection. Shown in the FAQ block, filtered by tag. */
export const faq = defineType({
  name: 'faq',
  title: 'FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({name: 'question', type: 'string', validation: (rule) => rule.required()}),
    slugField('question'),
    defineField({name: 'answer', type: 'text', rows: 4, validation: (rule) => rule.required()}),
    defineField({
      name: 'tags',
      type: 'array',
      description: 'Used to show the right FAQs on the right page',
      of: [defineArrayMember({type: 'reference', to: [{type: 'faqTag'}]})],
    }),
    webflowIdField,
  ],
  preview: {select: {title: 'question', subtitle: 'answer'}},
})

/** Webflow "Legal Pages" collection. URL: /legal-page/<slug> */
export const legalPage = defineType({
  name: 'legalPage',
  title: 'Legal page',
  type: 'document',
  icon: LockIcon,
  fields: [
    defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
    slugField(),
    defineField({
      name: 'body',
      type: 'richText',
      description: 'Migrated from the Webflow field "privacy policy"',
    }),
    defineField({name: 'updatedOn', title: 'Last updated', type: 'date'}),
    defineField({name: 'seo', type: 'seo'}),
    webflowIdField,
  ],
  preview: {select: {title: 'title', subtitle: 'slug.current'}},
})
