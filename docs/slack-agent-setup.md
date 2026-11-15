# Slack agent setup

How the client changes the website from Slack:

```
Client in Slack: "@website change the About page headline to …"
   │
   ▼
slack-bridge (Cloudflare Worker)  ── replies "Got it 👍" in the thread
   │  GitHub repository_dispatch
   ▼
.github/workflows/slack-request.yml
   │  Claude edits the files (following CLAUDE.md), runs check + build
   │  → commits to branch slack/<thread> → opens a pull request
   ▼
Netlify deploy preview  ── bot replies in the thread: summary + [Open preview] [Approve & publish]
   │
   ▼  client presses "Approve & publish"
slack-bridge merges the PR → Netlify deploys main → live
```

Follow-up messages in the same Slack thread ("make it shorter") update the same pull request.

You need accounts on: GitHub (have), Netlify (free), Cloudflare (free), Slack (admin of the workspace),
and either a Claude subscription (Pro/Max) or a Claude API key.

## 1. Netlify — hosting + deploy previews

1. app.netlify.com → **Add new project → Import an existing project → GitHub** → pick `nourthrwat/EarlyJune`.
2. Build settings are read from `netlify.toml` (build `npm run build`, publish `dist`). Click **Deploy**.
3. Project configuration → **Change project name**, e.g. `early-june`. The site lives at `https://early-june.netlify.app`.
4. Deploy previews are on by default for pull requests. Check under **Build & deploy → Deploy Previews**.
5. Forms: after the first deploy, **Forms** shows "Audit Form". Turn on email notifications there.

## 2. GitHub — secrets and variables

Repo → **Settings → Secrets and variables → Actions**.

Secrets:

| Name | Value |
|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | run `claude setup-token` on your computer (uses your Claude subscription) — **or** |
| `ANTHROPIC_API_KEY` | an API key from platform.claude.com (pay per use) |
| `SLACK_BOT_TOKEN` | the `xoxb-…` token from step 4 |

Variables tab:

| Name | Value |
|---|---|
| `NETLIFY_SITE_NAME` | the Netlify project name, e.g. `early-june` |

Also: **Settings → Actions → General → Workflow permissions → Read and write**, and tick
**Allow GitHub Actions to create and approve pull requests**.

## 3. GitHub token for the bridge

github.com/settings/personal-access-tokens → **Fine-grained token**:

- Repository access: only `nourthrwat/EarlyJune`
- Permissions: **Contents: Read and write**, **Pull requests: Read and write**

Copy the token (`github_pat_…`); it goes into the Worker in step 5.

## 4. Slack app

1. api.slack.com/apps → **Create New App → From a manifest** → pick the workspace.
2. Paste `slack-bridge/slack-app-manifest.yml` (leave `YOUR-WORKER` for now; you fix it in step 6).
3. **Install to Workspace**. Copy **Bot User OAuth Token** (`xoxb-…`) and, under Basic Information, the **Signing Secret**.
4. In Slack, invite the bot to the client channel: `/invite @website`.

## 5. Cloudflare Worker (the bridge)

```bash
cd slack-bridge
npm install
npx wrangler login
npx wrangler secret put SLACK_SIGNING_SECRET   # from step 4
npx wrangler secret put SLACK_BOT_TOKEN        # xoxb-… from step 4
npx wrangler secret put GITHUB_TOKEN           # github_pat_… from step 3
npm run deploy
```

Wrangler prints the Worker URL, e.g. `https://early-june-slack-bridge.<you>.workers.dev`.
Optional: put the client's Slack user IDs in `APPROVER_IDS` in `wrangler.toml` so only they can publish.

## 6. Point Slack at the Worker

In the Slack app settings:

- **Event Subscriptions → Request URL**: `https://<worker>/slack/events` (should say *Verified*)
- **Interactivity & Shortcuts → Request URL**: `https://<worker>/slack/interactions`

Save, and reinstall the app if Slack asks.

## 7. Test

In the channel: `@website change the About page headline to "Fewer layers. More results."`

1. The bot answers "Got it 👍" in the thread.
2. GitHub → Actions shows a **Slack request** run (2–4 minutes).
3. The bot posts the summary with **Open preview** and **Approve & publish**.
4. Approve → the PR is merged → Netlify publishes in about a minute.

## Limits (on purpose)

- Claude can only read/edit files and run `npm run check` / `npm run build` (see `--allowedTools` in the workflow).
- It cannot push to `main`. Every change waits for the approve button.
- Images sent in Slack are not picked up yet; upload them to `public/images/` and mention the file name.
