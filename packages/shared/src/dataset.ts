export const CORP_HR_SEED_SQL = `
CREATE TABLE departments (id INTEGER PRIMARY KEY, name TEXT);
INSERT INTO departments VALUES (1,'Engineering'),(2,'Marketing'),(3,'HR');

CREATE TABLE employees (id INTEGER PRIMARY KEY, name TEXT, dept_id INTEGER, hire_date TEXT);
INSERT INTO employees VALUES
  (1,'Alice',1,'2020-03-15'),
  (2,'Bob',2,'2019-07-22'),
  (3,'Carol',1,'2021-11-01'),
  (4,'Dana',3,'2022-01-10'),
  (5,'Eve',1,'2018-05-30');

CREATE TABLE salaries (emp_id INTEGER, amount INTEGER, year INTEGER);
INSERT INTO salaries VALUES
  (1,95000,2022),(1,100000,2023),(1,105000,2024),
  (2,72000,2022),(2,75000,2023),(2,78000,2024),
  (3,88000,2022),(3,92000,2023),(3,96000,2024),
  (4,65000,2022),(4,68000,2023),(4,71000,2024),
  (5,110000,2022),(5,115000,2023),(5,120000,2024);
`;

export const CORP_HR_SCHEMA = {
  employees: {
    columns: [
      { name: 'id', type: 'INTEGER', note: 'primary key' },
      { name: 'name', type: 'TEXT' },
      { name: 'dept_id', type: 'INTEGER', note: 'FK → departments.id' },
      { name: 'hire_date', type: 'TEXT', note: 'YYYY-MM-DD' },
    ],
    sample: 'Alice, Bob, Carol, Dana, Eve',
  },
  departments: {
    columns: [
      { name: 'id', type: 'INTEGER', note: 'primary key' },
      { name: 'name', type: 'TEXT' },
    ],
    sample: 'Engineering (1), Marketing (2), HR (3)',
  },
  salaries: {
    columns: [
      { name: 'emp_id', type: 'INTEGER', note: 'FK → employees.id' },
      { name: 'amount', type: 'INTEGER' },
      { name: 'year', type: 'INTEGER' },
    ],
    sample: 'One row per employee per year (2022–2024)',
  },
};

export const ECOMMERCE_SEED_SQL = `
CREATE TABLE categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

INSERT INTO categories (id, name) VALUES 
  (1, 'Electronics'),
  (2, 'Clothing'),
  (3, 'Books'),
  (4, 'Home & Kitchen'),
  (5, 'Sports & Outdoors');

CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  category_id INTEGER,
  price REAL NOT NULL,
  stock_qty INTEGER NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

INSERT INTO products (id, name, category_id, price, stock_qty) VALUES
  (1, 'Laptop', 1, 1200.00, 15),
  (2, 'Smartphone', 1, 800.00, 25),
  (3, 'Wireless Headphones', 1, 150.00, 40),
  (4, 'Denim Jeans', 2, 60.00, 50),
  (5, 'Cotton T-Shirt', 2, 25.00, 100),
  (6, 'Running Shoes', 2, 90.00, 30),
  (7, 'SQL Guide', 3, 45.00, 60),
  (8, 'Sci-Fi Novel', 3, 15.00, 45),
  (9, 'Cookbook', 3, 30.00, 20),
  (10, 'Coffee Maker', 4, 80.00, 15),
  (11, 'Air Fryer', 4, 120.00, 12),
  (12, 'Yoga Mat', 5, 25.00, 35),
  (13, 'Water Bottle', 5, 15.00, 80);

CREATE TABLE customers (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  signup_date TEXT NOT NULL
);

INSERT INTO customers (id, name, email, city, signup_date) VALUES
  (1, 'Alice Smith', 'alice@example.com', 'New York', '2023-01-15'),
  (2, 'Bob Jones', 'bob@example.com', 'San Francisco', '2023-02-20'),
  (3, 'Charlie Brown', 'charlie@example.com', 'Chicago', '2023-03-05'),
  (4, 'Diana Prince', 'diana@example.com', 'Los Angeles', '2023-04-12'),
  (5, 'Evan Wright', 'evan@example.com', 'Boston', '2023-05-18'),
  (6, 'Fiona Gallagher', 'fiona@example.com', 'Chicago', '2023-06-22'),
  (7, 'George Clark', 'george@example.com', 'New York', '2023-07-01'),
  (8, 'Hannah Abbott', 'hannah@example.com', 'Seattle', '2023-08-15'),
  (9, 'Ian Malcolm', 'ian@example.com', 'Austin', '2023-09-10'),
  (10, 'Julia Roberts', 'julia@example.com', 'Los Angeles', '2023-10-05');

CREATE TABLE orders (
  id INTEGER PRIMARY KEY,
  customer_id INTEGER,
  order_date TEXT NOT NULL,
  status TEXT NOT NULL,
  total REAL NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

INSERT INTO orders (id, customer_id, order_date, status, total) VALUES
  (1, 1, '2023-11-01', 'Completed', 1350.00),
  (2, 2, '2023-11-02', 'Completed', 80.00),
  (3, 3, '2023-11-03', 'Completed', 85.00),
  (4, 4, '2023-11-05', 'Completed', 105.00),
  (5, 5, '2023-11-06', 'Pending', 800.00),
  (6, 1, '2023-11-10', 'Completed', 50.00),
  (7, 6, '2023-11-12', 'Completed', 205.00),
  (8, 7, '2023-11-15', 'Completed', 120.00),
  (9, 8, '2023-11-16', 'Cancelled', 150.00),
  (10, 9, '2023-11-18', 'Completed', 60.00),
  (11, 10, '2023-11-20', 'Completed', 950.00),
  (12, 3, '2023-11-22', 'Completed', 30.00),
  (13, 4, '2023-11-25', 'Completed', 1200.00),
  (14, 2, '2023-11-26', 'Completed', 150.00),
  (15, 6, '2023-11-28', 'Completed', 90.00),
  (16, 1, '2023-12-01', 'Completed', 150.00),
  (17, 5, '2023-12-03', 'Completed', 170.00);

CREATE TABLE order_items (
  id INTEGER PRIMARY KEY,
  order_id INTEGER,
  product_id INTEGER,
  qty INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO order_items (id, order_id, product_id, qty, unit_price) VALUES
  (1, 1, 1, 1, 1200.00),
  (2, 1, 3, 1, 150.00),
  (3, 2, 10, 1, 80.00),
  (4, 3, 4, 1, 60.00),
  (5, 3, 12, 1, 25.00),
  (6, 4, 7, 2, 45.00),
  (7, 4, 8, 1, 15.00),
  (8, 5, 2, 1, 800.00),
  (9, 6, 5, 2, 25.00),
  (10, 7, 6, 2, 90.00),
  (11, 7, 12, 1, 25.00),
  (12, 8, 11, 1, 120.00),
  (13, 9, 3, 1, 150.00),
  (14, 10, 9, 2, 30.00),
  (15, 11, 2, 1, 800.00),
  (16, 11, 3, 1, 150.00),
  (17, 12, 13, 2, 15.00),
  (18, 13, 1, 1, 1200.00),
  (19, 14, 3, 1, 150.00),
  (20, 15, 6, 1, 90.00),
  (21, 16, 3, 1, 150.00),
  (22, 17, 10, 1, 80.00),
  (23, 17, 6, 1, 90.00);
`;

export const ECOMMERCE_SCHEMA = {
  categories: {
    columns: [
      { name: 'id', type: 'INTEGER', note: 'primary key' },
      { name: 'name', type: 'TEXT' }
    ],
    sample: 'Electronics (1), Clothing (2), Books (3)'
  },
  products: {
    columns: [
      { name: 'id', type: 'INTEGER', note: 'primary key' },
      { name: 'name', type: 'TEXT' },
      { name: 'category_id', type: 'INTEGER', note: 'FK → categories.id' },
      { name: 'price', type: 'REAL' },
      { name: 'stock_qty', type: 'INTEGER' }
    ],
    sample: 'Laptop (1), Smartphone (2), Denim Jeans (4)'
  },
  customers: {
    columns: [
      { name: 'id', type: 'INTEGER', note: 'primary key' },
      { name: 'name', type: 'TEXT' },
      { name: 'email', type: 'TEXT', note: 'unique' },
      { name: 'city', type: 'TEXT' },
      { name: 'signup_date', type: 'TEXT', note: 'YYYY-MM-DD' }
    ],
    sample: 'Alice Smith, Bob Jones, Charlie Brown'
  },
  orders: {
    columns: [
      { name: 'id', type: 'INTEGER', note: 'primary key' },
      { name: 'customer_id', type: 'INTEGER', note: 'FK → customers.id' },
      { name: 'order_date', type: 'TEXT', note: 'YYYY-MM-DD' },
      { name: 'status', type: 'TEXT', note: 'Completed, Pending, Cancelled' },
      { name: 'total', type: 'REAL' }
    ],
    sample: 'Order totals & fulfillment statuses'
  },
  order_items: {
    columns: [
      { name: 'id', type: 'INTEGER', note: 'primary key' },
      { name: 'order_id', type: 'INTEGER', note: 'FK → orders.id' },
      { name: 'product_id', type: 'INTEGER', note: 'FK → products.id' },
      { name: 'qty', type: 'INTEGER' },
      { name: 'unit_price', type: 'REAL' }
    ],
    sample: 'Line items linking products to orders'
  }
};

export const LIBRARY_SEED_SQL = `
CREATE TABLE authors (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  nationality TEXT NOT NULL,
  birth_year INTEGER NOT NULL
);

INSERT INTO authors (id, name, nationality, birth_year) VALUES
  (1, 'George Orwell', 'British', 1903),
  (2, 'Jane Austen', 'British', 1775),
  (3, 'F. Scott Fitzgerald', 'American', 1896),
  (4, 'Gabriel García Márquez', 'Colombian', 1927),
  (5, 'Harper Lee', 'American', 1926),
  (6, 'J.K. Rowling', 'British', 1965),
  (7, 'J.R.R. Tolkien', 'British', 1892),
  (8, 'Agatha Christie', 'British', 1890);

CREATE TABLE genres (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

INSERT INTO genres (id, name) VALUES
  (1, 'Fiction'),
  (2, 'Classic'),
  (3, 'Fantasy'),
  (4, 'Mystery'),
  (5, 'Science Fiction');

CREATE TABLE books (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  author_id INTEGER,
  genre_id INTEGER,
  published_year INTEGER NOT NULL,
  copies_total INTEGER NOT NULL,
  copies_available INTEGER NOT NULL,
  FOREIGN KEY (author_id) REFERENCES authors(id),
  FOREIGN KEY (genre_id) REFERENCES genres(id)
);

INSERT INTO books (id, title, author_id, genre_id, published_year, copies_total, copies_available) VALUES
  (1, '1984', 1, 5, 1949, 5, 3),
  (2, 'Animal Farm', 1, 1, 1945, 3, 3),
  (3, 'Pride and Prejudice', 2, 2, 1813, 4, 2),
  (4, 'Sense and Sensibility', 2, 2, 1811, 2, 1),
  (5, 'The Great Gatsby', 3, 2, 1925, 3, 2),
  (6, 'One Hundred Years of Solitude', 4, 1, 1967, 3, 1),
  (7, 'To Kill a Mockingbird', 5, 2, 1960, 5, 4),
  (8, 'Harry Potter and the Sorcerer''s Stone', 6, 3, 1997, 8, 6),
  (9, 'Harry Potter and the Chamber of Secrets', 6, 3, 1998, 6, 5),
  (10, 'The Hobbit', 7, 3, 1937, 5, 3),
  (11, 'The Fellowship of the Ring', 7, 3, 1954, 4, 4),
  (12, 'Murder on the Orient Express', 8, 4, 1934, 4, 2),
  (13, 'And Then There Were None', 8, 4, 1939, 3, 3);

CREATE TABLE members (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  join_date TEXT NOT NULL,
  membership_type TEXT NOT NULL
);

INSERT INTO members (id, name, email, join_date, membership_type) VALUES
  (1, 'Sarah Jenkins', 'sarah@example.com', '2022-01-10', 'Standard'),
  (2, 'Michael Chang', 'michael@example.com', '2022-03-15', 'Premium'),
  (3, 'Emily Davis', 'emily@example.com', '2022-06-20', 'Standard'),
  (4, 'David Miller', 'david@example.com', '2022-08-05', 'Premium'),
  (5, 'Jessica Taylor', 'jessica@example.com', '2022-11-12', 'Standard'),
  (6, 'James Wilson', 'james@example.com', '2023-01-25', 'Student'),
  (7, 'Amanda Martinez', 'amanda@example.com', '2023-04-18', 'Student'),
  (8, 'Robert Anderson', 'robert@example.com', '2023-07-02', 'Premium');

CREATE TABLE loans (
  id INTEGER PRIMARY KEY,
  book_id INTEGER,
  member_id INTEGER,
  loan_date TEXT NOT NULL,
  due_date TEXT NOT NULL,
  return_date TEXT,
  FOREIGN KEY (book_id) REFERENCES books(id),
  FOREIGN KEY (member_id) REFERENCES members(id)
);

INSERT INTO loans (id, book_id, member_id, loan_date, due_date, return_date) VALUES
  (1, 1, 1, '2023-10-01', '2023-10-15', '2023-10-12'),
  (2, 3, 2, '2023-10-02', '2023-10-16', '2023-10-18'),
  (3, 8, 3, '2023-10-05', '2023-10-19', '2023-10-19'),
  (4, 10, 4, '2023-10-10', '2023-10-24', '2023-10-22'),
  (5, 12, 5, '2023-10-12', '2023-10-26', '2023-10-27'),
  (6, 1, 6, '2023-10-15', '2023-10-29', '2023-10-28'),
  (7, 6, 7, '2023-10-18', '2023-11-01', '2023-11-05'),
  (8, 8, 8, '2023-10-20', '2023-11-03', '2023-11-02'),
  (9, 3, 1, '2023-10-25', '2023-11-08', '2023-11-08'),
  (10, 4, 3, '2023-11-01', '2023-11-15', '2023-11-14'),
  (11, 12, 2, '2023-11-05', '2023-11-19', NULL),
  (12, 6, 4, '2023-11-08', '2023-11-22', NULL),
  (13, 9, 6, '2023-11-10', '2023-11-24', '2023-11-23'),
  (14, 5, 8, '2023-11-12', '2023-11-26', NULL),
  (15, 10, 7, '2023-11-15', '2023-11-29', '2023-12-02'),
  (16, 2, 5, '2023-11-18', '2023-12-02', '2023-12-01'),
  (17, 7, 2, '2023-11-20', '2023-12-04', NULL),
  (18, 1, 3, '2023-11-22', '2023-12-06', '2023-12-06'),
  (19, 8, 1, '2023-11-25', '2023-12-09', NULL),
  (20, 11, 4, '2023-11-28', '2023-12-12', '2023-12-10');
`;

export const LIBRARY_SCHEMA = {
  authors: {
    columns: [
      { name: 'id', type: 'INTEGER', note: 'primary key' },
      { name: 'name', type: 'TEXT' },
      { name: 'nationality', type: 'TEXT' },
      { name: 'birth_year', type: 'INTEGER' }
    ],
    sample: 'George Orwell, Jane Austen, J.R.R. Tolkien'
  },
  genres: {
    columns: [
      { name: 'id', type: 'INTEGER', note: 'primary key' },
      { name: 'name', type: 'TEXT', note: 'unique' }
    ],
    sample: 'Classic, Fantasy, Science Fiction'
  },
  books: {
    columns: [
      { name: 'id', type: 'INTEGER', note: 'primary key' },
      { name: 'title', type: 'TEXT' },
      { name: 'author_id', type: 'INTEGER', note: 'FK → authors.id' },
      { name: 'genre_id', type: 'INTEGER', note: 'FK → genres.id' },
      { name: 'published_year', type: 'INTEGER' },
      { name: 'copies_total', type: 'INTEGER' },
      { name: 'copies_available', type: 'INTEGER' }
    ],
    sample: '1984, Pride and Prejudice, The Hobbit'
  },
  members: {
    columns: [
      { name: 'id', type: 'INTEGER', note: 'primary key' },
      { name: 'name', type: 'TEXT' },
      { name: 'email', type: 'TEXT', note: 'unique' },
      { name: 'join_date', type: 'TEXT', note: 'YYYY-MM-DD' },
      { name: 'membership_type', type: 'TEXT', note: 'Standard, Premium, Student' }
    ],
    sample: 'Sarah Jenkins, Michael Chang'
  },
  loans: {
    columns: [
      { name: 'id', type: 'INTEGER', note: 'primary key' },
      { name: 'book_id', type: 'INTEGER', note: 'FK → books.id' },
      { name: 'member_id', type: 'INTEGER', note: 'FK → members.id' },
      { name: 'loan_date', type: 'TEXT', note: 'YYYY-MM-DD' },
      { name: 'due_date', type: 'TEXT', note: 'YYYY-MM-DD' },
      { name: 'return_date', type: 'TEXT', note: 'YYYY-MM-DD (nullable)' }
    ],
    sample: 'Tracking active and past book borrowings'
  }
};
