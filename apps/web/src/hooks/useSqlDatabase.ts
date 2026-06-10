'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SqlResult } from '@sql-tutor/shared';

let sqlJsInit: Promise<typeof import('sql.js')> | null = null;

function loadSqlJs() {
  if (!sqlJsInit) {
    sqlJsInit = import('sql.js');
  }
  return sqlJsInit;
}

export function useSqlDatabase(seedSql: string | null) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dbRef = useRef<import('sql.js').Database | null>(null);
  const SQLRef = useRef<import('sql.js').SqlJsStatic | null>(null);

  const resetDb = useCallback(async (sql: string) => {
    if (!SQLRef.current) return;
    if (dbRef.current) {
      dbRef.current.close();
    }
    const db = new SQLRef.current.Database();
    db.run(sql);
    dbRef.current = db;
  }, []);

  useEffect(() => {
    if (!seedSql) return;
    let cancelled = false;

    (async () => {
      try {
        const SQL = await loadSqlJs();
        const sql = await SQL.default({
          locateFile: (file: string) => `/${file}`,
        });
        if (cancelled) return;
        SQLRef.current = sql;
        await resetDb(seedSql);
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) setError((e as Error).message);
      }
    })();

    return () => {
      cancelled = true;
      dbRef.current?.close();
    };
  }, [seedSql, resetDb]);

  const runSQL = useCallback((query: string): SqlResult => {
    if (!dbRef.current) throw new Error('Database not ready');
    const result = dbRef.current.exec(query);
    if (!result.length) return { columns: [], rows: [] };
    const { columns, values } = result[0];
    const rows = values.map((v) =>
      Object.fromEntries(columns.map((c, i) => [c, v[i]]))
    );
    return { columns, rows };
  }, []);

  return { ready, error, runSQL, resetDb };
}
