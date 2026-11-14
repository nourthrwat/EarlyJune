import {defineConfig} from 'astro/config'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://earlyjune.com',
  output: 'static',
  trailingSlash: 'never',
  build: {format: 'file'}, // /about-us.html served as /about-us — same URLs as Webflow
  integrations: [
    sitemap({
      filter: (page) => !/\/(404|styleguide)$/.test(page),
    }),
  ],
})
