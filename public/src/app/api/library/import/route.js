import { NextResponse } from "next/server";
import { requireUser, unauthorized } from "@/lib/auth-request";
import { getCf } from "@/lib/cf/env";
import { rateLimit } from "@/lib/cf/cache";
import { logError } from "@/lib/cf/logger";
import { matchRows } from "@/lib/import-match";
import { upsertUser } from "@/lib/repo";

const MAX_CHUNK = 25; // keeps one request well inside the per-invocation subrequest budget
const MAX_TOTAL = 10000;

// Goodreads import, driven by the browser in small chunks (no queue needed, live progress):
//   { action: "start", total }                  → { jobId }
//   { action: "chunk", jobId, rows: [...] }     → { matched, unmatched: [titles] }
//   { action: "finish", jobId }                 → { ok }
// Rows are the already-parsed shape from lib/library.js#mapGoodreadsRow. Existing shelf entries
// are never overwritten (ON CONFLICT DO NOTHING).
export async function POST(request) {
  const user = await requireUser(request);
  if (!user) return unauthorized();
  const { env } = await getCf();
  if (!env.ENGAGEMENT_DB || !env.DB) return NextResponse.json({ error: "feature_unavailable" }, { status: 503 });
  const b = await request.json().catch(() => ({}));
  const eng = env.ENGAGEMENT_DB;

  try {
    if (b.action === "start") {
      const total = Math.min(MAX_TOTAL, Math.max(0, Number(b.total) || 0));
      const id = crypto.randomUUID();
      await eng.prepare("INSERT INTO import_jobs (id, user_id, total, status) VALUES (?1,?2,?3,'running')").bind(id, user.uid, total).run();
      return NextResponse.json({ jobId: id });
    }

    const job = await eng.prepare("SELECT id, status FROM import_jobs WHERE id=?1 AND user_id=?2").bind(b.jobId, user.uid).first();
    if (!job) return NextResponse.json({ error: "unknown job" }, { status: 404 });

    if (b.action === "finish") {
      await eng.prepare("UPDATE import_jobs SET status='done', updated_at=CURRENT_TIMESTAMP WHERE id=?1").bind(job.id).run();
      return NextResponse.json({ ok: true });
    }

    if (b.action === "chunk") {
      const rl = await rateLimit(env, `import:${user.uid}`, { limit: 600, windowSeconds: 3600 });
      if (!rl.allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
      const rows = (Array.isArray(b.rows) ? b.rows : []).slice(0, MAX_CHUNK).filter((r) => r && r.title);
      const slugs = await matchRows(env, rows);
      await upsertUser(user.uid, user.name, user.photo);

      const shelfStmts = [];
      const finishedDays = new Map();
      const unmatched = [];
      rows.forEach((r, i) => {
        const slug = slugs[i];
        if (!slug) { unmatched.push(r.title); return; }
        shelfStmts.push(
          env.DB.prepare(
            `INSERT INTO shelf (user_id, book_slug, status, rating, review, progress, started_at, finished_at, updated_at)
             VALUES (?1,?2,?3,?4,?5,?6,?7,?8,CURRENT_TIMESTAMP) ON CONFLICT(user_id, book_slug) DO NOTHING`
          ).bind(user.uid, slug, r.status, r.rating ?? null, r.review ?? null, r.status === "read" ? 100 : 0, r.addedAt || null, r.finishedAt || null)
        );
        if (r.status === "read" && r.finishedAt) finishedDays.set(r.finishedAt, (finishedDays.get(r.finishedAt) || 0) + 1);
      });
      if (shelfStmts.length) await env.DB.batch(shelfStmts);

      // Imported finish dates feed the heatmap/monthly charts without logging fake page counts.
      const dayStmts = [...finishedDays].map(([day, n]) =>
        eng.prepare(
          `INSERT INTO daily_activity (user_id, day, books_finished) VALUES (?1,?2,?3)
           ON CONFLICT(user_id, day) DO UPDATE SET books_finished = books_finished + ?3`
        ).bind(user.uid, day, n)
      );
      dayStmts.push(
        eng.prepare("UPDATE import_jobs SET done = done + ?2, matched = matched + ?3, updated_at=CURRENT_TIMESTAMP WHERE id=?1").bind(job.id, rows.length, shelfStmts.length)
      );
      await eng.batch(dayStmts);
      return NextResponse.json({ matched: shelfStmts.length, processed: rows.length, unmatched });
    }
    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    logError("library.import", e);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
