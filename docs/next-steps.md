# Migration plan & status

| Phase | Status |
|---|---|
| 0. Inventory (pages, collections, tokens, fonts) | ✅ Done — `docs/seo-inventory.md`, `docs/content-model.md` |
| 1. Project setup (Astro + Sanity monorepo, tokens, CLAUDE.md) | ✅ Done |
| 2. Content model (Sanity schemas) | ✅ Done — needs `deploy-schema` from your machine |
| 3. Content migration script (Webflow API → Sanity) | ⏳ Next |
| 4. Rebuild page designs block by block from the Webflow pages | ⏳ |
| 5. SEO parity, redirects, forms, analytics | ⏳ |
| 6. Deploy (Vercel/Netlify) + Sanity webhook → rebuild | ⏳ |
| 7. QA (visual diff, Lighthouse, links) | ⏳ |
| 8. Launch + Slack agent | ⏳ |

## Do these on your machine now

```bash
git clone https://github.com/nourthrwat/earlyjune && cd earlyjune
npm run install:all
cd studio && npx sanity login && npm run deploy-schema   # puts the schema in Sanity
npm run dev                                              # Studio at http://localhost:3333
npx sanity cors add http://localhost:4321                # let the local site read Sanity
```

Then create `web/.env` from `web/.env.example` and run `npm run dev:web`.

## Blockers & decisions

1. **Fonts are still on Webflow's CDN.** Download the 5 files from the URLs in `tokens.css`
   into `web/public/fonts/` and update the `src` paths, before Webflow is cancelled.
2. **"Reckless Condensed Trial" is a trial font.** Trial licenses don't allow production use.
   The client needs a license from Displaay, or swap it for the licensed weights.
3. **Collection template URLs** (`/team/…`, `/logos/…`, `/faq/…`, `/vertical/…`, `/case-study-tage/…`):
   check Search Console and add redirects for any that are indexed (see SEO inventory).
4. **Forms:** Webflow forms (e.g. Audit page) need a replacement — Formspree, or a serverless
   endpoint to the client's CRM. Decide which.
5. **Interactions:** Webflow IX2 animations need rebuilding (CSS or GSAP) per page in phase 4.

## Phase 3 — migration script (spec)

`scripts/migrate-webflow.mjs`, run with `WEBFLOW_TOKEN` and `SANITY_WRITE_TOKEN`:

1. Taxonomies first (blogCategory, caseStudyTag, faqTag, vertical) so references resolve.
2. For each item: find existing doc by `webflowId`; create or patch it.
3. Upload each image once (`client.assets.upload`), cache by URL.
4. Rich text: Webflow HTML → Portable Text with `@portabletext/block-tools` `htmlToBlocks` + JSDOM,
   using the `richText` schema so only allowed styles come through.
5. Keep slugs exactly. Set `publishedAt` from the Webflow item's `lastPublished`/`createdOn`.
6. Run against a `staging` dataset first; diff counts with Webflow; then `production`.

## Later: Slack agent

Slack message → agent reads `CLAUDE.md` + `docs/` → content change via Sanity API, or code change
on a branch → Vercel preview URL posted back to Slack → merge/publish only after approval.
