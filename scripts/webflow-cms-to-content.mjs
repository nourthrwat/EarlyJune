#!/usr/bin/env node
/**
 * Webflow CMS → Astro content files.
 * Reusable for any Webflow migration: edit COLLECTIONS below to map collection keys and fields.
 *
 * Input: a JSON dump of Webflow Data API `list_collection_items` results, shaped like
 *   { "collections": { "<key>": { "slug": "<webflow collection slug>", "items": [ {id, createdOn, fieldData} ] } } }
 * (see migration/webflow-cms.json).
 *
 * Output:
 *   src/data/<name>.yaml          simple collections (taxonomies, logos, team, FAQs)
 *   src/content/<name>/<slug>.md  collections with long-form bodies (posts, case studies, legal)
 *
 * Usage: node scripts/webflow-cms-to-content.mjs migration/webflow-cms.json
 * Safe to re-run: files are overwritten from the dump. Hand edits made after migration will be lost,
 * so re-run only before launch.
 */
import fs from 'node:fs'
import path from 'node:path'
import TurndownService from 'turndown'
import YAML from 'yaml'

const input = process.argv[2]
if (!input) {
  console.error('Usage: node scripts/webflow-cms-to-content.mjs <dump.json>')
  process.exit(1)
}

const ROOT = process.cwd()
const dump = JSON.parse(fs.readFileSync(input, 'utf8')).collections

const turndown = new TurndownService({headingStyle: 'atx', bulletListMarker: '-', emDelimiter: '*'})
const md = (html) =>
  html
    ? turndown
        .turndown(html)
        .replace(/‍/g, '') // Webflow's zero-width joiner in empty paragraphs
        .replace(/\n{3,}/g, '\n\n')
        .trim()
    : ''

const img = (field) => (field?.url ? {src: field.url, alt: field.alt ?? ''} : undefined)
const clean = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ''))

/** Webflow item id → slug, per collection, for resolving references. */
const slugById = {}
for (const col of Object.values(dump)) for (const it of col.items) slugById[it.id] = it.fieldData.slug
const ref = (id) => (id ? slugById[id] : undefined)
const refs = (ids) => (ids?.length ? ids.map(ref).filter(Boolean) : undefined)

function writeYaml(name, rows) {
  const file = path.join(ROOT, 'src/data', `${name}.yaml`)
  fs.mkdirSync(path.dirname(file), {recursive: true})
  const header = `# Migrated from Webflow. Edit freely — order here is display order.\n`
  fs.writeFileSync(file, header + YAML.stringify(rows, {lineWidth: 0}))
  console.log(`  src/data/${name}.yaml (${rows.length})`)
}

function writeMarkdown(dir, slug, frontmatter, body) {
  const file = path.join(ROOT, 'src/content', dir, `${slug}.md`)
  fs.mkdirSync(path.dirname(file), {recursive: true})
  const fm = YAML.stringify(clean(frontmatter), {lineWidth: 0, blockQuote: 'literal'})
  fs.writeFileSync(file, `---\n${fm}---\n\n${body ? body + '\n' : ''}`)
}

const byCreated = (a, b) => a.createdOn.localeCompare(b.createdOn)

/* ---------------------------------------------------------------- mapping */

const COLLECTIONS = {
  'blog-categories': (items) =>
    writeYaml('blog-categories', items.map((it) => ({id: it.fieldData.slug, name: it.fieldData.name}))),

  'case-study-tags': (items) =>
    writeYaml('case-study-tags', items.map((it) => ({id: it.fieldData.slug, name: it.fieldData.name}))),

  'faq-tags': (items) =>
    writeYaml('faq-tags', items.map((it) => ({id: it.fieldData.slug, name: it.fieldData.name}))),

  verticals: (items) =>
    writeYaml('verticals', items.map((it) => ({id: it.fieldData.slug, name: it.fieldData.name}))),

  logos: (items) =>
    writeYaml(
      'logos',
      [...items].sort(byCreated).map((it) => clean({id: it.fieldData.slug, name: it.fieldData.name, logo: img(it.fieldData.logo)})),
    ),

  team: (items) =>
    writeYaml(
      'team',
      [...items].sort(byCreated).map((it) =>
        clean({
          id: it.fieldData.slug,
          name: it.fieldData.name,
          jobTitle: it.fieldData['job-title'],
          photo: img(it.fieldData['profile-picture']),
        }),
      ),
    ),

  faqs: (items) =>
    writeYaml(
      'faqs',
      [...items].sort(byCreated).map((it) =>
        clean({id: it.fieldData.slug, question: it.fieldData.name, answer: it.fieldData.answer, tags: refs(it.fieldData.tags)}),
      ),
    ),

  posts: (items) => {
    for (const it of items) {
      const f = it.fieldData
      writeMarkdown(
        'posts',
        f.slug,
        {
          title: f.name,
          summary: f['post-summary'],
          category: ref(f.category),
          publishedAt: it.createdOn.slice(0, 10),
          readTime: f['read-time'],
          featured: f.featured || undefined,
          mainImage: img(f['main-image']),
          thumbnailImage: f['thumbnail-image']?.url !== f['main-image']?.url ? img(f['thumbnail-image']) : undefined,
        },
        md(f['post-body']),
      )
    }
    console.log(`  src/content/posts/*.md (${items.length})`)
  },

  'case-studies': (items) => {
    for (const it of items) {
      const f = it.fieldData
      writeMarkdown(
        'case-studies',
        f.slug,
        {
          title: f.name,
          description: f.description,
          tags: refs(f.tags),
          brandColor: f['hero-bg-color'],
          sliderImage: img(f.image),
          sliderImageMobile: img(f['image-mobile']),
          heroImage: img(f['inner-page-image-desltop']),
          heroImageMobile: img(f['inner-page-image-mobile']),
          challenge: md(f.challenge),
          solution: md(f.solution),
        },
        '',
      )
    }
    console.log(`  src/content/case-studies/*.md (${items.length})`)
  },

  'legal-pages': (items) => {
    for (const it of items) {
      const f = it.fieldData
      // The page template renders the title as <h1>, so drop a leading H1 from the body
      const body = md(f['privacy-policy']).replace(/^# .+\n+/, '')
      writeMarkdown('legal', f.slug, {title: f.name}, body)
    }
    console.log(`  src/content/legal/*.md (${items.length})`)
  },
}

console.log('Writing content files:')
for (const [key, write] of Object.entries(COLLECTIONS)) {
  if (!dump[key]) {
    console.warn(`  ! collection "${key}" missing from dump, skipped`)
    continue
  }
  write(dump[key].items)
}
