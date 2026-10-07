import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://russkaye.github.io',
  integrations: [sitemap()],
  // Inline CSS so the first paint isn't blocked on a stylesheet request.
  build: { inlineStylesheets: 'always' },
});
