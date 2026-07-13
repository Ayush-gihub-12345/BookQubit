// Daily (well, every-3-hours) bulk import cron. The whole queue lives in D1
// itself (`import_chunks` — no R2/external storage) as compact JSON-blob
// rows staged by prepare_import.py. Each run consumes a few unconsumed
// chunks, expands them into real `books` rows, and records cumulative
// progress in `import_progress` — resumable across restarts and redeploys
// since "which chunks are left" is just a WHERE clause, not a cursor to lose.
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
      imported: 0, skipped: 0, chunksProcessed: 0, remainingChunks: null, capped: true,
      dailyCap: progress.daily_cap, importedToday: progress.imported_today, insertedTitles: [],
    };
  }

  const { results: chunks } = await db.prepare(
    "SELECT id, chunk_data FROM import_chunks WHERE consumed = 0 ORDER BY id LIMIT ?1"
  ).bind(perRunChunks).all();

  let imported = 0;
  let skipped = 0;
  const insertedTitles = [];

  for (const chunkRow of chunks) {
    if (progress.imported_today + imported >= progress.daily_cap) break; // stop mid-run if the cap is hit
    const rows = JSON.parse(chunkRow.chunk_data);

    for (let i = 0; i < rows.length; i += batchSize) {
      const slice = rows.slice(i, i + batchSize);
      const stmts = slice.map((r) =>
        db.prepare(
          `INSERT INTO books (slug, lang, title, author, publisher, isbn, published, page_count, format, category, subjects, cover_url)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
           ON CONFLICT(slug, lang) DO NOTHING`
        ).bind(
          r.slug, r.lang || "en", r.title, r.author || null, r.publisher || null, r.isbn || null,
          r.published || null, r.page_count || null, r.format || null, r.category || null,
          JSON.stringify(r.subjects || []), r.cover_url || null
        )
      );
      const results = await db.batch(stmts);
      results.forEach((res, idx) => {
        if (res.meta.changes > 0) {
          imported += 1;
          insertedTitles.push(slice[idx].title);
        } else {
          skipped += 1; // already existed (ON CONFLICT DO NOTHING) — not an error
        }
      });
    }

    await db.prepare("UPDATE import_chunks SET consumed = 1 WHERE id = ?1").bind(chunkRow.id).run();
  }

  const remaining = await db.prepare("SELECT COUNT(*) AS n FROM import_chunks WHERE consumed = 0").first();

  await db.prepare(
    `UPDATE import_progress SET total_imported = total_imported + ?1, total_skipped = total_skipped + ?2,
       imported_today = imported_today + ?1, last_run_at = CURRENT_TIMESTAMP, last_status = ?3 WHERE id = 1`
  ).bind(imported, skipped, remaining.n === 0 ? "complete" : "in_progress").run();

  return { imported, skipped, chunksProcessed: chunks.length, remainingChunks: remaining.n, capped: false, insertedTitles };
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
