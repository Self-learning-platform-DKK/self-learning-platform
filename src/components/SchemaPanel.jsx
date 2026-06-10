import { useState } from 'react';
import { SCHEMA } from '../data/challenges';

export default function SchemaPanel() {
  const [open, setOpen] = useState(null);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--muted)', textTransform: 'uppercase', margin: '0 0 8px' }}>
        Database schema
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {Object.entries(SCHEMA).map(([table, info]) => (
          <div key={table}>
            <button
              onClick={() => setOpen(open === table ? null : table)}
              style={{
                background: open === table ? 'var(--accent)' : 'var(--surface)',
                color: open === table ? '#fff' : 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '5px 12px',
                fontSize: 13,
                fontFamily: 'var(--mono)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {table}
            </button>
            {open === table && (
              <div style={{
                position: 'absolute',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '12px 16px',
                marginTop: 6,
                zIndex: 10,
                minWidth: 260,
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
                  {table}
                </p>
                {info.columns.map((col) => (
                  <div key={col.name} style={{ display: 'flex', gap: 12, padding: '4px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)', minWidth: 80 }}>{col.name}</span>
                    <span style={{ color: 'var(--accent)', fontSize: 12 }}>{col.type}</span>
                    {col.note && <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 'auto' }}>{col.note}</span>}
                  </div>
                ))}
                <p style={{ fontSize: 11, color: 'var(--muted)', margin: '8px 0 0' }}>{info.sample}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
