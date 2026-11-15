// Downloads the images attached to a Slack request into public/images/uploads/.
// Writes the saved paths to the step output `list` (one per line) for the Claude prompt.
import fs from 'node:fs'
import path from 'node:path'

const files = JSON.parse(process.env.FILES || 'null') || []
const dir = 'public/images/uploads'
const saved = []

const safeName = (name) => {
  const ext = path.extname(name).toLowerCase() || '.png'
  const base = path.basename(name, path.extname(name)).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'image'
  let file = `${base}${ext}`
  for (let i = 2; fs.existsSync(path.join(dir, file)); i++) file = `${base}-${i}${ext}`
  return file
}

for (const f of files) {
  const res = await fetch(f.url, {headers: {Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`}})
  const type = res.headers.get('content-type') || ''
  if (!res.ok || !type.startsWith('image/')) {
    console.error(`Could not download ${f.name} (${res.status} ${type}). Does the Slack app have the files:read scope?`)
    continue
  }
  fs.mkdirSync(dir, {recursive: true})
  const file = safeName(f.name)
  fs.writeFileSync(path.join(dir, file), Buffer.from(await res.arrayBuffer()))
  saved.push(`/images/uploads/${file}`)
  console.log(`saved ${dir}/${file}`)
}

const list = saved.length ? saved.map((p) => `- ${p}`).join('\n') : (files.length ? 'none (download failed — tell the client the Slack app needs the files:read scope)' : 'none')
fs.appendFileSync(process.env.GITHUB_OUTPUT || '/dev/null', `list<<EOF_LIST\n${list}\nEOF_LIST\n`)
