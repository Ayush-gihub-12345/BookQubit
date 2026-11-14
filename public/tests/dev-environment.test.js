import { describe, it, expect, afterEach, vi } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// wrangler.jsonc allows // comments; these are whole-line comments only.
const load = () => JSON.parse(
  readFileSync(fileURLToPath(new URL("../wrangler.jsonc", import.meta.url)), "utf8").replace(/^\s*\/\/.*$/gm, "")
);

describe("wrangler.jsonc: the dev environment can never touch production data", () => {
  const cfg = load();
  const dev = cfg.env && cfg.env.dev;

  it("defines a dev environment named bookqubit-dev-site", () => {
    expect(dev).toBeTruthy();
    expect(dev.name).toBe("bookqubit-dev-site");
    // and it must not be the production Worker's name
    expect(dev.name).not.toBe(cfg.name);
  });

  it("binds only its own D1 databases, never a production id", () => {
    const prodIds = new Set(cfg.d1_databases.map((d) => d.database_id));
    const devDbs = dev.d1_databases;
    expect(devDbs.map((d) => d.binding).sort()).toEqual(["CATALOG_DB", "DB"]);
    for (const d of devDbs) {
      expect(prodIds.has(d.database_id)).toBe(false);
      expect(d.database_name).toMatch(/dev/);
    }
  });

  it("has no service bindings (the importer writes to the production catalog)", () => {
    expect(dev.services ?? []).toEqual([]);
  });

  it("does not turn on schema bootstrap", () => {
    expect(dev.vars.RUN_SCHEMA).toBe("0");
  });

  it("production config is untouched: still the production Worker and databases", () => {
    expect(cfg.name).toBe("bookqubitdev");
    expect(cfg.d1_databases.map((d) => d.database_name).sort()).toEqual(["catalog", "database"]);
    expect(cfg.services.map((s) => s.binding)).toEqual(["IMPORT_CRON"]);
  });
});

describe("dev deployment behaviour", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("robots.txt: dev disallows every crawler and advertises no sitemap", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "dev");
    const { default: robots } = await import("@/app/robots.js");
    const out = robots();
    expect(out.rules).toEqual([{ userAgent: "*", disallow: "/" }]);
    expect(out.sitemap).toBeUndefined();
  });

  it("robots.txt: production is unchanged (sitemap present, crawlers still listed)", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "");
    const { default: robots } = await import("@/app/robots.js");
    const out = robots();
    expect(out.sitemap).toMatch(/\/sitemap\.xml$/);
    expect(out.rules.some((r) => r.userAgent === "SERankingBacklinksBot")).toBe(true);
    expect(out.rules.find((r) => r.userAgent === "*").allow).toBe("/");
  });

  it("banner shows in dev and renders nothing in production", async () => {
    const { default: EnvBanner } = await import("@/components/EnvBanner.jsx");
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "");
    expect(EnvBanner()).toBeNull();
    vi.stubEnv("NEXT_PUBLIC_APP_ENV", "dev");
    expect(EnvBanner()).not.toBeNull();
  });
});
