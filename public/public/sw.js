/* BookQubit service worker.
 *  - /_next/static + fonts/icons: cache-first (content-hashed, immutable)
 *  - page navigations: network-first, falling back to the last cached copy,
 *    then to the offline page
 *  - "Save for offline" items live in `bq-offline-v1` (managed by src/lib/offline.js)
 *    and are served for those exact URLs when the network is unavailable
 *  - never touches /api, /admin, non-GET requests or cross-origin requests
 * Bump VERSION to invalidate the shell caches.
 */
const VERSION = "v1";
const SHELL = `bq-shell-${VERSION}`;
const PAGES = `bq-pages-${VERSION}`;
const OFFLINE_SAVED = "bq-offline-v1"; // must match src/lib/offline.js
const OFFLINE_URL = "/en/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((c) => c.add(new Request(OFFLINE_URL, { cache: "reload" }))).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([SHELL, PAGES, OFFLINE_SAVED]);
      for (const k of await caches.keys()) if (!keep.has(k)) await caches.delete(k);
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin")) return;

  // Saved-for-offline items win when offline.
  if (url.pathname.startsWith("/_next/static/") || /\.(?:woff2?|png|svg|ico|webp)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok) caches.open(SHELL).then((c) => c.put(req, res.clone()));
            return res;
          })
      )
    );
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res.ok) {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(req, copy));
          }
          return res;
        } catch {
          return (
            (await caches.match(req)) ||
            (await (await caches.open(OFFLINE_SAVED)).match(req)) ||
            (await caches.match(OFFLINE_URL)) ||
            new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } })
          );
        }
      })()
    );
  }
});
