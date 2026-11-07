import {seo} from './objects/seo'
import {link} from './objects/link'
import {richText} from './objects/rich-text'
import {blockTypes} from './blocks'
import {post} from './documents/post'
import {caseStudy} from './documents/case-study'
import {blogCategory, caseStudyTag, faqTag, vertical} from './documents/taxonomies'
import {teamMember, logo, faq, legalPage} from './documents/people-and-content'
import {page, homePage, siteSettings, redirect} from './documents/pages'

export const schemaTypes = [
  // objects
  seo,
  link,
  richText,
  // page builder
  ...blockTypes,
  // pages
  homePage,
  page,
  siteSettings,
  redirect,
  // Webflow collections
  post,
  blogCategory,
  caseStudy,
  caseStudyTag,
  vertical,
  teamMember,
  logo,
  faq,
  faqTag,
  legalPage,
]
