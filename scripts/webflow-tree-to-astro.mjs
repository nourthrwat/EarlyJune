#!/usr/bin/env node
/**
 * Webflow Designer element tree → Astro page markup.
 * Reusable for any Webflow migration done through the Webflow MCP connector (no code export needed).
 *
 * Input:  migration/pages/<name>.json   (data_element_tool > get_all_elements, depth -1)
 * Output: migration/generated/<name>.astro  — a starting point that is then wired to content by hand
 *         (CMS lists are left as <!-- CMS LIST --> markers).
 *
 * Usage: node scripts/webflow-tree-to-astro.mjs home about-us ...
 */
import fs from 'node:fs'

const read = (f) => JSON.parse(fs.readFileSync(f, 'utf8'))
const assets = read('migration/webflow-assets.json')
const styles = read('migration/webflow-styles.json').result
const map = read('migration/webflow-map.json')

// Webflow class name → published CSS class (taken from the selectors so it always matches webflow.css)
const classOf = {}
for (const s of styles) {
  const parts = s.selector.split(',')[0].trim().split('.').filter(Boolean)
  classOf[s.name] = parts[parts.length - 1]
}
const cls = (names = []) =>
  names.map((n) => classOf[n] ?? n.toLowerCase().replace(/[./ ]/g, '-').replace(/%/g, '')).join(' ')

const esc = (t) =>
  String(t)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;')
const attr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;')

export function href(link) {
  if (!link) return '#'
  const type = link.linkType ?? link.mode
  const to = link.pageId ?? link.to?.pageId ?? link.href ?? link.to
  if (type === 'page') return map.pages[to] ?? '#'
  if (type === 'email') return `mailto:${to}`
  if (type === 'phone') return `tel:${to}`
  if (typeof to === 'string') return to.replace(/^https?:\/\/earlyjunedev\.webflow\.io/, '') || '/'
  return '#'
}
export const assetUrl = (id) => assets[id]?.url ?? ''

const imports = new Set()

function propsOf(inst) {
  const def = map.components[inst.id]
  const out = {}
  for (const p of inst.props) {
    if (!p.hasOverride) continue
    const key = def?.props[p.propId]
    if (!key) continue
    let v = p.value
    if (v && typeof v === 'object' && (v.mode || v.linkType)) v = href(v)
    else if (typeof v === 'string' && map.variants[v]) v = map.variants[v]
    else if (typeof v === 'string' && assets[v]) v = assetUrl(v)
    if (v && typeof v === 'object') continue // bound to a parent prop — not used on pages
    out[key] = v
  }
  return out
}

function render(n, d) {
  const pad = '  '.repeat(d)
  const s = n.settings ?? {}
  const c = cls(n.styleNames)
  const classAttr = c ? ` class="${c}"` : ''
  const extra = Object.entries(n.attributes ?? {})
    .map(([k, v]) => ` ${k}="${attr(v)}"`)
    .join('')
  const kids = (n.children ?? []).map((k) => render(k, d + 1)).filter(Boolean)
  const inner = (open, close) =>
    kids.length ? `${pad}${open}\n${kids.join('\n')}\n${pad}${close}` : `${pad}${open}${close}`

  switch (n.type) {
    case 'Body':
      return kids.join('\n')
    case 'String':
      return pad + esc(n.textContent ?? '')
    case '':
      return `${pad}<br />`
    case 'Block':
    case 'Section': {
      const tag = s.tag ?? (n.type === 'Section' ? 'section' : 'div')
      return inner(`<${tag}${classAttr}${extra}>`, `</${tag}>`)
    }
    case 'Heading':
      return inner(`<${s.tag}${classAttr}${extra}>`, `</${s.tag}>`)
    case 'Paragraph':
      return inner(`<p${classAttr}${extra}>`, `</p>`)
    case 'Span':
      return inner(`<span${classAttr}${extra}>`, `</span>`)
    case 'RichText':
      return inner(`<div class="w-richtext${c ? ' ' + c : ''}"${extra}>`, `</div>`)
    case 'Link': {
      const block = kids.some((k) => k.trim().startsWith('<'))
      const k = block ? `w-inline-block${c ? ' ' + c : ''}` : c
      return inner(`<a href="${attr(href(s.link))}"${k ? ` class="${k}"` : ''}${extra}>`, `</a>`)
    }
    case 'Image': {
      const src = assetUrl(s.assetId)
      const alt = s.altText ?? assets[s.assetId]?.alt ?? ''
      return `${pad}<img src="${attr(src)}" alt="${attr(alt)}" loading="lazy"${classAttr}${extra} />`
    }
    case 'HtmlEmbed': {
      if ((n.styleNames ?? []).includes('fluid_responsive')) return ''
      const key = map.embeds[n.id.element]
      return `${pad}<div class="w-embed${c ? ' ' + c : ''}"${extra}><Fragment set:html={embeds.${key ?? 'missing'}} /></div>`
    }
    case 'ComponentInstance': {
      const inst = n.instanceDetails
      const def = map.components[inst.id]
      if (!def || def.skip) return ''
      imports.add(def.name)
      const props = Object.entries(propsOf(inst))
        .map(([k, v]) => ` ${k}=${typeof v === 'string' && !v.includes('\n') ? `"${attr(v)}"` : `{${JSON.stringify(v)}}`}`)
        .join('')
      return `${pad}<${def.name}${props} />`
    }
    case 'DynamoWrapper':
      return inner(`<div class="w-dyn-list${c ? ' ' + c : ''}"><!-- CMS LIST ${n.id.element} -->`, `</div>`)
    case 'DynamoList':
      return inner(`<div role="list" class="w-dyn-items${c ? ' ' + c : ''}">`, `</div>`)
    case 'DynamoItem':
      return inner(`<div role="listitem" class="w-dyn-item${c ? ' ' + c : ''}">`, `</div>`)
    case 'DynamoEmpty':
      return ''
    case 'FormWrapper':
      return inner(`<div class="w-form${c ? ' ' + c : ''}">`, `</div>`)
    case 'FormForm': {
      const name = s.form?.name ?? 'form'
      return inner(
        `<form name="${attr(name)}" data-name="${attr(name)}" method="post" data-netlify="true" netlify-honeypot="bot-field"${classAttr}${extra}>\n${pad}  <input type="hidden" name="form-name" value="${attr(name)}" />`,
        `</form>`,
      )
    }
    case 'FormTextInput': {
      const i = s.input ?? {}
      return `${pad}<input class="w-input ${c}" type="${i.inputType ?? 'text'}" name="${attr(i.inputName ?? '')}" data-name="${attr(i.inputName ?? '')}" placeholder=""${i.isRequired ? ' required' : ''}${extra} />`
    }
    case 'FormTextarea': {
      const i = s.input ?? {}
      return `${pad}<textarea class="w-input ${c}" name="${attr(i.inputName ?? '')}" data-name="${attr(i.inputName ?? '')}" placeholder=""${i.isRequired ? ' required' : ''}${extra}></textarea>`
    }
    case 'FormButton':
      return `${pad}<input type="submit" class="w-button ${c}" value="Submit" />`
    case 'FormSuccessMessage':
      return inner(`<div class="w-form-done${c ? ' ' + c : ''}" tabindex="-1" role="region">`, `</div>`)
    case 'FormErrorMessage':
      return inner(`<div class="w-form-fail${c ? ' ' + c : ''}" tabindex="-1" role="region">`, `</div>`)
    case 'SliderWrapper':
      return inner(`<div class="w-slider${c ? ' ' + c : ''}">`, `</div>`)
    case 'SliderMask':
      return inner(`<div class="w-slider-mask${c ? ' ' + c : ''}">`, `</div>`)
    case 'SliderSlide':
      return inner(`<div class="w-slide${c ? ' ' + c : ''}">`, `</div>`)
    case 'SliderArrow': {
      const side = (n.styleNames ?? []).join(' ').includes('right') ? 'right' : 'left'
      return inner(`<div class="w-slider-arrow-${side}${c ? ' ' + c : ''}">`, `</div>`)
    }
    case 'SliderNav':
      return `${pad}<div class="w-slider-nav w-round${c ? ' ' + c : ''}"></div>`
    default:
      return `${pad}<!-- unsupported: ${n.type} -->`
  }
}

for (const name of process.argv.slice(2)) {
  imports.clear()
  const tree = read(`migration/pages/${name}.json`)
  const body = render(tree, 0)
  const head = [...imports].sort().map((c) => `import ${c} from '@/components/${c}.astro'`)
  const out = `---\nimport BaseLayout from '@/layouts/BaseLayout.astro'\n${head.join('\n')}\nimport * as embeds from '@/lib/embeds'\n---\n\n<BaseLayout>\n${body}\n</BaseLayout>\n`
  fs.mkdirSync('migration/generated', {recursive: true})
  fs.writeFileSync(`migration/generated/${name}.astro`, out)
  console.log(`migration/generated/${name}.astro`)
}
