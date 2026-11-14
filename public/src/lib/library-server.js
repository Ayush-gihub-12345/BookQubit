import { monthly, heatmap, streaks, goalPace, distribution, dayKey } from "@/lib/library";

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(n) ? n : 0));

/**
 * Log reading/listening progress. Writes (all small, batched per database):
 *   engagement: one reading_log row + ONE daily_activity upsert (stats/streaks read that row)
 *   main:       the reader's shelf status/progress (the existing source of truth for status)
 * `a` = { slug, pages?, percent?, audioSeconds?, finished? }
 */
export async function recordProgress(env, uid, a, now = new Date()) {
  const slug = String(a.slug || "").slice(0, 300);
  if (!slug) throw new Error("slug required");
  const pages = Math.round(clamp(a.pages, 0, 2000));
  const audio = Math.round(clamp(a.audioSeconds, 0, 86400));
  const percent = a.percent == null ? null : clamp(Number(a.percent), 0, 100);
  const finished = !!a.finished || percent === 100;
  const day = dayKey(now);
  const kind = finished ? "finish" : audio > 0 ? "audio" : "progress";

  if (env.ENGAGEMENT_DB && (pages || audio || finished || percent != null)) {
    const e = env.ENGAGEMENT_DB;
    await e.batch([
      e.prepare("INSERT INTO reading_log (user_id, book_slug, kind, pages, percent, audio_seconds) VALUES (?1,?2,?3,?4,?5,?6)")
        .bind(uid, slug, kind, pages || null, percent, audio || null),
      e.prepare(
        `INSERT INTO daily_activity (user_id, day, pages, audio_seconds, books_finished) VALUES (?1,?2,?3,?4,?5)
         ON CONFLICT(user_id, day) DO UPDATE SET pages = pages + ?3, audio_seconds = audio_seconds + ?4, books_finished = books_finished + ?5`
      ).bind(uid, day, pages, audio, finished ? 1 : 0),
    ]);
  }

  if (env.DB) {
    const status = finished ? "read" : "reading";
    const iso = now.toISOString();
    await env.DB.prepare(
      `INSERT INTO shelf (user_id, book_slug, status, progress, started_at, finished_at, updated_at)
       VALUES (?1, ?2, ?3, COALESCE(?4, 0), ?5, ?6, CURRENT_TIMESTAMP)
       ON CONFLICT(user_id, book_slug) DO UPDATE SET
         status = CASE WHEN ?3 = 'read' THEN 'read' WHEN status = 'read' THEN status ELSE ?3 END,
         progress = COALESCE(?4, progress),
         started_at = COALESCE(started_at, ?5),
         finished_at = COALESCE(?6, finished_at),
         updated_at = CURRENT_TIMESTAMP`
    ).bind(uid, slug, status, finished ? 100 : percent, iso, finished ? iso : null).run();
  }
  return { ok: true, day, kind };
}

/**
 * Reader stats for the dashboard. Reads ONE pre-aggregated table (daily_activity, <= ~400 rows),
 * the reader's finished shelf rows, and a single batched catalog lookup for genre/language mix.
 * `loadBooks(slugs)` → Map(slug → {category, lang, page_count}) is injected by the route.
 */
export async function buildStats(env, uid, { year, loadBooks, now = new Date() }) {
  const today = dayKey(now);
  let activity = [];
  let activityAvailable = false;
  if (env.ENGAGEMENT_DB) {
    const since = dayKey(now.getTime() - 400 * 86400000);
    const { results } = await env.ENGAGEMENT_DB.prepare(
      "SELECT day, pages, audio_seconds, books_finished FROM daily_activity WHERE user_id = ?1 AND day >= ?2 ORDER BY day"
    ).bind(uid, since).all();
    activity = results;
    activityAvailable = true;
  }

  let readRows = [];
  let target = 0;
  if (env.DB) {
    const [shelf, goal] = await Promise.all([
      env.DB.prepare(
        `SELECT book_slug, finished_at FROM shelf WHERE user_id = ?1 AND status = 'read'
         ORDER BY COALESCE(finished_at, updated_at) DESC LIMIT 1000`
      ).bind(uid).all(),
      env.DB.prepare("SELECT target FROM goals WHERE user_id = ?1 AND year = ?2").bind(uid, year).first(),
    ]);
    readRows = shelf.results;
    target = goal?.target || 0;
  }

  const finishedThisYear = readRows.filter((r) => (r.finished_at || "").startsWith(String(year))).length;
  const books = readRows.length ? await loadBooks(readRows.slice(0, 300).map((r) => r.book_slug)) : new Map();
  const known = [...books.values()];

  const activeDays = activity.filter((r) => (r.pages || 0) + (r.audio_seconds || 0) + (r.books_finished || 0) > 0).map((r) => r.day);
  return {
    year,
    activityAvailable,
    monthly: monthly(activity, year),
    streak: streaks(activeDays, today),
    heatmap: heatmap(activity, today),
    goal: { target, finished: finishedThisYear, ...goalPace({ target, finished: finishedThisYear, now }) },
    totals: {
      booksRead: readRows.length,
      pages: known.reduce((n, b) => n + (b.page_count || 0), 0),
      audioMinutes: Math.round(activity.reduce((n, r) => n + (r.audio_seconds || 0), 0) / 60),
    },
    genres: distribution(known.map((b) => b.category), 8),
    languages: distribution(known.map((b) => b.lang), 6),
  };
}
