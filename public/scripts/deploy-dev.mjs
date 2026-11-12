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
  const prodIds = new Set((cfg.d1_databases || []).map((d) => d.database_id));
  for (const d of dev.d1_databases || []) {
    if (prodIds.has(d.database_id)) fail("env.dev binds a PRODUCTION database (" + d.binding + ")");
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

run(["opennextjs-cloudflare", "build", "--env=dev"]);
run(["opennextjs-cloudflare", "deploy", "--env=dev"]);
