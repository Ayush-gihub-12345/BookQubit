import { describe, it, expect, beforeEach } from "vitest";
import { TTL, groupOf, freshness, swrWindowSeconds, CACHE_GROUPS } from "@/lib/cache-policy";
import { getGroupVersion, bumpGroup, resetVersionMemo, readVersions } from "@/lib/cache-versions";

describe("cache groups", () => {
  it("groups catalog, community, feed, search, settings and space keys", () => {
    for (const k of ["book-row:en:s", "facets:en", "facets:moods", "featured:en:5", "recent-added:en:8", "books-by-author:en:x", "platform:stats"]) expect(groupOf(k)).toBe("catalog");
    for (const k of ["community:x", "leaderboard:ranked", "popular-readers:20"]) expect(groupOf(k)).toBe("community");
    expect(groupOf("feed:en:books:2")).toBe("feed");
    expect(groupOf("search:en:atomic")).toBe("search");
    expect(groupOf("site:settings")).toBe("settings");
    expect(groupOf("ms-public:slug")).toBe("spaces");
  });

  it("never groups user-scoped or unknown keys, so a bump can never touch private data", () => {
    for (const k of ["recommendations:u1", "shelf:u1", "user:stats", "notifications:u", "something-else", "book-rowx"]) expect(groupOf(k)).toBeNull();
  });
});

describe("freshness: moderate, not aggressive", () => {
  const now = 1_000_000_000_000;
  it("serves fresh entries, serves recently expired ones while refreshing, refreshes long-expired ones first", () => {
    expect(freshness({ exp: now + 5000 }, TTL.lists, now)).toBe("fresh");
    expect(freshness({ exp: now - 60_000 }, TTL.lists, now)).toBe("swr");
    expect(freshness({ exp: now - 599_000 }, TTL.lists, now)).toBe("swr");
    expect(freshness({ exp: now - 601_000 }, TTL.lists, now)).toBe("refresh");
    expect(freshness({ exp: now - 5 * 3600_000 }, TTL.lists, now)).toBe("refresh");
    expect(freshness({ exp: now - 1.5 * 3600_000 }, TTL.static, now)).toBe("swr");
    expect(freshness({ exp: now - 3 * 3600_000 }, TTL.static, now)).toBe("refresh");
  });

  it("windows scale with the TTL but never drop below 10 minutes", () => {
    expect(swrWindowSeconds(60)).toBe(600);
    expect(swrWindowSeconds(3600)).toBe(7200);
  });

  it("keeps lifetimes short: lookups at most an hour, lists at most five minutes", () => {
    expect(TTL.static).toBeLessThanOrEqual(3600);
    expect(TTL.lists).toBeLessThanOrEqual(300);
  });
});

describe("group versions (KV)", () => {
  const mkKv = () => {
    const store = new Map();
    const kv = { reads: 0, get: async (k) => { kv.reads++; const v = store.get(k); return v ? JSON.parse(v) : null; }, put: async (k, v) => { store.set(k, v); } };
    return kv;
  };
  beforeEach(() => resetVersionMemo());

  it("is a no-op without KV and never throws", async () => {
    expect(await getGroupVersion({}, "catalog")).toBe("0");
    expect(await bumpGroup({}, "catalog")).toBeNull();
  });

  it("reads KV at most once per isolate per window, not once per request", async () => {
    const kv = mkKv();
    const env = { CACHE_KV: kv };
    for (let i = 0; i < 50; i++) await getGroupVersion(env, "catalog", 1000 + i * 100);
    expect(kv.reads).toBe(1);
  });

  it("a bump is visible to this isolate at once and to others after their window", async () => {
    const kv = mkKv();
    const env = { CACHE_KV: kv };
    expect(await bumpGroup(env, "catalog", 5000)).toEqual({ catalog: 1 });
    expect(await getGroupVersion(env, "catalog", 5001)).toBe("1");
    expect(await getGroupVersion(env, "feed", 5002)).toBe("0");
    resetVersionMemo(); // another isolate
    expect(await getGroupVersion(env, "catalog", 9000)).toBe("1");
  });

  it("'all' bumps every group; unknown groups are ignored", async () => {
    const env = { CACHE_KV: mkKv() };
    await bumpGroup(env, "all");
    expect(Object.keys(await readVersions(env)).sort()).toEqual([...CACHE_GROUPS].sort());
    expect(await bumpGroup(env, "bogus")).toBeNull();
  });

  it("a failing KV leaves caching working (version 0)", async () => {
    const bad = { CACHE_KV: { get: async () => { throw new Error("down"); }, put: async () => { throw new Error("down"); } } };
    expect(await getGroupVersion(bad, "catalog")).toBe("0");
    expect(await bumpGroup(bad, "catalog")).toBeNull();
  });
});
