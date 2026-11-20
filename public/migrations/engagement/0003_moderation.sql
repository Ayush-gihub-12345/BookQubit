-- Target: D1 `engagement`. Moderation for reader-made content: a hidden item stays in its table (so it can be restored) but
-- is left out of every public read. ADDITIVE and idempotent:
--   npx wrangler d1 execute engagement --remote --file=migrations/engagement/0003_moderation.sql
-- kind is 'list' or 'review_reply'; target_id is the list id or the reply id as text. Reports themselves live in the accounts
-- database (content_reports), where the community-reports queue already reads them.
CREATE TABLE IF NOT EXISTS hidden_content (
  kind      TEXT NOT NULL,
  target_id TEXT NOT NULL,
  hidden_at TEXT DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (kind, target_id)
) WITHOUT ROWID;
