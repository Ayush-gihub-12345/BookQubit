# 🚀 BookQubit Deployment Checklist

Before pushing to GitHub and triggering deployment, complete these prerequisites:

## Step 1: Cloudflare Setup

### Create D1 Databases
On [Cloudflare Dashboard](https://dash.cloudflare.com):

1. Navigate to **Databases > D1**
2. Create 3 databases:
   ```
   - bookqubit_content    (main content: books, authors, publishers)
   - bookqubit_users      (user data: profiles, library, collections)
   - bookqubit_analytics  (analytics: events, searches, metrics)
   ```
3. Copy the **Database ID** for each (UUID format)

### Create KV Namespace
1. Navigate to **Workers & Pages > KV**
2. Create namespace: `bookqubit-cache`
3. Copy the **Namespace ID**

### Create R2 Bucket
1. Navigate to **R2**
2. Create bucket: `bookqubit-assets`
3. Copy the **Bucket Name**

### Create API Token
1. Navigate to **Account Settings > API Tokens**
2. Create token with permissions:
   - D1 Edit
   - Workers Scripts Edit
   - Workers KV Storage Edit
   - R2 Edit
3. Copy the **API Token**

### Get Account ID
1. From Account Settings, copy your **Account ID**

---

## Step 2: GitHub Secrets Configuration

Go to your GitHub Repository → **Settings → Secrets and variables → Actions**

Add these secrets:

```
CLOUDFLARE_API_TOKEN          = (from Step 1)
CLOUDFLARE_ACCOUNT_ID         = (from Step 1)
D1_DATABASE_ID_CONTENT        = (bookqubit_content database ID)
D1_DATABASE_ID_USERS          = (bookqubit_users database ID)
D1_DATABASE_ID_ANALYTICS      = (bookqubit_analytics database ID)
NEXT_PUBLIC_API_URL           = https://api.bookqubit.com
WORKER_URL                    = https://bookqubit-web.your-subdomain.workers.dev
SLACK_WEBHOOK                 = (optional: for deployment notifications)
```

### How to get Database IDs:
```bash
# After setting CLOUDFLARE_API_TOKEN and ACCOUNT_ID, run:
npx wrangler d1 list --account-id YOUR_ACCOUNT_ID

# Or from Dashboard: D1 > Database > Copy ID from URL
# URL format: https://dash.cloudflare.com/.../d1/databases/{DATABASE_ID}
```

---

## Step 3: Update Wrangler Configuration

Edit `web/wrangler.toml`:

```toml
# Replace placeholder IDs with real values from Cloudflare
[[d1_databases]]
binding = "DB_CONTENT"
database_name = "bookqubit_content"
database_id = "your-actual-content-id-here"  # ← Update

[[d1_databases]]
binding = "DB_USERS"
database_name = "bookqubit_users"
database_id = "your-actual-users-id-here"  # ← Update

[[d1_databases]]
binding = "DB_ANALYTICS"
database_name = "bookqubit_analytics"
database_id = "your-actual-analytics-id-here"  # ← Update

[[kv_namespaces]]
binding = "CACHE"
id = "your-actual-kv-id-here"  # ← Update

[[r2_buckets]]
binding = "ASSETS"
bucket_name = "bookqubit-assets"
```

---

## Step 4: Local Testing (Optional but Recommended)

```bash
# Install dependencies
cd web && npm install
cd ../server && npm install

# Test build locally
cd web
npm run cf:build

# Test Wrangler authentication
npx wrangler whoami

# Test D1 migration locally (if you have local D1 setup)
npm run migrate:d1:local
```

---

## Step 5: Ready for Deployment

Once all prerequisites complete:

```bash
# Commit changes
git add .
git commit -m "chore: prepare for D1 deployment"

# Push to main branch (triggers deployment)
git push origin main
```

### What Happens on Push:
1. ✅ GitHub Actions workflow triggers
2. ✅ Dependencies installed
3. ✅ Application built with OpenNext
4. ✅ D1 schema created (tables)
5. ✅ Book data migrated from JSON to D1
6. ✅ Worker deployed to Cloudflare
7. ✅ API endpoints available

---

## Step 6: Verify Deployment

After deployment completes (5-10 minutes):

```bash
# Test API endpoints
curl https://api.bookqubit.com/api/v1/books?limit=1

# Check Cloudflare dashboard:
# - Workers > Deployments (should show latest)
# - D1 > bookqubit_content > Query Editor (should have data)
# - KV > bookqubit-cache (should exist)
# - R2 > bookqubit-assets (should exist)
```

---

## Troubleshooting

### "Placeholder database IDs found"
**Fix**: Update `wrangler.toml` with real database IDs from Cloudflare

### "Deployment failed - D1 migration error"
**Check**:
- Database IDs are correct
- API token has D1 Edit permission
- Schema syntax is valid (`web/schema.sql`)

### "API returns 404"
**Check**:
- Worker is deployed (verify in Cloudflare dashboard)
- D1 binding names match wrangler.toml
- Database has data (query in D1 editor)

### "Migration script failed"
**Check**:
- `scripts/migrate-d1-data.ts` exists
- Book data files exist in `server/src/api/v1/modules/books/data/`
- Database has write permissions

---

## Environment Staging vs Production

### Staging (branch: `staging`)
- Deploys to staging worker
- Uses staging D1 databases (optional separate set)
- Good for testing migrations

### Production (branch: `main`)
- Deploys to production worker
- Uses production D1 databases
- Requires all secrets configured

---

## Post-Deployment Tasks

### 1. Monitor Logs
```bash
# Watch real-time logs
npx wrangler tail --format pretty
```

### 2. Check Data Migration
Go to Cloudflare D1 > bookqubit_content > Query Editor:
```sql
-- Verify books loaded
SELECT COUNT(*) as book_count FROM books;

-- Check authors
SELECT COUNT(DISTINCT name) as author_count FROM authors;

-- Verify related books
SELECT COUNT(*) as related_count FROM related_books;
```

### 3. Performance Check
- D1 queries should average < 100ms
- KV cache hits should be > 80%

### 4. DNS Setup (if using custom domain)
- Add CNAME to Cloudflare nameservers
- Enable Auto HTTPS
- Configure SSL/TLS to Full

---

## Rollback Procedure

If something goes wrong:

```bash
# Option 1: Revert code and redeploy
git revert <commit-hash>
git push origin main

# Option 2: Rollback D1 schema (if data corrupted)
npx wrangler d1 migrations rollback --database bookqubit_content

# Option 3: Manual worker rollback (Cloudflare Dashboard)
# Workers > Deployments > select previous version > Rollback
```

---

## Next Deployment (After First Deploy)

For future deployments:

```bash
# Make code changes
git add .
git commit -m "feat: add new feature"

# Push to trigger deployment
git push origin main
```

That's it! The workflow automatically handles:
- ✅ Building
- ✅ Schema migrations (idempotent)
- ✅ Data updates
- ✅ Deployment

No manual D1 commands needed - just push!

---

## Quick Reference

| Step | Action | Command/Location |
|------|--------|------------------|
| 1 | Create D1 DBs | Cloudflare Dashboard |
| 2 | Create API Token | Account Settings > API Tokens |
| 3 | Add GitHub Secrets | Settings > Secrets and variables |
| 4 | Update wrangler.toml | `web/wrangler.toml` |
| 5 | Push to main | `git push origin main` |
| 6 | Monitor deployment | GitHub Actions / Cloudflare Dashboard |

