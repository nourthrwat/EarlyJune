import {defineConfig} from 'astro/config'
import {loadEnv} from 'vite'
import sitemap from '@astrojs/sitemap'

const {PUBLIC_SITE_URL} = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '')

// Static build. Content is fetched from Sanity at build time;
// a Sanity webhook triggers a rebuild on publish (see docs/deployment.md).
export default defineConfig({
  site: PUBLIC_SITE_URL || 'https://earlyjune.com',
  output: 'static',
  trailingSlash: 'never',
  build: {format: 'file'}, // /about-us.html → served as /about-us (matches Webflow URLs)
  integrations: [
    sitemap({
      // Webflow template pages that were never real URLs
      filter: (page) => !/\/(404|styleguide)$/.test(page),
    }),
  ],
  image: {
    domains: ['cdn.sanity.io'],
  },
})
