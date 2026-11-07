# Early June

Marketing site for Early June, migrated from Webflow to **Astro + Sanity**.

```
web/      Astro site (static) — reads content from Sanity at build time
studio/   Sanity Studio — where the team edits content
docs/     Content model, component catalogue, SEO inventory, migration plan
scripts/  Tooling (mock API, migration)
```

## Quick start

```bash
npm run install:all
cp web/.env.example web/.env
npm run dev:studio   # CMS on http://localhost:3333
npm run dev:web      # site on http://localhost:4321
```

## Key docs

- **[CLAUDE.md](CLAUDE.md)** — rules for anyone (human or AI) changing this repo
- **[docs/components.md](docs/components.md)** — design tokens, themes, blocks, how to add a block
- **[docs/content-model.md](docs/content-model.md)** — Webflow → Sanity field mapping
- **[docs/seo-inventory.md](docs/seo-inventory.md)** — every URL that must survive the migration
- **[docs/next-steps.md](docs/next-steps.md)** — migration status, blockers, what's next

Live style guide: `/styleguide` (not indexed).
