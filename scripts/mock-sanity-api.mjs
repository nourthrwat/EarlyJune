// Tiny stand-in for the Sanity query API, for build checks where api.sanity.io is unreachable.
// Answers every query with an empty result: [] for list queries, null for single-document queries.
// Usage:
//   node scripts/mock-sanity-api.mjs &
//   SANITY_API_HOST=http://localhost:4399 npm --prefix web run build
import http from 'node:http'

const PORT = Number(process.env.PORT || 4399)

http
  .createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`)
    const query = url.searchParams.get('query') || ''
    // Single-document queries end with [0]{...} or [0]
    const isSingle = /\[0\]\s*(\{[\s\S]*\})?\s*$/.test(query.trim())
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify({ms: 1, query, result: isSingle ? null : []}))
  })
  .listen(PORT, () => console.log(`Mock Sanity API on http://localhost:${PORT}`))
