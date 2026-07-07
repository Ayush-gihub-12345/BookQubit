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

## Firebase authentication (Google + email/password)
Set these as **build-time variables** (dashboard → Worker → Settings → Build → Variables —
NOT runtime secrets, because `NEXT_PUBLIC_*` values are inlined into the client bundle
during the build; they are public by design):

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
