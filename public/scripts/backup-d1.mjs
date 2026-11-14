// Exports the production USERS database (binding DB, name "database") to a
// local SQL file, for off-platform backup.
//
// This is the only copy of shelves, reviews, quotes, discussions, goals and
// preferences, none of which can be rebuilt. The catalog database is
// deliberately not backed up here: it is re-derivable from Open Library.
//
// READ-ONLY against production: `wrangler d1 export` reads and writes a local
// file; it never modifies the database. Needs the same wrangler auth a deploy
// already uses.
//
//   npm run backup
//
// Output: backups/database-<UTC timestamp>.sql  (gitignored: it contains
// personal data and must never be committed to this public repository).
//
// Restore, into a database that is EMPTY or disposable first:
//
//   npx wrangler d1 execute database --remote --file=backups/<file>.sql
//
// Test a restore against a scratch D1 before you ever need it for real; an
// untested backup is a hope, not a backup. Move the file somewhere that is
// not this laptop (encrypted storage / another provider).

import { execFileSync } from "node:child_process";
import { mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DB_NAME = "database"; // wrangler.jsonc: DB -> database_name "database"
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = join(ROOT, "backups");
const outFile = join(outDir, `${DB_NAME}-${stamp}.sql`);

mkdirSync(outDir, { recursive: true });

console.log(`Exporting remote D1 "${DB_NAME}" -> ${outFile}`);
execFileSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["wrangler", "d1", "export", DB_NAME, "--remote", `--output=${outFile}`],
  { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32" }
);

const kb = (statSync(outFile).size / 1024).toFixed(1);
console.log(`Done: ${outFile} (${kb} KB)`);
if (statSync(outFile).size < 1024) {
  console.error("Warning: the export is suspiciously small. Check it before trusting it.");
  process.exitCode = 1;
}
