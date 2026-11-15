// Posts the result of a Slack request back into the Slack thread (with the preview link and Approve button).
import fs from 'node:fs'

const env = process.env
const read = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').trim() : '')
const summary = read('/tmp/summary.md')
const page = (read('/tmp/page.txt').split('\n')[0] || '/').replace(/^(?!\/)/, '/')

let text
let blocks
if (env.STATUS !== 'success') {
  text = `Sorry, something went wrong while working on this. <${env.RUN_URL}|See the details>.`
} else if (env.CHANGED !== 'true') {
  text = summary || 'Nothing needed to change.'
} else {
  const pr = env.PR_NUMBER
  const preview = env.NETLIFY_SITE_NAME
    ? `https://deploy-preview-${pr}--${env.NETLIFY_SITE_NAME}.netlify.app${page}`
    : `${env.REPO_URL}/pull/${pr}`
  text = `${summary}\nPreview: ${preview}`
  blocks = [
    {type: 'section', text: {type: 'mrkdwn', text: summary || 'The change is ready.'}},
    {type: 'context', elements: [{type: 'mrkdwn', text: 'The preview takes about a minute to build. Nothing is live until you approve.'}]},
    {
      type: 'actions',
      elements: [
        {type: 'button', text: {type: 'plain_text', text: 'Open preview'}, url: preview, action_id: 'open_preview'},
        {type: 'button', text: {type: 'plain_text', text: 'Approve & publish'}, style: 'primary', action_id: 'approve', value: String(pr),
          confirm: {title: {type: 'plain_text', text: 'Publish this change?'}, text: {type: 'plain_text', text: 'It will go live on the website.'},
            confirm: {type: 'plain_text', text: 'Publish'}, deny: {type: 'plain_text', text: 'Cancel'}}},
        {type: 'button', text: {type: 'plain_text', text: 'View pull request'}, url: `${env.REPO_URL}/pull/${pr}`, action_id: 'open_pr'},
      ],
    },
    {type: 'context', elements: [{type: 'mrkdwn', text: 'Want something different? Reply in this thread and mention me.'}]},
  ]
}

if (!env.SLACK_BOT_TOKEN || !env.SLACK_CHANNEL) {
  console.log(text)
  process.exit(0)
}
const res = await fetch('https://slack.com/api/chat.postMessage', {
  method: 'POST',
  headers: {'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`},
  body: JSON.stringify({channel: env.SLACK_CHANNEL, thread_ts: env.SLACK_THREAD, text, blocks, unfurl_links: false}),
})
const data = await res.json()
if (!data.ok) {
  console.error('Slack error:', data.error)
  process.exit(1)
}
