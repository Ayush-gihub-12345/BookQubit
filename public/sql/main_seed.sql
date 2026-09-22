-- =============================================================================
-- Dummy reviewer + reviews + quotes, matching sql/catalog_seed.sql's 10 books.
-- Gives the book detail page real-looking Reader Reviews / Reader Quotes /
-- rating-distribution content locally instead of empty states.
--
-- LOCAL ONLY — never run with --remote.
--
-- Run AFTER main_schema.sql (and after catalog_seed.sql, since these
-- reference those book slugs by convention, though the two databases have
-- no real foreign key between them):
--   npx wrangler d1 execute database --local --file=sql/main_schema.sql
--   npx wrangler d1 execute database --local --file=sql/main_seed.sql
-- =============================================================================

DELETE FROM users WHERE id='dummy-reader-1';
INSERT INTO users (id, name, photo_url, slug, email_verified) VALUES ('dummy-reader-1', 'Alex Reader', 'https://i.pravatar.cc/150?u=dummy-reader-1', 'alex-reader', 1);
DELETE FROM shelf WHERE user_id='dummy-reader-1';
DELETE FROM quotes WHERE user_id='dummy-reader-1';
INSERT INTO shelf (user_id, book_slug, status, rating, review, progress) VALUES ('dummy-reader-1', 'dummy-book-one-000001', 'read', 5, 'Couldn''t put this down once the second half kicked in — the pacing really pays off.', 100);
INSERT INTO quotes (user_id, book_slug, text, page) VALUES ('dummy-reader-1', 'dummy-book-one-000001', 'A story about inherited silence and what it costs a family', 12);
INSERT INTO shelf (user_id, book_slug, status, rating, review, progress) VALUES ('dummy-reader-1', 'dummy-book-two-000002', 'read', 4, 'Solid and well-argued, though a couple of chapters felt padded.', 100);
INSERT INTO quotes (user_id, book_slug, text, page) VALUES ('dummy-reader-1', 'dummy-book-two-000002', 'Most "people problems" are actually badly designed feedback loops', 13);
INSERT INTO shelf (user_id, book_slug, status, rating, review, progress) VALUES ('dummy-reader-1', 'dummy-book-three-000003', 'read', 5, 'One of the best things I''ve read this year. Recommended it to three friends already.', 100);
INSERT INTO quotes (user_id, book_slug, text, page) VALUES ('dummy-reader-1', 'dummy-book-three-000003', 'A magic system built entirely around cartography and consequence', 14);
INSERT INTO shelf (user_id, book_slug, status, rating, review, progress) VALUES ('dummy-reader-1', 'dummy-book-four-000004', 'read', 4, 'Good ideas, but I wish the examples went deeper.', 100);
INSERT INTO quotes (user_id, book_slug, text, page) VALUES ('dummy-reader-1', 'dummy-book-four-000004', 'Nine interconnected stories set during one overnight shift', 15);
INSERT INTO shelf (user_id, book_slug, status, rating, review, progress) VALUES ('dummy-reader-1', 'dummy-book-five-000005', 'read', 4, 'The ending stuck with me for days after I finished it.', 100);
INSERT INTO quotes (user_id, book_slug, text, page) VALUES ('dummy-reader-1', 'dummy-book-five-000005', 'Most founder advice is survivorship bias retold as wisdom', 16);
INSERT INTO shelf (user_id, book_slug, status, rating, review, progress) VALUES ('dummy-reader-1', 'dummy-book-six-000006', 'read', 5, 'Couldn''t put this down once the second half kicked in — the pacing really pays off.', 100);
INSERT INTO quotes (user_id, book_slug, text, page) VALUES ('dummy-reader-1', 'dummy-book-six-000006', 'A magical realist meditation on what floods take and what they preserve', 17);
INSERT INTO shelf (user_id, book_slug, status, rating, review, progress) VALUES ('dummy-reader-1', 'dummy-book-seven-000007', 'read', 4, 'Solid and well-argued, though a couple of chapters felt padded.', 100);
INSERT INTO quotes (user_id, book_slug, text, page) VALUES ('dummy-reader-1', 'dummy-book-seven-000007', 'A satirical tour of forms, warnings, and flows nobody follows', 18);
INSERT INTO shelf (user_id, book_slug, status, rating, review, progress) VALUES ('dummy-reader-1', 'dummy-book-eight-000008', 'read', 4, 'One of the best things I''ve read this year. Recommended it to three friends already.', 100);
INSERT INTO quotes (user_id, book_slug, text, page) VALUES ('dummy-reader-1', 'dummy-book-eight-000008', 'A slow-burn financial mystery where the numbers are the least of it', 19);
INSERT INTO shelf (user_id, book_slug, status, rating, review, progress) VALUES ('dummy-reader-1', 'dummy-book-nine-000009', 'read', 5, 'Good ideas, but I wish the examples went deeper.', 100);
INSERT INTO quotes (user_id, book_slug, text, page) VALUES ('dummy-reader-1', 'dummy-book-nine-000009', 'Told across three timelines, one per generation of women', 20);
INSERT INTO shelf (user_id, book_slug, status, rating, review, progress) VALUES ('dummy-reader-1', 'dummy-book-ten-000010', 'read', 4, 'The ending stuck with me for days after I finished it.', 100);
INSERT INTO quotes (user_id, book_slug, text, page) VALUES ('dummy-reader-1', 'dummy-book-ten-000010', 'Profiles workers whose job is readiness, not output', 21);
