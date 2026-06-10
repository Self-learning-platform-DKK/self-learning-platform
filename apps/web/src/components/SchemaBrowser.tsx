'use client';

import { useEffect, useState } from 'react';
import type { SqlResult } from '@sql-tutor/shared';

interface Column {
  name: string;
  type: string;
  note?: string;
}

interface TableInfo {
  columns: Column[];
  sample?: string;
}

interface SchemaBrowserProps {
  schema: Record<string, TableInfo>;
  runSQL: (sql: string) => SqlResult;
}

const TYPE_BADGE: Record<string, string> = {
  INTEGER: 'bg-blue-500/20 text-blue-300',
  INT: 'bg-blue-500/20 text-blue-300',
  TEXT: 'bg-green-500/20 text-green-300',
  VARCHAR: 'bg-green-500/20 text-green-300',
  REAL: 'bg-yellow-500/20 text-yellow-300',
  FLOAT: 'bg-yellow-500/20 text-yellow-300',
  NUMERIC: 'bg-yellow-500/20 text-yellow-300',
  BOOLEAN: 'bg-purple-500/20 text-purple-300',
  DATE: 'bg-orange-500/20 text-orange-300',
  DATETIME: 'bg-orange-500/20 text-orange-300',
  TIMESTAMP: 'bg-orange-500/20 text-orange-300',
};

function getTypeBadge(type: string) {
  const key = type.toUpperCase().split('(')[0];
  return TYPE_BADGE[key] ?? 'bg-accent/20 text-accent';
}

export function SchemaBrowser({ schema, runSQL }: SchemaBrowserProps) {
  const tables = Object.keys(schema);
  const [activeTable, setActiveTable] = useState<string>(tables[0] ?? '');
  const [previewData, setPreviewData] = useState<Record<string, SqlResult>>({});
  const [activeTab, setActiveTab] = useState<'schema' | 'data'>('data');

  // Load preview data for every table once the db is ready
  useEffect(() => {
    if (!runSQL || tables.length === 0) return;
    const results: Record<string, SqlResult> = {};
    for (const table of tables) {
      try {
        results[table] = runSQL(`SELECT * FROM "${table}" LIMIT 5`);
      } catch {
        results[table] = { columns: [], rows: [] };
      }
    }
    setPreviewData(results);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tableInfo = schema[activeTable];
  const preview = previewData[activeTable];

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden mb-3">
      {/* Table tabs */}
      <div className="flex items-center gap-0 border-b border-border overflow-x-auto">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted px-3 py-2 border-r border-border whitespace-nowrap shrink-0">
          Tables
        </span>
        {tables.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTable(t)}
            className={`px-4 py-2 text-sm font-mono whitespace-nowrap border-r border-border transition ${
              activeTable === t
                ? 'bg-accent/10 text-accent font-semibold'
                : 'text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Schema / Data toggle */}
      {activeTable && (
        <div>
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab('data')}
              className={`px-4 py-1.5 text-xs font-semibold transition ${
                activeTab === 'data'
                  ? 'text-white border-b-2 border-accent -mb-px'
                  : 'text-muted hover:text-white'
              }`}
            >
              Preview data
            </button>
            <button
              onClick={() => setActiveTab('schema')}
              className={`px-4 py-1.5 text-xs font-semibold transition ${
                activeTab === 'schema'
                  ? 'text-white border-b-2 border-accent -mb-px'
                  : 'text-muted hover:text-white'
              }`}
            >
              Schema
            </button>
          </div>

          {/* DATA TAB */}
          {activeTab === 'data' && (
            <div className="overflow-x-auto max-h-52">
              {preview && preview.columns.length > 0 ? (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-white/5">
                      {preview.columns.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-2 text-left font-semibold text-white/80 whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-border/50 last:border-0 hover:bg-white/[0.03] transition"
                      >
                        {preview.columns.map((col) => (
                          <td
                            key={col}
                            className="px-4 py-1.5 text-white/70 whitespace-nowrap max-w-[160px] truncate"
                          >
                            {String(row[col] ?? 'NULL')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="px-4 py-3 text-xs text-muted italic">
                  {preview ? 'No data in this table.' : 'Loading preview…'}
                </p>
              )}
            </div>
          )}

          {/* SCHEMA TAB */}
          {activeTab === 'schema' && tableInfo && (
            <div className="overflow-x-auto max-h-52">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-white/5">
                    <th className="px-4 py-2 text-left font-semibold text-white/80">Column</th>
                    <th className="px-4 py-2 text-left font-semibold text-white/80">Type</th>
                    <th className="px-4 py-2 text-left font-semibold text-white/80">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {tableInfo.columns.map((col, i) => (
                    <tr
                      key={col.name}
                      className="border-b border-border/50 last:border-0 hover:bg-white/[0.03] transition"
                    >
                      <td className="px-4 py-1.5 font-mono text-white/90">{col.name}</td>
                      <td className="px-4 py-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${getTypeBadge(col.type)}`}>
                          {col.type.split('(')[0]}
                        </span>
                      </td>
                      <td className="px-4 py-1.5 text-muted">{col.note ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
