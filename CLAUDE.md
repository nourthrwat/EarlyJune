# Early June — agent instructions

Read this before every change. It applies to Claude Code, the Slack agent, and humans.

## What this is

The Early June marketing site, migrated from Webflow (`earlyjunedev.webflow.io`).

- `web/` — Astro 7, static output. Reads content from Sanity at build time.
- `studio/` — Sanity Studio 6 (CMS). Project `4onggkj5`, dataset `production`.
- `docs/` — content model, component catalogue, SEO inventory, plan.
- `scripts/` — migration and tooling scripts.

## Golden rules

1. **URLs never change.** Every URL must match the old Webflow URL (see `docs/seo-inventory.md`).
   If a URL must change, add a `redirect` document in Sanity in the same change.
2. **Use the design system. Never style one-off.**
   - Colors, fonts, sizes, spacing, radius: only `var(--…)` tokens from `web/src/styles/tokens.css`.
     No raw hex, no `px` font sizes, no magic numbers.
   - Backgrounds: only the 6 themes (`light, ivory, coal, blue, gold, green`) via `<Section theme>`.
   - Buttons: only `<Button>` with `primary | secondary | text`.
   - Images: only `<SanityImage>`. Rich text: only `<RichText>`.
3. **Reuse before you build.** Check `/styleguide` and `docs/components.md` first.
   A new page is almost always existing blocks in Sanity — not new code.
4. **Content lives in Sanity, not in code.** No hardcoded copy in components (sample data in
   `styleguide.astro` is the only exception).
5. **Model content, not layout.** Schema fields describe what something *is* (`heading`, `items`),
   never how it looks (`bigText`, `redButton`, `fontSize`). Variants are a short named list.
6. **One H1 per page.** `PageBuilder` gives `level="h1"` to the first block with a heading.
   Never store heading levels in Sanity.
7. **Never delete a schema field that has data.** Deprecate it (see `docs/content-model.md`).

## Where things are

| Need | File |
|---|---|
| Design tokens | `web/src/styles/tokens.css` |
| Themes, base styles, utilities | `web/src/styles/global.css` |
| Page-builder blocks (UI) | `web/src/components/blocks/*.astro` |
| Block registry | `web/src/components/blocks/PageBuilder.astro` |
| Block schemas | `studio/schemaTypes/blocks/index.ts` |
| Document schemas | `studio/schemaTypes/documents/*.ts` |
| All GROQ queries | `web/src/lib/queries.ts` (components never query) |
| URL rules per document type | `web/src/lib/links.ts` → `pathFor()` |
| `<head>` / SEO | `web/src/layouts/BaseLayout.astro` |

## Common tasks

**"Change text / image / order of sections"** → content change, do it in Sanity. No code.

**"Add a new page"** → create a `page` document in Sanity from existing blocks. No code.

**"Add a new kind of section"** → follow "Adding a new block" in `docs/components.md`.
All four steps in one change: schema → component → registry → docs + styleguide.

**"Change a color / font / spacing everywhere"** → edit the token in `tokens.css` only.

## Commands

```bash
npm run install:all     # install web + studio
npm run dev:web         # http://localhost:4321
npm run dev:studio      # http://localhost:3333
npm run build           # build both
npm --prefix web run check   # type-check Astro — must pass with 0 errors
```

No network to Sanity? Build against the mock:
`node scripts/mock-sanity-api.mjs & SANITY_API_HOST=http://localhost:4399 npm run build:web`

## Before you finish any change

- [ ] `npm --prefix web run check` → 0 errors
- [ ] `npm run build` passes
- [ ] New block/token? Added to `docs/components.md` **and** `/styleguide`
- [ ] Schema change? `docs/content-model.md` updated, and `npm --prefix studio run deploy-schema` run
- [ ] No raw hex / px font sizes / inline styles added (except `--brand` on case studies)
- [ ] No URL changed without a redirect
