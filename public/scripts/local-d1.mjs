// Local stand-in for the Cloudflare bindings, backed by Node's built-in
// SQLite (node:sqlite). It exists so `next dev` can run on a machine where
// workerd (Cloudflare's local runtime, used by wrangler / getPlatformProxy)
// will not start. That is the case on a Windows box missing the Visual C++
// runtime, and it was the case here: workerd.exe exits 0xC0000135.
//
// DEV ONLY. Nothing in the deployed Worker imports this file. It activates
// only when BQ_LOCAL_D1=1 is set, via next.config.mjs. It never talks to
// Cloudflare, never reads a secret, and writes only under public/.local-d1/
// (gitignored).
//
//   npm run dev:local   -> next dev with this shim
//   npm run seed:local  -> fill the local catalog from the live PUBLIC
//                          catalog API (read-only GETs)
//
// It implements the slice of the D1 API this app uses: prepare().bind() then
// all() / first() / run() / raw(), batch(), and exec(). It is deliberately
// not a general D1 emulator.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = join(ROOT, ".local-d1");

// node:sqlite rejects `undefined` and booleans; D1 accepts them by coercing.
const norm = (v) => (v === undefined ? null : typeof v === "boolean" ? (v ? 1 : 0) : v);
const plain = (row) => (row ? { ...row } : row);

class Statement {
  constructor(db, sql, params = []) {
    this.db = db;
    this.sql = sql;
    this.params = params;
  }
  bind(...params) {
    return new Statement(this.db, this.sql, params.map(norm));
  }
  _stmt() {
    return this.db.prepare(this.sql);
  }
  async all() {
    const rows = this._stmt().all(...this.params).map(plain);
    return { results: rows, success: true, meta: { rows_read: rows.length, rows_written: 0, duration: 0 } };
  }
  async first(col) {
    const row = plain(this._stmt().get(...this.params)) ?? null;
    if (row && col) return row[col] ?? null;
    return row;
  }
  async raw() {
    return this._stmt().setReturnArrays(true).all(...this.params);
  }
  async run() {
    const r = this._stmt().run(...this.params);
    return {
      success: true,
      results: [],
      meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid), rows_written: Number(r.changes), duration: 0 },
    };
  }
}

export class LocalD1 {
  constructor(file) {
    this.db = new DatabaseSync(file);
    this.db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = OFF;");
  }
  prepare(sql) {
    return new Statement(this.db, sql);
  }
  async exec(sql) {
    this.db.exec(sql);
    return { count: 1, duration: 0 };
  }
  // D1 batches are atomic; mirror that with one transaction.
  async batch(statements) {
    this.db.exec("BEGIN");
    try {
      const out = [];
      for (const s of statements) out.push(await s.run());
      this.db.exec("COMMIT");
      return out;
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }
}

export function openWithSchema(name, schemaFiles) {
  mkdirSync(DIR, { recursive: true });
  const file = join(DIR, `${name}.sqlite`);
  const fresh = !existsSync(file);
  const d1 = new LocalD1(file);
  if (fresh) {
    for (const f of schemaFiles) {
      const path = f.startsWith("migrations/") ? join(ROOT, f) : join(ROOT, "sql", f);
      // The schema files end with bare ALTERs for columns the CREATEs lack;
      // on a fresh file they apply once. Failures are reported, not hidden.
      for (const stmt of readFileSync(path, "utf8").split(/;\s*(?:\r?\n|$)/)) {
        const s = stmt.replace(/^\s*--.*$/gm, "").trim();
        if (!s) continue;
        try { d1.db.exec(s); } catch (e) { console.warn(`[local-d1] ${name}: ${f}: ${e.message}`); }
      }
    }
  }
  return d1;
}

// The context object has the same shape OpenNext's dev proxy provides:
// { env, cf, ctx }. `getCloudflareContext({ async: true })` returns it.
export function installLocalCloudflareContext() {
  // next dev loads the config in two processes; OpenNext only initialises in
  // the one that has AsyncLocalStorage, because that is the one that renders.
  if (!globalThis.AsyncLocalStorage) return;
  const catalog = openWithSchema("catalog", ["catalog_schema.sql"]);
  const main = openWithSchema("database", ["main_schema.sql"]);
  // Reader data (lists, votes, replies, challenges, reading log) lives in its own database, as in production.
  const engagement = openWithSchema("engagement", ["migrations/engagement/0001_engagement.sql", "migrations/engagement/0002_lists_votes_challenges.sql"]);
  globalThis[Symbol.for("__cloudflare-context__")] = {
    env: {
      DB: main,
      CATALOG_DB: catalog,
      ENGAGEMENT_DB: engagement,
      RUN_SCHEMA: "0",
      // IMPORT_CRON (the importer service binding) does not exist locally;
      // admin import routes will report it as not configured, which is accurate.
    },
    cf: {},
    ctx: { waitUntil() {}, passThroughOnException() {} },
  };
  console.log("[local-d1] using local SQLite in public/.local-d1 (no Cloudflare runtime)");
}
