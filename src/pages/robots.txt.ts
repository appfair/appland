import type { APIRoute } from 'astro';
import { loadSite } from '../lib/data.ts';

export const GET: APIRoute = async () => {
  const { site } = await loadSite();
  const sitemap = new URL('sitemap-index.xml', site.host).toString();
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
