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
    // Databases without an id are created by wrangler at deploy time, so only real ids are compared.
    const prodIds = new Set(cfg.d1_databases.map((d) => d.database_id).filter(Boolean));
    const prodNames = new Set(cfg.d1_databases.map((d) => d.database_name));
    const devDbs = dev.d1_databases;
    expect(devDbs.map((d) => d.binding).sort()).toEqual(["CATALOG_DB", "DB", "ENGAGEMENT_DB", "MINDSPACE_DB"]);
    for (const d of devDbs) {
      if (d.database_id) expect(prodIds.has(d.database_id)).toBe(false);
      expect(prodNames.has(d.database_name)).toBe(false);
      expect(d.database_name).toMatch(/dev/);
    }
  });

  it("has its own KV namespace (no id, so wrangler creates it for this Worker only) and Workers AI", () => {
    expect(dev.kv_namespaces).toEqual([{ binding: "CACHE_KV" }]);
    expect(dev.r2_buckets).toBeUndefined(); // R2 needs enabling on the account first (phase 2)
    expect(dev.ai).toEqual({ binding: "AI" });
  });

  it("has no service bindings (the importer writes to the production catalog)", () => {
    expect(dev.services ?? []).toEqual([]);
  });

  it("does not turn on schema bootstrap", () => {
    expect(dev.vars.RUN_SCHEMA).toBe("0");
  });

  it("production keeps its Worker, its two existing databases (same ids) and the importer service", () => {
    expect(cfg.name).toBe("bookqubitdev");
    const existing = cfg.d1_databases.filter((d) => d.database_id);
    expect(existing.map((d) => [d.binding, d.database_name, d.database_id]).sort()).toEqual([
      ["CATALOG_DB", "catalog", "a1795b64-95f5-49c3-9700-3a2c4401a5ba"],
      ["DB", "database", "b7a72589-843b-4c9a-b793-27e3a1ae2b80"],
    ]);
    expect(cfg.services.map((s) => s.binding)).toEqual(["IMPORT_CRON"]);
  });

  it("production declares the shared cache, engagement and mindspace databases and AI", () => {
    expect(cfg.d1_databases.map((d) => d.binding).sort()).toEqual(["CATALOG_DB", "DB", "ENGAGEMENT_DB", "MINDSPACE_DB"]);
    expect(cfg.kv_namespaces).toEqual([{ binding: "CACHE_KV" }]);
    expect(cfg.r2_buckets).toBeUndefined();
    expect(cfg.ai).toEqual({ binding: "AI" });
    // Resources that must be created by hand are not enabled here (they would fail the deploy if missing).
    expect(cfg.queues).toBeUndefined();
    expect(cfg.vectorize).toBeUndefined();
    expect(cfg.durable_objects).toBeUndefined();
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
