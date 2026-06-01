-- EVENTS

INSERT INTO events
(event_type,entity_type,entity_id,user_id,country,language)
VALUES

('book_view','book',1,1,'IN','en'),
('book_view','book',2,2,'IN','en'),
('book_view','book',3,3,'US','en'),
('book_view','book',4,4,'UK','en'),
('book_view','book',5,5,'IN','hi'),

('author_view','author',1,1,'IN','en'),
('author_view','author',2,2,'US','en'),

('publication_view','publication',1,1,'IN','en');

-- SEARCHES

INSERT INTO searches
(query,user_id,language,results_count)
VALUES

('atomic habits',1,'en',15),
('project hail mary',2,'en',8),
('psychology of money',3,'en',12),
('best self help books',4,'en',20),
('ambedkar books',5,'en',6);