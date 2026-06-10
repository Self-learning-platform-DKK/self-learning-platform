import { useState, useEffect, useRef } from 'react';
import { SEED_SQL } from '../data/challenges';

export function useDatabase() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const dbRef = useRef(null);

  useEffect(() => {
    async function init() {
      try {
        const SQL = await window.initSqlJs({
          locateFile: (f) =>
            `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${f}`,
        });
        const db = new SQL.Database();
        db.run(SEED_SQL);
        dbRef.current = db;
        setReady(true);
      } catch (e) {
        setError(e.message);
      }
    }
    init();
  }, []);

  function runSQL(sql) {
    if (!dbRef.current) throw new Error('Database not ready');
    const result = dbRef.current.exec(sql);
    if (!result.length) return { columns: [], rows: [] };
    const { columns, values } = result[0];
    const rows = values.map((v) =>
      Object.fromEntries(columns.map((c, i) => [c, v[i]]))
    );
    return { columns, rows };
  }

  return { ready, error, runSQL };
}
