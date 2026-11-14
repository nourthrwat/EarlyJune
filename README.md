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
migration/          Raw Webflow CMS export used for the migration
scripts/            Migration tools (reusable for other Webflow sites)
```

## Migration scripts

- `npm run migrate:cms` — Webflow CMS export (`migration/webflow-cms.json`) → Markdown/YAML
- `npm run localize-images` — download images from Webflow's CDN into `public/images/cms/`
  and rewrite references. **Run before Webflow is cancelled.**

See [CLAUDE.md](CLAUDE.md) for the rules every change must follow.
