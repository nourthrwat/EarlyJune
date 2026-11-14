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
3. **Use the existing design system.** Reuse existing classes and components; check `/styleguide`
   first. No new colors, font sizes or spacing values — use the CSS variables that already exist.
   To build a new section, copy a similar section from another page and change the copy.
4. **New post or case study** → copy an existing file in the same folder, keep the same fields.
5. **Images** go in `public/images/` and are referenced as `/images/...`. Always fill `alt`.
6. **One `<h1>` per page.**
7. **Small, focused changes.** One request = one pull request. Don't refactor unrelated code.

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
