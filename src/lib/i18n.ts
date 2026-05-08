import type {
  AssetFile,
  LocaleInfo,
  LocalizedAsset,
  LocalizedAssetList,
  LocalizedText,
} from './types.ts';

// Native names for the locales we expect to encounter in publication-format
// documents. The list is intentionally permissive — anything not present here
// just falls back to the locale code itself.
const LOCALE_NAMES: Record<string, { native: string; english: string; rtl?: boolean }> = {
  ar: { native: 'العربية', english: 'Arabic', rtl: true },
  'ar-SA': { native: 'العربية', english: 'Arabic (Saudi Arabia)', rtl: true },
  bn: { native: 'বাংলা', english: 'Bengali' },
  ca: { native: 'Català', english: 'Catalan' },
  cs: { native: 'Čeština', english: 'Czech' },
  da: { native: 'Dansk', english: 'Danish' },
  de: { native: 'Deutsch', english: 'German' },
  'de-DE': { native: 'Deutsch', english: 'German' },
  el: { native: 'Ελληνικά', english: 'Greek' },
  en: { native: 'English', english: 'English' },
  'en-GB': { native: 'English (UK)', english: 'English (UK)' },
  'en-US': { native: 'English (US)', english: 'English (US)' },
  es: { native: 'Español', english: 'Spanish' },
  'es-ES': { native: 'Español', english: 'Spanish (Spain)' },
  'es-MX': { native: 'Español (México)', english: 'Spanish (Mexico)' },
  fa: { native: 'فارسی', english: 'Persian', rtl: true },
  fi: { native: 'Suomi', english: 'Finnish' },
  fr: { native: 'Français', english: 'French' },
  'fr-FR': { native: 'Français', english: 'French' },
  he: { native: 'עברית', english: 'Hebrew', rtl: true },
  hi: { native: 'हिन्दी', english: 'Hindi' },
  'hi-IN': { native: 'हिन्दी', english: 'Hindi' },
  hu: { native: 'Magyar', english: 'Hungarian' },
  id: { native: 'Bahasa Indonesia', english: 'Indonesian' },
  it: { native: 'Italiano', english: 'Italian' },
  'it-IT': { native: 'Italiano', english: 'Italian' },
  ja: { native: '日本語', english: 'Japanese' },
  'ja-JP': { native: '日本語', english: 'Japanese' },
  ko: { native: '한국어', english: 'Korean' },
  'ko-KR': { native: '한국어', english: 'Korean' },
  nl: { native: 'Nederlands', english: 'Dutch' },
  no: { native: 'Norsk', english: 'Norwegian' },
  pl: { native: 'Polski', english: 'Polish' },
  pt: { native: 'Português', english: 'Portuguese' },
  'pt-BR': { native: 'Português (Brasil)', english: 'Portuguese (Brazil)' },
  'pt-PT': { native: 'Português (Portugal)', english: 'Portuguese (Portugal)' },
  ro: { native: 'Română', english: 'Romanian' },
  ru: { native: 'Русский', english: 'Russian' },
  'ru-RU': { native: 'Русский', english: 'Russian' },
  sv: { native: 'Svenska', english: 'Swedish' },
  th: { native: 'ไทย', english: 'Thai' },
  tr: { native: 'Türkçe', english: 'Turkish' },
  uk: { native: 'Українська', english: 'Ukrainian' },
  vi: { native: 'Tiếng Việt', english: 'Vietnamese' },
  zh: { native: '中文', english: 'Chinese' },
  'zh-CN': { native: '简体中文', english: 'Chinese (Simplified)' },
  'zh-Hans': { native: '简体中文', english: 'Chinese (Simplified)' },
  'zh-Hant': { native: '繁體中文', english: 'Chinese (Traditional)' },
  'zh-TW': { native: '繁體中文', english: 'Chinese (Traditional)' },
};

/** Strip the region tag, e.g. "de-DE" → "de". */
export function languageOf(code: string): string {
  const dash = code.indexOf('-');
  return dash === -1 ? code : code.slice(0, dash);
}

/**
 * Generic locale-fallback resolver: exact → language-only → other regional
 * variant of the same language → en-US → en → first available.
 */
function resolveLocaleKey<V>(
  map: Record<string, V>,
  preferred: string,
): { value: V | undefined; localeUsed: string | undefined } {
  if (preferred in map) return { value: map[preferred], localeUsed: preferred };
  const lang = languageOf(preferred);
  if (lang !== preferred && lang in map) {
    return { value: map[lang], localeUsed: lang };
  }
  for (const k of Object.keys(map)) {
    if (languageOf(k) === lang) return { value: map[k], localeUsed: k };
  }
  if ('en-US' in map) return { value: map['en-US'], localeUsed: 'en-US' };
  if ('en' in map) return { value: map['en'], localeUsed: 'en' };
  const first = Object.keys(map)[0];
  if (first) return { value: map[first], localeUsed: first };
  return { value: undefined, localeUsed: undefined };
}

/**
 * Localized text fields in appindex.json may be either a localized map (object
 * keyed by locale) or, where the spec permits, a plain scalar string. We
 * accept both for ergonomic reasons.
 */
export function pickText(
  source: LocalizedText | string | undefined,
  preferred: string,
): { value: string | undefined; localeUsed: string | undefined } {
  if (source == null) return { value: undefined, localeUsed: undefined };
  if (typeof source === 'string') return { value: source, localeUsed: undefined };
  return resolveLocaleKey(source, preferred);
}

/** Same as pickText, but for localized maps of single assets. */
export function pickAsset(
  source: LocalizedAsset | undefined,
  preferred: string,
): { value: AssetFile | undefined; localeUsed: string | undefined } {
  if (source == null) return { value: undefined, localeUsed: undefined };
  return resolveLocaleKey<AssetFile>(source, preferred);
}

/** Same as pickText, but for localized lists of assets. */
export function pickAssetList(
  source: LocalizedAssetList | undefined,
  preferred: string,
): { value: AssetFile[] | undefined; localeUsed: string | undefined } {
  if (source == null) return { value: undefined, localeUsed: undefined };
  return resolveLocaleKey<AssetFile[]>(source, preferred);
}

/**
 * Display info for a locale code. The `href` always points to the locale's
 * own subpath (e.g. /en/, /ja/), even for the default locale: this lets the
 * bare / route function as a browser-language auto-detector that doesn't
 * loop back on itself when a user opts to view the default locale via the
 * picker.
 */
export function localeInfo(code: string, _defaultLocale: string): LocaleInfo {
  const meta = LOCALE_NAMES[code] ?? LOCALE_NAMES[languageOf(code)] ?? null;
  const native = meta?.native ?? code;
  const english = meta?.english ?? code;
  const rtl = !!meta?.rtl;
  const href = `/${code}/`;
  return { code, nativeName: native, englishName: english, rtl, href };
}

/**
 * Locale codes the template ships a store badge for, mirroring the
 * canonical destinations of skipstone's normalizeLocaleApple() and
 * normalizeLocaleGoogle() (Sources/SkipBuild/Commands/MetaCommand.swift).
 * Keep these sets in lockstep with scripts/download-badges.mjs.
 */
const APPLE_BADGE_LOCALES = new Set([
  'ar', 'ca', 'cs', 'da', 'de', 'el',
  'en', 'en-AU', 'en-CA', 'en-GB',
  'es', 'es-MX', 'fi', 'fr', 'fr-CA',
  'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'ms', 'nl', 'no',
  'pl', 'pt', 'pt-BR', 'ro', 'ru', 'sk', 'sv', 'th', 'tr', 'uk', 'vi',
  'zh-Hans', 'zh-Hant',
]);

const GOOGLE_BADGE_LOCALES = new Set([
  'af', 'am', 'ar', 'az', 'be', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el',
  'en', 'en-AU', 'en-CA', 'en-GB', 'en-IN', 'en-SG', 'en-ZA',
  'es', 'es-419', 'es-US', 'et', 'eu', 'fa', 'fi', 'fil',
  'fr', 'fr-CA', 'gl', 'gu', 'he', 'hi', 'hr', 'hu', 'hy',
  'id', 'is', 'it', 'ja', 'ka', 'kk', 'km', 'kn', 'ko', 'ky',
  'lo', 'lt', 'lv', 'mk', 'ml', 'mn', 'mr', 'ms', 'my', 'ne', 'nl', 'no',
  'pa', 'pl', 'pt', 'pt-BR', 'rm', 'ro', 'ru',
  'si', 'sk', 'sl', 'sq', 'sr', 'sv', 'sw',
  'ta', 'te', 'th', 'tr', 'uk', 'ur', 'vi',
  'zh-Hans', 'zh-Hant',
]);

/**
 * Resolve a locale to one for which `<store>` has a localized badge.
 * Walks exact → language-only → "en", so per-locale
 * /badges/<code>/<store>.svg URLs never 404.
 */
export function badgeLocale(code: string, store: 'apple' | 'google'): string {
  const set = store === 'apple' ? APPLE_BADGE_LOCALES : GOOGLE_BADGE_LOCALES;
  if (set.has(code)) return code;
  const lang = languageOf(code);
  if (set.has(lang)) return lang;
  return 'en';
}

/**
 * Sort locales: default first, then alphabetically by English name. This keeps
 * the language picker stable across builds.
 */
export function sortLocales(codes: string[], defaultLocale: string): string[] {
  const dedup = Array.from(new Set(codes));
  return dedup.sort((a, b) => {
    if (a === defaultLocale) return -1;
    if (b === defaultLocale) return 1;
    const an = LOCALE_NAMES[a]?.english ?? a;
    const bn = LOCALE_NAMES[b]?.english ?? b;
    return an.localeCompare(bn);
  });
}
