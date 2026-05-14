// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { loadSite } from './src/lib/data.ts';

const data = await loadSite();

const localeCodes = data.locales.map((l) => l.code);

// Split site.host into an origin (passed to `site`) and a pathname (passed
// to `base`). Supports project-page deployments like
// `https://example.github.io/Fair-Skies` where every route must be served
// under `/Fair-Skies/...`. When the host has no path component, `base`
// resolves to `'/'` and behavior is unchanged from before.
const hostURL = new URL(data.site.host);
const basePath = hostURL.pathname || '/';

/**
 * Run Pagefind over the built `dist/` directory once Astro is done. Only
 * activated when siteinfo.yaml has `pagefind: true` — opted-out sites
 * never spawn the indexer or ship the index files.
 *
 * @param {boolean} enabled
 * @returns {import('astro').AstroIntegration}
 */
function pagefindIntegration(enabled) {
  return {
    name: 'pagefind',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        if (!enabled) return;
        const sitePath = fileURLToPath(dir);
        logger.info(`indexing ${sitePath}`);
        const { createIndex } = await import('pagefind');
        const { index } = await createIndex({});
        if (!index) throw new Error('pagefind: createIndex returned no handle');
        await index.addDirectory({ path: sitePath });
        await index.writeFiles({ outputPath: `${sitePath}/pagefind` });
      },
    },
  };
}

export default defineConfig({
  site: data.site.host,
  base: basePath,
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
    pagefindIntegration(data.site.pagefind === true),
  ],
  vite: {
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
