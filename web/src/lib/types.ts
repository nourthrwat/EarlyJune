import type {SanityImageSource} from '@sanity/image-url'
import type {LinkValue} from './links'

/* Hand-written types for query results. Replace with Sanity TypeGen when the
   schema settles (see docs/next-steps.md). */

export type Image = SanityImageSource & {alt?: string; asset?: unknown}

export type Seo = {
  title?: string | null
  description?: string | null
  image?: Image | null
  noIndex?: boolean
}

export type Block = {_key: string; _type: string; theme?: string; [key: string]: unknown}

export type PageDoc = {_id: string; title?: string; slug?: string; seo: Seo; pageBuilder?: Block[] | null}

export type CaseStudyCard = {
  _id: string
  title: string
  slug: string
  description?: string
  brandColor?: string
  sliderImage?: {desktop?: Image; mobile?: Image; alt?: string}
  tags?: string[]
}

export type PostCard = {
  _id: string
  title: string
  slug: string
  summary?: string
  readTime?: string
  featured?: boolean
  publishedAt?: string
  image?: Image
  category?: {title: string; slug: string} | null
}

export type SiteSettings = {
  siteName?: string
  siteUrl?: string
  contactEmail?: string
  socialLinks?: {platform?: string; url?: string}[]
  defaultSeo?: Seo
  mainNav?: LinkValue[]
  navCta?: LinkValue
  footerLinks?: LinkValue[]
} | null
