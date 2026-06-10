export const SCHEMA = {
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

export const SEED_SQL = `
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

export const TRACKS = {
  beginner: {
    label: 'Beginner',
    description: 'No SQL experience needed',
    color: '#4ade80',
    challenges: [
      {
        id: 'b1',
        title: 'Select everything',
        concept: 'SELECT',
        text: 'Retrieve every row and column from the employees table.',
        hint: 'SELECT * FROM table_name; — the * means "all columns".',
        aiPrompt: 'Explain the SQL SELECT statement to a complete beginner in under 80 words. Be friendly and use a simple analogy.',
        check: (rows) => rows.length === 5,
        successMsg: 'All 5 employees returned!',
        errorMsg: 'Try SELECT * FROM employees; — you should see 5 rows.',
      },
      {
        id: 'b2',
        title: 'Pick specific columns',
        concept: 'SELECT columns',
        text: "Show only the name and hire_date columns from the employees table. We don't need the id or dept_id.",
        hint: 'Instead of *, list the column names: SELECT name, hire_date FROM employees;',
        aiPrompt: 'Explain to a beginner how to select specific columns in SQL vs using SELECT *. Under 80 words.',
        check: (rows) => rows.length === 5 && rows[0].hasOwnProperty('name') && rows[0].hasOwnProperty('hire_date') && !rows[0].hasOwnProperty('id'),
        successMsg: 'Exactly right — only name and hire_date!',
        errorMsg: "Make sure you're selecting only name and hire_date, and getting all 5 rows.",
      },
      {
        id: 'b3',
        title: 'Filter with WHERE',
        concept: 'WHERE',
        text: 'Find only the employees who work in department 1 (Engineering).',
        hint: 'Add WHERE dept_id = 1 after your FROM clause.',
        aiPrompt: 'Explain the SQL WHERE clause to a beginner in under 80 words with a short example.',
        check: (rows) => rows.length === 3,
        successMsg: '3 engineers found — WHERE clause works!',
        errorMsg: 'Filter by dept_id = 1. You should get 3 results.',
      },
      {
        id: 'b4',
        title: 'Count rows',
        concept: 'COUNT()',
        text: 'How many employees are in the database? Return a single number using COUNT().',
        hint: 'SELECT COUNT(*) FROM employees; returns one row with the total count.',
        aiPrompt: 'Explain SQL COUNT() to a beginner in under 80 words. What does it do and when would you use it?',
        check: (rows) => rows.length === 1 && Object.values(rows[0])[0] === 5,
        successMsg: 'Correct! COUNT(*) returned 5.',
        errorMsg: 'Use COUNT(*) — you should get a single row with the value 5.',
      },
      {
        id: 'b5',
        title: 'Sort results',
        concept: 'ORDER BY',
        text: 'List all employees sorted alphabetically by name (A → Z).',
        hint: 'Add ORDER BY name ASC at the end. ASC = ascending (A→Z), DESC = descending.',
        aiPrompt: 'Explain ORDER BY in SQL to a beginner in under 80 words. Include ASC vs DESC.',
        check: (rows) => {
          if (rows.length !== 5) return false;
          const names = rows.map(r => r.name);
          return JSON.stringify(names) === JSON.stringify([...names].sort());
        },
        successMsg: 'Alphabetical! ORDER BY sorts any column.',
        errorMsg: 'Select all employees and sort by name ASC.',
      },
      {
        id: 'b6',
        title: 'Limit results',
        concept: 'LIMIT',
        text: 'Show only the first 3 employees from the table.',
        hint: 'Add LIMIT 3 at the very end of your query.',
        aiPrompt: 'Explain SQL LIMIT to a beginner in under 80 words. When is it useful?',
        check: (rows) => rows.length === 3,
        successMsg: 'LIMIT restricts how many rows come back — very useful for previewing data!',
        errorMsg: 'Add LIMIT 3 to the end of your query.',
      },
    ],
  },
  analyst: {
    label: 'Analyst',
    description: 'Aggregates, joins & grouping',
    color: '#60a5fa',
    challenges: [
      {
        id: 'a1',
        title: 'Join two tables',
        concept: 'JOIN',
        text: "Show each employee's name alongside their department name. You'll need to JOIN employees and departments.",
        hint: 'SELECT e.name, d.name FROM employees e JOIN departments d ON e.dept_id = d.id',
        aiPrompt: 'Explain SQL JOINs to a beginner in under 100 words. Use a simple real-world analogy.',
        check: (rows) => rows.length === 5 && Object.keys(rows[0]).length >= 2,
        successMsg: 'JOINs connect related tables — this is one of the most important SQL skills!',
        errorMsg: "Use JOIN ... ON to link employees.dept_id to departments.id. You should get 5 rows with name and department.",
      },
      {
        id: 'a2',
        title: 'Group and count',
        concept: 'GROUP BY',
        text: 'Count how many employees are in each department. Return the dept_id and the count.',
        hint: 'SELECT dept_id, COUNT(*) FROM employees GROUP BY dept_id;',
        aiPrompt: 'Explain GROUP BY in SQL to a beginner in under 100 words. What problem does it solve?',
        check: (rows) => rows.length === 3,
        successMsg: '3 groups — one per department. GROUP BY is essential for summarising data!',
        errorMsg: 'Use GROUP BY dept_id — you should get 3 rows, one per department.',
      },
      {
        id: 'a3',
        title: 'Average salary',
        concept: 'AVG()',
        text: 'Find the average salary across all employees for the year 2024.',
        hint: 'SELECT AVG(amount) FROM salaries WHERE year = 2024;',
        aiPrompt: 'Explain SQL aggregate functions AVG, SUM, MIN, MAX to a beginner in under 100 words.',
        check: (rows) => rows.length === 1 && Object.values(rows[0])[0] === 94000,
        successMsg: 'Average salary in 2024 is $94,000. Aggregate functions summarise groups of values.',
        errorMsg: "Use AVG(amount) from the salaries table, filtered to year 2024. You should get 94000.",
      },
      {
        id: 'a4',
        title: 'Highest earner',
        concept: 'MAX() + JOIN',
        text: "Find the name of the employee with the highest salary in 2024.",
        hint: 'Join employees and salaries, filter to year = 2024, then ORDER BY amount DESC LIMIT 1.',
        aiPrompt: 'Explain how to combine ORDER BY and LIMIT to find the top or bottom record in SQL. Under 100 words.',
        check: (rows) => rows.length === 1 && rows[0].name === 'Eve',
        successMsg: "Eve is the top earner! Great use of JOIN + ORDER BY + LIMIT.",
        errorMsg: 'Join employees to salaries on emp_id = id, filter year = 2024, sort by amount DESC, then LIMIT 1.',
      },
      {
        id: 'a5',
        title: 'Department salary totals',
        concept: 'GROUP BY + JOIN',
        text: 'Show the total salary paid per department in 2023. Display the department name and total.',
        hint: 'Join all 3 tables, filter year = 2023, then GROUP BY departments.name with SUM(amount).',
        aiPrompt: 'Explain how to join multiple tables and use GROUP BY with SUM in SQL. Under 100 words.',
        check: (rows) => rows.length === 3 && rows.some(r => Object.values(r).includes(283000)),
        successMsg: 'Total salaries by department — you combined JOIN, GROUP BY, and SUM!',
        errorMsg: 'Join employees, departments, and salaries. Filter year=2023, GROUP BY departments.name, SUM(amount).',
      },
      {
        id: 'a6',
        title: 'Filter groups with HAVING',
        concept: 'HAVING',
        text: 'Find departments where the total 2024 salary exceeds $150,000. Show department name and total.',
        hint: 'Use HAVING SUM(amount) > 150000 after your GROUP BY clause.',
        aiPrompt: 'Explain the difference between WHERE and HAVING in SQL to a beginner. Under 100 words.',
        check: (rows) => rows.length === 2,
        successMsg: '2 departments qualify. HAVING filters groups — like WHERE but for aggregated results!',
        errorMsg: 'Add HAVING SUM(amount) > 150000 after GROUP BY. You should get 2 departments.',
      },
    ],
  },
  advanced: {
    label: 'Advanced',
    description: 'Subqueries, CTEs & window functions',
    color: '#f472b6',
    challenges: [
      {
        id: 'adv1',
        title: 'Subquery filter',
        concept: 'Subquery',
        text: 'Find all employees whose salary in 2024 is above the average 2024 salary.',
        hint: 'Use a subquery: WHERE amount > (SELECT AVG(amount) FROM salaries WHERE year = 2024)',
        aiPrompt: 'Explain SQL subqueries to someone who knows basic SQL. Under 100 words.',
        check: (rows) => rows.length === 2,
        successMsg: '2 employees above the average — subqueries let you nest queries!',
        errorMsg: 'Join employees and salaries (year=2024), then filter where amount > the average. Expect 2 rows.',
      },
      {
        id: 'adv2',
        title: 'Salary growth',
        concept: 'Self JOIN',
        text: "Find each employee's salary increase from 2023 to 2024. Show their name and the difference.",
        hint: "Join salaries to itself: JOIN salaries s2 ON s1.emp_id = s2.emp_id AND s1.year=2023 AND s2.year=2024",
        aiPrompt: 'Explain SQL self-joins to someone who knows basic SQL. Under 100 words.',
        check: (rows) => rows.length === 5 && rows.some(r => Object.values(r).includes(5000)),
        successMsg: 'Self-joins compare a table to itself — great for year-over-year analysis!',
        errorMsg: 'Self-join the salaries table for years 2023 and 2024, then subtract. Expect 5 rows.',
      },
      {
        id: 'adv3',
        title: 'CTE basics',
        concept: 'WITH / CTE',
        text: 'Use a CTE (Common Table Expression) to first calculate each department\'s headcount, then select departments with more than 1 employee.',
        hint: 'WITH dept_counts AS (SELECT dept_id, COUNT(*) as cnt FROM employees GROUP BY dept_id) SELECT * FROM dept_counts WHERE cnt > 1;',
        aiPrompt: 'Explain SQL CTEs (WITH clause) to someone who knows GROUP BY. Under 100 words.',
        check: (rows) => rows.length === 2,
        successMsg: 'CTEs make complex queries readable by breaking them into named steps!',
        errorMsg: 'Your CTE should produce dept counts, then filter to cnt > 1. Expect 2 rows.',
      },
    ],
  },
};
