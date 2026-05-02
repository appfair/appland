import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Jimp } from 'jimp';

/**
 * Build-time favicon generation.
 *
 * Downloads the app's primary icon (from appindex.json), applies a soft
 * iOS-style rounded-corner mask, and emits PNGs at the standard favicon /
 * apple-touch-icon / PWA-manifest sizes into public/_generated/favicons/.
 *
 * Astro copies anything under public/ into the build output as-is, so the
 * generated images are also served at /_generated/favicons/* in dev.
 *
 * The function is idempotent: if the source icon's bytes haven't changed
 * since the last run, regeneration is skipped (a small JSON sidecar tracks
 * the last-seen source hash). This keeps repeat builds fast.
 */

// Public-facing path, relative to the site root. Layout.astro consumes these.
export interface FaviconPaths {
  /** Generic favicon used in <link rel="icon">. */
  icon: string;
  /** Apple-touch-icon (180×180) for iOS home screens. */
  appleTouchIcon: string;
  /** PWA-manifest icon, 192×192. */
  pwaIcon192: string;
  /** PWA-manifest icon, 512×512. */
  pwaIcon512: string;
}

const OUTPUT_SUBDIR = '_generated/favicons';
const STAMP_FILE = '.source-hash.json';

// iOS / Android squircle approximation. ~22.37% of edge.
const CORNER_RADIUS_RATIO = 0.2237;

interface GenerateOptions {
  /** Source icon — http(s) URL or absolute local file path. */
  iconSource: string;
  /** Project root that contains public/. */
  projectRoot: string;
}

function publicIconsDir(projectRoot: string): string {
  return resolve(projectRoot, 'public', OUTPUT_SUBDIR);
}

const TARGETS: ReadonlyArray<{ name: string; size: number; key: keyof FaviconPaths }> = [
  // Modern browsers prefer a single multi-resolution PNG; we ship 64 as the
  // default <link rel="icon"> target.
  { name: 'favicon-64.png', size: 64, key: 'icon' },
  { name: 'favicon-32.png', size: 32, key: 'icon' }, // Same key — last write wins; we use 64.
  { name: 'apple-touch-icon.png', size: 180, key: 'appleTouchIcon' },
  { name: 'icon-192.png', size: 192, key: 'pwaIcon192' },
  { name: 'icon-512.png', size: 512, key: 'pwaIcon512' },
];

/** Fetch the source bytes (URL or local file). */
async function loadSourceBytes(source: string): Promise<Buffer> {
  if (/^https?:\/\//i.test(source)) {
    const r = await fetch(source);
    if (!r.ok) {
      throw new Error(`favicon source HTTP ${r.status}: ${source}`);
    }
    return Buffer.from(await r.arrayBuffer());
  }
  if (!isAbsolute(source)) {
    throw new Error(`favicon source must be absolute path or http(s) URL: ${source}`);
  }
  return readFile(source);
}

/** Short hex digest used to detect when the source icon's bytes have changed. */
function shortHash(buf: Buffer): string {
  return createHash('sha256').update(buf).digest('hex').slice(0, 24);
}

/**
 * Apply a rounded-corner mask to a Jimp image in-place. Anti-aliased on the
 * curve so the edges look soft at small sizes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyRoundedCorners(img: any): void {
  const w = img.bitmap.width;
  const h = img.bitmap.height;
  const r = Math.round(Math.min(w, h) * CORNER_RADIUS_RATIO);
  // Coverage falloff width in pixels — 1.5 produces soft AA without blurring.
  const aaWidth = 1.5;

  // Distance from a pixel center to the nearest corner center, given that the
  // rounded rectangle's corner-circle centers sit (r,r) inset from each edge.
  function alphaCoverage(x: number, y: number): number {
    // Find which corner region the pixel is in (or none — interior).
    let cx: number | null = null;
    let cy: number | null = null;
    if (x < r && y < r) {
      cx = r;
      cy = r;
    } else if (x >= w - r && y < r) {
      cx = w - r - 1;
      cy = r;
    } else if (x < r && y >= h - r) {
      cx = r;
      cy = h - r - 1;
    } else if (x >= w - r && y >= h - r) {
      cx = w - r - 1;
      cy = h - r - 1;
    }
    if (cx === null || cy === null) return 1;
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= r - aaWidth) return 1;
    if (dist >= r) return 0;
    // Linear falloff in the AA band.
    return (r - dist) / aaWidth;
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const cov = alphaCoverage(x, y);
      if (cov >= 1) continue;
      const idx = (y * w + x) * 4;
      const a = img.bitmap.data[idx + 3]!;
      img.bitmap.data[idx + 3] = Math.round(a * cov);
    }
  }
}

async function ensureDir(p: string): Promise<void> {
  await mkdir(p, { recursive: true });
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function readStamp(stampPath: string): Promise<string | null> {
  try {
    const raw = await readFile(stampPath, 'utf8');
    const parsed = JSON.parse(raw) as { hash?: string };
    return parsed.hash ?? null;
  } catch {
    return null;
  }
}

async function writeStamp(stampPath: string, hash: string): Promise<void> {
  await writeFile(stampPath, JSON.stringify({ hash }, null, 2));
}

export async function generateFavicons({
  iconSource,
  projectRoot,
}: GenerateOptions): Promise<FaviconPaths> {
  const outDir = publicIconsDir(projectRoot);
  const stampPath = resolve(outDir, STAMP_FILE);

  // Always-resolved public paths returned to the caller.
  const paths: FaviconPaths = {
    icon: `/${OUTPUT_SUBDIR}/favicon-64.png`,
    appleTouchIcon: `/${OUTPUT_SUBDIR}/apple-touch-icon.png`,
    pwaIcon192: `/${OUTPUT_SUBDIR}/icon-192.png`,
    pwaIcon512: `/${OUTPUT_SUBDIR}/icon-512.png`,
  };

  let sourceBytes: Buffer;
  try {
    sourceBytes = await loadSourceBytes(iconSource);
  } catch (err) {
    // The build must not fail just because the icon source is unreachable
    // (offline build, transient HTTP error, etc.). Skip generation if files
    // already exist; warn otherwise.
    const have = await fileExists(resolve(outDir, 'favicon-64.png'));
    if (have) return paths;
    console.warn(
      `[favicon] could not fetch ${iconSource}: ${(err as Error).message}. ` +
        'Skipping favicon generation.',
    );
    return paths;
  }

  await ensureDir(outDir);
  const hash = shortHash(sourceBytes);
  const prevHash = await readStamp(stampPath);

  if (prevHash === hash) {
    // Bytes unchanged AND every output exists → fast path.
    const allPresent = await Promise.all(
      TARGETS.map((t) => fileExists(resolve(outDir, t.name))),
    );
    if (allPresent.every(Boolean)) return paths;
  }

  // Re-decode for each target. PNG decode is fast and avoids working around
  // Jimp's clone() typings, which differ slightly across @jimp/* sub-packages.
  for (const target of TARGETS) {
    const img = await Jimp.read(sourceBytes);
    img.resize({ w: target.size, h: target.size });
    applyRoundedCorners(img);
    const buf = await img.getBuffer('image/png');
    await writeFile(resolve(outDir, target.name), buf);
  }

  await writeStamp(stampPath, hash);
  return paths;
}

/** Resolve the project root for callers in src/lib/. */
export function applandProjectRoot(metaUrl: string): string {
  // <root>/src/lib/foo.ts → <root>
  const here = dirname(fileURLToPath(metaUrl));
  return resolve(here, '..', '..');
}
