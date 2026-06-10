'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lock, Check, Play } from 'lucide-react';
import { MonacoEditor } from './MonacoEditor';
import { ResultTable } from './ResultTable';
import { SchemaBrowser } from './SchemaBrowser';
import { useSqlDatabase } from '@/hooks/useSqlDatabase';
import { api, getSessionId } from '@/lib/api';
import type { SqlResult } from '@sql-tutor/shared';

interface Challenge {
  slug: string;
  title: string;
  concept: string;
  instructions: string;
  difficulty: string;
  xpReward: number;
  hints: { level: number; content: string }[];
  successMsg: string;
  errorMsg: string;
  hasAiPrompt?: boolean;
  dataset: { slug: string; schema: Record<string, unknown> };
  path?: { slug: string; title: string };
}

interface PathChallenge {
  slug: string;
  title: string;
  difficulty: string;
}

interface PathModule {
  id: string;
  title: string;
  challenges: PathChallenge[];
}

interface LearningPath {
  slug: string;
  title: string;
  color: string;
  difficulty: string;
  modules: PathModule[];
}

export function ChallengePlayer({ 
  challenge, 
  seedSql, 
  paths = [] 
}: { 
  challenge: Challenge; 
  seedSql: string;
  paths?: LearningPath[];
}) {
  const { ready, error, runSQL, resetDb } = useSqlDatabase(seedSql);
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<SqlResult | null>(null);
  const [durationMs, setDurationMs] = useState<number>();
  const [status, setStatus] = useState<'success' | 'error' | 'syntax' | null>(null);
  const [message, setMessage] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const [solved, setSolved] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [progress, setProgress] = useState<{ completedSlugs: string[] } | null>(null);

  // Reset database and clear local states when challenge changes
  useEffect(() => {
    setSql('');
    setResult(null);
    setStatus(null);
    setSolved(false);
    setHintLevel(0);
    setAiText('');
    resetDb(seedSql);
  }, [challenge.slug, seedSql, resetDb]);

  // Fetch progress to handle completion and unlocking
  useEffect(() => {
    api<{ completedSlugs: string[] }>('/progress')
      .then(setProgress)
      .catch(() => setProgress(null));
  }, [challenge.slug]);

  async function handleRun() {
    const q = sql.trim();
    if (!q) return;
    const start = performance.now();
    try {
      const res = runSQL(q);
      setDurationMs(Math.round(performance.now() - start));
      setResult(res);
      setHistory((h) => [q, ...h.slice(0, 49)]);

      const validation = await api<{
        passed: boolean;
        feedback: string;
        xpEarned: number;
        achievementsUnlocked?: string[];
      }>(`/challenges/${challenge.slug}/attempts`, {
        method: 'POST',
        body: JSON.stringify({
          sql: q,
          result: res,
          hintLevel,
          durationMs: Math.round(performance.now() - start),
          sessionId: getSessionId(),
        }),
      });

      if (validation.passed) {
        setStatus('success');
        setMessage(validation.feedback + (validation.xpEarned ? ` (+${validation.xpEarned} XP)` : ''));
        setSolved(true);
        // Refresh progress slugs locally to unlock/check off immediately
        setProgress((prev) => {
          const currentSlugs = prev?.completedSlugs || [];
          if (!currentSlugs.includes(challenge.slug)) {
            return { completedSlugs: [...currentSlugs, challenge.slug] };
          }
          return prev;
        });
      } else {
        setStatus('error');
        setMessage(validation.feedback);
      }
    } catch (e) {
      setResult(null);
      setStatus('syntax');
      setMessage(`SQL error: ${(e as Error).message}`);
    }
  }

  async function handleAi() {
    setAiLoading(true);
    setAiText('');
    try {
      const res = await api<{ text: string }>('/ai/tutor', {
        method: 'POST',
        body: JSON.stringify({ prompt: `Explain the SQL concept "${challenge.concept}" for this challenge: ${challenge.instructions}` }),
      });
      setAiText(res.text);
    } catch (e) {
      setAiText((e as Error).message.includes('disabled') || (e as Error).message.includes('403')
        ? 'AI is optional — add a BYOK key in Settings or upgrade to Pro. Hints work without AI.'
        : `AI unavailable: ${(e as Error).message}`);
    } finally {
      setAiLoading(false);
    }
  }

  // Calculate indices sequentially 1-50 across all paths
  const allChallenges: PathChallenge[] = [];
  const challengeIndices: Record<string, number> = {};
  let globalIndexCounter = 1;

  paths.forEach((p) => {
    p.modules.forEach((m) => {
      m.challenges.forEach((c) => {
        challengeIndices[c.slug] = globalIndexCounter++;
        allChallenges.push(c);
      });
    });
  });

  const completedSlugs = new Set(progress?.completedSlugs || []);
  const firstUncompleted = allChallenges.find((c) => !completedSlugs.has(c.slug));
  const activeSlug = firstUncompleted?.slug || '';

  const currentPath = paths.find((p) => p.slug === challenge.path?.slug);
  const trackChallenges = currentPath
    ? currentPath.modules.flatMap((m) => m.challenges)
    : [];

  const currentIdx = allChallenges.findIndex((c) => c.slug === challenge.slug);
  const nextChallenge = currentIdx !== -1 && currentIdx < allChallenges.length - 1
    ? allChallenges[currentIdx + 1]
    : null;
  const nextChallengeSlug = nextChallenge?.slug || null;

  const diffColor = {
    BEGINNER: 'text-beginner border-beginner/40 bg-beginner/10',
    INTERMEDIATE: 'text-intermediate border-intermediate/40 bg-intermediate/10',
    ADVANCED: 'text-advanced border-advanced/40 bg-advanced/10',
  }[challenge.difficulty] ?? 'text-accent';

  if (error) return <div className="text-red-400 p-8">Database error: {error}</div>;
  if (!ready) return <div className="text-muted p-8 text-center">Loading database…</div>;

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      {/* Left Column: Challenge Description, Hints & Level Progress Map */}
      <div className="lg:col-span-2 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${diffColor}`}>{challenge.concept}</span>
            <span className="text-xs text-muted">{challenge.xpReward} XP</span>
          </div>
          <h1 className="text-2xl font-bold">{challenge.title}</h1>
          <p className="text-muted leading-relaxed">{challenge.instructions}</p>
          {hintLevel > 0 && challenge.hints[hintLevel - 1] && (
            <div className="p-3 rounded-lg border border-border bg-surface text-sm font-mono text-muted">
              {challenge.hints[hintLevel - 1].content}
            </div>
          )}
        </div>

        {/* Level Progress Map UI below questions */}
        {currentPath && trackChallenges.length > 0 && (
          <div className="pt-6 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider">
                {currentPath.title}
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                {trackChallenges.filter((tc) => completedSlugs.has(tc.slug)).length} / {trackChallenges.length} complete
              </span>
            </div>

            {/* Micro-map grid of circles */}
            <div className="flex flex-wrap gap-2.5">
              {trackChallenges.map((tc) => {
                const num = challengeIndices[tc.slug];
                const isCompleted = completedSlugs.has(tc.slug);
                const isCurrent = tc.slug === challenge.slug;
                const isActive = tc.slug === activeSlug || (!progress && num === 1);
                const isLocked = !isCompleted && !isCurrent && !isActive && (num > challengeIndices[activeSlug] || activeSlug === '');

                if (isCurrent) {
                  return (
                    <div
                      key={tc.slug}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-white shadow-md select-none text-xs"
                      style={{
                        borderColor: currentPath.color,
                        boxShadow: `0 0 12px ${currentPath.color}60`,
                        backgroundColor: `${currentPath.color}25`,
                      }}
                      title={`${tc.title} (Current)`}
                    >
                      <span>{num}</span>
                      <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: currentPath.color }}></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ backgroundColor: currentPath.color }}></span>
                      </span>
                    </div>
                  );
                }

                if (isCompleted) {
                  return (
                    <Link
                      key={tc.slug}
                      href={`/challenges/${tc.slug}`}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full border border-emerald-500 bg-emerald-950/20 hover:bg-emerald-950/40 hover:scale-105 text-emerald-400 font-bold transition-all text-xs shadow-sm"
                      title={`${tc.title} (Completed - Click to Replay)`}
                    >
                      <span>{num}</span>
                      <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-zinc-950 font-bold border border-zinc-900 shadow-sm">
                        ✓
                      </span>
                    </Link>
                  );
                }

                if (isLocked) {
                  return (
                    <div
                      key={tc.slug}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full border border-zinc-800 bg-zinc-950/30 text-zinc-600 cursor-not-allowed text-xs opacity-60"
                      title="Complete previous levels to unlock"
                    >
                      <span>{num}</span>
                      <Lock className="w-2.5 h-2.5 absolute -top-0.5 -right-0.5 text-zinc-600 bg-zinc-950 rounded-full" />
                    </div>
                  );
                }

                // Active / Playable state
                return (
                  <Link
                    key={tc.slug}
                    href={`/challenges/${tc.slug}`}
                    className="relative flex items-center justify-center w-10 h-10 rounded-full border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 hover:scale-105 text-zinc-300 font-semibold transition-all text-xs"
                    title={`${tc.title} (Play)`}
                  >
                    <span>{num}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Schema, Editor, Actions & Result View */}
      <div className="lg:col-span-3 space-y-4">
        <SchemaBrowser schema={challenge.dataset.schema as Record<string, { columns: { name: string; type: string; note?: string }[]; sample?: string }>} runSQL={runSQL} />
        
        <MonacoEditor value={sql} onChange={setSql} onRun={handleRun} schema={challenge.dataset.schema as Record<string, { columns: { name: string; type: string }[] }>} height="240px" />
        
        <div className="flex flex-wrap gap-2">
          <button onClick={handleRun} className={`px-4 py-2 rounded-md font-semibold text-sm transition-colors ${solved ? 'bg-emerald-500 text-zinc-950' : 'bg-accent text-black'}`}>
            {solved ? '✓ Solved' : 'Run query'}
          </button>
          
          <button onClick={() => { setSql(''); setResult(null); setStatus(null); setSolved(false); setHintLevel(0); setAiText(''); resetDb(seedSql); }} className="px-3 py-2 rounded-md text-sm border border-border text-muted hover:bg-zinc-800 transition-colors">
            Reset
          </button>
          
          {hintLevel < challenge.hints.length && (
            <button onClick={() => setHintLevel((h) => h + 1)} className="px-3 py-2 rounded-md text-sm border border-border text-muted hover:bg-zinc-800 transition-colors">
              Show hint ({hintLevel}/{challenge.hints.length})
            </button>
          )}
          
          {challenge.hasAiPrompt && (
            <button onClick={handleAi} disabled={aiLoading} className="px-3 py-2 rounded-md text-sm border border-accent text-accent ml-auto disabled:opacity-50 hover:bg-accent/10 transition-colors">
              {aiLoading ? 'Thinking…' : 'Explain (optional AI)'}
            </button>
          )}
        </div>

        {/* Success / Error / Syntax banner containing 'Next Challenge' navigation */}
        {status && (
          <div>
            {status === 'success' ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-md">
                <div>
                  <p className="font-extrabold text-sm tracking-wide uppercase text-emerald-500">Success!</p>
                  <p className="text-xs text-zinc-300 mt-1">{message}</p>
                </div>
                {nextChallengeSlug ? (
                  <Link
                    href={`/challenges/${nextChallengeSlug}`}
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1.5 shrink-0 justify-center shadow-lg"
                  >
                    Next Challenge →
                  </Link>
                ) : (
                  <Link
                    href="/paths"
                    className="px-4 py-2 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1.5 shrink-0 justify-center shadow-lg"
                  >
                    View All Tracks
                  </Link>
                )}
              </div>
            ) : (
              <div className={`p-3 rounded-md text-sm border ${status === 'syntax' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                {message}
              </div>
            )}
          </div>
        )}
        
        {result && <ResultTable result={result} durationMs={durationMs} />}
        
        {aiText && (
          <div className="p-4 rounded-lg border border-border bg-surface text-sm leading-relaxed">
            <p className="text-xs font-bold uppercase text-accent mb-2">AI explanation (optional)</p>
            {aiText}
          </div>
        )}
        
        {history.length > 0 && (
          <details className="text-xs text-muted">
            <summary className="cursor-pointer select-none hover:text-zinc-350">Query history ({history.length})</summary>
            <ul className="mt-2 space-y-1 font-mono">
              {history.map((q, i) => <li key={i} className="truncate">{q}</li>)}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}
