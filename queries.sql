DROP TABLE IF EXISTS covers, books;

CREATE TABLE books(
	book_id SERIAL PRIMARY KEY NOT NULL,
	isbn VARCHAR(102) UNIQUE NOT NULL,
	author VARCHAR(102) NOT NULL,
	title VARCHAR(255) NOT NULL,
	descriptions TEXT NOT NULL,
	rating NUMERIC NOT NULL,
	read_on DATE NOT NUll
);

CREATE TABLE covers(
	cover_id SERIAL PRIMARY KEY,
	imageurl VARCHAR(255) UNIQUE NOT NULL,
	isbn VARCHAR(102) REFERENCES books(isbn)
	ON DELETE CASCADE 
);

INSERT INTO books (author, title, descriptions, rating, isbn, read_on)
VALUES ('James Hadley Chase', 'Make The Corpse Walk', 'Crazed millionaire Kester Weidmann believes money can buy everything - even life and death. So when his brother dies, Weidmann seeks the services of a voodoo expert to bring him back to life. He finds Rollo, a crooked nightclub owner who seizes the opportunity for the biggest con of the century.', 7.5, '9781842321133', '1994-06-30'),
('Arsène Wenger', 'Wenger: My Life and Lessons in Red and White', 'In Wenger: My Life and Lessons in Red and White, world-renowned and revolutionary soccer coach Arsène Wenger opens up about his life, sharing principles for success on and off the field with lessons on leadership...', 9.5, '9781797206158', '2019-06-21'),
('Chinua Achebe', 'No Longer AT Ease', 'The Corruptibility of Civil Servants. One of Chinua Achebe''s main socio-political criticisms in No Longer At Ease is that of corruption in Nigeria. From the moment the book begins the main character, Obi Okonkwo, is confronted with the issue of bribery.', 10, '9780385474559', '1996-04-12'),
('Agatha Christie', 'Cat Among The Pigeons', 'A revolution takes place within Ramat, a fictional kingdom in the Middle East. Before their deaths, Prince Ali Yusuf entrusts his pilot, Bob Rawlinson, to smuggle a fortune in jewels out of the country. These are concealed in the luggage of his sister, Joan Sutcliffe, and her daughter Jennifer.', 8, '0061002844', '1995-03-31')
;

INSERT INTO covers (imageurl, isbn)
VALUES ('https://covers.openlibrary.org/b/isbn/9781842321133-M.jpg?default=false', '9781842321133'),
('https://covers.openlibrary.org/b/isbn/9781797206158-M.jpg?default=false', '9781797206158'),
('https://covers.openlibrary.org/b/isbn/9780385474559-M.jpg?default=false', '9780385474559'),
('https://covers.openlibrary.org/b/isbn/0061002844-M.jpg?default=false', '0061002844')
RETURNING *
;

SELECT * FROM books
JOIN covers
ON books.isbn = covers.isbn
ORDER BY rating DESC
;

