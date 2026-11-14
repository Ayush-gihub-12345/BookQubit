// "Save for offline" helpers (client-only). Pages are stored in Cache Storage under
// `bq-offline-v1` (the same name sw.js reads); the index of titles lives in
// localStorage so the UI can list saved items without opening the cache.
export const OFFLINE_CACHE = "bq-offline-v1";
const INDEX_KEY = "bq-offline-index";

const supported = () => typeof window !== "undefined" && "caches" in window;

function readIndex() {
  try {
    return JSON.parse(localStorage.getItem(INDEX_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeIndex(list) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(list));
  } catch {
    /* storage full/blocked — cache copy still works */
  }
}

export const canSaveOffline = supported;
export const listOffline = readIndex;
export const isSavedOffline = (url) => readIndex().some((i) => i.url === url);

/** Fetch `url` (a page path) and store it. Returns true on success. */
export async function saveOffline(url, { title = url, kind = "summary" } = {}) {
  if (!supported()) return false;
  try {
    const res = await fetch(url, { credentials: "same-origin" });
    if (!res.ok) return false;
    const cache = await caches.open(OFFLINE_CACHE);
    await cache.put(url, res);
    const list = readIndex().filter((i) => i.url !== url);
    list.unshift({ url, title, kind, savedAt: Date.now() });
    writeIndex(list.slice(0, 200));
    return true;
  } catch {
    return false;
  }
}

export async function removeOffline(url) {
  if (!supported()) return;
  try {
    await (await caches.open(OFFLINE_CACHE)).delete(url);
  } catch {
    /* ignore */
  }
  writeIndex(readIndex().filter((i) => i.url !== url));
}
