import { REBUILD_STATEMENTS, rebuildPlan } from "./read-models-sql.js";

// Runtime side of the catalog read models (migrations/catalog/0002_read_models.sql).
// Rule: a model is only ever used when it exists AND covers every book (max_id >= the newest id being queried), so
// the worst case is the pre-existing slower code path, never a wrong or missing result for a new book.

const META_TTL_MS = 60_000;
let memo = { at: 0, value: null };

/** { built_at, max_id, books } or null when the tables are absent, empty, or unreadable. Memoised for a minute per isolate. */
export async function readModelMeta(db) {
  if (!db) return null;
  if (Date.now() - memo.at < META_TTL_MS) return memo.value;
  let value = null;
  try {
    value = (await db.prepare("SELECT built_at, max_id, books FROM read_model_meta WHERE name = 'catalog'").first()) || null;
  } catch {
    value = null; // table not created yet: behave exactly as before
  }
  memo = { at: Date.now(), value };
  return value;
}

/** True when the models exist and include every book up to `hi` (the newest id in the language being queried). */
export async function modelsCover(db, hi = 0) {
  const meta = await readModelMeta(db);
  return !!meta && Number(meta.max_id) >= Number(hi || 0);
}

/**
 * Rebuild every model. Up to ~20,000 books: one atomic batch. Larger catalogs: id-range chunks (see rebuildPlan), with the
 * models marked not-ready until the last step so readers never see a partial model. Returns the new meta row.
 */
export async function rebuildReadModels(db, { chunk = 5000 } = {}) {
  const top = await db.prepare("SELECT COALESCE(MAX(id), 0) AS m FROM books").first();
  const maxId = Number(top?.m || 0);
  if (maxId <= 4 * chunk) {
    await db.batch(REBUILD_STATEMENTS.map((sql) => db.prepare(sql)));
  } else {
    for (const step of rebuildPlan(maxId, chunk)) await db.batch(step.map((sql) => db.prepare(sql)));
  }
  memo = { at: 0, value: null };
  return readModelMeta(db);
}

/** Forget the memoised meta (tests, and right after an admin rebuild). */
export function resetReadModelMemo() { memo = { at: 0, value: null }; }

/**
 * SQL fragment selecting book ids through the key table. `n` is the placeholder number for the language; the value is
 * `n + 1`. Push `[lang, value]` (value from `keyValue`) onto the binds in that order.
 *   exact: tag, author            "this exact key"
 *   loose: publisher, format      "any distinct key containing the text" (the old in-memory index's behaviour),
 *                                 resolved over catalog_facets (a few thousand distinct keys), never over books.
 */
export function keyFilter(kind, n, loose) {
  const sql = loose
    ? `id IN (SELECT book_id FROM book_keys WHERE lang = ?${n} AND kind = '${kind}' AND key IN (SELECT name FROM catalog_facets WHERE lang = ?${n} AND kind = '${kind}' AND name LIKE ?${n + 1} ESCAPE '\\'))`
    : `id IN (SELECT book_id FROM book_keys WHERE lang = ?${n} AND kind = '${kind}' AND key = ?${n + 1})`;
  return sql;
}

/** The bound value for keyFilter: lower-cased, and for loose matches a LIKE pattern with wildcards escaped. */
export function keyValue(value, loose) {
  const v = String(value).trim().toLowerCase();
  return loose ? `%${v.replace(/[\\%_]/g, (c) => "\\" + c)}%` : v;
}
