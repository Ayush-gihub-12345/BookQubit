// Builds and deploys the DEV environment (Worker "bookqubit-dev-site").
//
// Run by the Workers Builds trigger on pushes to the `dev` branch, and usable by
// hand: `npm run deploy:dev` (needs `wrangler login`). Production is deployed by
// `npm run deploy`, which this never touches.
//
// NEXT_PUBLIC_* values are inlined at BUILD time, so they are set here, in the
// same process that builds, and not in a dashboard that could drift:
//   NEXT_PUBLIC_APP_ENV=dev  -> banner, noindex, robots disallow-all, no production
//                               Google Analytics
//   NEXT_PUBLIC_BASE_URL     -> canonical/OG URLs point at the dev address, not the
//                               live domain
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DEV_WORKER = "bookqubit-dev-site";
const DEV_URL = "https://bookqubit-dev-site.webpagewale.workers.dev";

// Refuse to deploy if the dev config could touch production data. This duplicates
// tests/dev-environment.test.js on purpose: the test guards the repo, this guards
// the one command that actually ships.
function assertDevConfigIsIsolated() {
  const raw = readFileSync(fileURLToPath(new URL("../wrangler.jsonc", import.meta.url)), "utf8");
  const cfg = JSON.parse(raw.replace(/^\s*\/\/.*$/gm, ""));
  const dev = cfg.env && cfg.env.dev;
  const fail = (m) => { console.error("deploy:dev refused: " + m); process.exit(1); };
  if (!dev) fail("wrangler.jsonc has no env.dev block");
  if (dev.name !== DEV_WORKER) fail("env.dev.name is " + dev.name + ", expected " + DEV_WORKER);
  // Databases without an id are created by wrangler at deploy time; compare real ids and names only.
  const prodIds = new Set((cfg.d1_databases || []).map((d) => d.database_id).filter(Boolean));
  const prodNames = new Set((cfg.d1_databases || []).map((d) => d.database_name));
  for (const d of dev.d1_databases || []) {
    if (d.database_id && prodIds.has(d.database_id)) fail("env.dev binds a PRODUCTION database (" + d.binding + ")");
    if (prodNames.has(d.database_name)) fail("env.dev reuses a PRODUCTION database name (" + d.database_name + ")");
  }
  if ((dev.services || []).length) fail("env.dev has service bindings (the importer writes to production)");
}

assertDevConfigIsIsolated();

const env = { ...process.env, NEXT_PUBLIC_APP_ENV: "dev", NEXT_PUBLIC_BASE_URL: DEV_URL };
const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const run = (args) => {
  console.log("> npx " + args.join(" "));
  const r = spawnSync(npx, args, { stdio: "inherit", env, shell: process.platform === "win32" });
  if (r.status !== 0) process.exit(r.status === null ? 1 : r.status);
};

// OpenNext refuses Next.js majors older than two years (15.x since Oct 2026). Production
// builds hit the same check; moving to a supported Next.js is a separate upgrade.
run(["opennextjs-cloudflare", "build", "--env=dev", "--dangerouslyUseUnsupportedNextVersion"]);
run(["opennextjs-cloudflare", "deploy", "--env=dev"]);

// The dev-only engagement / mindspace / catalog schema. Every statement is idempotent (CREATE ... IF NOT EXISTS), so
// running it on each deploy is safe. A failure here is reported but does not fail the deploy: the site is already live
// and those features simply stay "unavailable" until the SQL lands.
const sql = [
  ["bookqubit-dev-engagement", "migrations/engagement/0001_engagement.sql"],
  ["bookqubit-dev-mindspace", "migrations/mindspace/0001_mindspace.sql"],
  ["bookqubit-dev-catalog", "migrations/catalog/0001_fts_summaries.sql"],
  ["bookqubit-dev-catalog", "migrations/catalog/0002_read_models.sql"],
  ["bookqubit-dev-catalog", "migrations/catalog/0003_scale_series_works.sql"],
  ["bookqubit-dev-database", "migrations/main/0001_search_safety.sql"],
];
// These steps run AFTER the site is deployed, so they must never be able to hold the build open: no stdin (a prompt can
// never wait for an answer), a hard time limit per step, and a timestamp on every step so the build log shows exactly
// where time goes.
const STEP_LIMIT_MS = 120_000;
const quiet = { stdio: ["ignore", "inherit", "inherit"], env, timeout: STEP_LIMIT_MS, killSignal: "SIGKILL", shell: process.platform === "win32" };
const stamp = () => new Date().toISOString().slice(11, 19);
for (const [db, file] of sql) {
  const args = ["wrangler", "d1", "execute", db, "--remote", "--env=dev", "--file=" + file];
  console.log("[" + stamp() + "] > npx " + args.join(" "));
  const r = spawnSync(npx, args, quiet);
  console.log("[" + stamp() + "] exit " + (r.status ?? (r.error ? "timeout/killed" : "?")) + " " + file);
  if (r.status !== 0) console.warn("note: could not apply " + file + " to " + db + "; apply it by hand (see DEPLOYMENT_CHECKLIST.md)");
}

// Fill the catalog read models (idempotent; one pass over the dev catalog). Same SQL as Admin -> Caches -> Rebuild.
console.log("[" + stamp() + "] > rebuild read models");
const rebuild = spawnSync(process.execPath, ["scripts/rebuild-read-models.mjs", "--env=dev"], { ...quiet, shell: false, timeout: STEP_LIMIT_MS + 30_000 });
console.log("[" + stamp() + "] exit " + (rebuild.status ?? (rebuild.error ? "timeout/killed" : "?")) + " rebuild read models");
if (rebuild.status !== 0) console.warn("note: could not rebuild the read models; run scripts/rebuild-read-models.mjs --env=dev by hand");
process.exit(0); // the site is deployed; never let a bookkeeping step decide the build's outcome
