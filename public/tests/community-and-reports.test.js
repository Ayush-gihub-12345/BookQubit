import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({ verifyUserStrict: vi.fn(), verifyUser: vi.fn() }));

const repo = vi.hoisted(() => ({
  isActiveDiscussionMember: vi.fn(),
  getDiscussionMessagesSince: vi.fn(),
  getDiscussion: vi.fn(),
  searchDiscussions: vi.fn(),
  addDiscussionPost: vi.fn(),
  upsertUser: vi.fn(),
}));
vi.mock("@/lib/repo", () => repo);

const dbState = vi.hoisted(() => ({ binds: [] }));
vi.mock("@/lib/db", () => {
  const stmt = {
    bind: (...a) => { dbState.binds.push(...a); return stmt; },
    run: async () => ({ meta: {} }),
    all: async () => ({ results: [] }),
    first: async () => null,
  };
  return { getDb: async () => ({ prepare: () => stmt }) };
});

import { verifyUserStrict } from "@/lib/auth-server";

const params = (id) => ({ params: Promise.resolve({ id }) });
const get = (handler, path, token, extra) =>
  handler(
    new Request(`http://localhost${path}`, { headers: token ? { authorization: `Bearer ${token}` } : {} }),
    extra
  );

beforeEach(() => {
  vi.resetAllMocks();
  dbState.binds.length = 0;
  verifyUserStrict.mockImplementation(async (t) => (t === "alice-token" ? { uid: "alice" } : null));
});

describe("GET /api/discussions/[id]/messages", () => {
  it("401 for anonymous callers, so sequential ids can no longer be walked", async () => {
    const { GET } = await import("@/app/api/discussions/[id]/messages/route.js");
    const res = await get(GET, "/api/discussions/7/messages?since=0", null, params("7"));
    expect(res.status).toBe(401);
    expect(repo.getDiscussionMessagesSince).not.toHaveBeenCalled();
  });

  it("403 for a signed-in non-member", async () => {
    repo.isActiveDiscussionMember.mockResolvedValue(false);
    const { GET } = await import("@/app/api/discussions/[id]/messages/route.js");
    const res = await get(GET, "/api/discussions/7/messages", "alice-token", params("7"));
    expect(res.status).toBe(403);
    expect(repo.getDiscussionMessagesSince).not.toHaveBeenCalled();
  });

  it("200 for an active member", async () => {
    repo.isActiveDiscussionMember.mockResolvedValue(true);
    repo.getDiscussionMessagesSince.mockResolvedValue([{ id: 1, body: "hi" }]);
    const { GET } = await import("@/app/api/discussions/[id]/messages/route.js");
    const res = await get(GET, "/api/discussions/7/messages?since=0", "alice-token", params("7"));
    expect(res.status).toBe(200);
    expect((await res.json()).messages).toHaveLength(1);
    expect(repo.isActiveDiscussionMember).toHaveBeenCalledWith("alice", "7");
  });
});

describe("GET /api/discussions/[id]", () => {
  const thread = { id: 7, title: "T", posts: [], membership: null };

  it("anonymous: header loads, messages are NOT fetched", async () => {
    repo.getDiscussion.mockResolvedValue(thread);
    const { GET } = await import("@/app/api/discussions/[id]/route.js");
    const res = await get(GET, "/api/discussions/7?uid=victim", null, params("7"));
    expect(res.status).toBe(200);
    expect(repo.getDiscussion).toHaveBeenCalledWith("7", undefined, { includePosts: false });
  });

  it("non-member: still no messages; and ?uid= is ignored", async () => {
    repo.isActiveDiscussionMember.mockResolvedValue(false);
    repo.getDiscussion.mockResolvedValue(thread);
    const { GET } = await import("@/app/api/discussions/[id]/route.js");
    await get(GET, "/api/discussions/7?uid=victim", "alice-token", params("7"));
    expect(repo.getDiscussion).toHaveBeenCalledWith("7", "alice", { includePosts: false });
  });

  it("member: messages included", async () => {
    repo.isActiveDiscussionMember.mockResolvedValue(true);
    repo.getDiscussion.mockResolvedValue(thread);
    const { GET } = await import("@/app/api/discussions/[id]/route.js");
    await get(GET, "/api/discussions/7", "alice-token", params("7"));
    expect(repo.getDiscussion).toHaveBeenCalledWith("7", "alice", { includePosts: true });
  });

  it("degrades to anonymous (not an error) when Google verification is down", async () => {
    verifyUserStrict.mockRejectedValue(new Error("500"));
    repo.getDiscussion.mockResolvedValue(thread);
    const { GET } = await import("@/app/api/discussions/[id]/route.js");
    const res = await get(GET, "/api/discussions/7", "alice-token", params("7"));
    expect(res.status).toBe(200);
    expect(repo.getDiscussion).toHaveBeenCalledWith("7", undefined, { includePosts: false });
  });
});

describe("GET /api/discussions/search", () => {
  it("annotates membership for the token's user, not a ?uid=", async () => {
    repo.searchDiscussions.mockResolvedValue([]);
    const { GET } = await import("@/app/api/discussions/search/route.js");
    await get(GET, "/api/discussions/search?q=dune&uid=victim", "alice-token");
    expect(repo.searchDiscussions).toHaveBeenCalledWith("dune", "alice");
    await get(GET, "/api/discussions/search?q=dune&uid=victim", null);
    expect(repo.searchDiscussions).toHaveBeenLastCalledWith("dune", "");
  });
});

describe("POST /api/reports", () => {
  const post = async (body, token) => {
    const { POST } = await import("@/app/api/reports/route.js");
    return POST(
      new Request("http://localhost/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(body),
      })
    );
  };

  it("ignores a spoofed userId in the body (files anonymously)", async () => {
    const res = await post({ bookSlug: "dune", message: "wrong cover", userId: "victim" });
    expect(res.status).toBe(200);
    expect(dbState.binds).toEqual(["dune", null, "wrong cover"]);
  });

  it("attributes to the verified token's user", async () => {
    await post({ bookSlug: "dune", message: "wrong cover", userId: "victim" }, "alice-token");
    expect(dbState.binds).toEqual(["dune", "alice", "wrong cover"]);
  });

  it("still files anonymously if verification fails", async () => {
    verifyUserStrict.mockRejectedValue(new Error("500"));
    const res = await post({ message: "typo" }, "alice-token");
    expect(res.status).toBe(200);
    expect(dbState.binds[1]).toBeNull();
  });

  it("400 on an empty message", async () => {
    expect((await post({ message: "   " })).status).toBe(400);
  });
});
