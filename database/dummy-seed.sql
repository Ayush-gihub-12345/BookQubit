BEGIN TRANSACTION;

INSERT OR IGNORE INTO plans (slug, name, price_monthly, price_yearly, limits_json, features_json)
VALUES
('free', 'Free', 0, 0, '{"books":100,"users":1}', '["basic search","public catalog"]'),
('pro', 'Pro', 999, 9999, '{"books":10000,"users":5}', '["advanced search","analytics","priority support"]'),
('enterprise', 'Enterprise', 4999, 49999, '{"books":100000,"users":100}', '["team management","api access","white label"]');

INSERT OR IGNORE INTO users (id, email, name, avatar_url, role, plan_slug, status)
VALUES
('user_1', 'admin@bookqubit.test', 'Admin User', 'https://i.pravatar.cc/150?img=1', 'admin', 'pro', 'active'),
('user_2', 'member@bookqubit.test', 'Member User', 'https://i.pravatar.cc/150?img=2', 'user', 'free', 'active');

INSERT OR IGNORE INTO organizations (id, slug, name, owner_user_id, plan_slug, billing_email)
VALUES
('org_1', 'bookqubit', 'BookQubit Inc', 'user_1', 'pro', 'billing@bookqubit.test');

INSERT OR IGNORE INTO org_members (org_id, user_id, role)
VALUES
('org_1', 'user_1', 'owner'),
('org_1', 'user_2', 'member');

INSERT OR IGNORE INTO subscriptions (id, org_id, user_id, plan_slug, provider, provider_customer_id, provider_subscription_id, status, renews_at)
VALUES
('sub_1', 'org_1', NULL, 'pro', 'manual', 'cus_test_001', 'sub_test_001', 'active', datetime('now', '+30 days'));

INSERT OR IGNORE INTO content_items
(entity_type, lang, slug, title, subtitle, description, author_name, publisher_name, category, subject, level, image_url, body_json, featured, is_new, rating, rating_count, publication_year, pages, price, isbn, status)
VALUES
('book', 'en', 'book-one', 'Book One', 'Sample Subtitle', 'Dummy description for Book One', 'Alice Writer', 'BookQubit Press', 'Fiction', 'Adventure', 'Beginner', 'https://picsum.photos/seed/book1/600/900', '{"chapterCount":12,"format":"paperback"}', 1, 1, 4.8, 120, 2024, 320, '$9.99', '1111111111111', 'published'),
('book', 'en', 'book-two', 'Book Two', 'Another Subtitle', 'Dummy description for Book Two', 'Bob Author', 'BookQubit Press', 'Non-Fiction', 'Business', 'Intermediate', 'https://picsum.photos/seed/book2/600/900', '{"chapterCount":18,"format":"ebook"}', 1, 0, 4.5, 87, 2023, 260, '$12.99', '2222222222222', 'published'),
('article', 'en', 'welcome-guide', 'Welcome Guide', 'Getting started', 'Dummy article content', 'BookQubit Team', 'BookQubit', 'Guide', 'Platform', 'Beginner', 'https://picsum.photos/seed/article1/600/900', '{"type":"guide","length":"short"}', 1, 1, 5.0, 20, 2025, 8, 'Free', NULL, 'published');

INSERT OR IGNORE INTO content_tags (item_id, tag)
SELECT id, 'featured' FROM content_items WHERE slug = 'book-one' AND lang = 'en';

INSERT OR IGNORE INTO content_tags (item_id, tag)
SELECT id, 'bestseller' FROM content_items WHERE slug = 'book-one' AND lang = 'en';

INSERT OR IGNORE INTO content_tags (item_id, tag)
SELECT id, 'new' FROM content_items WHERE slug = 'book-two' AND lang = 'en';

INSERT OR IGNORE INTO content_strings (namespace, lang, key, value, raw_json)
VALUES
('home', 'en', 'hero.title', 'Discover books faster', '{"text":"Discover books faster"}'),
('home', 'en', 'hero.subtitle', 'A SaaS-ready catalog powered by D1', '{"text":"A SaaS-ready catalog powered by D1"}'),
('dashboard', 'en', 'stats.users', '2', '{"value":2}'),
('dashboard', 'en', 'stats.books', '2', '{"value":2}');

INSERT OR IGNORE INTO analytics (entity_type, entity_id, event_type, user_id, session_id, meta_json)
VALUES
('book', 'book-one', 'view', 'user_1', 'sess_1', '{"source":"seed"}'),
('book', 'book-two', 'view', 'user_2', 'sess_2', '{"source":"seed"}'),
('page', 'home', 'visit', 'user_1', 'sess_3', '{"source":"seed"}');

INSERT OR IGNORE INTO bookmarks (user_id, entity_type, entity_slug, note)
VALUES
('user_1', 'book', 'book-one', 'Top pick'),
('user_2', 'article', 'welcome-guide', 'Read later');

INSERT OR IGNORE INTO reviews (user_id, entity_type, entity_slug, rating, title, body, status)
VALUES
('user_1', 'book', 'book-one', 5, 'Great book', 'Dummy review content', 'published'),
('user_2', 'book', 'book-two', 4, 'Useful read', 'Dummy review content', 'published');

INSERT OR IGNORE INTO api_keys (user_id, org_id, key_prefix, key_hash, scopes_json, revoked_at)
VALUES
('user_1', 'org_1', 'bk_test', 'hash_dummy_123', '["read:books","write:books"]', NULL);

COMMIT;
