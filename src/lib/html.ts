/**
 * Whitelist-based HTML sanitizer for app descriptions.
 *
 * Google Play permits a small subset of HTML formatting tags inside an
 * app's description and "what's new" text (the most common are <b>, <i>,
 * <u>, <br>, and <a>). The Apple App Store mandates plain text. Authors
 * may publish either, so the renderer needs to:
 *
 *   1. Render whitelisted tags as real markup (so <b>bold</b> looks bold).
 *   2. Escape every other angle bracket so a stray "<3" renders verbatim
 *      and a hostile "<script>" never reaches the DOM.
 *   3. Preserve plain-text newlines as-is — the description container has
 *      `white-space: pre-wrap`, so they'll render as visible line breaks
 *      whether or not the source also uses <br>.
 *
 * The implementation is deliberately small (no third-party HTML parser
 * dependency); it's a regex-driven token splitter, not a real parser, but
 * it suffices for the constrained input the appindex carries.
 */

const ALLOWED_TAGS = new Set([
  'b', 'strong', 'i', 'em', 'u', 'br', 'a',
]);

/** Tags that never carry content. Closing forms are simply discarded. */
const VOID_TAGS = new Set(['br']);

/** URL schemes we'll permit on <a href="…">. Anything else is dropped. */
const SAFE_HREF = /^\s*(https?:|mailto:)/i;

/**
 * Escape "&" that isn't part of an existing entity, plus "<" and ">".
 * Entities already in the input (e.g. "&amp;") survive untouched, so a
 * URL like "?a=1&b=2" won't get double-escaped if the author wrote "&amp;".
 */
function escapeText(s: string): string {
  return s
    .replace(/&(?!(?:[a-zA-Z][a-zA-Z0-9]*|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;');
}

/**
 * Parse an attribute string like ` href="x" target=_blank` into a name→value
 * map. Quoted values support either single or double quotes; unquoted values
 * run to the next whitespace. Names are lowercased; later duplicates win.
 */
function parseAttrs(attrs: string): Map<string, string> {
  const out = new Map<string, string>();
  const re = /([a-zA-Z][a-zA-Z0-9:_-]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(attrs)) !== null) {
    const name = m[1]!.toLowerCase();
    const val = m[2] ?? m[3] ?? m[4] ?? '';
    out.set(name, val);
  }
  return out;
}

/**
 * Sanitize app-description text that may contain a small set of
 * Google-Play-permitted HTML tags. Returns a string suitable for
 * rendering via Astro's `set:html` directive.
 */
export function sanitizeDescription(input: string | undefined | null): string {
  if (!input) return '';

  let out = '';
  let lastIndex = 0;
  // Match anything that looks like an open or close tag. The regex is
  // intentionally permissive — anything that isn't whitelisted gets
  // re-escaped as visible text below.
  const tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
  let match: RegExpExecArray | null;

  while ((match = tagRe.exec(input)) !== null) {
    const [whole, rawName, rawAttrs] = match;
    const before = input.slice(lastIndex, match.index);
    out += escapeText(before);
    lastIndex = match.index + whole.length;

    const name = rawName!.toLowerCase();
    const isClose = whole.startsWith('</');

    if (!ALLOWED_TAGS.has(name)) {
      // Not on the whitelist — render the original characters as visible
      // text rather than silently dropping (so authors notice typos).
      out += escapeText(whole);
      continue;
    }

    if (VOID_TAGS.has(name)) {
      // Both `<br>` and a stray `</br>` collapse to a single line break.
      out += '<br>';
      continue;
    }

    if (isClose) {
      out += `</${name}>`;
      continue;
    }

    if (name === 'a') {
      const attrs = parseAttrs(rawAttrs ?? '');
      const href = (attrs.get('href') ?? '').trim();
      if (href && SAFE_HREF.test(href)) {
        out +=
          `<a href="${escapeAttr(href)}" ` +
          `target="_blank" rel="noopener nofollow">`;
      }
      // Unsafe / missing href: drop the open tag. A later </a> will be
      // emitted by the close branch above; that's a harmless dangling
      // close tag in the output (browsers ignore it).
      continue;
    }

    out += `<${name}>`;
  }
  out += escapeText(input.slice(lastIndex));
  return out;
}
