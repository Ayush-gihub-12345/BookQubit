import { describe, it, expect, vi, beforeEach } from "vitest";

const state = vi.hoisted(() => ({ cookie: undefined, headers: {}, set: null }));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: () => (state.cookie ? { value: state.cookie } : undefined),
    set: (...a) => { state.set = a; },
    delete: () => {},
  }),
  headers: async () => ({ get: (k) => state.headers[k.toLowerCase()] ?? null }),
}));

import { isAdminAuthenticated, setAdminSession } from "@/lib/admin-auth";

beforeEach(async () => {
  process.env.ADMIN_USERNAME = "admin";
  process.env.ADMIN_PASSWORD = "s3cret";
  state.headers = { host: "www.bookqubit.com" };
  state.set = null;
  await setAdminSession();
  state.cookie = state.set[1]; // the token the server just issued
});

describe("admin session cookie", () => {
  it("is SameSite=Strict, HttpOnly and Secure", () => {
    expect(state.set[2]).toMatchObject({ sameSite: "strict", httpOnly: true, secure: true });
  });
});

describe("isAdminAuthenticated Origin check", () => {
  it("accepts a valid cookie with no Origin (ordinary navigation / same-origin GET)", async () => {
    expect(await isAdminAuthenticated()).toBe(true);
  });
  it("accepts a same-origin Origin", async () => {
    state.headers.origin = "https://www.bookqubit.com";
    expect(await isAdminAuthenticated()).toBe(true);
  });
  it("rejects a foreign Origin even with a valid cookie", async () => {
    state.headers.origin = "https://evil.example";
    expect(await isAdminAuthenticated()).toBe(false);
  });
  it("rejects the literal 'null' Origin and unparseable ones", async () => {
    state.headers.origin = "null";
    expect(await isAdminAuthenticated()).toBe(false);
    state.headers.origin = "not a url";
    expect(await isAdminAuthenticated()).toBe(false);
  });
  it("rejects a wrong cookie", async () => {
    state.cookie = "nope";
    expect(await isAdminAuthenticated()).toBe(false);
  });
});
