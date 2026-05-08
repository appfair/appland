#!/usr/bin/env node
/**
 * Download localized App Store and Google Play store badges and write
 * them into public/badges/<canonical-locale>/{apple-app-store,google-play-store}.svg.
 *
 * Sources (mirrors of the officially-distributed badge assets):
 *   - https://github.com/steverichey/google-play-badge-svg/tree/master/img
 *   - https://github.com/ziadsarour/stores-badges/tree/master/appstore/black
 *
 * The destination locale sets exactly mirror the canonical (right-hand)
 * values from skipstone's normalizeLocaleApple() and normalizeLocaleGoogle()
 * tables in MetaCommand.swift. Those are the locales an appindex.json can
 * actually carry, so any other code is unreachable.
 *
 * For every destination locale, the script picks the closest available
 * source badge via:
 *   1. exact-match on the normalized source code,
 *   2. explicit alias (zh-Hans / zh-Hant alignment),
 *   3. language-only match (e.g. de-DE → de),
 *   4. any other regional sibling of the same language,
 *   5. en (final fallback).
 *
 * Usage:
 *   node scripts/download-badges.mjs
 */

import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(HERE, '..');
const OUTPUT_ROOT = resolve(PROJECT_ROOT, 'public', 'badges');

// ─── Canonical destination locales ───────────────────────────────────────────
// Mirror of the unique values produced by skipstone's normalizeLocaleApple()
// and normalizeLocaleGoogle() (Sources/SkipBuild/Commands/MetaCommand.swift).
// Keep these arrays in lockstep with that file.

const APPLE_DESTINATIONS = [
  'ar', 'ca', 'cs', 'da', 'de', 'el',
  'en', 'en-AU', 'en-CA', 'en-GB',
  'es', 'es-MX', 'fi', 'fr', 'fr-CA',
  'he', 'hi', 'hr', 'hu', 'id', 'it', 'ja', 'ko', 'ms', 'nl', 'no',
  'pl', 'pt', 'pt-BR', 'ro', 'ru', 'sk', 'sv', 'th', 'tr', 'uk', 'vi',
  'zh-Hans', 'zh-Hant',
];

const GOOGLE_DESTINATIONS = [
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
];

// ─── Source descriptors ──────────────────────────────────────────────────────

const GOOGLE_SOURCE = {
  badgeName: 'google-play-store.svg',
  rawBase: 'https://raw.githubusercontent.com/steverichey/google-play-badge-svg/master/img',
  apiList: 'repos/steverichey/google-play-badge-svg/contents/img',
  destinations: GOOGLE_DESTINATIONS,
  parseFilename(name) {
    const m = name.match(/^(.+)_get\.svg$/);
    if (!m) return null;
    const code = m[1];
    const remap = {
      iw: 'he',          // Hebrew, legacy ISO 639-1
      ua: 'uk',          // Ukrainian, occasionally written "ua"
      'es-419': 'es-419',
      'pt-br': 'pt-BR',
      'fr-ca': 'fr-CA',
      'zh-cn': 'zh-Hans',
      'zh-hk': 'zh-Hant',
      'zh-tw': 'zh-Hant',
    };
    return remap[code] ?? code;
  },
  aliases: {},
};

const APPLE_SOURCE = {
  badgeName: 'apple-app-store.svg',
  rawBase: 'https://raw.githubusercontent.com/ziadsarour/stores-badges/master/appstore/black',
  apiList: 'repos/ziadsarour/stores-badges/contents/appstore/black',
  destinations: APPLE_DESTINATIONS,
  parseFilename(name) {
    const m = name.match(/^(.+)\.svg$/);
    if (!m) return null;
    const code = m[1];
    const remap = {
      nb: 'no',          // Norwegian Bokmål → Norwegian
      'es-mx': 'es-MX',
      'pt-br': 'pt-BR',
      // zh-Hans / zh-Hant already canonical.
    };
    return remap[code] ?? code;
  },
  aliases: {},
};

// ─── HTTP ────────────────────────────────────────────────────────────────────

const GH_TOKEN = process.env.GITHUB_TOKEN;
const API_HEADERS = {
  accept: 'application/vnd.github+json',
  'user-agent': 'appland-badge-downloader',
  ...(GH_TOKEN ? { authorization: `Bearer ${GH_TOKEN}` } : {}),
};

async function listSourceFiles(apiList) {
  const r = await fetch(`https://api.github.com/${apiList}`, { headers: API_HEADERS });
  if (!r.ok) throw new Error(`list ${apiList}: HTTP ${r.status} ${r.statusText}`);
  const items = await r.json();
  return items
    .filter((it) => it.type === 'file' && it.name.toLowerCase().endsWith('.svg'))
    .map((it) => it.name);
}

async function fetchText(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'appland-badge-downloader' } });
  if (!r.ok) throw new Error(`fetch ${url}: HTTP ${r.status}`);
  return r.text();
}

// ─── Resolution ──────────────────────────────────────────────────────────────

function pickSource(target, sourceCodes, aliases) {
  if (sourceCodes.has(target)) return target;
  const aliased = aliases[target];
  if (aliased && sourceCodes.has(aliased)) return aliased;
  const lang = target.split('-')[0];
  if (sourceCodes.has(lang)) return lang;
  for (const s of sourceCodes) {
    if (s.split('-')[0] === lang) return s;
  }
  return sourceCodes.has('en') ? 'en' : null;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function downloadOne(source) {
  console.log(`[badges] listing ${source.badgeName} sources…`);
  const files = await listSourceFiles(source.apiList);
  const sourceMap = new Map();
  for (const f of files) {
    const norm = source.parseFilename(f);
    if (norm) sourceMap.set(norm, f);
  }
  const sourceCodes = new Set(sourceMap.keys());
  console.log(`[badges]   ${sourceCodes.size} source locale(s); ${source.destinations.length} destination(s)`);

  const needed = new Map();
  const plan = [];
  for (const target of source.destinations) {
    const picked = pickSource(target, sourceCodes, source.aliases);
    if (!picked) {
      console.warn(`[badges]   ${target}: no usable source — skipped`);
      continue;
    }
    plan.push({ target, picked });
    needed.set(picked, null);
  }
  await Promise.all(
    Array.from(needed.keys()).map(async (code) => {
      const filename = sourceMap.get(code);
      const url = `${source.rawBase}/${filename}`;
      needed.set(code, await fetchText(url));
    }),
  );

  let written = 0, unchanged = 0, fallback = 0;
  for (const { target, picked } of plan) {
    const dir = resolve(OUTPUT_ROOT, target);
    const out = resolve(dir, source.badgeName);
    const text = needed.get(picked);
    let prev;
    try { prev = await readFile(out, 'utf8'); } catch {}
    if (prev === text) { unchanged++; continue; }
    await mkdir(dir, { recursive: true });
    await writeFile(out, text);
    written++;
    if (target !== picked) {
      fallback++;
      console.log(`[badges]   ${target} → ${picked}`);
    }
  }
  console.log(
    `[badges] ${source.badgeName}: ${written} written (${fallback} via fallback), ${unchanged} unchanged`,
  );
}

async function main() {
  await mkdir(OUTPUT_ROOT, { recursive: true });
  await downloadOne(GOOGLE_SOURCE);
  await downloadOne(APPLE_SOURCE);
}

main().catch((e) => { console.error(e); process.exit(1); });
