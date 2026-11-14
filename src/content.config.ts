/**
 * CONTENT SCHEMAS — every content file is validated against these at build time.
 * A typo in a field name, a missing title, or a reference to a tag that doesn't exist
 * fails the build, so a bad edit can never reach the live site.
 *
 * Where the content lives:
 *   src/content/posts/<slug>.md          → /post/<slug>
 *   src/content/case-studies/<slug>.md   → /case-study/<slug>
 *   src/content/legal/<slug>.md          → /legal-page/<slug>
 *   src/data/*.yaml                      → lists shown inside pages (logos, team, FAQs, tags)
 */
import {defineCollection, reference} from 'astro:content'
import {file, glob} from 'astro/loaders'
import {z} from 'astro/zod'

/** An image: a path in /public (e.g. /images/cms/photo.png) or, until localized, a Webflow CDN URL. */
const image = z.object({
  src: z.string(),
  alt: z.string().default(''),
})

const named = z.object({name: z.string()})

const blogCategories = defineCollection({loader: file('src/data/blog-categories.yaml'), schema: named})
const caseStudyTags = defineCollection({loader: file('src/data/case-study-tags.yaml'), schema: named})
const faqTags = defineCollection({loader: file('src/data/faq-tags.yaml'), schema: named})

const logos = defineCollection({
  loader: file('src/data/logos.yaml'),
  schema: z.object({name: z.string(), logo: image.optional(), url: z.string().url().optional()}),
})

const team = defineCollection({
  loader: file('src/data/team.yaml'),
  schema: z.object({name: z.string(), jobTitle: z.string().optional(), photo: image.optional()}),
})

const faqs = defineCollection({
  loader: file('src/data/faqs.yaml'),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    tags: z.array(reference('faqTags')).default([]),
  }),
})

const posts = defineCollection({
  loader: glob({pattern: '**/*.md', base: 'src/content/posts'}),
  schema: z.object({
    title: z.string(),
    summary: z.string().optional(),
    category: reference('blogCategories').optional(),
    publishedAt: z.coerce.date(),
    readTime: z.string().optional(),
    featured: z.boolean().default(false),
    mainImage: image.optional(),
    thumbnailImage: image.optional(),
    /** Hidden from listings and the sitemap, page still builds (keeps old Webflow URLs alive). */
    hidden: z.boolean().default(false),
    seo: z.object({title: z.string().optional(), description: z.string().optional()}).optional(),
  }),
})

const caseStudies = defineCollection({
  loader: glob({pattern: '**/*.md', base: 'src/content/case-studies'}),
  schema: z.object({
    title: z.string(),
    /** Big headline on the case study page (defaults to the title) */
    headline: z.string().optional(),
    description: z.string().optional(),
    tags: z.array(reference('caseStudyTags')).default([]),
    brandColor: z
      .string()
      .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Use a hex color like #5865e8')
      .optional(),
    sliderImage: image.optional(),
    sliderImageMobile: image.optional(),
    heroImage: image.optional(),
    heroImageMobile: image.optional(),
    /** Markdown */
    challenge: z.string().optional(),
    /** Markdown */
    solution: z.string().optional(),
    /** "Results" numbers on the case study page */
    results: z.array(z.object({number: z.string(), label: z.string()})).default([]),
    order: z.number().optional(),
    seo: z.object({title: z.string().optional(), description: z.string().optional()}).optional(),
  }),
})

const legal = defineCollection({
  loader: glob({pattern: '**/*.md', base: 'src/content/legal'}),
  schema: z.object({
    title: z.string(),
    seo: z.object({title: z.string().optional(), description: z.string().optional()}).optional(),
  }),
})

export const collections = {
  blogCategories,
  caseStudyTags,
  faqTags,
  logos,
  team,
  faqs,
  posts,
  caseStudies,
  legal,
}
