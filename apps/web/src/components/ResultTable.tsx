import type { SqlResult } from '@sql-tutor/shared';

export function ResultTable({ result, durationMs }: { result: SqlResult; durationMs?: number }) {
  if (!result.columns.length) {
    return <p className="text-sm text-muted mt-3">Query executed — no rows returned.</p>;
  }

  return (
    <div className="mt-3 rounded-lg border border-border overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-surface">
            {result.columns.map((c) => (
              <th key={c} className="px-3 py-2 text-left text-xs uppercase tracking-wider text-muted border-b border-border">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {result.columns.map((c) => (
                <td key={c} className="px-3 py-2 font-mono">
                  {row[c] === null || row[c] === undefined ? (
                    <span className="text-muted italic">NULL</span>
                  ) : (
                    String(row[c])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-3 py-2 text-xs text-muted border-t border-border flex gap-4">
        <span>{result.rows.length} row{result.rows.length !== 1 ? 's' : ''}</span>
        {durationMs !== undefined && <span>{durationMs}ms</span>}
      </div>
    </div>
  );
}
