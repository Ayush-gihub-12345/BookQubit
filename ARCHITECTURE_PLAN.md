# BookQubit — Architecture Plan (Phase 0 audit)

Branch: `claude/docs-setup-7d64f3`. Dev-only work, written so a plain merge to `main` carries it to production.
**Nothing here touches production data or remote resources.** All DB work is `--local`.

## 1. What exists today (audited)

| Area | Reality |
|---|---|
| Stack | Next.js 15 (App Router) + React 19 + Tailwind 4 + `@opennextjs/cloudflare` 1.x, **plain JavaScript** (`.js/.jsx`, `jsconfig.json`) — there is **no TypeScript**, so `tsc --noEmit` does not apply. Verification = `next build` / `opennextjs-cloudflare build`. New code stays JS (+ JSDoc) to match. |
| Worker | `public/wrangler.jsonc`, name `bookqubitdev`, `main: .open-next/worker.js`, `nodejs_compat` |
| D1 `DB` ("database") | users, shelf, goals, discussions(+posts/members/notifications), follows, newsletter_subscribers, site_settings, reports, user_preferences, quotes, contact_messages, book_requests, email_verifications, app_cache |
| D1 `CATALOG_DB` ("catalog") | books (slug+lang unique, title, author, isbn, description, summary, key_points, tags, rating, cover_url, amazon_asin/url…), authors, publications, comics, import_chunks, import_progress, ol_fetch_state, catalog_counts |
| Service | `IMPORT_CRON` → worker `bookqubit-import-cron` (`bulk-import/cron-worker`), which also uses a Workers AI binding and a third D1 `titles` |
| Schema mgmt | embedded `SCHEMA`/`CATALOG_SCHEMA` strings in `src/lib/db.js`, gated by `RUN_SCHEMA` var; plus `sql/*.sql` for local seeding |
| Caching | 3-tier cache in `db.js` (KV was deliberately removed after a production incident: write-metered tier degrading silently) |
| Auth | Firebase (Google + email/password) + admin cookie auth |
| i18n | 21 languages (`src/lib/languages.js`), `/[lang]/(main)/…` routes via `src/middleware.js`, RTL for ur/ar |
| Features already present | shelf/progress/ratings, quotes, discussions/chat, follows, goals, leaderboard, wrapped, recommendations, PWA `manifest.js`, mobile tab bar, themes |

Gaps vs. the master brief: no KV/Vectorize/Queues/R2/Durable Objects bindings, no AI in the main app, no FTS5, no MindSpace, no audio/1-min summary engine, no global player, no custom shelves / reading log / stats / Goodreads import, no block/mute, no service worker.

## 2. Design decisions (and where I deviate from the brief)

1. **JS, not TS.** Converting an 11k-line JS codebase is out of scope and risky; new modules are JS with JSDoc.
2. **Additive only.** New tables live in new migration files; no existing table is altered or dropped.
   Migrations go in `public/migrations/{main,catalog}/NNNN_*.sql` and are applied with `wrangler d1 execute <db> --file=…` (they are not wired into `RUN_SCHEMA`).
3. **Two D1s respected.** User/social tables → `database`; catalog-side derived data (FTS5 over `books`, `book_summaries`) → `catalog`. No cross-DB FKs (same convention as today).
4. **KV reintroduced narrowly.** The earlier incident was KV-as-hot-path-cache degrading silently. `CACHE_KV` is used only for AI summary variants and rate limits, every call is try/catch → miss, and failures are logged.
5. **Graceful degradation everywhere.** `src/lib/cf/*` never throws for a missing optional binding (returns `null`/`[]`/`{queued:false}`).
6. **Production-safe merge.** New bindings are in `wrangler.jsonc`. KV and R2 omit IDs (wrangler ≥4.45 auto-provisions on deploy). Vectorize index and Queue must exist before deploying — see `DEPLOYMENT_CHECKLIST.md`. **Do not merge+deploy before running that checklist.**
7. **Custom entry.** `public/worker-entry.js` wraps `.open-next/worker.js` and adds the `queue()` consumer and the `ReadingRoom` Durable Object export.
8. **Local limits.** Workers AI and Vectorize have no full local simulator; they are optional and return empty results offline (or use `remote` bindings when logged in).

## 2b. Data layout and cost model (revised)

Workloads are split so one kind of traffic can never slow another (D1 serialises writes per database):

| Binding | Holds | Profile |
|---|---|---|
| `DB` (`database`) | accounts, social graph, discussions, moderation, blocks/privacy | low write, identity-critical |
| `CATALOG_DB` (`catalog`) | books, authors, publications, comics, `book_summaries`, `books_fts` | read-heavy, grows with imports |
| `ENGAGEMENT_DB` (`engagement`) | reading log, `daily_activity`, custom shelves, audio checkpoints/bookmarks, import jobs | write-heavy, small rows |
| `MINDSPACE_DB` (`mindspace`) | spaces, nodes, edges, node FTS | user content, public SEO reads |

Keeping infra use light as the catalog grows:
- **Reads:** memory → edge cache → KV → D1 with stale-while-revalidate; search results and feed pages are cached; every list is paginated (no unbounded scans); FTS5 replaces `LIKE '%x%'` scans.
- **Writes:** progress writes are debounced client-side; audio position is buffered in a Durable Object and flushed at most every 30 s; stats read one pre-aggregated row per user per day (`daily_activity`), never the event log; counters/clicks/plays go to Workers Analytics Engine, not D1.
- **AI:** never on the default request path. Summaries are generated once (import-time or queued), cached in D1+KV; semantic indexing runs as a bounded 30-minute cron (`EMBED_BATCH` books per run, one batched AI call, one Vectorize upsert), so cost is flat regardless of catalog size.
- **Fail-open:** every optional binding (KV, AI, Vectorize, R2, Queue, DO, Analytics, `ENGAGEMENT_DB`, `MINDSPACE_DB`) may be absent; features report "unavailable" instead of crashing the site.

## 3. Files per phase

**Phase 1 (this turn)** — infra, migrations, helpers
- new `public/migrations/main/0001_mindspace_library_safety.sql`
- new `public/migrations/catalog/0001_fts_summaries.sql`
- new `public/src/lib/cf/{env,cache,ai,vectorize,geo-affiliate,queue,logger}.js`
- new `public/src/lib/cf/consumer.js`, `public/src/lib/cf/reading-room.js`
- new `public/worker-entry.js`
- edit `public/wrangler.jsonc` (bindings, DO migration, queue)
- new `DEPLOYMENT_CHECKLIST.md`

**Phase 2** — `globals.css`, `layout.jsx`, `Navbar.jsx`, `MobileTabBar.jsx`, new `Sidebar`, `CommandPalette`, `public/sw.js`, offline helpers.
**Phase 3** — `books/[slug]/page.jsx`, new summary/intent/player components + `PlayerProvider`, `/api/summary`, `/api/audio/[key]`, `/api/affiliate`.
**Phase 4** — `[lang]/(main)/page.jsx` feed, feed cards, `/api/feed`, `/api/search`.
**Phase 5** — `/library`, `/library/stats`, `/library/import`, `/api/library/*`.
**Phase 6** — `/mindspace`, `/mindspace/[slug]`, graph viewer, `/api/mindspace/*`.
**Phase 7** — `/community` extensions, `/u/[username]`, clubs, safety endpoints, final build.

## 4. One-time `wrangler` commands (summary; full list in DEPLOYMENT_CHECKLIST.md)
```
npx wrangler queues create bookqubit-jobs
npx wrangler vectorize create bookqubit-vectors --dimensions=768 --metric=cosine
# KV + R2 auto-provision on first deploy (ids omitted in wrangler.jsonc)
npx wrangler d1 execute database --remote --file=migrations/main/0001_mindspace_library_safety.sql
npx wrangler d1 execute catalog  --remote --file=migrations/catalog/0001_fts_summaries.sql
```

## 5. Environment status (this machine)
- `workerd` cannot start until the Microsoft Visual C++ x64 redistributable is installed (`0xC0000135`); `next dev`, `wrangler d1 --local`, and `preview` all need it.
- Cloudflare MCP token cannot list D1/KV/R2/Queues/Vectorize/Workers (401/403), so existing remote resources were taken from the repo config, not enumerated live.

## 6. Status and known gaps (end of build session)

**Built** (each part unit-tested against the real SQL schemas where it touches data; see git log):
Phase 1 infra and helpers · Phase 2 design tokens, rail, PWA, offline · Phase 3 book page, 60-second reader, global player ·
Phase 4 hybrid search + connected feed · Phase 5 library, stats, custom shelves, Goodreads import ·
Phase 6 MindSpace (list/graph, public SEO pages, save-from-anywhere) · Phase 7 safety, privacy, reading twins, live rooms, admin review of reports.

**Not verified in a browser or on Cloudflare.** `workerd` could not start on the build machine (missing VC++ runtime), so
nothing was run end to end and no UI was looked at. Treat the first real run as the real test.

**Deviations from the original brief (deliberate):**
- JavaScript, not TypeScript (the codebase is JS); `tsc --noEmit` does not apply.
- Four databases by workload (see 2b) instead of one, to keep write bursts off accounts and the catalog.
- The feed lives at `/feed`; the existing home page (`/`) is unchanged.
- "Book clubs" reuse the existing discussion rooms (join/leave/archive/chat) and add live presence, spoiler text and
  moderation, rather than a second parallel system. There is no separate `/community/clubs` route.
- Goodreads import runs in the browser in 25-row chunks (live progress, no queue); the queue job slot is reserved.
- Karaoke highlighting for audio files is proportional to sentence length (no word timestamps).
- New UI strings are English only; the existing 21-language dictionary was not extended.

**Not built:** editorial/article cards (no content source), audio bookmarks and chapter-based sleep timer (need
chaptered audio), Framer Motion, the `Following` feed filter, server-side block enforcement on profile pages
(blocks hide content client-side), a public shelf page (shelves show as lists on profiles).

**Needs your decision before production:** run DEPLOYMENT_CHECKLIST.md in order; review the emerald/warm-paper
palette against real pages; set per-country affiliate tags; decide whether to keep `AI_ONE_MINUTE` on for the importer
(extra AI output per imported book).
