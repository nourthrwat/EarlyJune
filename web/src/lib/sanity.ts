import {createClient, type QueryParams} from '@sanity/client'
import {createImageUrlBuilder, type SanityImageSource} from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || '4onggkj5',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-02-01',
  useCdn: false, // static build: always read fresh published content
  perspective: 'published',
  // Only for local build checks against a mock API. Never set in production.
  ...(import.meta.env.SANITY_API_HOST ? {apiHost: import.meta.env.SANITY_API_HOST, useProjectHostname: false} : {}),
})

export function sanityFetch<T>(query: string, params: QueryParams = {}): Promise<T> {
  return sanityClient.fetch<T>(query, params)
}

const builder = createImageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source).auto('format').fit('max')
}

/** Responsive srcset for an image at the given widths. */
export function srcSet(source: SanityImageSource, widths = [480, 768, 1200, 1600, 2000]) {
  return widths.map((w) => `${urlFor(source).width(w).url()} ${w}w`).join(', ')
}
