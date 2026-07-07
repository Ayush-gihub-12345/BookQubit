# BookQubit — Next.js on Cloudflare Workers (D1 + KV)

Clean rebuild: no static data files. All content lives in **Cloudflare D1**; hot reads are
cached in **KV**. Tables are created automatically by code (`CREATE TABLE IF NOT EXISTS` runs
on first DB access after every deploy — see `src/lib/db.js`). You only create the D1
database and KV namespace once and insert rows.

## 1. Install
```bash
cd public
npm install
```

## 2. Create Cloudflare resources (once)
```bash
npx wrangler d1 create bookqubit-db
# → copy "database_id" into wrangler.jsonc

npx wrangler kv namespace create CACHE
# → copy "id" into wrangler.jsonc
```

## 3. Bindings (what connects to what)

| Resource | Binding name (env var in code) | Where set |
|---|---|---|
| D1 database | `DB` → `env.DB` | `wrangler.jsonc` → `d1_databases[0].binding` |
| KV namespace | `CACHE` → `env.CACHE` | `wrangler.jsonc` → `kv_namespaces[0].binding` |
| Static assets | `ASSETS` | `wrangler.jsonc` → `assets.binding` (auto-used by OpenNext) |
| Amazon tag | `AMAZON_ASSOC_TAG` | `wrangler.jsonc` → `vars`, or dashboard → Settings → Variables |

If you bind via the **Cloudflare dashboard** instead (Workers & Pages → your worker →
Settings → Bindings): add a *D1 database binding* with name exactly `DB`, and a
*KV namespace binding* with name exactly `CACHE`. Names must match — the code reads
`env.DB` and `env.CACHE`.

## 4. Run locally (real D1/KV bindings)
```bash
npm run preview     # builds with OpenNext + runs wrangler dev
```
Plain `npm run dev` also works for UI work: pages render, KV cache is skipped,
but DB queries need bindings — so use `preview` to see real data.

## 5. Schema + seed data
Ready-made files in `sql/`:
```bash
# create tables (same schema the code auto-creates)
npx wrangler d1 execute bookqubit-db --remote --file=sql/schema.sql
# insert dummy data: 14 books (incl. 2 Hindi), 6 authors, 4 publishers, 4 comics
npx wrangler d1 execute bookqubit-db --remote --file=sql/seed.sql
```
Use `--local` instead of `--remote` for local preview. All seed rows use
`INSERT OR IGNORE`, so re-running is safe.

Cover images: use Open Library covers (`https://covers.openlibrary.org/b/isbn/<ISBN>-L.jpg`)
or Google Books thumbnails — both free.

## 6. Deploy
```bash
npm run deploy
```

## Affiliate revenue
Set `AMAZON_ASSOC_TAG` to your Amazon Associates tracking ID. Any book with an
`amazon_asin` gets a "Buy on Amazon" button linking to
`amazon.com/dp/<asin>?tag=<your-tag>`; a book with only `amazon_url` uses that URL as-is.

## Multi-language
Every table has a `lang` column (`en`, `hi`, `ur`, …). The navbar language switcher sets a
cookie; queries filter by it and fall back to English when a language has no rows.
KV cache TTL is 5 minutes — new rows appear on the site within that window.
