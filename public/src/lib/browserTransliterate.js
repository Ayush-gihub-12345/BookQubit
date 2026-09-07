// Client-side TRANSLITERATION — spelling an English proper noun (book title,
// author name, publisher name) phonetically in the visitor's script (e.g.
// "Atomic Habits" -> "एटॉमिक हैबिट्स" in Hindi), not translating its meaning.
// That's a deliberately different job from browserTranslate.js (which
// handles description/summary/key_points and is left untouched): a reader
// browsing in Hindi still wants to recognize the English title by how it
// sounds, the way Indian bookstores and shelves actually label English
// books — not a semantic translation of the words.
//
// Uses Google's public "Input Tools" transliteration endpoint (the same
// engine behind Google's IME keyboards) — same pattern as
// browserTranslate.js: called from the browser only, cached in localStorage
// forever after (see CACHE_PREFIX's version note below for the one
// exception: a cache-format change invalidates old entries).
//
// Important limitation, stated plainly rather than oversold: this is a
// phonetic-input engine, not a pronunciation-aware transliterator. It has no
// English lexicon, so a word whose spelling doesn't fully determine its
// pronunciation (e.g. "read", which sounds different in "I read books" vs
// "I have read it") gets one phonetic guess with no way to know which
// reading was meant — sometimes the wrong one. This is an inherent ceiling
// of applying an IME (built for informal romanized typing) to English
// orthography, not something a better prompt/config fixes. What IS fixed
// here: word-by-word requests instead of one whole-string request (see
// transliterateWord/transliterateTitle below — keeps one bad word from
// dragging down every word after it in the same title), and
// TitleTransliterated.jsx now keeps the original English text available via
// a title="" tooltip, so a reader who doesn't recognize the phonetic
// rendering can still see the real title.
//
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
// v2: switched from whole-string to word-by-word transliteration (see
// transliterateTitle below) — a v1-cached whole-string result is a different
// shape/quality of output, so it must not be read back as if it were a v2
// word-level cache hit. Same reasoning as CACHE_VERSION in db.js: a stored
// value's meaning changed under what would otherwise be the same key.
const CACHE_PREFIX = "bq_tl2:";

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

// One word -> its phonetic spelling in the target script, via a single
// Input Tools request. Splitting the caller's title into individual API
// calls (rather than sending the whole title as one string) matters because
// the IME's language model works on word boundaries: sent as one string, a
// short/common word early in a title can bias how the model reads letters
// later in the string, and any one word going wrong corrupts everything
// after it in the same response. Word-level requests contain a bad guess to
// just that word, and words are cached (and can be fixed/re-fetched)
// independently instead of the whole title needing to invalidate together.
async function transliterateWord(word, itc) {
  const url = `${ENDPOINT}?text=${encodeURIComponent(word)}&itc=${itc}&num=1&cp=0&cs=1&ie=utf-8&oe=utf-8`;
  const res = await fetch(url);
  const data = await res.json();
  // Shape: ["SUCCESS",[["input text",["candidate1","candidate2",...],...]]]
  return data?.[0] === "SUCCESS" ? data[1]?.[0]?.[1]?.[0] : null;
}

// Splits on whitespace, keeping the separators so punctuation/spacing in the
// original title is preserved exactly (e.g. "Atomic Habits: An Easy Way"
// keeps its colon and spacing, only the words themselves get transliterated).
const WORD_SPLIT = /(\s+)/;

export async function transliterateTitle(text, lang) {
  if (!text || !lang || lang === "en") return text;
  const itc = ITC_BY_LANG[lang];
  if (!itc) return text; // unsupported script (Latin langs, zh/ja/ko) — show original

  const key = cacheKey(text, lang);
  const hit = readCache(key);
  if (hit) return hit;

  try {
    const parts = text.split(WORD_SPLIT);
    const results = await Promise.all(
      parts.map((part, i) => {
        // Odd indices are the whitespace separators captured by the split
        // regex's group — pass through unchanged, no API call needed.
        if (i % 2 === 1 || !/[a-zA-Z]/.test(part)) return part;
        return transliterateWord(part, itc).then((c) => c ?? part);
      })
    );
    const out = results.join("");
    // Only worth caching (and trusting) if at least one word actually came
    // back transliterated — if every request failed, `out` just equals the
    // original text and there's nothing gained by remembering that.
    if (out !== text) {
      writeCache(key, out);
      return out;
    }
  } catch { /* network/API failure — fall back to the original title below */ }
  return text;
}
