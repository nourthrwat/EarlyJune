# SEO inventory (Webflow, read 2026-11-07)

The new site must serve every URL below at the same path. Confirm against a full crawl
(Screaming Frog) of the live site before launch — this list comes from the Webflow pages API.

## Static pages

| Path | Webflow title | Meta description | New home |
|---|---|---|---|
| `/` | — (empty) | ❌ missing | `homePage` |
| `/about-us` | About us | ❌ missing | `page: about-us` |
| `/services` | Services | ❌ missing | `page: services` |
| `/our-work` | Our work | ❌ missing | `page: our-work` |
| `/blog` | Blog | ❌ missing | `page: blog` (postGrid, limit 0) |
| `/careers` | Careers | ❌ missing | `page: careers` |
| `/audit` | Audit | ❌ missing | `page: audit` |
| `/verticals` | Verticals | ❌ missing | `page: verticals` |
| `/verticals/e-commerce` | E-commerce | ❌ missing | `page: verticals/e-commerce` |
| `/verticals/financial-services` | Financial Services | ❌ missing | `page: verticals/financial-services` |
| `/verticals/healthcare` | Healthcare | ❌ missing | `page: verticals/healthcare` |
| `/404` | Not Found | — | `pages/404.astro` |

Drafts in Webflow, not migrated: `/style-guide` (replaced by `/styleguide`, noindex), `/untitled` (Dev Guidelines).
`/401` (password page) is not needed.

**Quick win:** no page has a meta description and the home page has no title.
Write them in Sanity (SEO tab) during content entry — it's the cheapest SEO improvement in the migration.

## Collection URLs

| Pattern | Kept? | Notes |
|---|---|---|
| `/post/<slug>` | ✅ | Blog posts |
| `/blog-categories/<slug>` | ✅ | Category listings |
| `/case-study/<slug>` | ✅ | Case studies |
| `/legal-page/<slug>` | ✅ | Privacy policy etc. Template SEO title was hardcoded "Privacy policy \| Earlyjune" for every item — now per document. |
| `/team/<slug>` | ⚠️ decide | Webflow generates these template pages. If they're indexed, 301 → `/about-us`. |
| `/logos/<slug>` | ⚠️ decide | Same — 301 → `/` if indexed. |
| `/faq/<slug>`, `/faq-tags/<slug>` | ⚠️ decide | Same — 301 to the page holding the FAQ block. |
| `/vertical/<slug>` | ⚠️ decide | Likely duplicates `/verticals/<slug>` — 301 to `/verticals/<slug>`. |
| `/case-study-tage/<slug>` | ⚠️ decide | 301 → `/our-work`. |

Check Google Search Console → Pages for these patterns. Anything with impressions gets a
`redirect` document in Sanity; the rest can be dropped.

## Already handled in the new build

- Canonical URL on every page (no `.html`, no trailing slash)
- `sitemap-index.xml` generated from real routes (styleguide and 404 excluded)
- `robots.txt` with sitemap link
- Open Graph + Twitter card tags, per-page share image with site default fallback
- `noindex` toggle per document
- FAQPage structured data on FAQ blocks
- One `<h1>` per page
