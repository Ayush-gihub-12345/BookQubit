import 'server-only';
import fs from 'node:fs/promises';
import path from 'node:path';

const FILE = {
  en: 'english',
  hi: 'hindi',
  bn: 'bengali',
  ta: 'tamil',
  te: 'telugu',
  mr: 'marathi',
  gu: 'gujarati',
  kn: 'kannada',
  ml: 'malayalam',
  pa: 'punjabi',
  ur: 'urdu',
  ar: 'arabic',
  es: 'spanish',
  fr: 'french',
  de: 'german',
  pt: 'portuguese',
  ru: 'russian',
  zh: 'chinese',
  ja: 'japanese',
  ko: 'korean',
};

export async function getTranslation(locale) {
  const code = FILE[locale] ? locale : 'en';
  const file = path.join(
    process.cwd(), 'src', 'translations', `${FILE[code]}.json`
  );

  try {
    const raw = await fs.readFile(file, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    console.error('[i18n] FAILED to load', file, '→', e.message);
    return {};
  }
}