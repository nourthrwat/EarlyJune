import {defineType, defineField} from 'sanity'
import {TagIcon} from '@sanity/icons/Tag'
import {TagsIcon} from '@sanity/icons/Tags'
import {ProjectsIcon} from '@sanity/icons/Projects'
import {slugField, webflowIdField} from '../objects/shared'

/**
 * Simple name + slug collections from Webflow.
 *   Blog Categories   → blogCategory   (Webflow URL /blog-categories/<slug>)
 *   Case Study Tages  → caseStudyTag
 *   FAQ Tags          → faqTag
 *   Verticals         → vertical
 */
const taxonomy = (name: string, title: string, icon: typeof TagIcon) =>
  defineType({
    name,
    title,
    type: 'document',
    icon,
    fields: [
      defineField({name: 'title', type: 'string', validation: (rule) => rule.required()}),
      slugField(),
      webflowIdField,
    ],
    preview: {select: {title: 'title', subtitle: 'slug.current'}},
  })

export const blogCategory = taxonomy('blogCategory', 'Blog category', TagIcon)
export const caseStudyTag = taxonomy('caseStudyTag', 'Case study tag', TagsIcon)
export const faqTag = taxonomy('faqTag', 'FAQ tag', TagsIcon)
export const vertical = taxonomy('vertical', 'Vertical', ProjectsIcon)
