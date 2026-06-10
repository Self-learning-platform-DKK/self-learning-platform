import test from 'node:test';
import assert from 'node:assert';
import { validateStructural, validateAst, validateResult, runValidation } from './engine';
import type { ValidationRuleConfig, SqlResult } from '@sql-tutor/shared';

test('validateStructural - blocks mutating SQL', () => {
  const badQueries = [
    'DROP TABLE employees',
    'DELETE FROM departments WHERE id = 1',
    'INSERT INTO salaries (emp_id, amount) VALUES (1, 100)',
    'UPDATE employees SET name = "John"',
    'ALTER TABLE employees ADD COLUMN age INTEGER',
    'CREATE TABLE test (id INT)',
  ];

  for (const q of badQueries) {
    const res = validateStructural(q);
    assert.strictEqual(res.passed, false, `Query "${q}" should be blocked`);
    assert.ok(res.failures.length > 0);
    assert.match(res.failures[0], /not allowed/);
  }
});

test('validateStructural - allows safe SELECT queries', () => {
  const safeQueries = [
    'SELECT * FROM employees',
    'SELECT name, hire_date FROM employees JOIN salaries ON employees.id = salaries.emp_id',
    'WITH summary AS (SELECT count(*) as cnt FROM departments) SELECT * FROM summary',
  ];

  for (const q of safeQueries) {
    const res = validateStructural(q);
    assert.strictEqual(res.passed, true, `Query "${q}" should be allowed`);
    assert.strictEqual(res.failures.length, 0);
  }
});

test('validateAst - KEYWORD_REQUIRED', () => {
  const rules: ValidationRuleConfig[] = [
    { type: 'KEYWORD_REQUIRED', config: { keyword: 'GROUP BY' } }
  ];

  const goodRes = validateAst('SELECT dept_id, COUNT(*) FROM employees GROUP BY dept_id', rules);
  assert.strictEqual(goodRes.passed, true);

  const badRes = validateAst('SELECT * FROM employees', rules);
  assert.strictEqual(badRes.passed, false);
  assert.match(badRes.failures[0], /must use GROUP BY/);
});

test('validateAst - FORBIDDEN_KEYWORD', () => {
  const rules: ValidationRuleConfig[] = [
    { type: 'FORBIDDEN_KEYWORD', config: { keyword: 'JOIN' } }
  ];

  const goodRes = validateAst('SELECT * FROM employees, salaries WHERE id = emp_id', rules);
  assert.strictEqual(goodRes.passed, true);

  const badRes = validateAst('SELECT * FROM employees JOIN salaries ON id = emp_id', rules);
  assert.strictEqual(badRes.passed, false);
  assert.match(badRes.failures[0], /JOIN is not allowed/);
});

test('validateAst - TABLE_USAGE', () => {
  const rules: ValidationRuleConfig[] = [
    { type: 'TABLE_USAGE', config: { tables: ['employees', 'departments'] } }
  ];

  const goodRes = validateAst('SELECT * FROM employees JOIN departments ON id = dept_id', rules);
  assert.strictEqual(goodRes.passed, true);

  const badRes = validateAst('SELECT * FROM employees JOIN salaries ON id = emp_id', rules);
  assert.strictEqual(badRes.passed, false);
  assert.match(badRes.failures[0], /must use table: departments/);
});

test('validateResult - ROW_COUNT', () => {
  const rules: ValidationRuleConfig[] = [
    { type: 'ROW_COUNT', config: { exact: 3 } }
  ];

  const result3: SqlResult = {
    columns: ['id'],
    rows: [{ id: 1 }, { id: 2 }, { id: 3 }]
  };
  const goodRes = validateResult(result3, rules);
  assert.strictEqual(goodRes.passed, true);

  const result2: SqlResult = {
    columns: ['id'],
    rows: [{ id: 1 }, { id: 2 }]
  };
  const badRes = validateResult(result2, rules);
  assert.strictEqual(badRes.passed, false);
  assert.match(badRes.failures[0], /Expected 3 rows, got 2/);
});

test('validateResult - COLUMN_NAMES', () => {
  const rules: ValidationRuleConfig[] = [
    { type: 'COLUMN_NAMES', config: { columns: ['name', 'salary_amount'], forbidden: ['password'] } }
  ];

  const goodResult: SqlResult = {
    columns: ['name', 'salary_amount', 'dept'],
    rows: [{ name: 'Alice', salary_amount: 5000, dept: 'HR' }]
  };
  const goodRes = validateResult(goodResult, rules);
  assert.strictEqual(goodRes.passed, true);

  const missingResult: SqlResult = {
    columns: ['name'],
    rows: [{ name: 'Alice' }]
  };
  const missingRes = validateResult(missingResult, rules);
  assert.strictEqual(missingRes.passed, false);
  assert.match(missingRes.failures[0], /Missing column: salary_amount/);

  const forbiddenResult: SqlResult = {
    columns: ['name', 'salary_amount', 'password'],
    rows: [{ name: 'Alice', salary_amount: 5000, password: 'xyz' }]
  };
  const forbiddenRes = validateResult(forbiddenResult, rules);
  assert.strictEqual(forbiddenRes.passed, false);
  assert.match(forbiddenRes.failures[0], /Column not allowed: password/);
});

test('validateResult - COLUMN_VALUES', () => {
  const rules: ValidationRuleConfig[] = [
    { type: 'COLUMN_VALUES', config: { column: 'dept', values: ['Engineering', 'Sales'] } }
  ];

  const goodResult: SqlResult = {
    columns: ['name', 'dept'],
    rows: [
      { name: 'Alice', dept: 'Engineering' },
      { name: 'Bob', dept: 'Sales' }
    ]
  };
  const goodRes = validateResult(goodResult, rules);
  assert.strictEqual(goodRes.passed, true);

  const badResult: SqlResult = {
    columns: ['name', 'dept'],
    rows: [
      { name: 'Alice', dept: 'Engineering' },
      { name: 'Bob', dept: 'Marketing' }
    ]
  };
  const badRes = validateResult(badResult, rules);
  assert.strictEqual(badRes.passed, false);
  assert.match(badRes.failures[0], /Expected value Sales not found/);
});

test('validateResult - SORT_ORDER', () => {
  const rules: ValidationRuleConfig[] = [
    { type: 'SORT_ORDER', config: { column: 'name', direction: 'ASC' } }
  ];

  const goodResult: SqlResult = {
    columns: ['name'],
    rows: [{ name: 'Alice' }, { name: 'Bob' }, { name: 'Charlie' }]
  };
  const goodRes = validateResult(goodResult, rules);
  assert.strictEqual(goodRes.passed, true);

  const badResult: SqlResult = {
    columns: ['name'],
    rows: [{ name: 'Charlie' }, { name: 'Alice' }, { name: 'Bob' }]
  };
  const badRes = validateResult(badResult, rules);
  assert.strictEqual(badRes.passed, false);
  assert.match(badRes.failures[0], /Results not sorted by name ASC/);
});

test('runValidation - XP reward and penalty calculation', () => {
  const rules: ValidationRuleConfig[] = [
    { type: 'ROW_COUNT', config: { exact: 2 } }
  ];
  const result: SqlResult = {
    columns: ['name'],
    rows: [{ name: 'Alice' }, { name: 'Bob' }]
  };

  const cleanValidation = runValidation('SELECT name FROM users', result, rules, {
    baseXp: 100,
    hintPenalty: 0.2,
    successMsg: 'Well done!',
    errorMsg: 'Try again',
  });

  assert.strictEqual(cleanValidation.passed, true);
  // baseXp * (1 - 0.2) = 80 XP
  assert.strictEqual(cleanValidation.xpEarned, 80);
  assert.strictEqual(cleanValidation.feedback, 'Well done!');
});
