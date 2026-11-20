// Reading challenges: books read, genres explored, countries visited, pages turned. The reader joins a challenge by choosing
// a target for a year (a row in ENGAGEMENT_DB.reading_challenges); progress is never stored. It is computed from the books the
// reader finished that year: one indexed shelf read (idx_shelf_user, at most 1000 rows) and one batched catalog lookup.
export const KINDS = {
  books: { label: "Books read", unit: "books", min: 1, max: 365, suggested: 24 },
  genres: { label: "Genres explored", unit: "genres", min: 2, max: 50, suggested: 8 },
  countries: { label: "Countries read around the world", unit: "countries", min: 2, max: 100, suggested: 12 },
  pages: { label: "Pages turned", unit: "pages", min: 100, max: 1_000_000, suggested: 8000 },
};
export const isKind = (k) => Object.prototype.hasOwnProperty.call(KINDS, k);
export const clampTarget = (kind, n) => Math.min(KINDS[kind].max, Math.max(KINDS[kind].min, Math.round(Number(n) || KINDS[kind].suggested)));

const norm = (v) => String(v ?? "").trim().toLowerCase();

/** Progress for one kind from finished books: [{ slug, category, country, page_count }]. */
export function progressFor(kind, books) {
  switch (kind) {
    case "books": return { done: books.length, items: [] };
    case "pages": return { done: books.reduce((n, b) => n + (Number(b.page_count) > 0 ? Number(b.page_count) : 0), 0), items: [] };
    case "genres": { const s = new Map(); for (const b of books) if (norm(b.category) && !s.has(norm(b.category))) s.set(norm(b.category), b.category); return { done: s.size, items: [...s.values()].sort() }; }
    case "countries": { const s = new Map(); for (const b of books) if (norm(b.country) && !s.has(norm(b.country))) s.set(norm(b.country), b.country); return { done: s.size, items: [...s.values()].sort() }; }
    default: return { done: 0, items: [] };
  }
}

/** Joined challenges with their progress, plus the kinds not joined yet. `loadBooks(slugs)` returns a Map slug -> row. */
export async function challengeStatus({ accounts, engagement, loadBooks }, uid, year) {
  const [joined, finished] = await Promise.all([
    engagement.prepare("SELECT kind, target FROM reading_challenges WHERE user_id = ?1 AND year = ?2").bind(uid, year).all(),
    accounts
      ? accounts.prepare(
          `SELECT book_slug FROM shelf WHERE user_id = ?1 AND status = 'finished'
           AND COALESCE(finished_at, updated_at) >= ?2 AND COALESCE(finished_at, updated_at) < ?3 LIMIT 1000`).bind(uid, `${year}-01-01`, `${year + 1}-01-01`).all()
      : { results: [] },
  ]);
  const slugs = finished.results.map((r) => r.book_slug);
  const rows = slugs.length && joined.results.length ? await loadBooks(slugs) : new Map();
  const books = slugs.map((s) => ({ slug: s, ...(rows.get(s) || {}) }));
  const have = new Set(joined.results.map((j) => j.kind));
  return {
    year,
    finishedCount: slugs.length,
    challenges: joined.results.filter((j) => isKind(j.kind)).map((j) => {
      const p = progressFor(j.kind, books);
      return { kind: j.kind, label: KINDS[j.kind].label, unit: KINDS[j.kind].unit, target: j.target, done: p.done, items: p.items, pct: Math.min(100, Math.round((p.done / j.target) * 100)), complete: p.done >= j.target };
    }),
    available: Object.entries(KINDS).filter(([k]) => !have.has(k)).map(([kind, v]) => ({ kind, label: v.label, unit: v.unit, suggested: v.suggested, min: v.min, max: v.max })),
  };
}

export async function joinChallenge(engagement, uid, year, kind, target) {
  if (!isKind(kind)) throw Object.assign(new Error("Unknown challenge."), { status: 400 });
  const t = clampTarget(kind, target);
  await engagement.prepare(
    `INSERT INTO reading_challenges(user_id, year, kind, target) VALUES (?1,?2,?3,?4)
     ON CONFLICT(user_id, year, kind) DO UPDATE SET target = excluded.target`).bind(uid, year, kind, t).run();
  return { kind, target: t };
}

export async function leaveChallenge(engagement, uid, year, kind) {
  await engagement.prepare("DELETE FROM reading_challenges WHERE user_id = ?1 AND year = ?2 AND kind = ?3").bind(uid, year, kind).run();
  return { left: true };
}
