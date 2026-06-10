'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Lock, Check, Trophy, Flame, User, Play } from 'lucide-react';

interface Challenge {
  slug: string;
  title: string;
  difficulty: string;
}

interface Module {
  id: string;
  title: string;
  challenges: Challenge[];
}

interface LearningPath {
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  color: string;
  modules: Module[];
}

interface ProgressData {
  xp: number;
  level: number;
  streak: number;
  completedChallenges: number;
  completedSlugs: string[];
  pathProgress: {
    slug: string;
    title: string;
    completed: number;
    total: number;
    percent: number;
  }[];
}

export default function PathsPage() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const pathsData = await api<LearningPath[]>('/paths');
        setPaths(pathsData);
      } catch (err) {
        console.error('Failed to load paths:', err);
      }

      try {
        const progressData = await api<ProgressData>('/progress');
        setProgress(progressData);
        setIsLoggedIn(true);
      } catch (err) {
        // User is a guest or not logged in
        setIsLoggedIn(false);
        setProgress(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-zinc-800 rounded w-1/4 mx-auto mb-12" />
          <div className="h-48 bg-zinc-900 rounded-xl" />
          <div className="h-48 bg-zinc-900 rounded-xl" />
          <div className="h-48 bg-zinc-900 rounded-xl" />
        </div>
      </div>
    );
  }

  // Calculate sequential indices and tracking state for all challenges
  const challengeIndices: Record<string, number> = {};
  const allChallenges: Challenge[] = [];
  let currentIndex = 1;

  paths.forEach((path) => {
    path.modules.forEach((mod) => {
      mod.challenges.forEach((c) => {
        challengeIndices[c.slug] = currentIndex++;
        allChallenges.push(c);
      });
    });
  });

  const completedSlugs = new Set(progress?.completedSlugs || []);
  const firstUncompleted = allChallenges.find((c) => !completedSlugs.has(c.slug));
  const activeSlug = firstUncompleted?.slug || '';

  const getTrackBadge = (slug: string) => {
    switch (slug) {
      case 'sql-foundations': return 'Warm-up';
      case 'sql-aggregates': return 'Core';
      case 'sql-joins': return 'Intermediate';
      case 'sql-subqueries': return 'Advanced';
      case 'sql-advanced': return 'Expert';
      default: return 'Core';
    }
  };

  const totalChallenges = allChallenges.length;
  const completedCount = completedSlugs.size;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header section with dashboard indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Curriculum
            <span className="text-sm font-medium bg-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-full border border-zinc-700">
              {totalChallenges} challenges
            </span>
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Master SQL step-by-step through our hands-on interactive game map.</p>
        </div>

        {/* User Stats Profile Card */}
        {isLoggedIn && progress ? (
          <div className="flex items-center gap-4 bg-zinc-900/60 border border-zinc-800 px-4 py-2.5 rounded-xl shadow-lg">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <User className="w-4 h-4 text-accent" />
              <div className="text-xs">
                <p className="font-semibold text-white">Level {progress.level}</p>
                <p className="text-zinc-500 text-[10px]">{progress.xp} XP</p>
              </div>
            </div>
            <div className="h-6 w-px bg-zinc-850" />
            <div className="flex items-center gap-1.5 text-amber-500">
              <Flame className="w-4 h-4" />
              <div className="text-xs">
                <p className="font-semibold text-white">{progress.streak} days</p>
                <p className="text-zinc-500 text-[10px]">streak</p>
              </div>
            </div>
            <div className="h-6 w-px bg-zinc-850" />
            <div className="flex items-center gap-1.5 text-emerald-500">
              <Trophy className="w-4 h-4" />
              <div className="text-xs">
                <p className="font-semibold text-white">{completedCount}/{totalChallenges}</p>
                <p className="text-zinc-500 text-[10px]">completed</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-sm font-semibold text-white transition-all">
              Sign In
            </Link>
            <Link href="/signup" className="px-4 py-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 text-sm font-semibold transition-all">
              Start Free
            </Link>
          </div>
        )}
      </div>

      {/* Guest warning banner */}
      {!isLoggedIn && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-amber-400 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 shrink-0" />
            <span>You are browsing as a guest. Sign in to save progress, earn XP, and unlock the curriculum sequentially!</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/login" className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-semibold text-xs hover:bg-amber-400 transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="text-xs text-amber-400 font-semibold hover:underline">
              Register
            </Link>
          </div>
        </div>
      )}

      {/* List of track cards */}
      <div className="space-y-6">
        {paths.map((p) => {
          const trackChallenges = p.modules.flatMap((m) => m.challenges);
          const trackTotal = trackChallenges.length;
          const trackCompleted = trackChallenges.filter((c) => completedSlugs.has(c.slug)).length;
          const trackPercent = trackTotal ? Math.round((trackCompleted / trackTotal) * 100) : 0;

          return (
            <div key={p.slug} className="p-6 rounded-2xl border border-zinc-850 bg-zinc-900/40 backdrop-blur-sm relative overflow-hidden transition-all duration-300 hover:border-zinc-800 shadow-md">
              
              {/* Card top details */}
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {p.title}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{trackCompleted} of {trackTotal} completed</p>
                </div>
                <span 
                  className="text-xs font-semibold px-2.5 py-1 rounded-full border"
                  style={{ 
                    borderColor: `${p.color}30`, 
                    color: p.color,
                    backgroundColor: `${p.color}08`
                  }}
                >
                  {getTrackBadge(p.slug)}
                </span>
              </div>

              {/* Card Progress Bar */}
              <div className="mt-3 mb-6 flex items-center gap-3">
                <div className="h-1.5 bg-zinc-800/80 rounded-full flex-1 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${trackPercent}%`,
                      backgroundColor: p.color
                    }} 
                  />
                </div>
                <span className="text-xs font-medium text-zinc-400 w-8 text-right">{trackPercent}%</span>
              </div>

              {/* Levels / Bubble grid */}
              <div className="flex flex-wrap gap-4 mt-4">
                {trackChallenges.map((c) => {
                  const num = challengeIndices[c.slug];
                  const isCompleted = completedSlugs.has(c.slug);
                  const isActive = c.slug === activeSlug || (!isLoggedIn && num === 1); // Unlock first level for guests
                  const isLocked = !isCompleted && !isActive;

                  if (isLocked) {
                    return (
                      <div 
                        key={c.slug}
                        className="relative flex items-center justify-center w-14 h-14 rounded-full border border-zinc-800 bg-zinc-950/40 text-zinc-600 cursor-not-allowed group transition-all"
                        title="Complete previous levels to unlock"
                      >
                        <span className="text-sm font-semibold">{num}</span>
                        <Lock className="w-3.5 h-3.5 absolute -top-0.5 -right-0.5 text-zinc-600 bg-zinc-950 rounded-full border border-zinc-850 p-0.5" />
                      </div>
                    );
                  }

                  if (isCompleted) {
                    return (
                      <Link
                        key={c.slug}
                        href={`/challenges/${c.slug}`}
                        className="relative flex items-center justify-center w-14 h-14 rounded-full border-2 border-emerald-500/80 bg-emerald-950/20 hover:bg-emerald-950/40 hover:scale-105 text-emerald-400 font-bold transition-all shadow-md group"
                        title={`${c.title} (Replay)`}
                      >
                        <span className="text-sm">{num}</span>
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-zinc-950 font-bold border border-zinc-900 shadow-sm">
                          ✓
                        </span>
                      </Link>
                    );
                  }

                  // Active / Glowing State
                  return (
                    <Link
                      key={c.slug}
                      href={`/challenges/${c.slug}`}
                      className="relative flex items-center justify-center w-14 h-14 rounded-full border-2 font-bold text-white transition-all hover:scale-110 shadow-lg group active:scale-95"
                      style={{
                        borderColor: p.color,
                        boxShadow: `0 0 16px ${p.color}50`,
                        backgroundColor: `${p.color}15`,
                      }}
                      title={`${c.title} (Active)`}
                    >
                      <span className="text-sm">{num}</span>
                      <Play className="w-3 h-3 absolute -bottom-1 -right-1 text-white bg-accent fill-white rounded-full border border-zinc-900 p-0.5 w-5 h-5 shadow-sm animate-bounce" style={{ backgroundColor: p.color }} />
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
