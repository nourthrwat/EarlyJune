/** Resolves a Sanity `link` object to an href. Keep URL rules in ONE place. */

export type LinkValue = {
  _key?: string
  label?: string
  style?: 'primary' | 'secondary' | 'text'
  linkType?: 'internal' | 'external'
  external?: string
  internal?: {_type: string; slug?: string} | null
}

/** URL pattern per document type. Must match the old Webflow URLs. */
export function pathFor(type: string, slug?: string): string {
  switch (type) {
    case 'homePage':
      return '/'
    case 'page':
      return `/${slug ?? ''}`
    case 'post':
      return `/post/${slug}`
    case 'caseStudy':
      return `/case-study/${slug}`
    case 'legalPage':
      return `/legal-page/${slug}`
    case 'blogCategory':
      return `/blog-categories/${slug}`
    default:
      return '/'
  }
}

export function hrefFor(link?: LinkValue | null): string | undefined {
  if (!link) return undefined
  if (link.linkType === 'external') return link.external
  if (link.internal) return pathFor(link.internal._type, link.internal.slug)
  return undefined
}

export function isExternal(href?: string) {
  return !!href && /^https?:\/\//.test(href)
}
