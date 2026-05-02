import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Loads a Material Symbols SVG from public/icons/permissions/{name}.svg at
 * build time and returns it as an inlined string suitable for `set:html`.
 *
 * The shipped SVG files don't carry an explicit `fill` attribute, so they
 * inherit `currentColor` automatically. We additionally normalize the root
 * <svg> element to:
 *   - drop the fixed pixel width/height (we size it via CSS),
 *   - add `fill="currentColor"` defensively,
 *   - mark it `aria-hidden="true"` since it's a decorative icon.
 *
 * Loaded SVGs are cached in-process so each unique icon is read from disk only
 * once per build.
 */

const cache = new Map<string, string>();

function publicIconsDir(): string {
  // <repo>/site/appland/src/lib/svg-icons.ts → <repo>/site/appland/public/icons/permissions
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, '..', '..', 'public', 'icons', 'permissions');
}

export async function loadPermissionIcon(name: string): Promise<string> {
  const cached = cache.get(name);
  if (cached) return cached;

  const path = resolve(publicIconsDir(), `${name}.svg`);
  let svg: string;
  try {
    svg = await readFile(path, 'utf8');
  } catch {
    // Fall back to a generic icon if the requested name is missing.
    svg = await readFile(resolve(publicIconsDir(), 'shield.svg'), 'utf8');
  }

  // Normalize the root <svg> element.
  svg = svg.replace(
    /<svg([^>]*)>/,
    (_match, attrs: string) => {
      // Drop fixed width/height; we size via CSS.
      let cleaned = attrs
        .replace(/\swidth="[^"]*"/g, '')
        .replace(/\sheight="[^"]*"/g, '');
      // Ensure currentColor and aria-hidden are present.
      if (!/\sfill=/.test(cleaned)) cleaned += ' fill="currentColor"';
      if (!/aria-hidden=/.test(cleaned)) cleaned += ' aria-hidden="true"';
      if (!/\sfocusable=/.test(cleaned)) cleaned += ' focusable="false"';
      return `<svg${cleaned}>`;
    },
  );

  cache.set(name, svg);
  return svg;
}

/** Returns the public URL at which the raw SVG file is also served. */
export function permissionIconURL(name: string): string {
  return `/icons/permissions/${name}.svg`;
}
