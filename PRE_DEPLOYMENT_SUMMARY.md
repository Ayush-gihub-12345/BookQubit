# ⚡ Pre-Deployment Summary for BookQubit

## What You Need to Do BEFORE Pushing to GitHub

### 🔧 Prerequisites (15-20 minutes)

#### 1. **Cloudflare Account Setup**
   - [ ] Create 3 D1 Databases:
     - `bookqubit_content` → Copy Database ID
     - `bookqubit_users` → Copy Database ID  
     - `bookqubit_analytics` → Copy Database ID
   - [ ] Create KV Namespace `bookqubit-cache` → Copy ID
   - [ ] Create R2 Bucket `bookqubit-assets`
   - [ ] Generate API Token with D1, Workers, KV, R2 permissions
   - [ ] Copy Account ID

#### 2. **GitHub Secrets Setup**
   Go to: Repository → Settings → Secrets and variables → Actions
   
   Add 6 secrets:
   ```
   CLOUDFLARE_API_TOKEN        = your_api_token_here
   CLOUDFLARE_ACCOUNT_ID       = your_account_id
   D1_DATABASE_ID_CONTENT      = bookqubit_content_id_uuid
   D1_DATABASE_ID_USERS        = bookqubit_users_id_uuid
   D1_DATABASE_ID_ANALYTICS    = bookqubit_analytics_id_uuid
   NEXT_PUBLIC_API_URL         = https://api.bookqubit.com
   WORKER_URL                  = https://bookqubit-web.xxx.workers.dev
   ```

#### 3. **Update wrangler.toml**
   Edit `web/wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB_CONTENT"
   database_name = "bookqubit_content"
   database_id = "PASTE_REAL_ID_HERE"  # ← Replace this

   [[d1_databases]]
   binding = "DB_USERS"
   database_name = "bookqubit_users"
   database_id = "PASTE_REAL_ID_HERE"  # ← Replace this

   [[d1_databases]]
   binding = "DB_ANALYTICS"
   database_name = "bookqubit_analytics"
   database_id = "PASTE_REAL_ID_HERE"  # ← Replace this

   [[kv_namespaces]]
   binding = "CACHE"
   id = "PASTE_REAL_KV_ID_HERE"  # ← Replace this
   ```

#### 4. **Verify Setup Locally**
   ```bash
   cd web
   npm install
   npx wrangler whoami  # Should show your account
   ```

---

## What Happens After You Push

```bash
git commit -m "chore: setup D1 deployment"
git push origin main
```

### Automatic Deployment Flow (GitHub Actions)

1. **Trigger**: Push detected on `main` branch ✅
2. **Build**: Next.js + OpenNext compilation ✅
3. **Schema**: D1 tables created (auto-idempotent) ✅
4. **Migration**: Book data loaded from JSON → D1 ✅
5. **Deploy**: Worker deployed to Cloudflare ✅
6. **API Ready**: All endpoints live ✅

**Total time**: ~5-10 minutes

---

## Deployment Checklist

| Step | Status | How to Check |
|------|--------|-------------|
| D1 Databases Created | [ ] | Cloudflare Dashboard > D1 |
| API Token Generated | [ ] | Cloudflare Account Settings > API Tokens |
| GitHub Secrets Added | [ ] | GitHub Repo > Settings > Secrets |
| wrangler.toml Updated | [ ] | No "your-d1" placeholders in file |
| Can authenticate to Wrangler | [ ] | `npx wrangler whoami` works |
| Push to main | [ ] | `git push origin main` |
| Deployment Started | [ ] | GitHub Actions tab shows running job |
| Deployment Succeeded | [ ] | Workflow shows ✅ all steps green |
| API Responds | [ ] | `curl https://api.bookqubit.com/api/v1/books` |

---

## Deployment Results

After successful deployment:

### ✅ What's Live
- **Worker**: https://bookqubit-web.xxx.workers.dev
- **D1 Databases**: 3 databases with schema + data
- **API Endpoints**:
  ```
  GET  /api/v1/books              # List all books
  GET  /api/v1/books/:slug        # Single book detail
  GET  /api/v1/books/:id/related  # Related/recommended books
  GET  /api/v1/books/search/:q    # Search functionality
  GET  /api/v1/books/category/:c  # Filter by category
  GET  /api/v1/books/author/:a    # Filter by author
  ```
- **D1 Data**: 600+ books with all metadata loaded

### ✅ What Changed
- No more reading from JSON files
- All book data now from D1 database
- API Worker queries D1 for every request
- KV cache stores frequently accessed data
- R2 bucket ready for book cover storage

---

## What You DON'T Need to Do Manually

❌ ~~Manually run schema migrations~~
❌ ~~Manually upload book data~~
❌ ~~SSH into servers~~
❌ ~~Manage database backups manually~~
❌ ~~Deploy via FTP or similar~~

✅ Just push to GitHub and let GitHub Actions handle it!

---

## After First Deployment

### For Future Changes:
```bash
# Make code changes
git add .
git commit -m "feat: add new feature"
git push origin main

# That's it! Workflow runs automatically
```

### To Update Book Data:
Option 1: Rerun migration
```bash
npm run migrate:d1  # Uses GitHub Action workflow
```

Option 2: Manual D1 query
```bash
npx wrangler d1 execute bookqubit_content --remote \
  --command "UPDATE books SET rating = 4.8 WHERE id = 1"
```

---

## Troubleshooting During Deployment

### "Workflow failed at D1 schema step"
→ Check wrangler.toml database IDs are real values, not placeholders

### "Migration script error"
→ Ensure book data files exist in `server/src/api/v1/modules/books/data/`

### "API returns 404"
→ Check Worker is deployed in Cloudflare dashboard > Workers > Deployments

### "Database is empty"
→ Check migration completed successfully in GitHub Actions logs

### "Can't authenticate to Wrangler"
→ Verify CLOUDFLARE_API_TOKEN secret is set correctly

---

## Summary

**Before Deployment**: Complete the 4 prerequisite sections above (~20 min)

**After Push to main**: 
- GitHub Actions automatically runs deployment
- Watch the workflow in Actions tab (5-10 min)
- Check Cloudflare dashboard to confirm deployment

**Result**: Live production BookQubit with D1 database! 🎉

---

## Need Help?

- **GitHub Actions failing?** → Check workflow logs in Actions tab
- **D1 issues?** → Visit Cloudflare D1 docs: https://developers.cloudflare.com/d1/
- **Wrangler issues?** → Run `npx wrangler --help`
- **Deployment docs** → See `DEPLOYMENT_ARCHITECTURE.md`

