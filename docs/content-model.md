# Content model — Webflow → Sanity

Source: Webflow site "Copy of Early June" (`6ab98d8daf6ccf6378b3dad6`), read on 2026-11-07.
Every migrated document will keep the Webflow item ID in a read-only `webflowId` field, so the
migration script (phase 3) can re-run safely: look the document up by `webflowId`, then update it.

## Collections

| Webflow collection | Webflow URL | Sanity type | Route in `web/` |
|---|---|---|---|
| Blog Posts (`post`) | `/post/<slug>` | `post` | `pages/post/[slug].astro` |
| Blog Categories (`blog-categories`) | `/blog-categories/<slug>` | `blogCategory` | `pages/blog-categories/[slug].astro` |
| Case Studies (`case-study`) | `/case-study/<slug>` | `caseStudy` | `pages/case-study/[slug].astro` |
| Case Study Tages (`case-study-tage`) | `/case-study-tage/<slug>` | `caseStudyTag` | none — see SEO inventory |
| Legal Pages (`legal-page`) | `/legal-page/<slug>` | `legalPage` | `pages/legal-page/[slug].astro` |
| Team Members (`team`) | `/team/<slug>` | `teamMember` | none — shown in `teamGrid` |
| Logos (`logos`) | `/logos/<slug>` | `logo` | none — shown in `logoStrip` |
| FAQs (`faq`) | `/faq/<slug>` | `faq` | none — shown in `faqList` |
| FAQ Tags (`faq-tags`) | `/faq-tags/<slug>` | `faqTag` | none |
| Verticals (`vertical`) | `/vertical/<slug>` | `vertical` | none — vertical pages are `page` docs |

## Field mapping

Webflow `name` → Sanity `title` (or `name` / `question`), Webflow `slug` → `slug.current` (unchanged).

### Blog Posts → `post`
| Webflow field | Type | Sanity field |
|---|---|---|
| `post-body` | RichText | `body` (Portable Text via `htmlToBlocks`) |
| `post-summary` | PlainText | `summary` |
| `main-image` | Image | `mainImage` |
| `thumbnail-image` | Image | `thumbnailImage` |
| `featured` | Switch | `featured` |
| `read-time` | PlainText | `readTime` |
| `category` | Reference → Blog Categories | `category` → `blogCategory` |
| (item publish date) | — | `publishedAt` |

### Case Studies → `caseStudy`
| Webflow field | Type | Sanity field |
|---|---|---|
| `description` | PlainText | `description` |
| `image` | Image (desktop slider) | `sliderImage.desktop` |
| `image-mobile` | Image | `sliderImage.mobile` |
| `inner-page-image-desltop` | Image | `heroImage.desktop` |
| `inner-page-image-mobile` | Image | `heroImage.mobile` |
| `hero-bg-color` | Color | `brandColor` (hex string) |
| `challenge` | RichText | `challenge` |
| `solution` | RichText | `solution` |
| `tags` | MultiReference → Case Study Tages | `tags[]` → `caseStudyTag` |

### Team Members → `teamMember`
`profile-picture` → `photo` · `job-title` → `jobTitle` · new: `order` (display order)

### Logos → `logo`
`logo` → `image` · new: `url` (optional client website)

### FAQs → `faq`
`name` → `question` · `answer` → `answer` · `tags` → `tags[]` → `faqTag`

### Legal Pages → `legalPage`
`privacy-policy` (RichText) → `body` · new: `updatedOn`

## New types (not in Webflow)

| Type | Why |
|---|---|
| `homePage` (singleton) | Home page built from blocks |
| `page` | Static pages built from blocks — replaces Webflow Designer pages |
| `siteSettings` (singleton) | Navigation, footer, default SEO, site URL |
| `redirect` | 301/302 redirects the client can manage |
| `seo` (object) | Per-document SEO: title, description, share image, noindex |
| `link` (object) | Internal (by reference) or external links, with button style |
| `richText` (array) | Shared Portable Text config: H2–H4, lists, quote, links, images |

## Static pages (Webflow Designer → Sanity `page`)

These are rebuilt as `page` documents (slug = full path) from page-builder blocks:
`about-us`, `services`, `our-work`, `blog`, `careers`, `audit`, `verticals`,
`verticals/e-commerce`, `verticals/financial-services`, `verticals/healthcare`. Home → `homePage`.

## Schema change rules

- Never delete a field that has data. Deprecate it: `deprecated: {reason}`, `readOnly: true`,
  `hidden: ({value}) => value === undefined`. Migrate data, then remove the field later.
- Never rename a field in place. Add the new one, migrate, deprecate the old one.
- After any change: `npm --prefix studio run deploy-schema`.
