# BookQubit — Phase 0 Implementation Notes

**Date:** 2026-11-11
**Branch:** `claude/bookqubit-env-inspection-e9ffd2` (uncommitted, nothing pushed, nothing deployed)

What changed, what was verified, what is deliberately **not** done, and what only you can do.

---

## Status against the roadmap

| ID | Item | Status |
|---|---|---|
| **P0-0** | Test + CI harness | **Done.** Vitest, 62 tests, `.github/workflows/ci.yml` (test + build jobs). CI has not run yet — nothing is pushed. |
| **P0-1** | Verified token on user-scoped GETs | **Done** — 11 endpoints, see below. |
| **P0-2** | Gate discussion message reads | **Done.** |
| **P0-3** | Drop body-supplied `userId` from `/api/reports` | **Done.** |
| **P0-4** | Rate limiting | **Not done in code — needs your action.** Rules in §4. |
| **P0-5** | Escape `<` in JSON-LD | **Done** (all 3 sites). |
| **P0-6** | Untrack `wrangler-account.json` | **Done** (staged as deletions; files kept on disk, now ignored). |
| **P0-7** | Admin cookie + CSRF | **Done** (`SameSite=Strict` + central `Origin` check). |
| **P0-8** | Security headers | **Partly done.** HSTS, `nosniff`, `Referrer-Policy`, `frame-ancestors`/`X-Frame-Options`, `Permissions-Policy` ship. **CSP deliberately omitted** — §3. |
| **P0-9** | D1 backup | **Script written, not run.** `npm run backup`. A restore has not been tested. |

---

## 1. S-1 / S-2: what changed

New files: `src/lib/api-auth.js` (`requireUser`, `getRequestUser`, `bearerToken`), `src/lib/authFetch.js` (client helper that attaches the Firebase ID token as `Authorization: Bearer`).

**Design decision:** the endpoints no longer compare a token's uid to a `?uid=` parameter — they **ignore the parameter and derive the subject from the verified token**. There is no way to ask them about someone else, so a client still sending `?uid=` is harmless. Tests assert exactly this (a spoofed `?uid=victim` is never read, never bound into a query).

| Endpoint | Before | Now |
|---|---|---|
| `GET /api/shelf` (+`?slug=`) | any `?uid=` | own data, bearer token; 401 otherwise |
| `GET /api/notifications` | any `?uid=` | same |
| `GET /api/discussions/mine` | any `?uid=` | same |
| `GET /api/network` | any `?uid=` | same |
| `GET /api/wrapped` | any `?uid=` | same |
| `GET /api/achievements` | any `?uid=` | same |
| `GET /api/liked` | any `?uid=` | same |
| `GET /api/recommendations` | any `?uid=` | same |
| `GET /api/goal` | any `?uid=` | same — **found beyond the audit's list** (activity streak) |
| `GET /api/preferences` | any `?uid=` | same — **beyond the audit** (genre picks) |
| `GET /api/requests` | any `?uid=` | same — **beyond the audit** (book requests) |
| `GET /api/discussions/[id]` | open | header public; **messages only for active members** |
| `GET /api/discussions/[id]/messages` | open | 401 anonymous / 403 non-member / 200 member |
| `GET /api/discussions/search` | `?uid=` annotated membership | annotates for the token's user only |
| `GET /api/follow` | `?uid=` revealed `following` | `following` only for the token's user |
| `POST /api/reports` | trusted body `userId` | verified token or anonymous |

**401 vs 503.** `verifyUser` collapsed "forged token" and "Google returned 500" into the same `null`. A new `verifyUserStrict` throws on network failure / 5xx / 429, and `requireUser` answers **503** for that, so an upstream outage doesn't read as "your session is invalid". The original `verifyUser` is a lenient wrapper with unchanged behaviour, so the ~15 existing mutation routes are untouched.

**Verification memo.** Successful verifications are cached per isolate for 60 s (keyed by SHA-256 of the token; only successes; capped at 500). Without it, the GET endpoints — several are polled (Navbar notifications, ChatPanel messages every few seconds) — would add an outbound Google round-trip to every poll.

**Client side:** 24 call sites across 16 files migrated to `authFetch`. The login redirect was also hardened: previously a non-OK `/api/preferences` response parsed as `{error}`, `onboarded` was `undefined`, and an existing reader would have been sent back through onboarding.

### Deploy-order warning

The API and the client bundle **must ship together**. A browser tab that was opened before the deploy keeps running the *old* JavaScript, which still calls `?uid=` with no token → **401s until the reader reloads**. Expect transient empty shelves/notifications for already-open tabs right after deploy. Do it at a quiet hour.

### Not changed, on purpose

- `GET /api/quotes?uid=` still returns a reader's quotes by uid. Public profiles already display a reader's quotes (`readers/[id]/page.jsx` calls `getQuotesByUser`), so this exposes nothing the site doesn't already publish.
- The ~15 mutation routes still take `idToken` in the JSON body. They were already correct (uid derived from the verified token); moving them to headers is cosmetic.

---

## 2. Verification performed

| Check | Result |
|---|---|
| `npm test` | **62/62 pass** (5 files) |
| `next build` | **Passes**, with `initOpenNextCloudflareForDev()` temporarily bypassed (config restored afterwards, verified) |

**The build did not run unmodified in this sandbox.** `next build` dies with `unhandledRejection [Error: write EOF]` before compiling anything. I reproduced the identical failure on a pristine checkout of `HEAD` (before any of my changes), so it is a pre-existing sandbox/dev-proxy issue, not something introduced here. It very likely works on your machine and on Linux CI, but **I have not confirmed that**. If the CI `build` job fails the same way, that is the cause.

**Not verified:** nothing was exercised against a running app, real Firebase, or real D1. The tests mock those. In particular, the client changes (`authFetch` call sites, `ChatPanel`, login redirect) are covered only by compilation, not by clicking through them. Before deploying, please sign in locally and check: account page, notifications badge, community chat (as member and non-member), a review save, and the post-login redirect.

**Tests caught a real bug:** `safeJsonLd` was a silent no-op on first write (a single-backslash escape in JS is just `<` again). Fixed, and `tests/json-ld.test.js` now guards it.

---

## 3. Why CSP is not included

This site loads Google Tag Manager, Firebase Auth (with its popup/iframe hosts) and Next's inline bootstrap scripts. A script-restricting CSP that is wrong breaks sign-in, and nothing in a build can detect that. The safe path is to ship it as `Content-Security-Policy-Report-Only`, watch the console against a running app, tune it, then enforce. `frame-ancestors 'self'` has none of those dependencies, so it ships now.

Security headers are in `next.config.mjs`, **not** `public/public/_headers` — Workers Assets applies `_headers` to static assets only, so it never touched the HTML/JSON the Worker renders. `_headers` keeps its one job (immutable caching of `/_next/static`).

---

## 4. P0-4 — rate limiting: needs you (I did not touch production settings)

This is a Cloudflare dashboard change; the brief rules out changing production settings, and I can't verify it without the Cloudflare MCP. Suggested rules (Security → WAF → Rate limiting rules):

| Rule | Expression | Limit | Action |
|---|---|---|---|
| Search suggest | `http.request.uri.path eq "/api/suggest"` | 20 req / 10 s per IP | Block 60 s |
| Public writes | `http.request.method eq "POST" and http.request.uri.path in {"/api/contact" "/api/newsletter" "/api/reports" "/api/requests"}` | 5 req / 60 s per IP | Block 10 min |
| Whole API | `starts_with(http.request.uri.path, "/api/")` | 120 req / 60 s per IP | Managed challenge |
| Admin login | `http.request.uri.path eq "/api/admin/login"` | 5 req / 5 min per IP | Block 15 min |

**Update from the account data: both zones (`bookqubit.com`, `bookqubit.shop`) are on the Free plan, so expect room for very few rules, probably one. The four rules below will not all fit. If you can only add one, make it the search endpoint (`/api/suggest`).** Check the allowance in the dashboard before relying on any of this. Start in **Log** mode if available and watch for false positives (a shared NAT'd mobile network can look like one IP).

---

## 5. P0-9 — backups

```bash
cd public
npm run backup
```

Writes `public/backups/database-<timestamp>.sql` (gitignored — it holds personal data and the repo is public). It is read-only against production. **Still to do, by you:** run it once, move the file off this machine, and **restore it into a scratch D1** to prove it works. Scheduling it (cron Worker or a scheduled task) is the next step once one manual run succeeds.

---

## 6. Housekeeping

- `public/package-lock.json` changed: Vitest added, plus metadata drift (`"dev": true` flags) from a fresh `npm install`. Harmless.
- `docs/` is untracked; `.github/workflows/ci.yml`, `public/tests/`, `public/vitest.config.mjs` are new.
- The staged deletions of the two `wrangler-account.json` files take effect on commit. **They remain in git history** of a public repository (account ID + owner email). Not secrets; rewriting history is optional and probably not worth it.

---

## 7. Still open from the audit (Phase 0 scope excluded)

S-4 (admin session design), S-8 (`follows.target_type` allowlist), S-9 (local JWT verification), S-10 (Turnstile), S-12, S-13, plus all of Phases 1–3.
