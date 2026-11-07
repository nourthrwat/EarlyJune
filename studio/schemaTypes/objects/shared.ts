import {defineField} from 'sanity'

/**
 * Section themes. These are the ONLY background options a block can use.
 * Each value maps to a CSS class in web/src/styles/global.css (.theme-<value>),
 * which maps to the color tokens from the Webflow style guide.
 * Add a new theme there first, then here.
 */
export const THEMES = [
  {title: 'Light (cream)', value: 'light'},
  {title: 'Ivory', value: 'ivory'},
  {title: 'Coal (dark)', value: 'coal'},
  {title: 'Blue', value: 'blue'},
  {title: 'Gold', value: 'gold'},
  {title: 'Green (dark)', value: 'green'},
]

export const themeField = defineField({
  name: 'theme',
  type: 'string',
  initialValue: 'light',
  options: {list: THEMES, layout: 'dropdown'},
})

/** Original Webflow item ID. Used by the migration script to upsert, never edited by hand. */
export const webflowIdField = defineField({
  name: 'webflowId',
  title: 'Webflow ID',
  type: 'string',
  readOnly: true,
  hidden: ({value}) => !value,
  description: 'Set by the migration script. Do not edit.',
})

/** Slug that must stay identical to the Webflow slug so URLs don't change. */
export const slugField = (source = 'title') =>
  defineField({
    name: 'slug',
    type: 'slug',
    description: 'URL part. Changing it after launch breaks links — add a redirect if you do.',
    options: {source, maxLength: 96},
    validation: (rule) => rule.required(),
  })
