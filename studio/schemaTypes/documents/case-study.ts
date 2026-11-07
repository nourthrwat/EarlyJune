import {defineArrayMember, defineField, defineType} from 'sanity'
import {CaseIcon} from '@sanity/icons/Case'
import {slugField, webflowIdField} from '../objects/shared'

const responsiveImage = (name: string, title: string, description: string, group: string) =>
  defineField({
    name,
    title,
    type: 'object',
    group,
    description,
    fields: [
      defineField({name: 'desktop', type: 'image', options: {hotspot: true}}),
      defineField({
        name: 'mobile',
        type: 'image',
        options: {hotspot: true},
        description: 'Optional. Falls back to the desktop image.',
      }),
      defineField({name: 'alt', title: 'Alternative text', type: 'string'}),
    ],
  })

/** Webflow "Case Studies" collection. URL: /case-study/<slug> */
export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case study',
  type: 'document',
  icon: CaseIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'media', title: 'Images & color'},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'content', validation: (rule) => rule.required()}),
    {...slugField(), group: 'content'},
    defineField({
      name: 'description',
      type: 'text',
      rows: 2,
      group: 'content',
      description: 'Short line shown on the "Our work" slider. Also the fallback SEO description.',
    }),
    defineField({
      name: 'tags',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({type: 'reference', to: [{type: 'caseStudyTag'}]})],
    }),
    defineField({name: 'challenge', type: 'richText', group: 'content'}),
    defineField({name: 'solution', type: 'richText', group: 'content'}),
    responsiveImage('sliderImage', 'Slider image', 'Used on the "Our work" slider', 'media'),
    responsiveImage('heroImage', 'Case study page image', 'Large image at the top of the case study page', 'media'),
    defineField({
      name: 'brandColor',
      type: 'string',
      group: 'media',
      description: 'Hero background color for this client, as a hex code (e.g. #5865E8)',
      validation: (rule) =>
        rule.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, {name: 'hex color'}).error('Use a hex code like #5865E8'),
    }),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
    webflowIdField,
  ],
  preview: {
    select: {title: 'title', subtitle: 'description', media: 'sliderImage.desktop'},
  },
})
