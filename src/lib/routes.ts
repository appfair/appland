/**
 * URL helpers for the multi-app routes. The single-app site only renders the
 * locale-index routes, so it never invokes appPageHref().
 */

import type { LocaleInfo, LocaleLink } from './types.ts';

/** Locale index page: /{locale}/ */
export function localeIndexHref(locale: string): string {
  return `/${locale}/`;
}

/** Per-app sub-page: /{locale}/apps/{slug}/ */
export function appPageHref(locale: string, slug: string): string {
  return `/${locale}/apps/${encodeURIComponent(slug)}/`;
}

/** Build the per-page LocaleLink list pointing every locale at the same path-template. */
export function localeLinksFor(
  locales: LocaleInfo[],
  hrefFor: (code: string) => string,
): LocaleLink[] {
  return locales.map((l) => ({ ...l, href: hrefFor(l.code) }));
}
