// Shared by scripts/prod-preflight.mjs (and its test): which tables and indexes a set of migration files promises to create.
// Every migration here is idempotent ("CREATE ... IF NOT EXISTS"), so "what it creates" is simply what those statements name.
export function createdObjects(sql) {
  const text = String(sql).replace(/^\s*--.*$/gm, "");
  const grab = (kind) => [...text.matchAll(new RegExp(`CREATE\\s+(?:UNIQUE\\s+)?${kind}\\s+(?:IF\\s+NOT\\s+EXISTS\\s+)?["\`]?([A-Za-z0-9_]+)["\`]?`, "gi"))].map((m) => m[1]);
  // Virtual tables (FTS5) show up in sqlite_master as tables too, and create shadow tables we do not list.
  const virtual = [...text.matchAll(/CREATE\s+VIRTUAL\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?["`]?([A-Za-z0-9_]+)["`]?/gi)].map((m) => m[1]);
  return { tables: [...new Set([...grab("TABLE"), ...virtual])], indexes: [...new Set(grab("INDEX"))] };
}

/** Which database (by binding) each migration folder belongs to. */
export const FOLDER_BINDING = { catalog: "CATALOG_DB", engagement: "ENGAGEMENT_DB", main: "DB", mindspace: "MINDSPACE_DB" };
