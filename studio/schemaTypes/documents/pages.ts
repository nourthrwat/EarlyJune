import {defineArrayMember, defineField, defineType} from 'sanity'
import {DocumentIcon} from '@sanity/icons/Document'
import {HomeIcon} from '@sanity/icons/Home'
import {CogIcon} from '@sanity/icons/Cog'
import {LinkIcon} from '@sanity/icons/Link'

/**
 * Static pages (About us, Services, Careers, Audit, Our work, Blog, Verticals...).
 * Built from page-builder blocks so the client can add pages without a developer.
 *
 * Path rules: the slug is the full path without leading/trailing slashes.
 *   "about-us"                → /about-us
 *   "verticals/healthcare"    → /verticals/healthcare  (Webflow folder pages)
 */
export const page = defineType({
  name: 'page',
  type: 'document',
  icon: DocumentIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'content', validation: (rule) => rule.required()}),
    defineField({
      name: 'slug',
      title: 'Path',
      type: 'slug',
      group: 'content',
      description: 'e.g. "about-us" or "verticals/healthcare". Must match the old Webflow URL.',
      options: {source: 'title', maxLength: 120},
      validation: (rule) =>
        rule.required().custom((slug) => {
          const value = slug?.current
          if (!value) return 'Required'
          if (value.startsWith('/') || value.endsWith('/')) return 'No leading or trailing "/"'
          if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(value)) return 'Lowercase letters, numbers, "-" and "/" only'
          return true
        }),
    }),
    defineField({name: 'pageBuilder', title: 'Sections', type: 'pageBuilder', group: 'content'}),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {
    select: {title: 'title', path: 'slug.current'},
    prepare: ({title, path}) => ({title, subtitle: path ? `/${path}` : 'No path'}),
  },
})

/** The home page (singleton, id "homePage"). */
export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  icon: HomeIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'SEO'},
  ],
  fields: [
    defineField({name: 'title', type: 'string', group: 'content', initialValue: 'Home'}),
    defineField({name: 'pageBuilder', title: 'Sections', type: 'pageBuilder', group: 'content'}),
    defineField({name: 'seo', type: 'seo', group: 'seo'}),
  ],
  preview: {prepare: () => ({title: 'Home page', subtitle: '/'})},
})

/** Global settings (singleton, id "siteSettings"): navigation, footer, default SEO. */
export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  icon: CogIcon,
  groups: [
    {name: 'general', title: 'General', default: true},
    {name: 'navigation', title: 'Navigation'},
    {name: 'footer', title: 'Footer'},
  ],
  fields: [
    defineField({name: 'siteName', type: 'string', group: 'general', initialValue: 'Early June'}),
    defineField({
      name: 'siteUrl',
      title: 'Site URL',
      type: 'url',
      group: 'general',
      description: 'Production domain, e.g. https://earlyjune.com — used for canonical URLs',
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'seo',
      group: 'general',
      description: 'Used when a page has no SEO of its own',
    }),
    defineField({
      name: 'mainNav',
      title: 'Main navigation',
      type: 'array',
      group: 'navigation',
      of: [defineArrayMember({type: 'link'})],
    }),
    defineField({name: 'navCta', title: 'Navigation button', type: 'link', group: 'navigation'}),
    defineField({
      name: 'footerLinks',
      type: 'array',
      group: 'footer',
      of: [defineArrayMember({type: 'link'})],
    }),
    defineField({name: 'contactEmail', type: 'string', group: 'footer', validation: (rule) => rule.email()}),
    defineField({
      name: 'socialLinks',
      type: 'array',
      group: 'footer',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              type: 'string',
              options: {list: ['LinkedIn', 'Instagram', 'X', 'Facebook', 'YouTube', 'Dribbble', 'Behance']},
            }),
            defineField({name: 'url', type: 'url'}),
          ],
          preview: {select: {title: 'platform', subtitle: 'url'}},
        }),
      ],
    }),
  ],
  preview: {prepare: () => ({title: 'Site settings'})},
})

/** Redirects managed by the client. Read at build time and written to the host's redirect file. */
export const redirect = defineType({
  name: 'redirect',
  type: 'document',
  icon: LinkIcon,
  validation: (rule) =>
    rule.custom((doc) =>
      doc?.source && doc.source === doc.destination ? 'Source and destination cannot be the same' : true,
    ),
  fields: [
    defineField({
      name: 'source',
      type: 'string',
      description: 'Old path, e.g. /old-page',
      validation: (rule) =>
        rule.required().custom((value?: string) => (value?.startsWith('/') ? true : 'Must start with /')),
    }),
    defineField({
      name: 'destination',
      type: 'string',
      description: 'New path (/new-page) or full URL',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'permanent',
      description: 'On = 301 (permanent). Off = 302 (temporary).',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: {source: 'source', destination: 'destination'},
    prepare: ({source, destination}) => ({title: `${source} → ${destination}`}),
  },
})
