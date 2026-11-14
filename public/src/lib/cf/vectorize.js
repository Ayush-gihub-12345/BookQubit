import { optional } from "./env.js";
import { embedText } from "./ai.js";
import { logError } from "./logger.js";

// Vector id conventions: book:{slug}:{lang} | node:{id} | user:{id}
// metadata.type lets one index serve books, MindSpace nodes and taste vectors.

export async function upsertVector(env, id, values, metadata = {}) {
  const idx = optional(env, "BOOK_VECTORS");
  if (!idx || !values) return false;
  try {
    await idx.upsert([{ id, values, metadata }]);
    return true;
  } catch (e) {
    logError("upsertVector", e, { id });
    return false;
  }
}

/** @returns {Promise<Array<{ id: string, score: number, metadata: any }>>} [] when unavailable. */
export async function queryVectors(env, values, { topK = 10, type } = {}) {
  const idx = optional(env, "BOOK_VECTORS");
  if (!idx || !values) return [];
  try {
    const res = await idx.query(values, {
      topK,
      returnMetadata: "all",
      ...(type ? { filter: { type } } : {}),
    });
    return (res.matches || []).map((m) => ({ id: m.id, score: m.score, metadata: m.metadata || {} }));
  } catch (e) {
    logError("queryVectors", e);
    return [];
  }
}

export async function semanticSearch(env, text, opts = {}) {
  const v = await embedText(env, text);
  return v ? queryVectors(env, v, opts) : [];
}

/** Reciprocal Rank Fusion over ranked id lists (keyword + semantic). */
export function rrf(lists, k = 60) {
  const score = new Map();
  for (const list of lists) {
    list.forEach((id, rank) => score.set(id, (score.get(id) || 0) + 1 / (k + rank + 1)));
  }
  return [...score.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id);
}

/** Mean of equal-length vectors, L2-normalised (cosine index). Ignores empty/mismatched entries; null if none usable. */
export function averageVectors(vectors) {
  const ok = vectors.filter((v) => Array.isArray(v) && v.length);
  if (!ok.length) return null;
  const dim = ok[0].length;
  const use = ok.filter((v) => v.length === dim);
  const sum = new Array(dim).fill(0);
  for (const v of use) for (let i = 0; i < dim; i++) sum[i] += v[i];
  const norm = Math.sqrt(sum.reduce((n, x) => n + x * x, 0)) || 1;
  return sum.map((x) => x / norm);
}
