// Rebuilds the catalog read models (tag / author / publisher / format lookups and facet counts) with the same SQL the
// admin button runs. Needs `wrangler login`. Apply migrations/catalog/0002_read_models.sql first.
//
//   node scripts/rebuild-read-models.mjs --env=dev            the dev catalog (bookqubit-dev-catalog)
//   node scripts/rebuild-read-models.mjs --env=prod --yes     the PRODUCTION catalog; --yes is required
//
// Safe to repeat: it deletes and refills the read tables (never `books`) in one pass.
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { REBUILD_STATEMENTS } from "../src/lib/read-models-sql.js";

const arg = (name) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const env = arg("env");
if (env !== "dev" && env !== "prod") { console.error("usage: rebuild-read-models.mjs --env=dev|prod [--yes]"); process.exit(1); }
if (env === "prod" && !process.argv.includes("--yes")) { console.error("Refusing to touch production without --yes."); process.exit(1); }

const dir = mkdtempSync(join(tmpdir(), "bq-readmodels-"));
const file = join(dir, "rebuild.sql");
writeFileSync(file, REBUILD_STATEMENTS.map((s) => s.trim().replace(/;?$/, ";")).join("\n"));

const db = env === "dev" ? "bookqubit-dev-catalog" : "catalog";
const args = ["wrangler", "d1", "execute", db, "--remote", ...(env === "dev" ? ["--env=dev"] : []), `--file=${file}`];
console.log("> npx " + args.join(" "));
const r = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", args, { stdio: ["ignore", "inherit", "inherit"], timeout: 120_000, killSignal: "SIGKILL", shell: process.platform === "win32" });
process.exit(r.status ?? 1);
