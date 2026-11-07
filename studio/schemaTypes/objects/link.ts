import {defineField, defineType} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

/** A button or text link. Internal links point at documents so URLs never go stale. */
export const link = defineType({
  name: 'link',
  type: 'object',
  icon: LinkIcon,
  fields: [
    defineField({name: 'label', type: 'string', validation: (rule) => rule.required()}),
    defineField({
      name: 'linkType',
      type: 'string',
      initialValue: 'internal',
      options: {
        list: [
          {title: 'Page on this site', value: 'internal'},
          {title: 'External URL', value: 'external'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
    defineField({
      name: 'internal',
      title: 'Page',
      type: 'reference',
      to: [{type: 'page'}, {type: 'homePage'}, {type: 'post'}, {type: 'caseStudy'}, {type: 'legalPage'}],
      hidden: ({parent}) => parent?.linkType === 'external',
    }),
    defineField({
      name: 'external',
      title: 'URL',
      type: 'url',
      validation: (rule) => rule.uri({scheme: ['http', 'https', 'mailto', 'tel'], allowRelative: true}),
      hidden: ({parent}) => parent?.linkType !== 'external',
    }),
    defineField({
      name: 'style',
      description: 'Button style from the style guide',
      type: 'string',
      initialValue: 'primary',
      options: {
        list: [
          {title: 'Primary (filled)', value: 'primary'},
          {title: 'Secondary (outline)', value: 'secondary'},
          {title: 'Text link', value: 'text'},
        ],
        layout: 'radio',
      },
    }),
  ],
  preview: {
    select: {title: 'label', subtitle: 'linkType'},
  },
})
