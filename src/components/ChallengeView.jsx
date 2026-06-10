import { useState, useRef } from 'react';
import ResultTable from './ResultTable';

async function fetchAIExplanation(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt + ' Be encouraging, friendly, and concrete. No markdown headers.' }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text ?? 'Could not load explanation.';
}

export default function ChallengeView({ challenge, trackColor, onSuccess, runSQL }) {
  const [sql, setSql] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null); // 'success' | 'error' | 'syntax'
  const [message, setMessage] = useState('');
  const [hint, setHint] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [solved, setSolved] = useState(false);
  const textareaRef = useRef();

  function handleRun() {
    const q = sql.trim();
    if (!q) return;
    try {
      const { columns, rows } = runSQL(q);
      setResult({ columns, rows });
      if (challenge.check(rows)) {
        setStatus('success');
        setMessage(challenge.successMsg);
        setSolved(true);
        setTimeout(onSuccess, 1400);
      } else {
        setStatus('error');
        setMessage(challenge.errorMsg);
      }
    } catch (e) {
      setResult(null);
      setStatus('syntax');
      setMessage(`SQL error: ${e.message}`);
    }
  }

  function handleReset() {
    setSql('');
    setResult(null);
    setStatus(null);
    setMessage('');
    setHint(false);
    setAiText('');
    setSolved(false);
    textareaRef.current?.focus();
  }

  async function handleAsk() {
    setAiLoading(true);
    setAiText('');
    const text = await fetchAIExplanation(challenge.aiPrompt);
    setAiText(text);
    setAiLoading(false);
  }

  function handleKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      const s = textareaRef.current;
      const start = s.selectionStart;
      const end = s.selectionEnd;
      const newVal = sql.substring(0, start) + '  ' + sql.substring(end);
      setSql(newVal);
      requestAnimationFrame(() => {
        s.selectionStart = s.selectionEnd = start + 2;
      });
    }
  }

  const statusColors = {
    success: { bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.4)', text: '#4ade80' },
    error: { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.4)', text: '#f87171' },
    syntax: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.4)', text: '#fbbf24' },
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
          background: trackColor + '22', color: trackColor,
          padding: '3px 10px', borderRadius: 4,
        }}>
          {challenge.concept}
        </span>
        <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{challenge.title}</h2>
      </div>

      <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text)', marginBottom: 16 }}>
        {challenge.text}
      </p>

      {hint && (
        <div style={{
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderLeft: `3px solid ${trackColor}`, borderRadius: 6,
          padding: '10px 14px', fontSize: 13, color: 'var(--muted)',
          marginBottom: 14, fontFamily: 'var(--mono)', lineHeight: 1.6,
        }}>
          {challenge.hint}
        </div>
      )}

      <div style={{ position: 'relative', marginBottom: 10 }}>
        <textarea
          ref={textareaRef}
          value={sql}
          onChange={(e) => setSql(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={5}
          spellCheck={false}
          placeholder="-- Write your SQL here…&#10;-- Press Cmd+Enter to run"
          style={{
            width: '100%',
            fontFamily: 'var(--mono)',
            fontSize: 14,
            lineHeight: 1.7,
            background: 'var(--surface)',
            color: 'var(--text)',
            border: `1px solid ${status === 'syntax' ? '#fbbf24' : status === 'success' ? '#4ade80' : 'var(--border)'}`,
            borderRadius: 8,
            padding: '14px 16px',
            resize: 'vertical',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={handleRun}
          style={{
            background: solved ? '#4ade80' : trackColor,
            color: '#000',
            border: 'none',
            borderRadius: 6,
            padding: '8px 20px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.15s',
          }}
        >
          {solved ? '✓ Solved' : 'Run query'}
        </button>
        <button onClick={handleReset} style={{ background: 'none', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>
          Reset
        </button>
        <button onClick={() => setHint(!hint)} style={{ background: 'none', color: 'var(--muted)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer' }}>
          {hint ? 'Hide hint' : 'Show hint'}
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={handleAsk}
          disabled={aiLoading}
          style={{ background: 'none', color: trackColor, border: `1px solid ${trackColor}`, borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'pointer', opacity: aiLoading ? 0.6 : 1 }}
        >
          {aiLoading ? 'Thinking…' : 'Explain this concept ↗'}
        </button>
      </div>

      {status && (
        <div style={{
          marginTop: 12,
          padding: '10px 14px',
          borderRadius: 6,
          background: statusColors[status].bg,
          border: `1px solid ${statusColors[status].border}`,
          color: statusColors[status].text,
          fontSize: 14,
          display: 'flex',
          gap: 8,
          alignItems: 'flex-start',
        }}>
          <span>{status === 'success' ? '✓' : status === 'error' ? '✗' : '⚠'}</span>
          <span>{message}</span>
        </div>
      )}

      {result && <ResultTable columns={result.columns} rows={result.rows} />}

      {aiText && (
        <div style={{
          marginTop: 14,
          padding: '14px 16px',
          background: 'var(--surface)',
          borderRadius: 8,
          border: '1px solid var(--border)',
          fontSize: 14,
          lineHeight: 1.8,
          color: 'var(--text)',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: trackColor, margin: '0 0 8px' }}>
            AI explanation
          </p>
          {aiText}
        </div>
      )}
    </div>
  );
}
