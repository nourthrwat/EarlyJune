import type {StructureResolver} from 'sanity/structure'
import {CogIcon} from '@sanity/icons/Cog'
import {HomeIcon} from '@sanity/icons/Home'

export const SINGLETON_TYPES = new Set(['siteSettings', 'homePage'])

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home page')
        .icon(HomeIcon)
        .child(S.document().schemaType('homePage').documentId('homePage')),
      S.documentTypeListItem('page').title('Pages'),
      S.divider(),
      S.documentTypeListItem('post').title('Blog posts'),
      S.documentTypeListItem('blogCategory').title('Blog categories'),
      S.divider(),
      S.documentTypeListItem('caseStudy').title('Case studies'),
      S.documentTypeListItem('caseStudyTag').title('Case study tags'),
      S.documentTypeListItem('vertical').title('Verticals'),
      S.divider(),
      S.documentTypeListItem('teamMember').title('Team members'),
      S.documentTypeListItem('logo').title('Client logos'),
      S.documentTypeListItem('faq').title('FAQs'),
      S.documentTypeListItem('faqTag').title('FAQ tags'),
      S.documentTypeListItem('legalPage').title('Legal pages'),
      S.divider(),
      S.documentTypeListItem('redirect').title('Redirects'),
      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
    ])
