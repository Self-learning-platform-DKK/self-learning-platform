import { useState, useEffect } from 'react';
import { TRACKS } from './data/challenges';
import { useDatabase } from './hooks/useDatabase';
import SchemaPanel from './components/SchemaPanel';
import ChallengeView from './components/ChallengeView';

const STORAGE_KEY = 'sqlt_progress_v1';

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function saveProgress(p) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch {}
}

export default function App() {
  const { ready, error, runSQL } = useDatabase();
  const [track, setTrack] = useState('beginner');
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [progress, setProgress] = useState(loadProgress);
  const [celebrate, setCelebrate] = useState(false);

  const currentTrack = TRACKS[track];
  const challenges = currentTrack.challenges;
  const challenge = challenges[challengeIdx];
  const trackColor = currentTrack.color;

  const completedInTrack = challenges.filter((c) => progress[c.id]).length;
  const pct = Math.round((completedInTrack / challenges.length) * 100);

  function markSolved() {
    const next = { ...progress, [challenge.id]: true };
    setProgress(next);
    saveProgress(next);
    setCelebrate(true);
    setTimeout(() => {
      setCelebrate(false);
      if (challengeIdx < challenges.length - 1) {
        setChallengeIdx(challengeIdx + 1);
      }
    }, 1200);
  }

  useEffect(() => {
    setChallengeIdx(0);
  }, [track]);

  if (error) return (
    <div style={{ padding: 40, color: '#f87171', fontFamily: 'monospace' }}>
      Failed to load database: {error}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)' }}>
      {celebrate && (
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            fontSize: 72, animation: 'pop 0.4s ease-out',
          }}>🎉</div>
        </div>
      )}

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
        {/* Header */}
        <div style={{ padding: '28px 0 24px', borderBottom: '1px solid var(--border)', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="1" y="1" width="20" height="20" rx="5" fill={trackColor} opacity="0.15"/>
                <rect x="1" y="1" width="20" height="20" rx="5" stroke={trackColor} strokeWidth="1.5"/>
                <path d="M6 8h10M6 11h10M6 14h6" stroke={trackColor} strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>SQL Tutor</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '2px 0 0 32px' }}>Learn SQL by doing</p>
          </div>
          <div style={{ flex: 1 }} />
          {/* Track switcher */}
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.entries(TRACKS).map(([key, t]) => {
              const done = t.challenges.filter((c) => progress[c.id]).length;
              return (
                <button
                  key={key}
                  onClick={() => setTrack(key)}
                  style={{
                    background: track === key ? t.color + '20' : 'none',
                    color: track === key ? t.color : 'var(--muted)',
                    border: `1px solid ${track === key ? t.color : 'var(--border)'}`,
                    borderRadius: 8,
                    padding: '6px 14px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.label}
                  {done > 0 && (
                    <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                      {done}/{t.challenges.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'start' }}>
          {/* Sidebar */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--muted)', textTransform: 'uppercase', margin: '0 0 10px' }}>
              {currentTrack.label} · {currentTrack.description}
            </p>

            {/* Progress bar */}
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, marginBottom: 16, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: trackColor, borderRadius: 2, transition: 'width 0.5s ease' }} />
            </div>

            {/* Challenge list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {challenges.map((c, i) => {
                const done = !!progress[c.id];
                const active = i === challengeIdx;
                return (
                  <button
                    key={c.id}
                    onClick={() => setChallengeIdx(i)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px',
                      borderRadius: 8,
                      border: active ? `1px solid ${trackColor}` : '1px solid transparent',
                      background: active ? trackColor + '15' : 'none',
                      color: active ? trackColor : done ? 'var(--muted)' : 'var(--text)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: 13,
                      fontWeight: active ? 600 : 400,
                      transition: 'all 0.12s',
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%',
                      background: done ? trackColor : 'var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: done ? '#000' : 'var(--muted)',
                      flexShrink: 0,
                    }}>
                      {done ? '✓' : i + 1}
                    </span>
                    <span style={{ lineHeight: 1.3 }}>
                      <span style={{ display: 'block' }}>{c.title}</span>
                      <span style={{ display: 'block', fontSize: 11, opacity: 0.6, fontFamily: 'var(--mono)' }}>{c.concept}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {completedInTrack === challenges.length && (
              <div style={{
                marginTop: 16, padding: '12px 14px',
                background: trackColor + '18', border: `1px solid ${trackColor}`,
                borderRadius: 8, fontSize: 13, color: trackColor, fontWeight: 600,
                textAlign: 'center',
              }}>
                Track complete! 🎉
              </div>
            )}
          </div>

          {/* Main panel */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '24px 28px',
          }}>
            {!ready ? (
              <div style={{ color: 'var(--muted)', fontSize: 14, padding: '40px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>⏳</div>
                Loading database…
              </div>
            ) : (
              <>
                <SchemaPanel />
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 20 }}>
                  <ChallengeView
                    key={challenge.id}
                    challenge={challenge}
                    trackColor={trackColor}
                    onSuccess={markSolved}
                    runSQL={runSQL}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
          SQL Tutor · powered by Claude
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=Sora:wght@400;600;700&display=swap');

        :root {
          --sans: 'Sora', system-ui, sans-serif;
          --mono: 'IBM Plex Mono', monospace;
          --bg: #0f1117;
          --surface: #161b27;
          --border: rgba(255,255,255,0.08);
          --text: #e8eaf0;
          --muted: rgba(232,234,240,0.45);
          --accent: #60a5fa;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); }

        @keyframes pop {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        textarea::placeholder { color: var(--muted); }
        textarea:focus { border-color: var(--accent) !important; box-shadow: 0 0 0 2px rgba(96,165,250,0.15); }
        button:active { transform: scale(0.97); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
      `}</style>
    </div>
  );
}
