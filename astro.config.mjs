// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadSite } from './src/lib/data.ts';

const { site, appView } = await loadSite();

const localeCodes = appView.locales.map((l) => l.code);

export default defineConfig({
  site: site.host,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: appView.defaultLocale,
        locales: Object.fromEntries(
          localeCodes.map((c) => [c, c]),
        ),
      },
    }),
  ],
  vite: {
    // Cast: standalone Vite types may differ slightly from Astro's bundled
    // ones, but the plugin is binary-compatible at runtime.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
