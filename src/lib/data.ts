import { readFile } from 'node:fs/promises';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

import type {
  AppEntry,
  AppIndex,
  AppView,
  AssetView,
  FaviconPaths,
  HeroView,
  LocaleInfo,
  PermissionView,
  PlatformEntry,
  PlatformView,
  SiteData,
  SiteInfo,
} from './types.ts';
import { localeInfo, pickAsset, pickAssetList, pickText, sortLocales } from './i18n.ts';
import { describePermission, shouldHideAndroidPermission, sortPermissions } from './permissions.ts';
import { lookupAndroidDescription, lookupPermissionLabel } from './permission-descriptions.ts';
import { generateFavicons } from './favicon.ts';

const FALLBACK_DEFAULT_LOCALE = 'en-US';

/** Resolve `site/siteinfo.yaml` location starting from the appland project root. */
function projectRoot(): string {
  // This module lives at <repo>/site/appland/src/lib/data.ts.
  // The Astro build runs with cwd at <repo>/site/appland.
  const here = dirname(fileURLToPath(import.meta.url));
  return resolve(here, '..', '..');
}

function siteInfoPath(): string {
  return resolve(projectRoot(), '..', 'siteinfo.yaml');
}

export async function loadSiteInfo(): Promise<SiteInfo> {
  const raw = await readFile(siteInfoPath(), 'utf8');
  const parsed = yaml.load(raw) as Partial<SiteInfo> | null;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`siteinfo.yaml at ${siteInfoPath()} is empty or invalid`);
  }
  if (!parsed.title) throw new Error('siteinfo.yaml: "title" is required');
  if (!parsed.host) throw new Error('siteinfo.yaml: "host" is required');
  if (!parsed.appindex) throw new Error('siteinfo.yaml: "appindex" is required');
  // The default footer interpolates the title — pull a usable string
  // out even when title is a locale-keyed map.
  const titleString =
    typeof parsed.title === 'string'
      ? parsed.title
      : ((parsed.title as Record<string, string>)['en-US'] ??
        (parsed.title as Record<string, string>)['en'] ??
        Object.values(parsed.title as Record<string, string>)[0] ??
        '');
  return {
    showSourceLink: true,
    showStoreBadges: true,
    showPermissions: true,
    showDependencyCount: true,
    defaultTheme: 'system',
    defaultPlatform: 'ios',
    accentColor: '#3B82F6',
    footer: `© {year} ${titleString}`,
    ...parsed,
  } as SiteInfo;
}

export async function loadAppIndex(siteInfo: SiteInfo): Promise<AppIndex> {
  const ref = siteInfo.appindex;
  const baseDir = dirname(siteInfoPath());
  const path = isAbsolute(ref) ? ref : resolve(baseDir, ref);
  const raw = await readFile(path, 'utf8');
  const parsed = JSON.parse(raw) as AppIndex;
  if (!parsed.apps || !parsed.apps.length) {
    throw new Error(`appindex.json at ${path} contains no apps`);
  }
  return parsed;
}

// Asset URL resolution ────────────────────────────────────────────────────────

function resolveAssetURL(
  location: string | undefined,
  app: AppEntry,
): string | undefined {
  if (!location) return undefined;
  if (/^https?:\/\//i.test(location)) return location;
  const base = app.source?.assets;
  if (!base) {
    return location.startsWith('/') ? location : `/${location}`;
  }
  const trimmedBase = base.endsWith('/') ? base : `${base}/`;
  const trimmedLoc = location.startsWith('/') ? location.slice(1) : location;
  return trimmedBase + trimmedLoc;
}

// Locale collection ──────────────────────────────────────────────────────────

function collectLocales(app: AppEntry): string[] {
  const seen = new Set<string>();
  const visit = (obj: Record<string, unknown> | undefined) => {
    if (!obj) return;
    for (const k of Object.keys(obj)) seen.add(k);
  };
  // Collect from app-level promoted fields
  for (const fld of ['title', 'subtitle', 'description', 'keywords', 'releaseNotes'] as const) {
    const v = app[fld];
    if (v && typeof v === 'object') visit(v as Record<string, unknown>);
  }
  // Collect from per-platform fields
  for (const platform of [app.platforms.ios, app.platforms.android]) {
    if (!platform) continue;
    for (const fld of ['title', 'subtitle', 'description', 'keywords', 'releaseNotes'] as const) {
      const v = platform[fld];
      if (v && typeof v === 'object') visit(v as Record<string, unknown>);
    }
    visit(platform.assets?.featureGraphic as Record<string, unknown> | undefined);
    visit(platform.assets?.screenshots as Record<string, unknown> | undefined);
    if (platform.permissions) {
      for (const p of platform.permissions) {
        if (p.description) visit(p.description);
      }
    }
  }
  return Array.from(seen);
}

function pickDefaultLocale(locales: string[]): string {
  if (locales.includes('en-US')) return 'en-US';
  if (locales.includes('en')) return 'en';
  return locales[0]!;
}

// Per-platform view ──────────────────────────────────────────────────────────

function buildPlatformView(
  app: AppEntry,
  platform: PlatformEntry,
  platformId: string,
  locale: string,
  defaultLocale: string,
): PlatformView {

  // Localized fields: platform overrides app-level
  const title = pickText(platform.title ?? app.title, locale);
  const subtitle = pickText(platform.subtitle ?? app.subtitle, locale);
  const description = pickText(platform.description ?? app.description, locale);
  const releaseNotes = pickText(platform.releaseNotes ?? app.releaseNotes, locale);

  // Assets are now in platform.assets
  const iconURL = resolveAssetURL(platform.assets?.icon?.location, app);

  const fg = pickAsset(platform.assets?.featureGraphic, locale);
  const featureGraphicURL = resolveAssetURL(fg.value?.location, app);

  const ssRequested = pickAssetList(platform.assets?.screenshots, locale);
  const ssFallback = ssRequested.value
    ? ssRequested
    : pickAssetList(platform.assets?.screenshots, defaultLocale);
  const screenshotsList = ssFallback.value ?? [];
  const screenshotsLocale = ssFallback.localeUsed ?? locale;
  const screenshots: AssetView[] = screenshotsList.map((s, i) => ({
    url: resolveAssetURL(s.location, app) ?? '',
    width: s.width,
    height: s.height,
    alt: `${title.value ?? app.name} screenshot ${i + 1} (${screenshotsLocale})`,
  }));

  // Permissions: filter Android plumbing, attach localized descriptions.
  const permissions: PermissionView[] = [];
  if (platform.permissions) {
    for (const p of platform.permissions) {
      if (platformId === 'android' && shouldHideAndroidPermission(p.key)) continue;
      let desc = pickText(p.description, locale).value;
      if (!desc && platformId === 'android') {
        desc = lookupAndroidDescription(p.key, locale);
      }
      const view = describePermission(p.key, platformId, desc);
      view.label = lookupPermissionLabel(view.label, locale);
      permissions.push(view);
    }
  }
  const sortedPerms = sortPermissions(permissions);

  const privacyURL = pickText(app.links?.['privacy'], locale).value;
  const supportURL = pickText(app.links?.['support'], locale).value;

  const dists = platform.channels ?? {};
  let storeURL: string | undefined;
  let storeBadge: PlatformView['storeBadge'];
  const apple = dists['appleappstore'];
  const google = dists['googleplaystore'];
  if (platformId === 'ios' && apple?.url) {
    storeURL = apple.url;
    storeBadge = 'apple-app-store';
  } else if (platformId === 'android' && google?.url) {
    storeURL = google.url;
    storeBadge = 'google-play-store';
  } else {
    const anyDist = Object.values(dists).find((d) => !!d?.url);
    if (anyDist?.url) storeURL = anyDist.url;
  }

  return {
    id: platformId,
    displayName: platformId === 'ios' ? 'iPhone' : 'Android',
    version: platform.version,
    buildNumber: platform.buildNumber,
    storeURL,
    storeBadge,
    title: title.value ?? app.name,
    subtitle: subtitle.value ?? '',
    description: description.value ?? '',
    releaseNotes: releaseNotes.value,
    iconURL,
    featureGraphicURL,
    screenshots,
    permissions: sortedPerms,
    privacyURL,
    supportURL,
    dependencyCount: countSbomDependencies(platform),
    rawTitleLocaleUsed: title.localeUsed ?? locale,
    rawDescriptionLocaleUsed: description.localeUsed ?? locale,
  };
}

function countSbomDependencies(platform: PlatformEntry): number {
  const pkgs = platform.sbom?.packages;
  if (!pkgs) return 0;
  return pkgs.filter((p) => {
    const v = p.versionInfo ?? '';
    return v && v !== 'source';
  }).length;
}

// Per-app view ────────────────────────────────────────────────────────────────

interface BuildAppViewOpts {
  /** Locale list shared across the whole site (union over apps in multi-app mode). */
  locales: LocaleInfo[];
  defaultLocale: string;
  /** True when generating favicons for this app (skipped for non-primary apps in multi-app mode). */
  generateAppFavicons: boolean;
}

async function buildAppView(
  app: AppEntry,
  opts: BuildAppViewOpts,
): Promise<AppView> {
  const platformIds: ('ios' | 'android')[] = [];
  if (app.platforms.ios) platformIds.push('ios');
  if (app.platforms.android) platformIds.push('android');

  const view = (locale: string, platform: 'ios' | 'android'): PlatformView | null => {
    const p = app.platforms[platform];
    if (!p) return null;
    return buildPlatformView(app, p, platform, locale, opts.defaultLocale);
  };

  const hero = (locale: string): HeroView => {
    const primary = app.platforms.ios ?? app.platforms.android!;
    const title = pickText(app.title ?? primary.title, locale).value ?? app.name;
    const subtitle = pickText(app.subtitle ?? primary.subtitle, locale).value ?? '';
    const description = pickText(app.description ?? primary.description, locale).value ?? '';
    const iconURL = resolveAssetURL(primary.assets?.icon?.location, app);
    const fg = pickAsset(primary.assets?.featureGraphic, locale);
    const featureGraphicURL = resolveAssetURL(fg.value?.location, app);
    return { title, subtitle, description, iconURL, featureGraphicURL };
  };

  // Social card image: explicit override (site-level) is handled outside.
  let socialImage: string | undefined;
  if (app.platforms.android?.assets?.featureGraphic) {
    const fg = pickAsset(app.platforms.android.assets.featureGraphic, opts.defaultLocale);
    socialImage = resolveAssetURL(fg.value?.location, app);
  }
  if (!socialImage) {
    socialImage = resolveAssetURL(
      (app.platforms.ios ?? app.platforms.android)?.assets?.icon?.location,
      app,
    );
  }

  let favicons: AppView['favicons'];
  if (opts.generateAppFavicons) {
    const iconSource =
      resolveAssetURL(app.platforms.ios?.assets?.icon?.location, app) ??
      resolveAssetURL(app.platforms.android?.assets?.icon?.location, app);
    if (iconSource) {
      try {
        favicons = await generateFavicons({
          iconSource,
          projectRoot: projectRoot(),
        });
      } catch (err) {
        console.warn(
          `[appland] favicon generation failed for ${app.name} (${(err as Error).message})`,
        );
      }
    }
  }

  return {
    app,
    slug: app.name,
    defaultLocale: opts.defaultLocale,
    locales: opts.locales,
    platforms: platformIds,
    view,
    hero,
    sourceURL: app.source?.url,
    releaseURL: app.source?.release,
    socialImage,
    favicons,
  };
}

// Public entry point ─────────────────────────────────────────────────────────

export interface LoadedSite extends SiteData {
  /**
   * Convenience accessor that returns the first (and, in single-app mode,
   * only) AppView. Existing single-app callers use this in place of the old
   * top-level `appView` field.
   */
  appView: AppView;
}

let cached: LoadedSite | undefined;

export async function loadSite(): Promise<LoadedSite> {
  if (cached) return cached;
  const site = await loadSiteInfo();
  const index = await loadAppIndex(site);

  // Locale union across every app in the index
  const localeUnion = new Set<string>();
  for (const app of index.apps) {
    for (const c of collectLocales(app)) localeUnion.add(c);
  }
  if (localeUnion.size === 0) localeUnion.add(FALLBACK_DEFAULT_LOCALE);

  const localesRaw = Array.from(localeUnion);
  const defaultLocale = pickDefaultLocale(localesRaw);
  const orderedCodes = sortLocales(localesRaw, defaultLocale);
  const locales: LocaleInfo[] = orderedCodes.map((c) => localeInfo(c, defaultLocale));

  const multiApp = index.apps.length > 1;

  const apps: AppView[] = [];
  for (let i = 0; i < index.apps.length; i++) {
    const app = index.apps[i]!;
    apps.push(
      await buildAppView(app, {
        locales,
        defaultLocale,
        // Single-app: generate favicons from the app's icon (existing behaviour).
        // Multi-app: site-level favicons are produced separately below.
        generateAppFavicons: !multiApp,
      }),
    );
  }

  // Site-level social image / favicons
  let siteSocialImage = site.socialImage;
  if (!siteSocialImage) {
    siteSocialImage = apps[0]?.socialImage;
  }

  let siteFavicons: FaviconPaths | undefined;
  if (multiApp) {
    // Use the first app's icon as the site favicon source for now. The
    // aggregate site can override by placing files under public/.
    const firstApp = apps[0];
    const iconSource = firstApp
      ? resolveAssetURL(
          firstApp.app.platforms.ios?.assets?.icon?.location ??
            firstApp.app.platforms.android?.assets?.icon?.location,
          firstApp.app,
        )
      : undefined;
    if (iconSource) {
      try {
        siteFavicons = await generateFavicons({
          iconSource,
          projectRoot: projectRoot(),
        });
      } catch (err) {
        console.warn(
          `[appland] site favicon generation failed (${(err as Error).message})`,
        );
      }
    }
  } else {
    siteFavicons = apps[0]?.favicons;
  }

  cached = {
    site,
    locales,
    defaultLocale,
    apps,
    multiApp,
    socialImage: siteSocialImage,
    favicons: siteFavicons,
    appView: apps[0]!,
  };
  return cached;
}

export { resolveAssetURL };
