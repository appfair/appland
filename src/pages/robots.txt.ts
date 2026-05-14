import type { APIRoute } from 'astro';
import { loadSite } from '../lib/data.ts';

export const GET: APIRoute = async () => {
  const { site } = await loadSite();
  // Construct sitemap URL from origin + (normalized) base so that
  // hosts with a path component (`https://x.github.io/Fair-Skies`)
  // resolve to `https://x.github.io/Fair-Skies/sitemap-index.xml`.
  const hostURL = new URL(site.host);
  const base = hostURL.pathname.endsWith('/')
    ? hostURL.pathname
    : hostURL.pathname + '/';
  const sitemap = `${hostURL.origin}${base}sitemap-index.xml`;
  const body = [
    'User-agent: *',
    'Allow: /',
    `Sitemap: ${sitemap}`,
    '',
  ].join('\n');
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
