#!/usr/bin/env node
/**
 * Downloads every image still served from Webflow's CDN into public/images/cms/
 * and rewrites the references in src/ to the local copies.
 *
 * Run once on your machine before Webflow is cancelled (Webflow's CDN goes away with the site):
 *   npm run localize-images
 *
 * Safe to re-run: already-downloaded files are skipped.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SCAN_DIRS = ['src']
const OUT_DIR = path.join(ROOT, 'public/images/cms')
const CDN = /https:\/\/(?:cdn\.prod\.website-files\.com|uploads-ssl\.webflow\.com|assets\.website-files\.com)\/[^\s"')<>]+/g

const files = []
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (/\.(md|mdx|ya?ml|json|astro|css|ts|js)$/.test(entry.name)) files.push(full)
  }
}
SCAN_DIRS.forEach((d) => fs.existsSync(path.join(ROOT, d)) && walk(path.join(ROOT, d)))

const urls = new Set()
for (const file of files) for (const m of fs.readFileSync(file, 'utf8').matchAll(CDN)) urls.add(m[0])

if (urls.size === 0) {
  console.log('No Webflow CDN URLs left. Nothing to do.')
  process.exit(0)
}

fs.mkdirSync(OUT_DIR, {recursive: true})
const localPath = (url) => {
  const name = decodeURIComponent(new URL(url).pathname.split('/').pop())
    .replace(/^[0-9a-f]{24}_/, '') // drop Webflow's asset id prefix
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .toLowerCase()
  return `/images/cms/${name}`
}

const map = new Map()
let failed = 0
for (const url of urls) {
  const local = localPath(url)
  const dest = path.join(ROOT, 'public', local)
  if (!fs.existsSync(dest)) {
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
      console.log(`  ↓ ${local}`)
    } catch (err) {
      failed++
      console.error(`  ✗ ${url} — ${err.message}`)
      continue
    }
  }
  map.set(url, local)
}

for (const file of files) {
  const before = fs.readFileSync(file, 'utf8')
  const after = before.replace(CDN, (url) => map.get(url) ?? url)
  if (after !== before) fs.writeFileSync(file, after)
}

console.log(`\nDone: ${map.size} images local${failed ? `, ${failed} failed (re-run to retry)` : ''}.`)
