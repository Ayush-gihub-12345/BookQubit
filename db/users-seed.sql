-- USERS

INSERT INTO users
(id,firebase_uid,email,username,display_name)
VALUES

(1,'uid001','user1@bookqubit.com','reader1','Reader One'),
(2,'uid002','user2@bookqubit.com','reader2','Reader Two'),
(3,'uid003','user3@bookqubit.com','reader3','Reader Three'),
(4,'uid004','user4@bookqubit.com','reader4','Reader Four'),
(5,'uid005','user5@bookqubit.com','reader5','Reader Five'),

(6,'uid006','user6@bookqubit.com','reader6','Reader Six'),
(7,'uid007','user7@bookqubit.com','reader7','Reader Seven'),
(8,'uid008','user8@bookqubit.com','reader8','Reader Eight'),
(9,'uid009','user9@bookqubit.com','reader9','Reader Nine'),
(10,'uid010','user10@bookqubit.com','reader10','Reader Ten'),

(11,'uid011','user11@bookqubit.com','reader11','Reader Eleven'),
(12,'uid012','user12@bookqubit.com','reader12','Reader Twelve'),
(13,'uid013','user13@bookqubit.com','reader13','Reader Thirteen'),
(14,'uid014','user14@bookqubit.com','reader14','Reader Fourteen'),
(15,'uid015','user15@bookqubit.com','reader15','Reader Fifteen'),

(16,'uid016','user16@bookqubit.com','reader16','Reader Sixteen'),
(17,'uid017','user17@bookqubit.com','reader17','Reader Seventeen'),
(18,'uid018','user18@bookqubit.com','reader18','Reader Eighteen'),
(19,'uid019','user19@bookqubit.com','reader19','Reader Nineteen'),
(20,'uid020','user20@bookqubit.com','reader20','Reader Twenty');

-- USER INTERACTIONS

INSERT INTO user_interactions
(user_id,entity_type,entity_id,interaction_type)
VALUES

(1,'book',1,'read'),
(1,'book',2,'saved'),
(1,'book',3,'wishlist'),

(2,'book',1,'read'),
(2,'book',4,'saved'),

(3,'author',1,'follow'),
(3,'book',5,'favorite'),

(4,'book',1,'rating'),
(5,'book',2,'read');

-- USER INSIGHTS

INSERT INTO user_insights
(user_id,books_read,books_saved,books_rated,engagement_score)
VALUES

(1,15,10,5,80),
(2,8,4,1,45),
(3,25,15,10,95),
(4,6,3,2,35),
(5,12,8,4,70);