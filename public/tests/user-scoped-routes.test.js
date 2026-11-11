import { describe, it, expect, vi, beforeEach } from "vitest";

// ---- mocks: auth, repo, db. Nothing here touches Cloudflare or Google. ----
vi.mock("@/lib/auth-server", () => ({ verifyUserStrict: vi.fn(), verifyUser: vi.fn() }));

const repo = vi.hoisted(() => {
  const fns = {};
  for (const n of [
    "getNotifications", "getAchievements", "getReaderNetwork", "getYearInBooks",
    "getRecommendations", "getMyDiscussions", "getUserPreferences", "getBooksBySlug",
    "upsertUser",
  ]) fns[n] = vi.fn();
  return fns;
});
vi.mock("@/lib/repo", () => repo);

// A tiny D1 stand-in that records every bound parameter.
const dbState = vi.hoisted(() => ({ binds: [] }));
vi.mock("@/lib/db", () => {
  const stmt = {
    bind: (...args) => { dbState.binds.push(...args); return stmt; },
    all: async () => ({ results: [] }),
    first: async () => null,
    run: async () => ({ meta: {} }),
  };
  const db = { prepare: () => stmt, batch: async () => [] };
  return { getDb: async () => db, getCatalogDb: async () => db };
});

import { verifyUserStrict } from "@/lib/auth-server";

const VICTIM = "victim-uid";
const ALICE = "alice-uid";

const call = (handler, path, { token } = {}) =>
  handler(new Request(`http://localhost${path}`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  }));

const withUid = (path) => `${path}${path.includes("?") ? "&" : "?"}uid=${VICTIM}`;

beforeEach(() => {
  vi.resetAllMocks();
  dbState.binds.length = 0;
  verifyUserStrict.mockImplementation(async (t) => (t === "alice-token" ? { uid: ALICE, name: "Alice" } : null));
  repo.getNotifications.mockResolvedValue([]);
  repo.getAchievements.mockResolvedValue([]);
  repo.getReaderNetwork.mockResolvedValue({});
  repo.getYearInBooks.mockResolvedValue({});
  repo.getRecommendations.mockResolvedValue({ picks: [], basis: null });
  repo.getMyDiscussions.mockResolvedValue([]);
  repo.getUserPreferences.mockResolvedValue({ genres: [], onboarded: false });
  repo.getBooksBySlug.mockResolvedValue(new Map());
});

// Routes that delegate to a repo function: [label, loader, path, repo fn].
const repoRoutes = [
  ["notifications", () => import("@/app/api/notifications/route.js"), "/api/notifications", "getNotifications"],
  ["achievements", () => import("@/app/api/achievements/route.js"), "/api/achievements", "getAchievements"],
  ["network", () => import("@/app/api/network/route.js"), "/api/network", "getReaderNetwork"],
  ["wrapped", () => import("@/app/api/wrapped/route.js"), "/api/wrapped?year=2026", "getYearInBooks"],
  ["recommendations", () => import("@/app/api/recommendations/route.js"), "/api/recommendations?lang=en", "getRecommendations"],
  ["discussions/mine", () => import("@/app/api/discussions/mine/route.js"), "/api/discussions/mine", "getMyDiscussions"],
  ["preferences", () => import("@/app/api/preferences/route.js"), "/api/preferences", "getUserPreferences"],
];

// Routes that query D1 directly.
const dbRoutes = [
  ["shelf", () => import("@/app/api/shelf/route.js"), "/api/shelf"],
  ["shelf?slug", () => import("@/app/api/shelf/route.js"), "/api/shelf?slug=dune"],
  ["liked", () => import("@/app/api/liked/route.js"), "/api/liked"],
  ["goal", () => import("@/app/api/goal/route.js"), "/api/goal"],
  ["requests", () => import("@/app/api/requests/route.js"), "/api/requests"],
];

describe.each(repoRoutes)("GET %s (repo-backed)", (_label, load, path, fn) => {
  it("401s with no credential and reads nothing", async () => {
    const { GET } = await load();
    const res = await call(GET, withUid(path));
    expect(res.status).toBe(401);
    expect(repo[fn]).not.toHaveBeenCalled();
  });

  it("401s on a forged token", async () => {
    const { GET } = await load();
    const res = await call(GET, path, { token: "forged" });
    expect(res.status).toBe(401);
    expect(repo[fn]).not.toHaveBeenCalled();
  });

  it("serves the TOKEN's user and ignores a spoofed ?uid=", async () => {
    const { GET } = await load();
    const res = await call(GET, withUid(path), { token: "alice-token" });
    expect(res.status).toBe(200);
    expect(repo[fn]).toHaveBeenCalledTimes(1);
    expect(repo[fn].mock.calls[0][0]).toBe(ALICE);
    expect(JSON.stringify(repo[fn].mock.calls)).not.toContain(VICTIM);
  });
});

describe.each(dbRoutes)("GET %s (D1-backed)", (_label, load, path) => {
  it("401s with no credential and issues no query", async () => {
    const { GET } = await load();
    const res = await call(GET, withUid(path));
    expect(res.status).toBe(401);
    expect(dbState.binds).toEqual([]);
  });

  it("binds only the token's user, never the spoofed ?uid=", async () => {
    const { GET } = await load();
    const res = await call(GET, withUid(path), { token: "alice-token" });
    expect(res.status).toBe(200);
    expect(dbState.binds).toContain(ALICE);
    expect(dbState.binds).not.toContain(VICTIM);
  });
});

describe("503 when Google verification is down", () => {
  it("reports an outage as 503 so the browser does not sign the reader out", async () => {
    verifyUserStrict.mockRejectedValue(new Error("Identity Toolkit returned 500"));
    const { GET } = await import("@/app/api/notifications/route.js");
    const res = await call(GET, "/api/notifications", { token: "alice-token" });
    expect(res.status).toBe(503);
  });
});
