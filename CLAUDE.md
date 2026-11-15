# Early June — agent instructions

Read this before every change. It applies to Claude Code, the Slack agent, and humans.

## What this is

The Early June marketing site, migrated from Webflow to a **static Astro site**.
There is no CMS: all content lives in this repo as Markdown and YAML files.
The client requests changes in Slack; every change becomes a pull request with a preview
link, and goes live only after the client approves it.

## Where content lives

| Content | File | URL |
|---|---|---|
| Blog posts | `src/content/posts/<slug>.md` | `/post/<slug>` |
| Case studies | `src/content/case-studies/<slug>.md` | `/case-study/<slug>` |
| Legal pages | `src/content/legal/<slug>.md` | `/legal-page/<slug>` |
| Blog categories | `src/data/blog-categories.yaml` | `/blog-categories/<id>` |
| Case study tags, FAQ tags | `src/data/case-study-tags.yaml`, `src/data/faq-tags.yaml` | — |
| Client logos | `src/data/logos.yaml` | — |
| Team members | `src/data/team.yaml` | — |
| FAQs | `src/data/faqs.yaml` | — |
| Page copy (home, about, services…) | `src/pages/*.astro` | same path |
| Header / footer links | `src/components/Header.astro`, `src/components/Footer.astro` | every page |

## How pages are built

The markup and CSS were rebuilt 1:1 from the Webflow Designer (Client-First naming), so page files
use the **same class names as Webflow**: `section_*`, `padding-global`, `container-large`,
`heading-style-*`, `text-color-*`, `spacer-*`…

- `src/styles/webflow.css` — GENERATED from Webflow by `scripts/webflow-styles-to-css.mjs`. Never edit by hand.
- `src/styles/site.css` — the only place for hand-written CSS (keep it tiny).
- `src/components/` — the Webflow components, with the same names and variants:

| Component | Use it like | Variants |
|---|---|---|
| `Header` | `<Header variant="white-light" logoColor="white-light" logoMobile="white-light" />` on dark heroes | base, white-light |
| `Footer` | `<Footer />` | — |
| `Button` | `<Button href="/audit" text="Say hi" variant="soild" />` | base, soild, white, black, black-soild, white-soild |
| `ButtonIcon` | `<ButtonIcon href="/audit" text="Request an audit" variant="gold-dark" />` | base, blue-dark-icon, blue-dark-large, gold-dark, green |
| `Faq` | `<Faq question="…" answer="…" />` | base, white-light, ivory |
| `SectionQuote` | `<SectionQuote quote="…" name="…" title="…" photo="…" />` | — |
| `SectionDefine` | `<SectionDefine eyebrow="…" title="…" text="…" />` | base, gold-dark, coal-dark |
| `SectionCta` | `<SectionCta title="…" buttonText="…" buttonHref="/audit" />` | — |
| `SectionCtaBlue` | `<SectionCtaBlue title="…" text="…" />` | base, bg-2, without-subheading, bg-2-without-subheading |
| `CaseStudyCard` | `<CaseStudyCard title="…" description="…" buttonHref="/case-study/…" />` | base, gold-light |

`/styleguide` shows every color, heading class, button and section in one place.

Field rules for every file are in `src/content.config.ts`. The build fails on a missing required
field, a wrong type, or a reference to a tag/category that doesn't exist — fix the content, never
loosen the schema to make an error go away.

## Golden rules

1. **URLs never change.** Every URL must match the old Webflow URL. A file's name is its slug:
   renaming `hey-jane.md` changes the URL. If a URL must change, add a redirect in `public/_redirects`
   in the same change.
2. **Content requests change content files only.** "Change the headline", "add a blog post",
   "swap the team photo" → edit the Markdown/YAML (or the copy in the page file). No CSS, no new components.
   (Exception: a new page or section from a Figma link — see below.)
3. **Use the existing design system.** Reuse existing classes and components; check `/styleguide`
   first. No new colors, font sizes or spacing values — use the CSS variables that already exist.
   To build a new section, copy a similar section from another page and change the copy.
4. **New post or case study** → copy an existing file in the same folder, keep the same fields.
5. **Images** go in `public/images/` and are referenced as `/images/...`. Always fill `alt`.
6. **One `<h1>` per page.**
7. **Small, focused changes.** One request = one pull request. Don't refactor unrelated code.

## New pages and sections from Figma

When a request includes a figma.com link:

1. Read the design with the Figma tool `get_figma_data`. Pass the file key and the `node-id` from the link
   (`?node-id=12-34` → `12:34`), so you only fetch the frame that was linked. Each call counts against
   Figma's API limit, so fetch once and work from the result.
2. Download the images the design uses with `download_figma_images` into `public/images/<page-slug>/`
   (PNG for photos, SVG for icons and logos). Reference them as `/images/<page-slug>/<file>` with a real `alt`.
3. Build the page as `src/pages/<page-slug>.astro` with `BaseLayout`, `Header`, `Footer` and the page structure
   every other page uses: `page-wrapper > main-wrapper > section_* > padding-global > container-* > …`.
   Copy a similar existing page as the starting point.
4. Map the design to what exists **before** writing anything new:
   - text styles → existing heading/text classes (see `/styleguide`)
   - colors → the `--colors--*` variables (pick the closest one; never hard-code a new hex)
   - buttons, CTAs, FAQs, quotes, case-study cards → the components in `src/components/`
   - spacing → `padding-section-*`, `spacer-*`, `container-*`
5. Only if the layout truly can't be built from existing classes: add new classes for that page at the end of
   `src/styles/site.css`, under a comment `/* <page-slug> page (from Figma) */`, named `section_<name>-…`,
   using the existing CSS variables and rem units. Make it work at 991px, 767px and 479px.
6. URLs: new pages only — never rename or move existing ones. Add the page to the header or footer only if asked.
7. In /tmp/summary.md, list anything that could not match the design exactly (fonts that don't exist on the
   site, effects, missing images), so the client can decide in the preview.

## Commands

```bash
npm install
npm run dev        # http://localhost:4321
npm run check      # must report 0 errors
npm run build      # must pass
```

## Before you finish any change

- [ ] `npm run check` → 0 errors
- [ ] `npm run build` passes
- [ ] No URL changed without a redirect
- [ ] Only the files the request needs were changed
- [ ] The PR description says, in plain words, what changed and on which page
