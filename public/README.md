# BookQubit — Next.js on Cloudflare Workers (D1)

> **Note:** sections below "Firebase authentication" haven't been re-verified against
> the current codebase (last confirmed accurate: KV-based caching, a single D1 database,
> and 12 UI languages — all three have since changed. KV was removed entirely in favor of
> a three-tier cache in `src/lib/db.js`; the catalog now lives in its own database;
> there are 21 UI languages in `src/lib/i18n.js`). Trust `src/lib/db.js` and
> `wrangler.jsonc` over prose below if they disagree.

All content lives in **Cloudflare D1**, split across **two databases**:
- `DB` (database name `database`) — users, shelves, reviews, discussions, site settings
- `CATALOG_DB` (database name `catalog`) — books, authors, publications, comics

Both auto-create their tables on first access in production (`CREATE TABLE IF NOT EXISTS`
in `src/lib/db.js`) — but that auto-create is gated behind the `RUN_SCHEMA` var in
`wrangler.jsonc` (normally `"0"`, to stop it re-running pointless DDL on every cold start —
see the comment on `shouldBootstrap()` in `db.js`). **Locally, that means schema is never
auto-created** — you apply it yourself once, via the files in `sql/`, below.

## 1. Install
```bash
cd public
npm install
```

## 2. Environment
```bash
cp .env.example .env.local
```
See `.env.example` for what each value does and what's *not* needed for local UI work.

## 3. Create Cloudflare resources (once, for your own deployment)
```bash
npx wrangler d1 create database
npx wrangler d1 create catalog
# → copy each "database_id" into wrangler.jsonc's d1_databases array
```

## 4. Bindings (what connects to what)

| Resource | Binding name (env var in code) | Where set |
|---|---|---|
| Main D1 database | `DB` → `env.DB` | `wrangler.jsonc` → `d1_databases[0].binding` |
| Catalog D1 database | `CATALOG_DB` → `env.CATALOG_DB` | `wrangler.jsonc` → `d1_databases[1].binding` |
| Static assets | `ASSETS` | `wrangler.jsonc` → `assets.binding` (auto-used by OpenNext) |
| Schema bootstrap flag | `RUN_SCHEMA` | `wrangler.jsonc` → `vars` — keep `"0"` normally, see note above |

There is no KV binding — it was removed (see `db.js`'s cache-section comments for why:
a write-metered cache tier silently degrading to uncached reads was a real production
incident).

## 5. Schema + seed data (local dev)
```bash
# one-time: create tables in your local D1 simulation
npx wrangler d1 execute database --local --file=sql/main_schema.sql
npx wrangler d1 execute catalog  --local --file=sql/catalog_schema.sql

# 10 dummy books/authors/publishers + a reviewer with reviews/quotes on every book
npx wrangler d1 execute database --local --file=sql/main_seed.sql
npx wrangler d1 execute catalog  --local --file=sql/catalog_seed.sql
```
**These 4 files are `--local` only.** Every one says so in its own header comment —
running any of them with `--remote` would write test data into the real, production
catalog (which has thousands of real rows). There is deliberately no documented
`--remote` seed workflow.

If you edit the seed data and re-run these while a `preview` server is already running,
the app's own cache can still serve you the old values. Stop the server, clear
`.wrangler/state/v3/cache` and `.open-next/cache` (leave `.wrangler/state/v3/d1` alone —
that's your seeded data), then restart.

## 6. Run locally
```bash
npm run preview     # builds with OpenNext + runs wrangler dev, binds to LOCAL D1 (see step 5)
```
Two other options:
- `npm run dev` — plain `next dev`, no D1 access at all (no Workers runtime), but fastest
  for pure UI/CSS work. Pages needing DB data degrade gracefully rather than crash.
- `npx opennextjs-cloudflare preview --remote` — binds to the **real production D1**
  instead of local. Read *and* write — shelf updates, likes, etc. hit production. Useful
  for reproducing a production-only bug, not for routine dev.

Cover images: use Open Library covers (`https://covers.openlibrary.org/b/isbn/<ISBN>-L.jpg`)
or Google Books thumbnails — both free.

## 7. Deploy
```bash
npm run deploy
```
After a schema change in `db.js`: set `RUN_SCHEMA` to `"1"` in `wrangler.jsonc`, deploy,
load one page (so the bootstrap runs once), then set it back to `"0"` and deploy again.

## Firebase authentication (Google + email/password)
For local dev, these already live in `.env.example` (step 2 above) — the values below
are the same ones, already hardcoded as defaults in `src/lib/firebase.js` /
`src/lib/auth-server.js` too, so auth works even with no env file at all.

For a real deployment, set these as **build-time variables** (dashboard → Worker →
Settings → Build → Variables — NOT runtime secrets, because `NEXT_PUBLIC_*` values are
inlined into the client bundle during the build; they are public by design):

| Variable | From Firebase console → Project settings → Your web app |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | apiKey |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | authDomain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | projectId |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | appId |

Also: Firebase console → Authentication → Sign-in method → enable **Google** and
**Email/Password**, and add your `*.workers.dev` domain (and custom domain) under
**Authorized domains**. If the vars are unset, auth UI hides itself gracefully.

## Themes & languages
- 4 themes (Light / Dark / Sepia / Midnight) — switcher in the navbar, stored in a cookie.
- 12 UI languages with RTL support; translated UI strings in `src/lib/i18n.js`.
- **Localized slugs**: each language row has its own slug (e.g. `/books/सेपियन्स` for Hindi).
  Translations share the same ISBN, which links language variants for hreflang alternates.

## Affiliate revenue
Set `AMAZON_ASSOC_TAG` to your Amazon Associates tracking ID. Any book with an
`amazon_asin` gets a "Buy on Amazon" button linking to
`amazon.com/dp/<asin>?tag=<your-tag>`; a book with only `amazon_url` uses that URL as-is.

## Multi-language
Every table has a `lang` column (`en`, `hi`, `ur`, …). The navbar language switcher sets a
cookie; queries filter by it and fall back to English when a language has no rows.
KV cache TTL is 5 minutes — new rows appear on the site within that window.
