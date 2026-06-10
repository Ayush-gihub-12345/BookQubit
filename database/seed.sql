BEGIN TRANSACTION;

INSERT OR IGNORE INTO languages (code, name) VALUES
('en', 'English'),
('hi', 'Hindi'),
('ur', 'Urdu');

INSERT OR IGNORE INTO authors (slug, name, bio, website) VALUES
('james-clear', 'James Clear', 'Author of Atomic Habits.', 'https://jamesclear.com'),
('cal-newport', 'Cal Newport', 'Author of Deep Work.', 'https://calnewport.com'),
('morgan-housel', 'Morgan Housel', 'Author of The Psychology of Money.', 'https://www.morganhousel.com');

INSERT OR IGNORE INTO publishers (slug, name, description, website) VALUES
('penguin-random-house', 'Penguin Random House', 'Major book publisher.', 'https://www.penguinrandomhouse.com'),
('harper-collins', 'HarperCollins', 'Major book publisher.', 'https://www.harpercollins.com');

INSERT OR IGNORE INTO categories (slug, name) VALUES
('self-help', 'Self Help'),
('productivity', 'Productivity'),
('finance', 'Finance');

INSERT OR IGNORE INTO users (id, email, name, role) VALUES
('user_1', 'admin@bookqubit.test', 'Admin User', 'admin'),
('user_2', 'reader@bookqubit.test', 'Reader User', 'user');

INSERT OR IGNORE INTO tags (name) VALUES
('habit'),
('productivity'),
('finance'),
('best-seller');

INSERT OR REPLACE INTO books
(slug, title, subtitle, description, isbn, cover_image, publication_year, pages, rating, rating_count, featured, bestseller, language_id, author_id, publisher_id, category_id)
VALUES
(
  'atomic-habits',
  'Atomic Habits',
  'Tiny Changes, Remarkable Results',
  'An easy and proven way to build good habits and break bad ones.',
  '9780735211292',
  'https://picsum.photos/seed/atomic-habits/600/900',
  2018,
  320,
  4.9,
  15000,
  1,
  1,
  (SELECT id FROM languages WHERE code = 'en'),
  (SELECT id FROM authors WHERE slug = 'james-clear'),
  (SELECT id FROM publishers WHERE slug = 'penguin-random-house'),
  (SELECT id FROM categories WHERE slug = 'self-help')
),
(
  'deep-work',
  'Deep Work',
  'Rules for Focused Success in a Distracted World',
  'A guide to focused work and productivity.',
  '9781455586691',
  'https://picsum.photos/seed/deep-work/600/900',
  2016,
  304,
  4.8,
  9800,
  1,
  1,
  (SELECT id FROM languages WHERE code = 'en'),
  (SELECT id FROM authors WHERE slug = 'cal-newport'),
  (SELECT id FROM publishers WHERE slug = 'harper-collins'),
  (SELECT id FROM categories WHERE slug = 'productivity')
),
(
  'psychology-of-money',
  'The Psychology of Money',
  'Timeless lessons on wealth, greed, and happiness',
  'Lessons about money, behavior, and decision making.',
  '9780857197689',
  'https://picsum.photos/seed/psychology-money/600/900',
  2020,
  256,
  5.0,
  20000,
  1,
  1,
  (SELECT id FROM languages WHERE code = 'en'),
  (SELECT id FROM authors WHERE slug = 'morgan-housel'),
  (SELECT id FROM publishers WHERE slug = 'harper-collins'),
  (SELECT id FROM categories WHERE slug = 'finance')
);

INSERT OR IGNORE INTO book_affiliates (book_id, provider, affiliate_url, price, currency, active) VALUES
((SELECT id FROM books WHERE slug = 'atomic-habits'), 'amazon', 'https://amazon.in/dp/0735211299?tag=bookqubit-21', '499', 'INR', 1),
((SELECT id FROM books WHERE slug = 'atomic-habits'), 'flipkart', 'https://www.flipkart.com/search?q=atomic+habits', '479', 'INR', 1),
((SELECT id FROM books WHERE slug = 'deep-work'), 'amazon', 'https://amazon.in/dp/1455586692?tag=bookqubit-21', '399', 'INR', 1),
((SELECT id FROM books WHERE slug = 'psychology-of-money'), 'amazon', 'https://amazon.in/dp/0857197681?tag=bookqubit-21', '449', 'INR', 1);

INSERT OR IGNORE INTO book_tags (book_id, tag_id) VALUES
((SELECT id FROM books WHERE slug = 'atomic-habits'), (SELECT id FROM tags WHERE name = 'habit')),
((SELECT id FROM books WHERE slug = 'atomic-habits'), (SELECT id FROM tags WHERE name = 'productivity')),
((SELECT id FROM books WHERE slug = 'deep-work'), (SELECT id FROM tags WHERE name = 'productivity')),
((SELECT id FROM books WHERE slug = 'psychology-of-money'), (SELECT id FROM tags WHERE name = 'finance')),
((SELECT id FROM books WHERE slug = 'psychology-of-money'), (SELECT id FROM tags WHERE name = 'best-seller'));

INSERT OR IGNORE INTO reviews (book_id, user_id, rating, title, review_text) VALUES
((SELECT id FROM books WHERE slug = 'atomic-habits'), 'user_1', 5, 'Excellent', 'Very useful and practical.'),
((SELECT id FROM books WHERE slug = 'deep-work'), 'user_2', 5, 'Very focused', 'Great book for productivity.'),
((SELECT id FROM books WHERE slug = 'psychology-of-money'), 'user_1', 5, 'Insightful', 'Strong lessons about money.');

INSERT OR IGNORE INTO bookmarks (user_id, book_id) VALUES
('user_1', (SELECT id FROM books WHERE slug = 'atomic-habits')),
('user_1', (SELECT id FROM books WHERE slug = 'psychology-of-money')),
('user_2', (SELECT id FROM books WHERE slug = 'deep-work'));

COMMIT;
