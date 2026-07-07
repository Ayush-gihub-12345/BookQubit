# Cloudflare D1 + KV data layer

Books/authors/publications/comics now live in D1 (`migrations/0001_init.sql`), read through
a KV cache (`web/src/lib/server/kv.js`, 10 min TTL). API routes: `/api/books`, `/api/books/[slug]`,
`/api/authors`, `/api/publications`, `/api/comics`. `useBooks`/`useBook`
(`web/src/hooks/useBooks.js`) fetch from `/api/books*` — same return shape as before.

**Static files under `web/src/data/**` are still the source of truth for build-time
generation** (sitemap, `generateStaticParams`) and are NOT yet wired into most listing
pages (booklist, category, collections, tags, authors, publications, comics, search, trend
dashboards, homepage sections) — those ~38 files still import `@/data/*` directly. Only
`useBooks`/`useBook` were migrated. See the follow-up list at the bottom.

## One-time setup
```
cd web
npm install
npx wrangler d1 create bookqubit-db      # copy database_id into ../wrangler.jsonc
npx wrangler kv namespace create BOOKS_CACHE   # copy id into ../wrangler.jsonc
npm run db:migrate:local
npm run migrate:generate                 # regenerates ../migrations/0002_seed.sql from web/src/data
npm run db:seed:local
```

Set `NEXT_PUBLIC_AMAZON_ASSOC_TAG` (your Amazon Associates tracking ID, e.g. `bookqubit-20`)
in `.dev.vars` / Cloudflare Pages env vars. Buy links are built as
`amazon.com/dp/<asin>?tag=<your-tag>`, falling back to the original URL in the data if no
ASIN could be parsed.

Run locally against real D1/KV bindings with `npm run cf:preview` — plain `next dev` has no
bindings, so `useBooks`/`useBook` will fail against `/api/books*` under `next dev`.

For production: `npm run db:migrate:remote`, `npm run db:seed:remote`, `npm run cf:deploy`.

## Remaining migration work (not done in this pass)
Mechanically repeat the `useBooks.js` pattern (swap static `@/data/*` import + sync call for
a `fetch('/api/...')` call) in the ~38 files that still import `@/data/*` directly — mainly
listing/detail pages under `web/src/features/**` and `web/src/components/homepages/**`, plus
`sitemap.js` and `useCategories.jsx`/`TagsData.js`/`useCollectionFiltering.js` which build
category/tag/collection lists from the raw book arrays. Those helper files may be easiest to
port as new `/api/tags`, `/api/categories`, `/api/collections` routes computed server-side
from the `books` table instead of client-side from static imports.
