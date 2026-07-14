// Daily (well, every-3-hours) bulk import cron. The whole queue lives in D1
// itself (`import_chunks` — no R2/external storage) as compact JSON-blob
// rows staged by prepare_import.py. Each row carries { books, authors,
// publications } — every book comes with author/publisher stub profiles
// (name + slug, plus whatever bio Open Library's author dump actually has),
// so every author/publisher gets at least a bare page, not just plain text
// on the book. Each run consumes a few unconsumed chunks, expands them into
// real rows, and records cumulative progress in `import_progress` —
// resumable across restarts and redeploys since "which chunks are left" is
// just a WHERE clause, not a cursor to lose.
//
// Two independent safeguards protect the daily D1 write quota:
//   1. daily_cap/imported_today/today_date on import_progress — enforced
//      here regardless of who or what triggered the run (scheduled cron OR
//      a manual "Run now" click), so a manual trigger can never blow past
//      the day's budget even if clicked repeatedly.
//   2. The /run HTTP route requires a shared secret header, known only to
//      the main app's server (never sent to the browser) — the raw worker
//      URL is not something "anyone" can use to trigger a run.
//
// maxChunks lets a caller process just one chunk per call (the admin
// dashboard does this in a loop, so it can show live per-chunk progress
// instead of waiting for the whole scheduled-size batch to finish silently).

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

async function runImport(env, { maxChunks } = {}) {
  const db = env.DB;
  const perRunChunks = maxChunks || Number(env.PER_RUN_CHUNKS) || 13;
  const batchSize = Number(env.D1_BATCH_SIZE) || 100;

  await db.prepare(
    "INSERT INTO import_progress (id, total_imported, total_skipped) VALUES (1, 0, 0) ON CONFLICT(id) DO NOTHING"
  ).run();

  let progress = await db.prepare("SELECT * FROM import_progress WHERE id=1").first();

  // Roll the daily counter over at UTC midnight.
  if (progress.today_date !== todayUTC()) {
    await db.prepare("UPDATE import_progress SET today_date=?1, imported_today=0 WHERE id=1").bind(todayUTC()).run();
    progress = { ...progress, today_date: todayUTC(), imported_today: 0 };
  }

  if (progress.imported_today >= progress.daily_cap) {
    return {
      imported: 0, skipped: 0, authorsImported: 0, publishersImported: 0,
      chunksProcessed: 0, remainingChunks: null, capped: true,
      dailyCap: progress.daily_cap, importedToday: progress.imported_today, insertedTitles: [],
    };
  }

  const { results: chunks } = await db.prepare(
    "SELECT id, chunk_data FROM import_chunks WHERE consumed = 0 ORDER BY id LIMIT ?1"
  ).bind(perRunChunks).all();

  let imported = 0;
  let skipped = 0;
  let authorsImported = 0;
  let publishersImported = 0;
  const insertedTitles = [];

  // Runs one batch of INSERT ... ON CONFLICT DO NOTHING statements against
  // `db`, returning how many actually inserted a new row (vs. already existed).
  async function upsertBatch(table, columns, rows, toValues) {
    let insertedCount = 0;
    for (let i = 0; i < rows.length; i += batchSize) {
      const slice = rows.slice(i, i + batchSize);
      const placeholders = columns.map((_, idx) => `?${idx + 1}`).join(", ");
      const stmts = slice.map((r) =>
        db.prepare(
          `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders}) ON CONFLICT(slug, lang) DO NOTHING`
        ).bind(...toValues(r))
      );
      const results = await db.batch(stmts);
      results.forEach((res, idx) => {
        if (res.meta.changes > 0) insertedCount += 1;
        else if (table === "books") skipped += 1; // already existed — not an error
        if (table === "books" && res.meta.changes > 0) insertedTitles.push(slice[idx].title);
      });
    }
    return insertedCount;
  }

  for (const chunkRow of chunks) {
    // Total D1 rows written this run (books + author/publisher stubs) is
    // what actually counts against the daily write-row quota, not just books.
    if (progress.imported_today + imported + authorsImported + publishersImported >= progress.daily_cap) break;
    const payload = JSON.parse(chunkRow.chunk_data);

    imported += await upsertBatch(
      "books",
      ["slug", "lang", "title", "author", "publisher", "isbn", "published", "page_count", "format", "category", "subjects", "cover_url"],
      payload.books || [],
      (r) => [
        r.slug, r.lang || "en", r.title, r.author || null, r.publisher || null, r.isbn || null,
        r.published || null, r.page_count || null, r.format || null, r.category || null,
        JSON.stringify(r.subjects || []), r.cover_url || null,
      ]
    );
    authorsImported += await upsertBatch(
      "authors",
      ["slug", "lang", "name", "birth_year", "bio", "wikipedia_url"],
      payload.authors || [],
      (r) => [r.slug, r.lang || "en", r.name, r.birth_year || null, r.bio || null, r.wikipedia_url || null]
    );
    publishersImported += await upsertBatch(
      "publications",
      ["slug", "lang", "name"],
      payload.publications || [],
      (r) => [r.slug, r.lang || "en", r.name]
    );

    await db.prepare("UPDATE import_chunks SET consumed = 1 WHERE id = ?1").bind(chunkRow.id).run();
  }

  const remaining = await db.prepare("SELECT COUNT(*) AS n FROM import_chunks WHERE consumed = 0").first();
  const totalWrittenThisRun = imported + authorsImported + publishersImported;

  await db.prepare(
    `UPDATE import_progress SET total_imported = total_imported + ?1, total_skipped = total_skipped + ?2,
       total_authors_imported = total_authors_imported + ?3, total_publishers_imported = total_publishers_imported + ?4,
       imported_today = imported_today + ?5, last_run_at = CURRENT_TIMESTAMP, last_status = ?6 WHERE id = 1`
  ).bind(imported, skipped, authorsImported, publishersImported, totalWrittenThisRun, remaining.n === 0 ? "complete" : "in_progress").run();

  return {
    imported, skipped, authorsImported, publishersImported,
    chunksProcessed: chunks.length, remainingChunks: remaining.n, capped: false, insertedTitles,
  };
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runImport(env));
  },
  // Manual trigger, called only by the main app's server (never the
  // browser directly) — requires the shared secret set via
  // `wrangler secret put IMPORT_TRIGGER_SECRET`.
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/run") {
      const provided = request.headers.get("x-import-secret");
      if (!env.IMPORT_TRIGGER_SECRET || provided !== env.IMPORT_TRIGGER_SECRET) {
        return new Response("unauthorized", { status: 401 });
      }
      const maxChunks = Number(url.searchParams.get("maxChunks")) || undefined;
      const result = await runImport(env, { maxChunks });
      return Response.json(result);
    }
    return new Response("bookqubit-import-cron is running.", { status: 200 });
  },
};
