CREATE TABLE IF NOT EXISTS blog_posts (
	id SERIAL PRIMARY KEY,
	title VARCHAR(255) NOT NULL,
	content TEXT NOT NULL,
	poster BYTEA,
	image_url TEXT NOT NULL,
	transformation TEXT NOT NULL,
	labels TEXT,
	release_date DATE,
	release_year INT,
	auther_id INT,
	created_date DATE DEFAULT CURRENT_DATE,
	end_date DATE
);

CREATE TABLE IF NOT EXISTS users(
	id SERIAL PRIMARY KEY,
	firstname VARCHAR(150) NOT NULL,
	lastname VARCHAR(150) NOT NULL,
	username VARCHAR(150) UNIQUE NOT NULL,
	email VARCHAR(100) UNIQUE NOT NULL,
	password VARCHAR(100) NOT NULL,
	is_verified BOOLEAN DEFAULT FALSE,
	verification_token TEXT
);

INSERT INTO users (firstname, lastname, username, email, password) VALUES ('Saurabh', 'Ram', 'exampleuser', 'example@example.com', 'Example@123');

-- select pg_get_serial_sequence('nexora.users', 'id');

-- select last_value, is_called
-- from nexora.users_id_seq;

select setval(
  pg_get_serial_sequence('nexora.users', 'id'),
  coalesce(max(id), 1)
)
from nexora.users;

-- select pg_get_serial_sequence('public.users', 'id');

-- select last_value, is_called
-- from public.users_id_seq;

select setval(
  pg_get_serial_sequence('public.users', 'id'),
  coalesce(max(id), 1)
)
from public.users;

