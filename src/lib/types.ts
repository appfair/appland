// Shape of site/siteinfo.yaml.
export interface SiteInfo {
  title: string;
  host: string;
  appindex: string;
  tagline?: string;
  accentColor?: string;
  defaultTheme?: 'light' | 'dark' | 'system';
  defaultPlatform?: 'ios' | 'android';
  showSourceLink?: boolean;
  showStoreBadges?: boolean;
  showPermissions?: boolean;
  showDependencyCount?: boolean;
  footer?: string;
  analyticsScript?: string;
  analyticsDomain?: string;
  socialImage?: string;
}

// Subset of the appindex.json fields actually used at render time.
export interface AppIndex {
  $schema?: string;
  specVersion?: string;
  generated?: string;
  generator?: string;
  apps: AppEntry[];
}

export interface AppEntry {
  name: string;
  source?: { url?: string; release?: string; assets?: string; license?: string };
  /**
   * App-level localized URLs for ancillary pages. Conventional keys are
   * "privacy" and "support"; consumers may render others if present.
   */
  links?: Record<string, LocalizedText>;
  /** Shared localized fields — promoted from platforms when identical. */
  title?: LocalizedText;
  subtitle?: LocalizedText;
  description?: LocalizedText;
  keywords?: LocalizedKeywords;
  releaseNotes?: LocalizedText;
  platforms: { ios?: PlatformEntry; android?: PlatformEntry };
}

/**
 * One entry under PlatformEntry.distributions. The conventional store keys
 * are "appleappstore" and "googleplaystore"; future-friendly callers should
 * be prepared for keys like "fdroid", "testflight", "amazonappstore", etc.
 */
export interface DistributionEntry {
  id?: string;
  url?: string;
}

export interface PlatformEntry {
  platform?: string;
  version?: string;
  buildNumber?: string;
  // iOS-specific
  bundleIdentifier?: string;
  // Android-specific
  applicationId?: string;
  /** Per-store distribution channels. */
  channels?: Record<string, DistributionEntry>;
  // Localized fields (may be overrides of app-level values)
  title?: LocalizedText;
  subtitle?: LocalizedText;
  description?: LocalizedText;
  keywords?: LocalizedKeywords;
  releaseNotes?: LocalizedText;
  /** Image assets: icon, screenshots, featureGraphic. */
  assets?: {
    icon?: AssetFile;
    featureGraphic?: LocalizedAsset;
    screenshots?: LocalizedAssetList;
  };
  permissions?: PermissionEntry[];
  /** Platform-specific configuration (manifest, entitlements, infoPlist). */
  metadata?: {
    manifest?: { features?: ManifestFeature[]; label?: string; name?: string };
    entitlements?: Record<string, unknown>;
    infoPlist?: Record<string, unknown>;
  };
  sbom?: SBOM;
}

export type LocalizedText = Record<string, string>;
export type LocalizedKeywords = Record<string, string[]>;
export type LocalizedAsset = Record<string, AssetFile>;
export type LocalizedAssetList = Record<string, AssetFile[]>;

export interface AssetFile {
  digest?: string;
  hash?: string;
  size?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  location?: string;
}

export interface PermissionEntry {
  key: string;
  description?: LocalizedText;
}

export interface ManifestFeature {
  name: string;
  required?: string | boolean;
}

export interface SBOM {
  packages?: Array<{
    name?: string;
    versionInfo?: string;
    licenseConcluded?: string;
    licenseDeclared?: string;
  }>;
}

// Render-time view models ─────────────────────────────────────────────────────

export interface LocaleInfo {
  /** Canonical locale code as it appears in the appindex (e.g. "en-US"). */
  code: string;
  /** Native-language name of the locale, e.g. "Deutsch". */
  nativeName: string;
  /** English name, e.g. "German". */
  englishName: string;
  /** Text direction; true if right-to-left. */
  rtl: boolean;
  /** Locale's index path: always "/{code}/". */
  href: string;
}

/**
 * Like LocaleInfo, but with a page-specific href used by the language
 * picker on a sub-page (e.g. /{code}/apps/{slug}/).
 */
export interface LocaleLink extends LocaleInfo {
  href: string;
}

export interface PlatformView {
  id: 'ios' | 'android';
  displayName: string;
  version?: string;
  buildNumber?: string;
  storeURL?: string;
  storeBadge?: 'apple-app-store' | 'google-play-store';
  title: string;
  subtitle: string;
  description: string;
  releaseNotes?: string;
  iconURL?: string;
  featureGraphicURL?: string;
  screenshots: AssetView[];
  permissions: PermissionView[];
  privacyURL?: string;
  supportURL?: string;
  dependencyCount: number;
  rawTitleLocaleUsed: string;
  rawDescriptionLocaleUsed: string;
}

export interface AssetView {
  url: string;
  width?: number;
  height?: number;
  alt: string;
}

export interface PermissionView {
  key: string;
  /** Friendly category name. */
  label: string;
  /** Localized rationale, if available. */
  description?: string;
  /** Heuristic sensitivity tier for ordering and styling. */
  sensitivity: 'high' | 'medium' | 'low';
  /** Material Symbols icon name; the SVG lives at /icons/permissions/{icon}.svg. */
  icon: string;
}

export interface AppView {
  app: AppEntry;
  /** URL-safe identifier (the appindex `name` field, e.g. "Net-Skip"). */
  slug: string;
  defaultLocale: string;
  locales: LocaleInfo[];
  platforms: ('ios' | 'android')[];
  /** Built once per (locale, platform) pair. */
  view: (locale: string, platform: 'ios' | 'android') => PlatformView | null;
  /** Localized hero copy that doesn't depend on the platform picker. */
  hero: (locale: string) => HeroView;
  /** Returns a useful absolute URL for the source repository, if known. */
  sourceURL?: string;
  releaseURL?: string;
  /** A reasonable social-card image URL (feature graphic, or icon). */
  socialImage?: string;
  /** Site-root-relative URLs for the auto-generated favicon set. */
  favicons?: FaviconPaths;
}

/**
 * Top-level site data. In single-app mode `apps.length === 1` and the
 * landing pages render that one app directly. In multi-app mode the locale
 * roots render a list of apps and each app gets its own sub-route.
 */
export interface SiteData {
  site: SiteInfo;
  /** Union of locales across every app (or the single app's locales). */
  locales: LocaleInfo[];
  defaultLocale: string;
  apps: AppView[];
  multiApp: boolean;
  /** Site-wide social-card image (used on the multi-app index). */
  socialImage?: string;
  /** Site-wide favicon set (used on the multi-app index). */
  favicons?: FaviconPaths;
}

export interface FaviconPaths {
  icon: string;
  appleTouchIcon: string;
  pwaIcon192: string;
  pwaIcon512: string;
}

export interface HeroView {
  title: string;
  subtitle: string;
  description: string;
  iconURL?: string;
  featureGraphicURL?: string;
}
