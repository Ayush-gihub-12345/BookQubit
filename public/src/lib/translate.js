import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cached } from "./db";

// Maps our 21 language codes to the codes Workers AI's translation model
// expects. m2m100 covers 100 languages by ISO 639-1 code — ours already
// match for almost everything; this table exists mainly for clarity/safety.
const MODEL_LANG = {
  hi: "hi", bn: "bn", te: "te", mr: "mr", ta: "ta", gu: "gu", kn: "kn", ml: "ml", pa: "pa", ur: "ur",
  es: "es", fr: "fr", de: "de", pt: "pt", it: "it", ru: "ru", zh: "zh", ja: "ja", ko: "ko", ar: "ar",
};

const SEP = "\n";

async function translateLines(lines, targetLang) {
  const { env } = await getCloudflareContext({ async: true });
  if (!env.AI) return lines; // AI binding not configured — degrade to original text
  const text = lines.join(SEP);
  if (!text.trim()) return lines;
  try {
    const result = await env.AI.run("@cf/meta/m2m100-1.2b", {
      text,
      source_lang: "en",
      target_lang: MODEL_LANG[targetLang] || targetLang,
    });
    const translated = (result?.translated_text || "").split(SEP);
    // Guard against the model collapsing/adding lines — fall back per-line
    // to the original if the shape doesn't match, rather than misaligning.
    return translated.length === lines.length ? translated : lines;
  } catch {
    return lines; // translation failed (quota, unsupported lang, network) — degrade gracefully
  }
}

// Translates a mapped book object's purely-descriptive text fields into
// `lang`. Deliberately EXCLUDES category, collection, and tags — those
// double as filter/URL keys throughout the app (queryBooks WHERE clauses,
// /books?category=, /books?tag= links). Translating them would make every
// such link silently stop matching the English-stored values in D1.
//
// Cached per (slug, lang) in KV so a given book is machine-translated only
// once — every subsequent request for that book+language is instant.
export async function translateBook(book, lang) {
  if (!MODEL_LANG[lang]) return book; // language not supported by the model — serve English as-is
  return cached(`translate:book:${book.slug}:${lang}`, async () => {
    const scalarFields = [book.title, book.description, book.summary];
    const arrayFields = [book.genres, book.subjects, book.keyPoints];
    const arrayLengths = arrayFields.map((a) => a.length);
    const arrayFlat = arrayFields.flat();

    const [translatedScalars, translatedArrayFlat] = await Promise.all([
      translateLines(scalarFields.map((s) => s || ""), lang),
      arrayFlat.length ? translateLines(arrayFlat, lang) : Promise.resolve([]),
    ]);

    let cursor = 0;
    const rebuiltArrays = arrayLengths.map((len) => {
      const slice = translatedArrayFlat.slice(cursor, cursor + len);
      cursor += len;
      return slice;
    });

    return {
      ...book,
      title: translatedScalars[0] || book.title,
      description: translatedScalars[1] || book.description,
      summary: translatedScalars[2] || book.summary,
      genres: rebuiltArrays[0],
      subjects: rebuiltArrays[1],
      keyPoints: rebuiltArrays[2],
    };
  }, 60 * 60 * 24 * 30); // 30 days — book content rarely changes
}

export async function translateBooks(books, lang) {
  if (!MODEL_LANG[lang]) return books;
  return Promise.all(books.map((b) => translateBook(b, lang)));
}
