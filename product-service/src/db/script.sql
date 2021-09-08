create extension if not exists "uuid-ossp";

create table if not exists products (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	title text NOT NULL,
	description text,
	price int
);

create table if not exists stocks (
	product_id uuid,
	count int,
	FOREIGN KEY ("product_id") REFERENCES "products" ("id")
);

insert into products (title, description, price) values
	('Armani Yellow T-Short', 'The best color you can get', 30),
	('Gucci Jeans', 'The most pretentious jeans you can find', 80),
	('Black-White-Yellow Shirt', 'Elegance and style', 40),
	('Gucci Dress', 'Girl`s pink dream', 140),
	('Hoodie Supreme - Red', 'Comfort and style', 20);

with product_ids as (
	select id, row_number() over () as rn
	from products
)
insert into stocks values
	((select id from product_ids where rn = 1), 15),
	((select id from product_ids where rn = 2), 2),
	((select id from product_ids where rn = 3), 10),
	((select id from product_ids where rn = 4), 2),
	((select id from product_ids where rn = 5), 20);
