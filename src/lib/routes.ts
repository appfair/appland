/**
 * URL helpers for the multi-app routes. The single-app site only renders the
 * locale-index routes, so it never invokes appPageHref().
 *
 * Every href is prefixed with `import.meta.env.BASE_URL`, which Astro derives
 * from the `base:` config. For a root-deployed site this is `/`; for a
 * subpath deployment such as `https://example.github.io/Fair-Skies/` it is
 * `/Fair-Skies/`, so `localeIndexHref('en')` yields `/Fair-Skies/en/`.
 */

import type { LocaleInfo, LocaleLink } from './types.ts';

// Astro always normalizes BASE_URL to end with a slash.
const BASE = import.meta.env.BASE_URL;

/** Locale index page: {base}{locale}/ */
export function localeIndexHref(locale: string): string {
  return `${BASE}${locale}/`;
}

/** Per-app sub-page: {base}{locale}/apps/{slug}/ */
export function appPageHref(locale: string, slug: string): string {
  return `${BASE}${locale}/apps/${encodeURIComponent(slug)}/`;
}

/** Build the per-page LocaleLink list pointing every locale at the same path-template. */
export function localeLinksFor(
  locales: LocaleInfo[],
  hrefFor: (code: string) => string,
): LocaleLink[] {
  return locales.map((l) => ({ ...l, href: hrefFor(l.code) }));
}
