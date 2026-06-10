export default function ResultTable({ columns, rows }) {
  if (!columns.length) return null;
  return (
    <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)', marginTop: 12 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--surface)' }}>
            {columns.map((c) => (
              <th key={c} style={{
                padding: '7px 14px',
                textAlign: 'left',
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--muted)',
                borderBottom: '1px solid var(--border)',
              }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}>
              {columns.map((c) => (
                <td key={c} style={{ padding: '7px 14px', fontFamily: typeof row[c] === 'number' ? 'var(--mono)' : 'inherit', color: 'var(--text)' }}>
                  {row[c] ?? <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>NULL</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ padding: '6px 14px', fontSize: 11, color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
        {rows.length} row{rows.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
