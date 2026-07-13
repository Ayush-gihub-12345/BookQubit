// Daily (well, every-3-hours) bulk import cron. Reads the next unprocessed
// chunk files from R2 (staged by prepare_import.py + upload_to_r2.py),
// inserts them into D1's `books` table, and records exactly where it
// stopped in `import_progress` so the next run picks up seamlessly —
// resumable across restarts, redeploys, and even a fresh queue refresh.

async function runImport(env) {
  const db = env.DB;
  const bucket = env.IMPORT_BUCKET;
  const prefix = env.IMPORT_PREFIX || "import-queue";
  const perRunChunks = Number(env.PER_RUN_CHUNKS) || 5;
  const batchSize = Number(env.D1_BATCH_SIZE) || 100;

  await db.prepare(
    `INSERT INTO import_progress (id, source_prefix, next_chunk, total_chunks) VALUES (1, ?1, 0, 0)
     ON CONFLICT(id) DO NOTHING`
  ).bind(prefix).run();

  const progress = await db.prepare("SELECT * FROM import_progress WHERE id=1").first();

  // Re-read the manifest every run — if you upload a refreshed queue with
  // more chunks later, this picks up the new total automatically.
  const manifestObj = await bucket.get(`${prefix}/manifest.json`);
  const totalChunks = manifestObj ? (await manifestObj.json()).totalChunks : progress.total_chunks;

  let nextChunk = progress.next_chunk;
  let imported = 0;
  let skipped = 0;
  let processedChunks = 0;

  while (processedChunks < perRunChunks && nextChunk < totalChunks) {
    const chunkNum = String(nextChunk + 1).padStart(5, "0");
    const obj = await bucket.get(`${prefix}/chunk-${chunkNum}.jsonl`);
    if (!obj) break; // missing/gap in the queue — stop safely rather than skip silently

    const text = await obj.text();
    const rows = text.split("\n").filter(Boolean).map((line) => JSON.parse(line));

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
      for (const res of results) {
        if (res.meta.changes > 0) imported += 1;
        else skipped += 1; // already existed (ON CONFLICT DO NOTHING) — not an error
      }
    }

    nextChunk += 1;
    processedChunks += 1;
  }

  await db.prepare(
    `UPDATE import_progress SET next_chunk=?1, total_chunks=?2, total_imported=total_imported+?3,
       total_skipped=total_skipped+?4, last_run_at=CURRENT_TIMESTAMP, last_status=?5 WHERE id=1`
  ).bind(
    nextChunk, totalChunks, imported, skipped,
    totalChunks > 0 && nextChunk >= totalChunks ? "complete" : "in_progress"
  ).run();

  return { imported, skipped, chunksProcessed: processedChunks, nextChunk, totalChunks };
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runImport(env));
  },
  // Manual trigger for testing locally/remotely: GET /run
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/run") {
      const result = await runImport(env);
      return Response.json(result);
    }
    return new Response("bookqubit-import-cron is running. GET /run to trigger manually.");
  },
};
