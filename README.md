# Early June

Marketing site for Early June — migrated from Webflow to a **static Astro site** with no CMS.
The team requests changes in Slack; each change ships as a reviewed pull request.

> The earlier Astro + Sanity version lives on the [`sanity`](../../tree/sanity) branch.

## Quick start

```bash
npm install
npm run dev      # http://localhost:4321
```

## Structure

```
src/content/        Blog posts, case studies, legal pages (Markdown)
src/data/           Logos, team, FAQs, tags, categories (YAML)
src/content.config.ts  Field rules for all content — the build fails on bad content
src/pages/          One file per page/route
src/components/     Webflow components (Header, Footer, buttons, sections) with their variants
src/styles/         webflow.css (generated from Webflow) + site.css (hand-written)
migration/          Raw data read from Webflow through the MCP connector (no code export needed)
scripts/            Migration tools (reusable for other Webflow sites)
```

## Migration scripts

- `npm run migrate:cms` — Webflow CMS export (`migration/webflow-cms.json`) → Markdown/YAML
- `node scripts/webflow-styles-to-css.mjs` — Webflow styles, variables and component variants → `src/styles/webflow.css`
- `node scripts/webflow-tree-to-astro.mjs <page>` — a Webflow page's element tree → Astro markup (starting point)
- `npm run localize-images` — download images and fonts from Webflow's CDN into `public/images/cms/`
  and rewrite references. **Run before Webflow is cancelled.**

The Webflow site is on the free plan (no code export), so everything was read with the Webflow MCP
connector: element trees per page (`migration/pages/`), styles, variables, component variants,
embeds and custom code.

See [CLAUDE.md](CLAUDE.md) for the rules every change must follow.
