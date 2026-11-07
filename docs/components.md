# Components & style guide

The live version of this page is **`/styleguide`** on the site. This file is the written contract.

## Design tokens (`web/src/styles/tokens.css`)

Extracted from the Webflow Variables and Client-First classes.

### Colors

Raw palette — same names as Webflow `Colors/…` variables, prefixed `--color-`:

| Token | Value | Token | Value |
|---|---|---|---|
| `--color-coal-dark` | `#1e1e1e` | `--color-green` | `#35782c` |
| `--color-coal` | `#2c2c2c` | `--color-green-light` | `#7cac6b` |
| `--color-blue-deep` | `#015e68` | `--color-green-dark` | `#1b3e0e` |
| `--color-blue-dark` | `#32a1ac` | `--color-green-dark-2` | `#06211a` |
| `--color-blue` | `#8ddde5` | `--color-gold` | `#ffc852` |
| `--color-blue-light` | `#c6eef2` | `--color-gold-light` | `#ffe9ba` |
| `--color-ivory` | `#f4f1dc` | `--color-gold-dark` | `#e19a01` |
| `--color-light` | `#fefdf5` | `--color-red` | `#ff6c5c` |
| `--color-white` | `#ffffff` | `--color-rose` / `--color-red-light` | `#ffa69d` / `#ffb6ae` |

**Components use the semantic tokens, never the palette directly:**
`--surface`, `--text`, `--text-muted`, `--border`, `--button-bg`, `--button-text`, `--accent`.
Themes redefine these, which is how every component adapts to dark/light sections automatically.

### Typography

| Use | Font token | Family |
|---|---|---|
| Headings | `--font-display` | Reckless Condensed |
| Italic H2 style | `--font-display-alt` | Reckless Condensed Trial (⚠ trial license) |
| Body & UI | `--font-body` | Work Sans |

| Class | Size token | Webflow class |
|---|---|---|
| `.heading-style-display` | `--fs-display` (48→96px) | `heading-style-h1-large`, `-regular`, `-caseStudy` |
| `.heading-style-h1` | `--fs-h1` (44→80px) | `heading-style-h1` |
| `.heading-style-h2` | `--fs-h2` (32→67px, italic) | `heading-style-h2` |
| `.heading-style-h3` | `--fs-h3` | — |
| `.heading-style-h4` | `--fs-h4` | — |
| `.text-size-large / medium / small` | `--fs-large / medium / small` | `text-size-*` |
| `.eyebrow` | `--fs-small`, uppercase | — |

Heading sizes are fluid (`clamp`) between the Webflow mobile and desktop values.

### Layout & spacing

- Containers: `--container-small` 48rem · `--container-medium` 84rem · `--container-large` 106.125rem
- Side padding: `--padding-global` 1.5rem (1rem on mobile)
- Section padding: `--section-small` / `--section-medium` / `--section-large`
- Spacing scale: `--space-1` … `--space-9` (0.25rem → 6rem)
- Breakpoints (match Webflow): 991px tablet · 767px mobile landscape · 478px mobile

## Themes

Every block has a `theme` field. The only options:

| Value | Background | Text | Button |
|---|---|---|---|
| `light` (default) | light | coal | coal / ivory |
| `ivory` | ivory | coal | coal / ivory |
| `coal` | coal | ivory | gold / coal |
| `blue` | blue | coal | coal / ivory |
| `gold` | gold | coal | coal / ivory |
| `green` | green-dark-2 | ivory | gold / coal |

Defined in `global.css` (`.theme-*`) and `studio/schemaTypes/objects/shared.ts` (`THEMES`). Keep them in sync.

## UI primitives (`web/src/components/ui/`)

| Component | Use for | Props |
|---|---|---|
| `Section` | Wrapping every block: theme, padding, container | `theme`, `width: small/medium/large`, `spacing: none/small/medium/large` |
| `SectionHeading` | Eyebrow + heading + intro at the top of a block | `eyebrow`, `heading`, `intro`, `level`, `align`, `size` |
| `Button` | Every button and CTA | `link` (Sanity link) or `href` + `label`; `variant: primary/secondary/text` |
| `SanityImage` | Every image | `image`, `alt`, `sizes`, `width`, `aspect`, `eager` |
| `RichText` | Every Portable Text field | `value` |

## Page-builder blocks

| Block (`_type`) | Component | What it's for | Variants |
|---|---|---|---|
| `hero` | `Hero.astro` | Top of a page | `size: large/compact`, image optional |
| `splitMedia` | `SplitMedia.astro` | Text beside an image | `imagePosition: left/right` |
| `featureGrid` | `FeatureGrid.astro` | Services, values, steps | `columns: 2/3/4` |
| `caseStudySlider` | `CaseStudySlider.astro` | "Our work" slider (scroll-snap, no JS) | picks or latest 8 |
| `logoStrip` | `LogoStrip.astro` | Client logos | picks or all |
| `teamGrid` | `TeamGrid.astro` | Team members | picks or all |
| `postGrid` | `PostGrid.astro` | Blog listing | `category`, `limit` (0 = all), `showFeatured` |
| `faqList` | `FaqList.astro` | FAQs + FAQPage schema.org | filter by tags |
| `richTextSection` | `RichTextSection.astro` | Long-form text | `width: small/medium` |
| `ctaBanner` | `CtaBanner.astro` | Closing call to action | default theme `coal` |

All blocks also take `theme` and receive `level` (`h1` or `h2`) from `PageBuilder`.

## Adding a new block

Only when no existing block can do the job. All steps go in the same commit.

1. **Schema** — add a `defineType` in `studio/schemaTypes/blocks/index.ts`:
   content fields + `themeField`. No color/size/spacing fields. Add it to `blockTypes`
   and to the `pageBuilder` array. Give it an icon and a preview.
2. **Query** — if it references other documents, expand them in `PAGE_BUILDER` in
   `web/src/lib/queries.ts`.
3. **Component** — `web/src/components/blocks/<Name>.astro`:
   wrap in `<Section theme={theme}>`, use `SectionHeading`, `Button`, `SanityImage`, `RichText`.
   Styles use tokens only. Accept `level` and use it for the main heading.
4. **Register** — add it to `REGISTRY` in `PageBuilder.astro`.
5. **Document** — add a row to the table above and a sample to `web/src/pages/styleguide.astro`.
6. **Deploy schema** — `npm --prefix studio run deploy-schema`.

## Adding a token

Add it to `tokens.css` with a comment, add it to the tables above and to `/styleguide`. Then use it.
Never add a one-off value in a component "just this once".
