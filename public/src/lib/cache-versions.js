import { CACHE_GROUPS } from "@/lib/cache-policy";

// Group versions live in ONE small KV value: { catalog: 3, feed: 1, ... }. A cached key's name includes its
// group's version, so bumping the version makes every old entry unreachable at once, in every tier and every
// region, with no per-key deletes. Old entries simply expire by TTL.
//
// Cost: one KV read per isolate per VERSION_MEMO_MS (not per request). Failure mode: if KV is absent or errors,
// the version is "0" everywhere and the cache behaves exactly as it did before versioning existed.
const KV_KEY = "cache:versions";
const VERSION_MEMO_MS = 15_000;

let memo = { map: {}, exp: 0 };

export function resetVersionMemo() {
  memo = { map: {}, exp: 0 };
}

async function readMap(kv) {
  try {
    const raw = await kv.get(KV_KEY, { type: "json", cacheTtl: 30 });
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return null; // KV problem: caller keeps the last known map
  }
}

/** Current version of a group as a string ("0" when unknown). */
export async function getGroupVersion(env, group, now = Date.now()) {
  const kv = env && env.CACHE_KV;
  if (!kv) return "0";
  if (now > memo.exp) {
    const map = await readMap(kv);
    memo = { map: map ?? memo.map, exp: now + VERSION_MEMO_MS };
  }
  return String(memo.map[group] || 0);
}

/**
 * Invalidate one group (or "all"). Returns the new version map, or null when KV isn't available
 * (then entries just expire by TTL, which is the safe default).
 */
export async function bumpGroup(env, group, now = Date.now()) {
  const kv = env && env.CACHE_KV;
  if (!kv) return null;
  const groups = group === "all" ? CACHE_GROUPS : CACHE_GROUPS.includes(group) ? [group] : [];
  if (!groups.length) return null;
  const current = (await readMap(kv)) || {};
  const next = { ...current };
  for (const g of groups) next[g] = (Number(next[g]) || 0) + 1;
  try {
    await kv.put(KV_KEY, JSON.stringify(next));
  } catch {
    return null;
  }
  memo = { map: next, exp: now + VERSION_MEMO_MS }; // this isolate sees it immediately
  return next;
}

export async function readVersions(env) {
  const kv = env && env.CACHE_KV;
  return kv ? (await readMap(kv)) || {} : {};
}
