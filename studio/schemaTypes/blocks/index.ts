import {defineArrayMember, defineField, defineType} from 'sanity'
import {BlockContentIcon} from '@sanity/icons/BlockContent'
import {SparklesIcon} from '@sanity/icons/Sparkles'
import {ImagesIcon} from '@sanity/icons/Images'
import {CaseIcon} from '@sanity/icons/Case'
import {ThLargeIcon} from '@sanity/icons/ThLarge'
import {UsersIcon} from '@sanity/icons/Users'
import {HelpCircleIcon} from '@sanity/icons/HelpCircle'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {StackIcon} from '@sanity/icons/Stack'
import {CommentIcon} from '@sanity/icons/Comment'
import {themeField} from '../objects/shared'

/**
 * PAGE-BUILDER BLOCKS
 * -------------------
 * Every block here has exactly one matching component in
 * web/src/components/blocks/<BlockName>.astro, documented in docs/components.md.
 *
 * Rules (also in CLAUDE.md):
 *  - Model content, not layout. Variants are limited to `theme` and a few named options.
 *  - Never add free color / font-size / spacing fields. Those live in design tokens.
 *  - To add a block: schema here → component → register in PageBuilder.astro → docs/components.md.
 */

const heading = defineField({name: 'heading', type: 'string'})
const eyebrow = defineField({
  name: 'eyebrow',
  type: 'string',
  description: 'Small label above the heading (optional)',
})
const ctas = defineField({
  name: 'ctas',
  title: 'Buttons',
  type: 'array',
  of: [defineArrayMember({type: 'link'})],
  validation: (rule) => rule.max(2),
})

const blockPreview = (subtitle: string, icon: typeof BlockContentIcon, titleField = 'heading', media?: string) => ({
  select: {title: titleField, ...(media ? {media} : {})},
  prepare: ({title, media: m}: {title?: string; media?: unknown}) => ({
    title: title || 'Untitled',
    subtitle,
    media: (m as never) ?? icon,
  }),
})

export const hero = defineType({
  name: 'hero',
  type: 'object',
  icon: SparklesIcon,
  fields: [
    eyebrow,
    {...heading, validation: (rule) => rule.required()},
    defineField({name: 'text', type: 'text', rows: 3}),
    ctas,
    defineField({name: 'image', type: 'image', options: {hotspot: true}, fields: [defineField({name: 'alt', type: 'string'})]}),
    defineField({
      name: 'size',
      type: 'string',
      initialValue: 'large',
      options: {
        list: [
          {title: 'Large (home / landing)', value: 'large'},
          {title: 'Compact (inner pages)', value: 'compact'},
        ],
        layout: 'radio',
      },
    }),
    themeField,
  ],
  preview: blockPreview('Hero', SparklesIcon, 'heading', 'image'),
})

export const logoStrip = defineType({
  name: 'logoStrip',
  type: 'object',
  icon: ImagesIcon,
  fields: [
    heading,
    defineField({
      name: 'logos',
      type: 'array',
      description: 'Leave empty to show all client logos',
      of: [defineArrayMember({type: 'reference', to: [{type: 'logo'}]})],
    }),
    themeField,
  ],
  preview: blockPreview('Logo strip', ImagesIcon),
})

export const caseStudySlider = defineType({
  name: 'caseStudySlider',
  title: 'Case study slider',
  type: 'object',
  icon: CaseIcon,
  fields: [
    eyebrow,
    heading,
    defineField({
      name: 'caseStudies',
      type: 'array',
      description: 'Pick and order case studies. Leave empty to show the latest ones.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'caseStudy'}]})],
    }),
    defineField({name: 'cta', title: 'Button', type: 'link'}),
    themeField,
  ],
  preview: blockPreview('Case study slider', CaseIcon),
})

export const featureGrid = defineType({
  name: 'featureGrid',
  title: 'Feature grid',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    eyebrow,
    heading,
    defineField({name: 'intro', type: 'text', rows: 3}),
    defineField({
      name: 'items',
      type: 'array',
      validation: (rule) => rule.min(1).max(8),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'feature',
          fields: [
            defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'text', type: 'text', rows: 3}),
            defineField({name: 'icon', type: 'image', description: 'Small SVG/PNG icon (optional)'}),
            defineField({name: 'link', type: 'link'}),
          ],
          preview: {select: {title: 'title', subtitle: 'text', media: 'icon'}},
        }),
      ],
    }),
    defineField({
      name: 'columns',
      type: 'number',
      initialValue: 3,
      options: {list: [2, 3, 4], layout: 'radio', direction: 'horizontal'},
    }),
    themeField,
  ],
  preview: blockPreview('Feature grid', ThLargeIcon),
})

export const splitMedia = defineType({
  name: 'splitMedia',
  title: 'Text + image',
  type: 'object',
  icon: StackIcon,
  fields: [
    eyebrow,
    heading,
    defineField({name: 'body', type: 'richText'}),
    ctas,
    defineField({
      name: 'image',
      type: 'image',
      options: {hotspot: true},
      fields: [defineField({name: 'alt', type: 'string'})],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'imagePosition',
      type: 'string',
      initialValue: 'right',
      options: {list: ['left', 'right'], layout: 'radio', direction: 'horizontal'},
    }),
    themeField,
  ],
  preview: blockPreview('Text + image', StackIcon, 'heading', 'image'),
})

export const richTextSection = defineType({
  name: 'richTextSection',
  title: 'Text section',
  type: 'object',
  icon: BlockContentIcon,
  fields: [
    heading,
    defineField({name: 'body', type: 'richText'}),
    defineField({
      name: 'width',
      type: 'string',
      initialValue: 'small',
      options: {
        list: [
          {title: 'Narrow (reading width)', value: 'small'},
          {title: 'Medium', value: 'medium'},
        ],
        layout: 'radio',
      },
    }),
    themeField,
  ],
  preview: blockPreview('Text section', BlockContentIcon),
})

export const teamGrid = defineType({
  name: 'teamGrid',
  title: 'Team grid',
  type: 'object',
  icon: UsersIcon,
  fields: [
    eyebrow,
    heading,
    defineField({
      name: 'members',
      type: 'array',
      description: 'Leave empty to show the whole team in display order',
      of: [defineArrayMember({type: 'reference', to: [{type: 'teamMember'}]})],
    }),
    themeField,
  ],
  preview: blockPreview('Team grid', UsersIcon),
})

export const faqList = defineType({
  name: 'faqList',
  title: 'FAQ list',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    heading,
    defineField({
      name: 'tags',
      type: 'array',
      description: 'Show FAQs with any of these tags. Leave empty to show all FAQs.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'faqTag'}]})],
    }),
    themeField,
  ],
  preview: blockPreview('FAQ list', HelpCircleIcon),
})

export const postGrid = defineType({
  name: 'postGrid',
  title: 'Blog post grid',
  type: 'object',
  icon: DocumentTextIcon,
  fields: [
    heading,
    defineField({
      name: 'category',
      type: 'reference',
      to: [{type: 'blogCategory'}],
      description: 'Leave empty to show posts from all categories',
    }),
    defineField({
      name: 'limit',
      type: 'number',
      initialValue: 6,
      description: '0 = show all posts (use on the main Blog page)',
      validation: (rule) => rule.min(0).max(60),
    }),
    defineField({name: 'showFeatured', title: 'Highlight featured post', type: 'boolean', initialValue: false}),
    themeField,
  ],
  preview: blockPreview('Blog post grid', DocumentTextIcon),
})

export const ctaBanner = defineType({
  name: 'ctaBanner',
  title: 'Call-to-action banner',
  type: 'object',
  icon: CommentIcon,
  fields: [
    {...heading, validation: (rule) => rule.required()},
    defineField({name: 'text', type: 'text', rows: 2}),
    {...ctas, validation: (rule) => rule.min(1).max(2)},
    {...themeField, initialValue: 'coal'},
  ],
  preview: blockPreview('CTA banner', CommentIcon),
})

/** The list of blocks an editor can add to a page, in menu order. */
export const pageBuilder = defineType({
  name: 'pageBuilder',
  type: 'array',
  of: [
    defineArrayMember({type: 'hero'}),
    defineArrayMember({type: 'splitMedia'}),
    defineArrayMember({type: 'featureGrid'}),
    defineArrayMember({type: 'caseStudySlider'}),
    defineArrayMember({type: 'logoStrip'}),
    defineArrayMember({type: 'teamGrid'}),
    defineArrayMember({type: 'postGrid'}),
    defineArrayMember({type: 'faqList'}),
    defineArrayMember({type: 'richTextSection'}),
    defineArrayMember({type: 'ctaBanner'}),
  ],
})

export const blockTypes = [
  hero,
  logoStrip,
  caseStudySlider,
  featureGrid,
  splitMedia,
  richTextSection,
  teamGrid,
  faqList,
  postGrid,
  ctaBanner,
  pageBuilder,
]
