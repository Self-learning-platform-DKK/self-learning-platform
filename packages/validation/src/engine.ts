import { Parser } from 'node-sql-parser';
import type { SqlResult, ValidationLayerResult, ValidationResult, ValidationRuleConfig } from '@sql-tutor/shared';

const parser = new Parser();

function emptyLayer(passed = true): ValidationLayerResult {
  return { passed, failures: [] };
}

function checkKeyword(sql: string, keyword: string): boolean {
  return new RegExp(`\\b${keyword.replace(/\s+/g, '\\s+')}\\b`, 'i').test(sql);
}

function getTablesFromAst(ast: unknown): string[] {
  const tables = new Set<string>();
  const walk = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    const n = node as Record<string, unknown>;
    if (n.table && typeof n.table === 'string') tables.add(n.table.toLowerCase());
    if (n.from && Array.isArray(n.from)) n.from.forEach(walk);
    if (n.join && Array.isArray(n.join)) n.join.forEach(walk);
    Object.values(n).forEach((v) => {
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object') walk(v);
    });
  };
  walk(ast);
  return [...tables];
}

export function validateAst(sql: string, rules: ValidationRuleConfig[]): ValidationLayerResult {
  const failures: string[] = [];
  const astRules = rules.filter((r) =>
    ['KEYWORD_REQUIRED', 'FORBIDDEN_KEYWORD', 'TABLE_USAGE', 'AST_STRUCTURE'].includes(r.type)
  );

  let ast: unknown = null;
  try {
    ast = parser.astify(sql, { database: 'SQLite' });
  } catch (e) {
    return { passed: astRules.length === 0, failures: astRules.length ? [`SQL parse error: ${(e as Error).message}`] : [] };
  }

  for (const rule of astRules) {
    const cfg = rule.config;
    switch (rule.type) {
      case 'KEYWORD_REQUIRED':
        if (!checkKeyword(sql, cfg.keyword as string)) {
          failures.push(`Query must use ${cfg.keyword}`);
        }
        break;
      case 'FORBIDDEN_KEYWORD':
        if (checkKeyword(sql, cfg.keyword as string)) {
          failures.push(`${cfg.keyword} is not allowed`);
        }
        break;
      case 'TABLE_USAGE': {
        const required = (cfg.tables as string[]).map((t) => t.toLowerCase());
        const found = getTablesFromAst(ast);
        for (const t of required) {
          if (!found.includes(t)) failures.push(`Query must use table: ${t}`);
        }
        break;
      }
      case 'AST_STRUCTURE':
        if (cfg.mustContain) {
          for (const k of cfg.mustContain as string[]) {
            if (!checkKeyword(sql, k)) failures.push(`Query must contain: ${k}`);
          }
        }
        break;
    }
  }

  return { passed: failures.length === 0, failures };
}

export function validateResult(
  result: SqlResult,
  rules: ValidationRuleConfig[]
): ValidationLayerResult {
  const failures: string[] = [];
  const resultRules = rules.filter((r) =>
    ['ROW_COUNT', 'COLUMN_NAMES', 'COLUMN_VALUES', 'SORT_ORDER', 'RESULT_SET'].includes(r.type)
  );

  for (const rule of resultRules) {
    const cfg = rule.config;
    switch (rule.type) {
      case 'ROW_COUNT': {
        const count = result.rows.length;
        if (cfg.exact !== undefined && count !== cfg.exact) {
          failures.push(`Expected ${cfg.exact} rows, got ${count}`);
        }
        break;
      }
      case 'COLUMN_NAMES': {
        if (result.rows.length === 0) {
          failures.push('No rows returned');
          break;
        }
        const cols = Object.keys(result.rows[0]);
        for (const c of (cfg.columns as string[]) ?? []) {
          if (!cols.includes(c)) failures.push(`Missing column: ${c}`);
        }
        for (const c of (cfg.forbidden as string[]) ?? []) {
          if (cols.includes(c)) failures.push(`Column not allowed: ${c}`);
        }
        break;
      }
      case 'COLUMN_VALUES': {
        const targetCol = cfg.column as string | undefined;
        const values = cfg.values as unknown[];
        const found = result.rows.flatMap((r) => {
          if (targetCol) return [r[targetCol]];
          return Object.values(r);
        });
        for (const v of values ?? []) {
          if (!found.some((f) => f === v)) failures.push(`Expected value ${v} not found`);
        }
        break;
      }
      case 'SORT_ORDER': {
        const col = cfg.column as string;
        const dir = (cfg.direction as string) ?? 'ASC';
        const vals = result.rows.map((r) => r[col]);
        const sorted = [...vals].sort((a, b) => String(a).localeCompare(String(b)));
        if (dir === 'DESC') sorted.reverse();
        if (JSON.stringify(vals) !== JSON.stringify(sorted)) {
          failures.push(`Results not sorted by ${col} ${dir}`);
        }
        break;
      }
    }
  }

  return { passed: failures.length === 0, failures };
}

export function validateStructural(sql: string): ValidationLayerResult {
  const forbidden = ['DROP', 'DELETE', 'INSERT', 'UPDATE', 'ALTER', 'CREATE', 'TRUNCATE'];
  const failures: string[] = [];
  for (const kw of forbidden) {
    if (checkKeyword(sql, kw)) failures.push(`${kw} statements are not allowed`);
  }
  return { passed: failures.length === 0, failures };
}

export function validatePerformance(_sql: string, _durationMs: number): ValidationLayerResult {
  return emptyLayer(true);
}

export function runValidation(
  sql: string,
  result: SqlResult,
  rules: ValidationRuleConfig[],
  options: { baseXp: number; hintPenalty?: number; successMsg: string; errorMsg: string }
): ValidationResult {
  const ast = validateAst(sql, rules);
  const structural = validateStructural(sql);
  const resultLayer = validateResult(result, rules);
  const performance = validatePerformance(sql, 0);

  const requiredFailures = [
    ...(ast.passed ? [] : ast.failures),
    ...(structural.passed ? [] : structural.failures),
    ...(resultLayer.passed ? [] : resultLayer.failures),
  ];

  const passed = requiredFailures.length === 0;
  const penalty = options.hintPenalty ?? 0;
  const xpEarned = passed ? Math.max(1, Math.round(options.baseXp * (1 - penalty))) : 0;

  return {
    passed,
    layers: { ast, result: resultLayer, structural, performance },
    feedback: passed ? options.successMsg : options.errorMsg + (requiredFailures.length ? ` (${requiredFailures[0]})` : ''),
    xpEarned,
  };
}
