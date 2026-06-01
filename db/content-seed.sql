-- AUTHORS

INSERT INTO authors (id,name,slug,bio) VALUES
(1,'James Clear','james-clear','Author of Atomic Habits'),
(2,'Andy Weir','andy-weir','Science fiction writer'),
(3,'Morgan Housel','morgan-housel','Finance author'),
(4,'Matt Haig','matt-haig','Novelist'),
(5,'B. R. Ambedkar','br-ambedkar','Social reformer');

-- PUBLISHERS

INSERT INTO publishers (id,name,slug) VALUES
(1,'Penguin','penguin'),
(2,'HarperCollins','harpercollins'),
(3,'Simon and Schuster','simon-schuster');

-- BOOKS

INSERT INTO books
(id,author_id,publisher_id,title,canonical_slug,book_type,status)
VALUES

(1,1,1,'Atomic Habits','atomic-habits','book','published'),
(2,2,2,'Project Hail Mary','project-hail-mary','book','published'),
(3,3,3,'The Psychology of Money','psychology-of-money','book','published'),
(4,4,1,'The Midnight Library','midnight-library','book','published'),
(5,5,2,'Annihilation of Caste','annihilation-of-caste','book','published'),

(6,1,1,'Atomic Habits Hindi','atomic-habits-hindi','book','published'),
(7,1,1,'Atomic Habits Urdu','atomic-habits-urdu','book','published'),
(8,2,2,'The Martian','the-martian','book','published'),
(9,2,2,'Artemis','artemis','book','published'),
(10,3,3,'Same As Ever','same-as-ever','book','published'),

(11,4,1,'Reasons To Stay Alive','reasons-to-stay-alive','book','published'),
(12,4,1,'How To Stop Time','how-to-stop-time','book','published'),
(13,1,1,'Habit Design','habit-design','book','published'),
(14,1,1,'Tiny Habits Guide','tiny-habits-guide','book','published'),
(15,2,2,'Space Mission One','space-mission-one','book','published'),

(16,2,2,'Journey To Europa','journey-to-europa','book','published'),
(17,4,1,'Life Choices','life-choices','book','published'),
(18,3,3,'Money Mastery','money-mastery','book','published'),
(19,3,3,'Investor Mindset','investor-mindset','book','published'),
(20,5,2,'Who Were The Shudras','who-were-the-shudras','book','published');

-- PUBLICATIONS

INSERT INTO publications
(id,publisher_id,title,slug,publication_type)
VALUES
(1,1,'BookQubit Weekly','bookqubit-weekly','newsletter'),
(2,2,'BookQubit Monthly','bookqubit-monthly','magazine');

-- TRANSLATIONS

INSERT INTO translations
(entity_type,entity_id,language_code,translated_title,translated_slug)
VALUES
('book',1,'hi','परमाणु आदतें','atomic-habits-hi'),
('book',1,'ar','العادات الذرية','atomic-habits-ar'),
('book',2,'hi','प्रोजेक्ट हेल मैरी','project-hail-mary-hi');

-- METADATA

INSERT INTO metadata
(entity_type,entity_id,key,value)
VALUES
('book',1,'genre','self-help'),
('book',2,'genre','science-fiction'),
('book',3,'genre','finance'),
('book',4,'genre','fiction'),
('book',5,'genre','history');