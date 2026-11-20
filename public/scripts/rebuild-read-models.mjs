// Rebuilds the catalog read models (tag / author / publisher / format lookups, editions and facet counts) with the same SQL
// the admin button runs. Needs `wrangler login`. Apply migrations/catalog/0002 and 0003 first.
//
//   node scripts/rebuild-read-models.mjs --env=dev            the dev catalog (bookqubit-dev-catalog)
//   node scripts/rebuild-read-models.mjs --env=prod --yes     the PRODUCTION catalog; --yes is required
//
// Up to ~20,000 books it runs as one file. Beyond that it runs the id-range chunks one after another (each its own
// `d1 execute`), so no single query is large; the models are marked not-ready until the last step. Safe to repeat.
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { REBUILD_STATEMENTS, rebuildPlan } from "../src/lib/read-models-sql.js";

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const env = arg("env");
if (env !== "dev" && env !== "prod") { console.error("usage: rebuild-read-models.mjs --env=dev|prod [--yes]"); process.exit(1); }
if (env === "prod" && !process.argv.includes("--yes")) { console.error("Refusing to touch production without --yes."); process.exit(1); }

const db = env === "dev" ? "bookqubit-dev-catalog" : "catalog";
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const base = ["wrangler", "d1", "execute", db, "--remote", ...(env === "dev" ? ["--env=dev"] : [])];
const run = (extra) => spawnSync(npx, [...base, ...extra], { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"], timeout: 180_000, killSignal: "SIGKILL", shell: process.platform === "win32" });
const sql = (list) => list.map((s) => s.trim().replace(/;?$/, ";")).join("\n");

const dir = mkdtempSync(join(tmpdir(), "bq-readmodels-"));
const exec = (statements, name) => {
  const file = join(dir, name);
  writeFileSync(file, sql(statements));
  console.log("> " + name);
  const r = spawnSync(npx, [...base, `--file=${file}`], { stdio: ["ignore", "inherit", "inherit"], timeout: 180_000, killSignal: "SIGKILL", shell: process.platform === "win32" });
  if (r.status !== 0) { console.error(`step ${name} failed`); process.exit(r.status ?? 1); }
};

let maxId = 0;
try {
  const r = run(["--json", "--command", "SELECT COALESCE(MAX(id),0) AS m FROM books"]);
  maxId = Number(JSON.parse(r.stdout)[0].results[0].m) || 0;
} catch { /* unknown size: use the safe single-file path only for small catalogs, chunk otherwise */ maxId = 0; }

if (maxId > 20000) {
  rebuildPlan(maxId).forEach((step, i) => exec(step, `step-${String(i).padStart(3, "0")}.sql`));
} else {
  exec(REBUILD_STATEMENTS, "rebuild.sql");
}
console.log("done");
