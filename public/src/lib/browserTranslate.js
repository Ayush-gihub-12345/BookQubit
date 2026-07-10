// Client-side, on-the-fly translation of book content. Books are stored in
// D1 in English only — instead of translating server-side (which meant
// running a model on every request), the browser itself calls a free public
// translation API and caches results in localStorage, so each unique piece
// of text is ever translated once per language, on the visitor's own device.
const ENDPOINT = "https://api.mymemory.translated.net/get";
const CACHE_PREFIX = "bq_tr:";
const MAX_CHUNK = 450; // MyMemory's free tier truncates long single requests

function cacheKey(text, lang) {
  // Cheap non-cryptographic hash — just needs to be stable and short.
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

async function translateChunk(text, lang) {
  const key = cacheKey(text, lang);
  const hit = readCache(key);
  if (hit) return hit;
  try {
    const res = await fetch(`${ENDPOINT}?q=${encodeURIComponent(text)}&langpair=en|${lang}`);
    const data = await res.json();
    const out = data?.responseData?.translatedText;
    if (out && data.responseStatus === 200) {
      writeCache(key, out);
      return out;
    }
  } catch { /* network/API failure — fall back to source text below */ }
  return text;
}

// Splits on sentence boundaries so chunks stay under MyMemory's length limit
// without cutting words in half.
function splitIntoChunks(text) {
  if (text.length <= MAX_CHUNK) return [text];
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = "";
  for (const s of sentences) {
    if ((current + " " + s).length > MAX_CHUNK && current) {
      chunks.push(current.trim());
      current = s;
    } else {
      current = current ? `${current} ${s}` : s;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

export async function translateText(text, lang) {
  if (!text || !lang || lang === "en") return text;
  const chunks = splitIntoChunks(text);
  const translated = await Promise.all(chunks.map((c) => translateChunk(c, lang)));
  return translated.join(" ");
}
