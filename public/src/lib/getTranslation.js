import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';
import { locales, defaultLocale, localeFile } from './locales';

const CACHE = new Map();

export async function getTranslation(locale) {
  const safe = locales.includes(locale) ? locale : defaultLocale;
  if (CACHE.has(safe)) return CACHE.get(safe);

  const file = path.join(
    process.cwd(), 'src', 'translations', `${localeFile[safe]}.json`
  );

  try {
    const raw = await fs.readFile(file, 'utf8');
    const dict = JSON.parse(raw);
    CACHE.set(safe, dict);
    return dict;
  } catch {
    if (safe !== defaultLocale) return getTranslation(defaultLocale);
    return {};
  }
}