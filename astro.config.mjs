// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadSite } from './src/lib/data.ts';

const data = await loadSite();

const localeCodes = data.locales.map((l) => l.code);

export default defineConfig({
  site: data.site.host,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: data.defaultLocale,
        locales: Object.fromEntries(
          localeCodes.map((c) => [c, c]),
        ),
      },
    }),
  ],
  vite: {
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
