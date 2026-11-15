/**
 * Slack ⇄ GitHub bridge (Cloudflare Worker).
 *
 *  POST /slack/events        Slack Events API: someone @mentions the bot → start the GitHub workflow
 *  POST /slack/interactions  Slack buttons: "Approve & publish" → merge the pull request (Netlify then deploys)
 *
 * Secrets (wrangler secret put …): SLACK_SIGNING_SECRET, SLACK_BOT_TOKEN, GITHUB_TOKEN
 * Vars (wrangler.toml):            GITHUB_REPO, APPROVER_IDS (optional, comma-separated Slack user IDs)
 */
export interface Env {
  SLACK_SIGNING_SECRET: string
  SLACK_BOT_TOKEN: string
  GITHUB_TOKEN: string
  GITHUB_REPO: string
  APPROVER_IDS?: string
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)
    if (request.method !== 'POST') return new Response('Early June Slack bridge is running.')

    const body = await request.text()
    if (!(await verifySlack(request, body, env.SLACK_SIGNING_SECRET))) return new Response('Bad signature', {status: 401})

    if (url.pathname === '/slack/events') return handleEvent(request, body, env, ctx)
    if (url.pathname === '/slack/interactions') return handleInteraction(body, env, ctx)
    return new Response('Not found', {status: 404})
  },
}

// ---------- Slack events: a new request ----------
async function handleEvent(request: Request, body: string, env: Env, ctx: ExecutionContext) {
  const payload = JSON.parse(body)
  if (payload.type === 'url_verification') return new Response(payload.challenge)
  // Slack retries if we were slow; the first delivery already started the work.
  if (request.headers.get('x-slack-retry-num')) return new Response('ok')

  const event = payload.event
  if (payload.type !== 'event_callback' || event?.type !== 'app_mention' || event.bot_id) return new Response('ok')

  const text = String(event.text ?? '')
    .replace(/<@[A-Z0-9]+>/g, '') // the bot mention
    .replace(/<(https?:\/\/[^|>]+)(?:\|[^>]*)?>/g, '$1') // Slack link markup <url|label> → url
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
  const threadTs = event.thread_ts ?? event.ts

  ctx.waitUntil(
    (async () => {
      if (!text) {
        await slackPost(env, event.channel, threadTs, 'Hi! Tell me what to change on the website, for example: “Change the home page headline to …”.')
        return
      }
      const res = await github(env, `/repos/${env.GITHUB_REPO}/dispatches`, 'POST', {
        event_type: 'slack-request',
        client_payload: {text, user: event.user, channel: event.channel, thread_ts: threadTs},
      })
      await slackPost(
        env,
        event.channel,
        threadTs,
        res.ok
          ? 'Got it 👍 Working on it now. I’ll reply here with a preview link in a few minutes.'
          : `Sorry, I couldn’t start the job (GitHub ${res.status}).`,
      )
    })(),
  )
  return new Response('ok')
}

// ---------- Slack buttons: approve ----------
async function handleInteraction(body: string, env: Env, ctx: ExecutionContext) {
  const payload = JSON.parse(new URLSearchParams(body).get('payload') ?? '{}')
  const action = payload.actions?.[0]
  if (payload.type !== 'block_actions' || action?.action_id !== 'approve') return new Response('')

  const user: string = payload.user?.id
  const approvers = (env.APPROVER_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  const replyTo = payload.response_url as string

  ctx.waitUntil(
    (async () => {
      if (approvers.length && !approvers.includes(user)) {
        await respond(replyTo, {replace_original: false, response_type: 'ephemeral', text: 'Only approvers can publish changes.'})
        return
      }
      const pr = Number(action.value)
      const info = await (await github(env, `/repos/${env.GITHUB_REPO}/pulls/${pr}`)).json<any>()
      if (info.merged) {
        await respond(replyTo, {replace_original: false, response_type: 'ephemeral', text: 'This change is already published.'})
        return
      }
      const merge = await github(env, `/repos/${env.GITHUB_REPO}/pulls/${pr}/merge`, 'PUT', {merge_method: 'squash'})
      if (!merge.ok) {
        const err = await merge.json<any>().catch(() => ({}))
        await respond(replyTo, {replace_original: false, text: `Couldn’t publish: ${err.message ?? merge.status}`})
        return
      }
      await github(env, `/repos/${env.GITHUB_REPO}/git/refs/heads/${info.head.ref}`, 'DELETE')
      await respond(replyTo, {
        replace_original: true,
        text: `✅ Published by <@${user}>. The live site updates in about a minute.`,
      })
    })(),
  )
  return new Response('')
}

// ---------- helpers ----------
async function verifySlack(request: Request, body: string, secret: string) {
  const ts = request.headers.get('x-slack-request-timestamp')
  const sig = request.headers.get('x-slack-signature')
  if (!ts || !sig || Math.abs(Date.now() / 1000 - Number(ts)) > 60 * 5) return false
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign'])
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`v0:${ts}:${body}`))
  const expected = 'v0=' + [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('')
  return timingSafeEqual(expected, sig)
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function github(env: Env, path: string, method = 'GET', body?: unknown) {
  return fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'early-june-slack-bridge',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

function slackPost(env: Env, channel: string, threadTs: string, text: string) {
  return fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`},
    body: JSON.stringify({channel, thread_ts: threadTs, text}),
  })
}

function respond(responseUrl: string, message: Record<string, unknown>) {
  return fetch(responseUrl, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(message)})
}
