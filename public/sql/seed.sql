-- Dummy seed data. Run AFTER schema.sql:
--   npx wrangler d1 execute bookqubit-db --remote --file=sql/seed.sql
-- Covers come from Open Library (free). ASINs are real so affiliate links work
-- once AMAZON_ASSOC_TAG is set.

-- ── BOOKS (en) ──────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO books (slug,lang,title,author,publisher,price,isbn,published,page_count,format,description,summary,category,collection,genres,subjects,tags,key_points,rating,cover_url,country,amazon_asin,featured,bestseller) VALUES
('sapiens','en','Sapiens: A Brief History of Humankind','Yuval Noah Harari','Harper Perennial','$24.99','9780062316097','2015',464,'Paperback',
 'A sweeping history of humankind, from the Stone Age to the twenty-first century.',
 'Harari traces how an insignificant ape became the ruler of planet Earth through three great revolutions: the Cognitive Revolution gave Sapiens fictive language and the power of shared myths; the Agricultural Revolution traded foraging freedom for settled abundance and hierarchy; and the Scientific Revolution unleashed a feedback loop of knowledge, empire and capital that still accelerates today. Along the way he asks whether all this progress has actually made humans happier.',
 'History','Harari Collection','["History","Anthropology"]','["Evolution","Civilization","Sociology"]','["History","Science","Big Ideas"]',
 '["Shared myths let strangers cooperate at scale","Agriculture was history''s biggest trade-off","Money, empires and religion unified humankind","Science grew from admitting ignorance"]',
 4.6,'https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg','Israel','0062316095',1,1),

('homo-deus','en','Homo Deus: A Brief History of Tomorrow','Yuval Noah Harari','Harper Perennial','$22.99','9780062464316','2017',464,'Paperback',
 'What happens when humanity''s old enemies — famine, plague and war — are finally tamed?',
 'Having largely conquered famine, plague and war, humankind will next pursue immortality, bliss and divinity. Harari argues that the same humanist ideals that built the modern world may be undone by the technologies it created: biotech that rewrites bodies and dataism that knows us better than we know ourselves. The book asks who — or what — will inherit the world when intelligence decouples from consciousness.',
 'Futurism & Ethics','Harari Collection','["Futurism","Philosophy"]','["AI","Biotechnology","Humanism"]','["AI Ethics","Futurism","Philosophy"]',
 '["Humanity''s new agenda: immortality, happiness, divinity","Algorithms may know you better than you do","Dataism is the emerging religion of the 21st century"]',
 4.4,'https://covers.openlibrary.org/b/isbn/9780062464316-L.jpg','Israel','0062464310',1,0),

('atomic-habits','en','Atomic Habits','James Clear','Avery','$27.00','9780735211292','2018',320,'Hardcover',
 'An easy and proven way to build good habits and break bad ones.',
 'Clear shows that remarkable results come not from radical change but from tiny improvements compounded over time. His four laws of behavior change — make it obvious, attractive, easy and satisfying — turn habit formation into a practical system. Identity, not outcomes, drives lasting change: every action is a vote for the type of person you wish to become.',
 'Self-Help','','["Self-Help","Psychology"]','["Habits","Productivity","Behavior Change"]','["Habits","Productivity","Bestseller"]',
 '["1% better every day compounds to 37x in a year","Systems beat goals","Identity change is the north star of habit change","Environment design beats willpower"]',
 4.8,'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg','USA','0735211299',1,1),

('deep-work','en','Deep Work','Cal Newport','Grand Central Publishing','$18.99','9781455586691','2016',304,'Paperback',
 'Rules for focused success in a distracted world.',
 'Newport argues that the ability to focus without distraction on cognitively demanding tasks — deep work — is becoming both rarer and more valuable. He offers four rules: work deeply through rituals and routines, embrace boredom to train concentration, quit social media that fails a cost-benefit test, and drain the shallows by ruthlessly scheduling every minute.',
 'Self-Help','','["Productivity","Business"]','["Focus","Career","Attention"]','["Productivity","Focus","Career"]',
 '["Deep work is the superpower of the knowledge economy","Schedule every minute of your day","Embrace boredom to rebuild attention"]',
 4.5,'https://covers.openlibrary.org/b/isbn/9781455586691-L.jpg','USA','1455586692',0,1),

('thinking-fast-and-slow','en','Thinking, Fast and Slow','Daniel Kahneman','Farrar, Straus and Giroux','$20.00','9780374533557','2011',499,'Paperback',
 'The Nobel laureate''s tour of the two systems that drive the way we think.',
 'Kahneman maps the mind as two systems: fast, intuitive System 1 and slow, deliberate System 2. Through decades of research he reveals the biases that flow from this machinery — anchoring, availability, loss aversion, the planning fallacy — and shows why overconfidence is the engine of capitalism and why we systematically mispredict what will make us happy.',
 'Psychology','','["Psychology","Economics"]','["Cognitive Bias","Decision Making","Behavioral Economics"]','["Psychology","Decision Making","Nobel Prize"]',
 '["Two systems: fast intuition, slow reason","Losses loom larger than gains","We answer easier questions than the ones asked","The experiencing self and remembering self differ"]',
 4.5,'https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg','Israel','0374533555',0,1),

('psychology-of-money','en','The Psychology of Money','Morgan Housel','Harriman House','$19.99','9780857197689','2020',256,'Paperback',
 'Timeless lessons on wealth, greed, and happiness.',
 'Doing well with money has little to do with how smart you are and a lot to do with how you behave. Through 19 short stories Housel shows that wealth is what you don''t see, that reasonable beats rational, that compounding rewards patience above brilliance, and that the highest dividend money pays is control over your time.',
 'Finance','','["Finance","Psychology"]','["Investing","Wealth","Behavior"]','["Money","Investing","Bestseller"]',
 '["Wealth is what you don''t spend","Compounding needs time, not genius","Save without a reason","Freedom is the highest dividend"]',
 4.7,'https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg','USA','0857197681',1,1),

('why-i-am-an-atheist','en','Why I Am an Atheist','Bhagat Singh','Srishti Publishers','$9.99','9788170288808','1930',64,'Paperback',
 'A powerful reasoned essay by the Indian revolutionary, written in jail, defending his atheism.',
 'Written in Lahore Central Jail in 1930, this essay is a rigorous defense of disbelief rooted in rationalism, humanism and revolutionary purpose. Singh deconstructs religious orthodoxy through logic and lived experience, arguing that blind faith diverts energy from the struggle for justice — and that his atheism demands action and sacrifice rather than divine intervention.',
 'Philosophy','Revolutionary Classics','["Autobiography","Political Philosophy"]','["Rationalism","Freedom Struggle","Secularism"]','["Atheism","Indian History","Revolution"]',
 '["Rationalism over blind faith","Belief must survive scrutiny","Purpose without divine reward"]',
 4.8,'https://covers.openlibrary.org/b/isbn/9788170288808-L.jpg','India','9389847125',1,0),

('the-god-delusion','en','The God Delusion','Richard Dawkins','Mariner Books','$18.99','9780618918249','2006',464,'Paperback',
 'A hard-hitting scientific case against religion from the famed evolutionary biologist.',
 'Dawkins examines the God hypothesis as a scientific claim and finds it wanting. He dismantles classic arguments for design, explains how morality and meaning arise without a deity through evolution and culture, and argues that religious indoctrination of children deserves the same scrutiny as any other claim about reality.',
 'Philosophy','','["Science","Philosophy"]','["Atheism","Evolution","Religion"]','["Atheism","Science","Debate"]',
 '["The God hypothesis is a scientific claim","Design arguments fail against natural selection","Morality precedes religion"]',
 4.2,'https://covers.openlibrary.org/b/isbn/9780618918249-L.jpg','UK','0618680004',0,0),

('1984','en','1984','George Orwell','Signet Classics','$9.99','9780451524935','1949',328,'Paperback',
 'The dystopian classic of surveillance, propaganda and the war on truth.',
 'In Airstrip One, Winston Smith rewrites history for the Ministry of Truth while dreaming of rebellion against Big Brother. Orwell''s masterpiece shows how language shapes thought (Newspeak), how power sustains itself through perpetual war and manufactured hate, and how the final conquest of totalitarianism is not obedience but love of the oppressor.',
 'Fiction','Dystopian Classics','["Fiction","Dystopia"]','["Totalitarianism","Surveillance","Propaganda"]','["Classics","Dystopia","Politics"]',
 '["Who controls the past controls the future","Language limits thought","Power seeks power for its own sake"]',
 4.7,'https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg','UK','0451524934',0,1),

('meditations','en','Meditations','Marcus Aurelius','Modern Library','$15.00','9780812968255','180',256,'Paperback',
 'The private journal of a Roman emperor — the foundational text of Stoic practice.',
 'Written for no audience but himself, these notes show a ruler of the known world coaching his own mind: control what you can, accept what you cannot, act for the common good, and remember that you could leave life right now. Two millennia later it remains the most practical manual of Stoic philosophy ever written.',
 'Philosophy','Stoic Classics','["Philosophy","Classics"]','["Stoicism","Ethics","Self-Discipline"]','["Stoicism","Philosophy","Classics"]',
 '["You control your judgments, not events","Memento mori — act accordingly","The obstacle is the way"]',
 4.6,'https://covers.openlibrary.org/b/isbn/9780812968255-L.jpg','Italy','0812968255',0,0),

('zero-to-one','en','Zero to One','Peter Thiel','Crown Business','$27.00','9780804139298','2014',224,'Hardcover',
 'Notes on startups, or how to build the future.',
 'Thiel argues that real progress comes from creating something new — going from zero to one — rather than copying what works. Competition is for losers; durable companies are built on secrets, monopoly through 10x better technology, strong founding teams, and definite optimism about the future you intend to build.',
 'Business','','["Business","Entrepreneurship"]','["Startups","Innovation","Venture Capital"]','["Startups","Business","Innovation"]',
 '["Competition destroys profits","Build a monopoly through 10x improvement","What valuable company is nobody building?"]',
 4.5,'https://covers.openlibrary.org/b/isbn/9780804139298-L.jpg','USA','0804139296',0,0),

('nexus','en','Nexus: A Brief History of Information Networks','Yuval Noah Harari','Random House','$35.00','9780593734223','2024',528,'Hardcover',
 'From the Stone Age to AI — how information networks made and may unmake our world.',
 'Harari reframes history as the story of information networks: mythology and bureaucracy built empires, print fueled both science and witch hunts, and now AI becomes the first technology that can make decisions and create ideas by itself. The choice ahead is between networks that self-correct and networks that spiral into delusion.',
 'Futurism & Ethics','Harari Collection','["History","Technology"]','["AI","Information","Networks"]','["AI Ethics","Futurism","History"]',
 '["Information doesn''t equal truth","Self-correcting mechanisms decide a network''s fate","AI is an agent, not a tool"]',
 4.3,'https://covers.openlibrary.org/b/isbn/9780593734223-L.jpg','Israel','059373422X',1,0);

-- ── BOOKS (hi) — multi-language demo ───────────────────────────────────────
-- Translations share the same ISBN as the English edition: ISBN acts as the
-- "work key" linking language variants for hreflang alternates.
-- Slugs are localized (Devanagari) — the router resolves them cross-language.
INSERT OR IGNORE INTO books (slug,lang,title,author,publisher,price,isbn,published,page_count,format,description,summary,category,collection,genres,subjects,tags,key_points,rating,cover_url,country,amazon_asin,featured,bestseller) VALUES
('सेपियन्स','hi','सेपियन्स: मानव जाति का संक्षिप्त इतिहास','युवाल नोआ हरारी','Harper Hindi','₹499','9780062316097','2018',512,'Paperback',
 'पाषाण युग से इक्कीसवीं सदी तक मानव जाति का व्यापक इतिहास।',
 'हरारी बताते हैं कि कैसे एक साधारण वानर तीन महान क्रांतियों — संज्ञानात्मक, कृषि और वैज्ञानिक — के माध्यम से पृथ्वी का शासक बन गया। साझा मिथकों की शक्ति से लेकर पूंजी और साम्राज्य तक, यह पुस्तक पूछती है कि क्या इस प्रगति ने हमें अधिक खुश बनाया है।',
 'इतिहास','हरारी संग्रह','["इतिहास","मानवविज्ञान"]','["विकास","सभ्यता"]','["इतिहास","विज्ञान"]',
 '["साझा मिथक बड़े पैमाने पर सहयोग संभव बनाते हैं","कृषि इतिहास का सबसे बड़ा समझौता थी"]',
 4.6,'https://covers.openlibrary.org/b/isbn/9789353024734-L.jpg','इज़राइल','9353024730',1,1),

('एटॉमिक-हैबिट्स','hi','एटॉमिक हैबिट्स','जेम्स क्लियर','Manjul Publishing','₹399','9780735211292','2020',320,'Paperback',
 'अच्छी आदतें बनाने और बुरी आदतें तोड़ने का आसान और सिद्ध तरीका।',
 'क्लियर दिखाते हैं कि उल्लेखनीय परिणाम बड़े बदलावों से नहीं बल्कि समय के साथ संचित छोटे सुधारों से आते हैं। व्यवहार परिवर्तन के चार नियम आदत निर्माण को एक व्यावहारिक प्रणाली में बदल देते हैं।',
 'स्वयं सहायता','','["स्वयं सहायता","मनोविज्ञान"]','["आदतें","उत्पादकता"]','["आदतें","उत्पादकता"]',
 '["हर दिन 1% बेहतर","लक्ष्य नहीं, प्रणाली","पहचान बदलें, आदतें बदलेंगी"]',
 4.8,'https://covers.openlibrary.org/b/isbn/9789390085361-L.jpg','अमेरिका','9390085365',1,1);

-- ── AUTHORS ─────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO authors (slug,lang,name,birth_year,country,bio,famous_work,genres,image_url,wikipedia_url,website_url) VALUES
('yuval-noah-harari','en','Yuval Noah Harari',1976,'Israel','Historian and philosopher known for transforming complex historical ideas into accessible global narratives spanning the deep past and far future.','Sapiens','["History","Philosophy","Future Studies"]',NULL,'https://en.wikipedia.org/wiki/Yuval_Noah_Harari','https://www.ynharari.com'),
('james-clear','en','James Clear',1986,'USA','Writer and speaker focused on habits, decision-making and continuous improvement; his newsletter reaches millions of readers weekly.','Atomic Habits','["Self-Help","Productivity"]',NULL,'https://en.wikipedia.org/wiki/James_Clear','https://jamesclear.com'),
('cal-newport','en','Cal Newport',1982,'USA','Computer science professor at Georgetown and author who writes about the intersection of technology, work and culture.','Deep Work','["Productivity","Technology"]',NULL,'https://en.wikipedia.org/wiki/Cal_Newport','https://calnewport.com'),
('daniel-kahneman','en','Daniel Kahneman',1934,'Israel','Nobel Prize-winning psychologist whose work with Amos Tversky founded behavioral economics and mapped the biases of human judgment.','Thinking, Fast and Slow','["Psychology","Economics"]',NULL,'https://en.wikipedia.org/wiki/Daniel_Kahneman',NULL),
('bhagat-singh','en','Bhagat Singh',1907,'India','Indian socialist revolutionary whose acts of dramatic resistance against British rule made him a legendary figure in India''s freedom struggle.','Why I Am an Atheist','["Revolutionary","Political Philosophy"]',NULL,'https://en.wikipedia.org/wiki/Bhagat_Singh',NULL),
('george-orwell','en','George Orwell',1903,'UK','Novelist, essayist and critic whose lucid prose and opposition to totalitarianism produced two of the most influential novels of the 20th century.','1984','["Fiction","Political Satire"]',NULL,'https://en.wikipedia.org/wiki/George_Orwell',NULL);

-- ── PUBLICATIONS ────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO publications (slug,lang,name,description,about,logo_url,founded,headquarters,website,type,notable_authors,imprints) VALUES
('penguin-random-house','en','Penguin Random House','The world''s largest English-language trade publisher, known for literary classics and modern bestsellers.','Formed in 2013 from the merger of Penguin Group and Random House, it publishes over 15,000 new titles annually across more than 250 imprints and brands worldwide.',NULL,'2013','New York, USA','https://www.penguinrandomhouse.com','Trade Publisher','["Margaret Atwood","Dan Brown","George Orwell","Zadie Smith"]','["Viking","Knopf","Doubleday","Penguin Classics","Vintage"]'),
('harpercollins','en','HarperCollins','A major publisher of fiction and non-fiction, from J.R.R. Tolkien to Yuval Noah Harari.','The second-largest consumer book publisher in the world, operating in 18 countries, tracing its history to Harper & Brothers founded in 1817.',NULL,'1989','New York, USA','https://www.harpercollins.com','Trade Publisher','["J.R.R. Tolkien","Neil Gaiman","Agatha Christie","Yuval Noah Harari"]','["William Morrow","Harper","Harper Perennial","Avon","HarperOne"]'),
('hachette','en','Hachette Book Group','One of the "Big Five" US publishers, home to Little, Brown and Grand Central.','A division of France''s Hachette Livre, HBG publishes roughly 1,400 adult books a year and is home to James Patterson, Cal Newport and many bestselling authors.',NULL,'2006','New York, USA','https://www.hachettebookgroup.com','Trade Publisher','["James Patterson","Cal Newport","Michael Connelly"]','["Little, Brown","Grand Central","Orbit","Basic Books"]'),
('macmillan','en','Macmillan Publishers','Global trade publisher with a 180-year history in literature and science.','Founded in London in 1843, Macmillan today spans fiction, non-fiction and academic publishing, and is home to Farrar, Straus and Giroux — publisher of Nobel laureates including Daniel Kahneman.',NULL,'1843','New York / London','https://us.macmillan.com','Trade Publisher','["Daniel Kahneman","Jeffrey Archer","Nora Roberts"]','["Farrar, Straus and Giroux","St. Martin''s Press","Tor","Picador"]');

-- ── COMICS ──────────────────────────────────────────────────────────────────
INSERT OR IGNORE INTO comics (slug,lang,title,category,publisher,publication_date,cover_price,format,characters,creators,description,cover_url,value_today,fun_fact,rating) VALUES
('marvel-comics-1','en','Marvel Comics #1','Golden Age','Timely Publications (now Marvel)','October 1939','10 cents','68 pages, full color','["The Human Torch","Namor the Sub-Mariner","Ka-Zar","The Angel"]','["Carl Burgos","Bill Everett","Martin Goodman (editor)"]','The comic that started the Marvel Universe: an anthology introducing the Human Torch and Namor whose success led directly to the rise of the Marvel brand.',NULL,'$1.26 million (near-mint, 2019)','Though titled Marvel Comics, the company didn''t officially adopt the Marvel name until the 1960s.',9.8),
('action-comics-1','en','Action Comics #1','Golden Age','DC Comics','June 1938','10 cents','64 pages, full color','["Superman","Lois Lane","Zatara"]','["Jerry Siegel","Joe Shuster"]','The birth of the superhero genre: Superman''s debut turned a struggling anthology into the most valuable comic book ever printed.',NULL,'$6 million (CGC 8.5, 2024)','Siegel and Shuster sold the rights to Superman for $130.',9.9),
('detective-comics-27','en','Detective Comics #27','Golden Age','DC Comics','May 1939','10 cents','64 pages, full color','["Batman","Commissioner Gordon"]','["Bob Kane","Bill Finger"]','The first appearance of the Bat-Man in "The Case of the Chemical Syndicate" — a six-page story that launched one of fiction''s most enduring characters.',NULL,'$1.5 million+','Bill Finger created most of what defines Batman but wasn''t credited until 2015.',9.7),
('amazing-fantasy-15','en','Amazing Fantasy #15','Silver Age','Marvel Comics','August 1962','12 cents','36 pages, full color','["Spider-Man","Aunt May","Uncle Ben"]','["Stan Lee","Steve Ditko"]','Spider-Man''s origin story — a teenage hero with everyday problems, published in a series that was being cancelled with this very issue.',NULL,'$3.6 million (CGC 9.6, 2021)','Publisher Martin Goodman thought readers would hate a teenage hero and that spiders were too creepy.',9.6);
