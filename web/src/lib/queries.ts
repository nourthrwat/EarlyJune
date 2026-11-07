import {defineQuery} from 'groq'

/* --------------------------------------------------------------------------
   All GROQ queries live here. Components never write their own queries.
   SEO fields are resolved with fallbacks in GROQ so templates stay simple.
   -------------------------------------------------------------------------- */

const LINK = /* groq */ `{
  _key, label, style, linkType, external,
  "internal": internal->{_type, "slug": slug.current}
}`

const SEO = (titleField: string, descriptionField: string) => /* groq */ `"seo": {
  "title": coalesce(seo.title, ${titleField}),
  "description": coalesce(seo.description, ${descriptionField}),
  "image": coalesce(seo.image, *[_id == "siteSettings"][0].defaultSeo.image),
  "noIndex": seo.noIndex == true
}`

const CASE_STUDY_CARD = /* groq */ `{
  _id, title, "slug": slug.current, description, brandColor, sliderImage,
  "tags": tags[]->title
}`

const POST_CARD = /* groq */ `{
  _id, title, "slug": slug.current, summary, readTime, featured, publishedAt,
  "image": coalesce(thumbnailImage, mainImage),
  "category": category->{title, "slug": slug.current}
}`

/** Page builder: expands only the references each block needs. */
const PAGE_BUILDER = /* groq */ `pageBuilder[]{
  ...,
  _key,
  _type,
  ctas[]${LINK},
  cta${LINK},
  items[]{..., link${LINK}},
  body,
  _type == "logoStrip" => {
    "logos": select(
      count(logos) > 0 => logos[]->{_id, name, image, url},
      *[_type == "logo"] | order(name asc){_id, name, image, url}
    )
  },
  _type == "caseStudySlider" => {
    "caseStudies": select(
      count(caseStudies) > 0 => caseStudies[]->${CASE_STUDY_CARD},
      *[_type == "caseStudy"] | order(_createdAt desc)[0...8]${CASE_STUDY_CARD}
    )
  },
  _type == "teamGrid" => {
    "members": select(
      count(members) > 0 => members[]->{_id, name, jobTitle, photo},
      *[_type == "teamMember"] | order(coalesce(order, 999) asc, name asc){_id, name, jobTitle, photo}
    )
  },
  _type == "faqList" => {
    "faqs": select(
      count(tags) > 0 => *[_type == "faq" && count((tags[]._ref)[@ in ^.^.tags[]._ref]) > 0]{_id, question, answer},
      *[_type == "faq"]{_id, question, answer}
    )
  },
  _type == "postGrid" => {
    "posts": select(
      defined(category) => *[_type == "post" && category._ref == ^.category._ref] | order(publishedAt desc)${POST_CARD},
      *[_type == "post"] | order(publishedAt desc)${POST_CARD}
    )
  }
}`

export const SITE_SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0]{
  siteName, siteUrl, contactEmail, socialLinks,
  defaultSeo,
  mainNav[]${LINK},
  navCta${LINK},
  footerLinks[]${LINK}
}`)

export const HOME_PAGE_QUERY = defineQuery(`*[_id == "homePage"][0]{
  _id, title,
  ${SEO('*[_id == "siteSettings"][0].defaultSeo.title', '*[_id == "siteSettings"][0].defaultSeo.description')},
  ${PAGE_BUILDER}
}`)

export const PAGE_PATHS_QUERY = defineQuery(`*[_type == "page" && defined(slug.current)].slug.current`)

export const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0]{
  _id, title, "slug": slug.current,
  ${SEO('title', '*[_id == "siteSettings"][0].defaultSeo.description')},
  ${PAGE_BUILDER}
}`)

export const POST_SLUGS_QUERY = defineQuery(`*[_type == "post" && defined(slug.current)].slug.current`)

export const POST_QUERY = defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, summary, readTime, publishedAt, body, mainImage,
  "category": category->{title, "slug": slug.current},
  ${SEO('title', 'summary')},
  "related": *[_type == "post" && slug.current != $slug && category._ref == ^.category._ref]
    | order(publishedAt desc)[0...3]${POST_CARD}
}`)

export const CATEGORY_SLUGS_QUERY = defineQuery(`*[_type == "blogCategory" && defined(slug.current)].slug.current`)

export const CATEGORY_QUERY = defineQuery(`*[_type == "blogCategory" && slug.current == $slug][0]{
  _id, title, "slug": slug.current,
  "seo": {"title": title, "description": null, "image": null, "noIndex": false},
  "posts": *[_type == "post" && category._ref == ^._id] | order(publishedAt desc)${POST_CARD}
}`)

export const CASE_STUDY_SLUGS_QUERY = defineQuery(`*[_type == "caseStudy" && defined(slug.current)].slug.current`)

export const CASE_STUDY_QUERY = defineQuery(`*[_type == "caseStudy" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, description, brandColor, heroImage, challenge, solution,
  "tags": tags[]->title,
  ${SEO('title', 'description')},
  "next": *[_type == "caseStudy" && slug.current != $slug] | order(_createdAt desc)[0]${CASE_STUDY_CARD}
}`)

export const LEGAL_SLUGS_QUERY = defineQuery(`*[_type == "legalPage" && defined(slug.current)].slug.current`)

export const LEGAL_QUERY = defineQuery(`*[_type == "legalPage" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, body, updatedOn,
  ${SEO('title', 'null')}
}`)

export const REDIRECTS_QUERY = defineQuery(`*[_type == "redirect" && defined(source) && defined(destination)]{
  source, destination, permanent
}`)
