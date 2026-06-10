'use client';

import { useEffect, useState } from 'react';
import { MonacoEditor } from '@/components/MonacoEditor';
import { ResultTable } from '@/components/ResultTable';
import { SchemaBrowser } from '@/components/SchemaBrowser';
import { useSqlDatabase } from '@/hooks/useSqlDatabase';
import { api } from '@/lib/api';

export default function WorkspacePage() {
  const [datasets, setDatasets] = useState<{ slug: string; name: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [seedSql, setSeedSql] = useState<string | null>(null);
  const [schema, setSchema] = useState<Record<string, { columns: { name: string; type: string; note?: string }[]; sample?: string }>>({});
  const [sql, setSql] = useState('-- Write SQL here\n');
  const [result, setResult] = useState<{ columns: string[]; rows: Record<string, unknown>[] } | null>(null);
  const [durationMs, setDurationMs] = useState<number>();
  const [error, setError] = useState('');
  const { ready, runSQL } = useSqlDatabase(seedSql);

  useEffect(() => {
    api<{ slug: string; name: string }[]>('/datasets').then(setDatasets);
  }, []);

  useEffect(() => {
    if (!selected) return;
    api<{ seedSql: string; schema: typeof schema }>(`/datasets/${selected}`).then((d) => {
      setSeedSql(d.seedSql);
      setSchema(d.schema);
    });
  }, [selected]);

  function handleRun() {
    setError('');
    const start = performance.now();
    try {
      const res = runSQL(sql);
      setDurationMs(Math.round(performance.now() - start));
      setResult(res);
    } catch (e) {
      setError((e as Error).message);
      setResult(null);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">SQL Workspace</h1>
      <p className="text-muted mb-6">Free-form practice with Monaco editor — no account required.</p>
      <div className="flex gap-2 mb-4 flex-wrap">
        {datasets.map((d) => (
          <button
            key={d.slug}
            onClick={() => setSelected(d.slug)}
            className={`px-3 py-1.5 rounded-md text-sm border ${selected === d.slug ? 'border-accent bg-accent/20 text-accent' : 'border-border'}`}
          >
            {d.name}
          </button>
        ))}
      </div>
      {!selected ? (
        <p className="text-muted p-8 text-center border border-dashed border-border rounded-xl">Select a dataset to begin</p>
      ) : !ready ? (
        <p className="text-muted p-8 text-center">Loading database…</p>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <MonacoEditor value={sql} onChange={setSql} onRun={handleRun} schema={schema} height="320px" />
            <button onClick={handleRun} className="px-4 py-2 bg-accent text-black font-semibold rounded-md text-sm">Run (Ctrl+Enter)</button>
            {error && <p className="text-yellow-400 text-sm">{error}</p>}
            {result && <ResultTable result={result} durationMs={durationMs} />}
          </div>
          <div>
            <SchemaBrowser schema={schema} runSQL={runSQL} />
          </div>
        </div>
      )}
    </div>
  );
}
