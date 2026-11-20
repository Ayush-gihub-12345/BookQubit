// Read-only check that a database set has everything the code expects, BEFORE you deploy (and after, to confirm).
// It changes nothing: it only runs SELECTs against sqlite_master.
//
//   node scripts/prod-preflight.mjs --env=dev      the dev databases (bookqubit-dev-*)
//   node scripts/prod-preflight.mjs --env=prod     the production databases
//
// For each migration file it lists the tables and indexes the file creates, then asks the matching remote database which of
// those exist. Missing ones are reported with the exact command that creates them. Exit code 1 when anything is missing.
// Needs `wrangler login`. stdin is ignored and every call has a time limit, so it can never hang a terminal or a build.
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { createdObjects, FOLDER_BINDING } from "./lib/migrations.mjs";

const arg = (n) => process.argv.find((a) => a.startsWith(`--${n}=`))?.split("=")[1];
const env = arg("env");
if (env !== "dev" && env !== "prod") { console.error("usage: prod-preflight.mjs --env=dev|prod"); process.exit(2); }

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const DB_NAMES = env === "dev"
  ? { DB: "bookqubit-dev-database", CATALOG_DB: "bookqubit-dev-catalog", ENGAGEMENT_DB: "bookqubit-dev-engagement", MINDSPACE_DB: "bookqubit-dev-mindspace" }
  : { DB: "database", CATALOG_DB: "catalog", ENGAGEMENT_DB: "engagement", MINDSPACE_DB: "mindspace" };
const npx = process.platform === "win32" ? "npx.cmd" : "npx";

function remoteNames(db) {
  const r = spawnSync(npx, ["wrangler", "d1", "execute", db, "--remote", ...(env === "dev" ? ["--env=dev"] : []), "--json", "--command", "SELECT type, name FROM sqlite_master WHERE type IN ('table','index')"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], timeout: 90_000, killSignal: "SIGKILL", shell: process.platform === "win32" });
  if (r.status !== 0) return { error: (r.stderr || "wrangler failed").split("\n").find((l) => l.trim()) || "wrangler failed" };
  try {
    const rows = JSON.parse(r.stdout)[0].results;
    return { tables: new Set(rows.filter((x) => x.type === "table").map((x) => x.name)), indexes: new Set(rows.filter((x) => x.type === "index").map((x) => x.name)) };
  } catch { return { error: "could not read wrangler output" }; }
}

let missingAny = false;
for (const folder of readdirSync(join(ROOT, "migrations"))) {
  const binding = FOLDER_BINDING[folder];
  if (!binding) continue;
  const db = DB_NAMES[binding];
  const have = remoteNames(db);
  console.log(`\n${db}  (${binding})`);
  if (have.error) { console.log(`  cannot check: ${have.error}`); missingAny = true; continue; }
  for (const file of readdirSync(join(ROOT, "migrations", folder)).filter((f) => f.endsWith(".sql")).sort()) {
    const { tables, indexes } = createdObjects(readFileSync(join(ROOT, "migrations", folder, file), "utf8"));
    const missing = [...tables.filter((t) => !have.tables.has(t)).map((t) => `table ${t}`), ...indexes.filter((i) => !have.indexes.has(i)).map((i) => `index ${i}`)];
    if (!missing.length) { console.log(`  ok       ${file}`); continue; }
    missingAny = true;
    console.log(`  MISSING  ${file}: ${missing.join(", ")}`);
    console.log(`           npx wrangler d1 execute ${db} --remote${env === "dev" ? " --env=dev" : ""} --file=migrations/${folder}/${file}`);
  }
}
console.log(missingAny ? "\nNot ready: apply the migrations above, then run this again." : "\nAll expected tables and indexes are present.");
process.exit(missingAny ? 1 : 0);
