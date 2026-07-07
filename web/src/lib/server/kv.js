import { getCloudflareContext } from "@opennextjs/cloudflare";

const DEFAULT_TTL_SECONDS = 600;

export async function getKv() {
  const { env } = await getCloudflareContext({ async: true });
  return env.BOOKS_CACHE;
}

// Read-through cache: returns the cached value for `key`, or computes it via
// `fn`, caches it, and returns it. Catalog data changes rarely, so a short
// TTL is enough to absorb read traffic without serving stale data long.
export async function cached(key, fn, ttlSeconds = DEFAULT_TTL_SECONDS) {
  const kv = await getKv();
  const hit = await kv.get(key, "json");
  if (hit !== null) return hit;

  const value = await fn();
  await kv.put(key, JSON.stringify(value), { expirationTtl: ttlSeconds });
  return value;
}
