import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth-server", () => ({ verifyUserStrict: vi.fn(), verifyUser: vi.fn() }));

import { verifyUserStrict } from "@/lib/auth-server";
import { bearerToken, requireUser, getRequestUser } from "@/lib/api-auth";

const req = (headers = {}) => new Request("http://localhost/api/x", { headers });

beforeEach(() => vi.resetAllMocks());

describe("bearerToken", () => {
  it("extracts a bearer token", () => {
    expect(bearerToken(req({ authorization: "Bearer abc.def" }))).toBe("abc.def");
  });
  it("is case-insensitive about the scheme and tolerates padding", () => {
    expect(bearerToken(req({ authorization: "  bearer   tok  " }))).toBe("tok");
  });
  it("returns null with no header, a different scheme, or an empty token", () => {
    expect(bearerToken(req())).toBeNull();
    expect(bearerToken(req({ authorization: "Basic abc" }))).toBeNull();
    expect(bearerToken(req({ authorization: "Bearer " }))).toBeNull();
  });
  it("does NOT read a token from the query string", () => {
    const r = new Request("http://localhost/api/x?idToken=abc");
    expect(bearerToken(r)).toBeNull();
  });
});

describe("requireUser", () => {
  it("401 and never calls Google when there is no credential", async () => {
    const out = await requireUser(req());
    expect(out.response.status).toBe(401);
    expect(verifyUserStrict).not.toHaveBeenCalled();
  });

  it("401 when the token is rejected", async () => {
    verifyUserStrict.mockResolvedValue(null);
    const out = await requireUser(req({ authorization: "Bearer forged" }));
    expect(out.response.status).toBe(401);
  });

  it("503, not 401, when verification itself is unavailable", async () => {
    verifyUserStrict.mockRejectedValue(new Error("Identity Toolkit returned 503"));
    const out = await requireUser(req({ authorization: "Bearer real" }));
    expect(out.response.status).toBe(503);
  });

  it("returns the verified user", async () => {
    verifyUserStrict.mockResolvedValue({ uid: "alice", name: "Alice" });
    const out = await requireUser(req({ authorization: "Bearer good" }));
    expect(out.response).toBeUndefined();
    expect(out.user.uid).toBe("alice");
    expect(verifyUserStrict).toHaveBeenCalledWith("good");
  });
});

describe("getRequestUser", () => {
  it("is null for anonymous and the user for a valid token", async () => {
    expect(await getRequestUser(req())).toBeNull();
    verifyUserStrict.mockResolvedValue({ uid: "alice" });
    expect((await getRequestUser(req({ authorization: "Bearer t" }))).uid).toBe("alice");
  });
});
