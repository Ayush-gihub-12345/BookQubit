// Client-side, title-only TRANSLITERATION — spelling an English title
// phonetically in the visitor's script (e.g. "Atomic Habits" -> "एटॉमिक
// हैबिट्स" in Hindi), not translating its meaning. That's a deliberately
// different job from browserTranslate.js (which handles description/
// summary/key_points and is left untouched): a reader browsing in Hindi
// still wants to recognize the English title by how it sounds, the way
// Indian bookstores and shelves actually label English books — not a
// semantic translation of the title's words.
//
// Uses Google's public "Input Tools" transliteration endpoint (the same
// engine behind Google's IME keyboards) — same pattern as
// browserTranslate.js: called from the browser only, once per unique
// title+language, cached in localStorage forever after.
//
// Verified live per language before shipping (see conversation): clean,
// correct output for every Indic script tested plus Russian and Arabic.
// Chinese and Korean reject the request outright, and Japanese returned
// garbled mixed kanji/kana nonsense for an English phrase — so those three
// are deliberately NOT in this map and fall through to the original title
// unchanged, rather than ship broken output. Latin-script languages
// (es/fr/de/pt/it) need no transliteration at all (confirmed: the API
// itself just echoes the input back for these) and are skipped before ever
// making a network call.
const ITC_BY_LANG = {
  hi: "hi-t-i0-und", // Hindi
  bn: "bn-t-i0-und", // Bengali
  te: "te-t-i0-und", // Telugu
  mr: "mr-t-i0-und", // Marathi
  ta: "ta-t-i0-und", // Tamil
  gu: "gu-t-i0-und", // Gujarati
  kn: "kn-t-i0-und", // Kannada
  ml: "ml-t-i0-und", // Malayalam
  pa: "pa-t-i0-und", // Punjabi
  ur: "ur-t-i0-und", // Urdu
  ru: "ru-t-i0-und", // Russian
  ar: "ar-t-i0-und", // Arabic
};

const ENDPOINT = "https://inputtools.google.com/request";
const CACHE_PREFIX = "bq_tl:"; // distinct prefix from browserTranslate's bq_tr:

function cacheKey(text, lang) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (Math.imul(31, h) + text.charCodeAt(i)) | 0;
  return `${CACHE_PREFIX}${lang}:${h}`;
}
function readCache(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function writeCache(key, value) {
  try { localStorage.setItem(key, value); } catch { /* storage full/unavailable — skip caching */ }
}

export async function transliterateTitle(text, lang) {
  if (!text || !lang || lang === "en") return text;
  const itc = ITC_BY_LANG[lang];
  if (!itc) return text; // unsupported script (Latin langs, zh/ja/ko) — show original

  const key = cacheKey(text, lang);
  const hit = readCache(key);
  if (hit) return hit;

  try {
    const url = `${ENDPOINT}?text=${encodeURIComponent(text)}&itc=${itc}&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8`;
    const res = await fetch(url);
    const data = await res.json();
    // Shape: ["SUCCESS",[["input text",["candidate1","candidate2",...],...]]]
    const candidate = data?.[0] === "SUCCESS" ? data[1]?.[0]?.[1]?.[0] : null;
    if (candidate) {
      writeCache(key, candidate);
      return candidate;
    }
  } catch { /* network/API failure — fall back to the original title below */ }
  return text;
}
