'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, clearTokens } from '@/lib/api';
import { Shield, Compass, Lock, Check, Flame, Trophy, Award, Database, ArrowRight, Target, Sun, Moon } from 'lucide-react';

interface PathProgress {
  slug: string;
  title: string;
  completed: number;
  total: number;
  percent: number;
}

interface ProgressData {
  xp: number;
  level: number;
  streak: number;
  completedChallenges: number;
  pathProgress: PathProgress[];
  resume: { track: string; challengeSlug: string } | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [manualOverride, setManualOverride] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('sqlt_access_token'));
    const savedTheme = localStorage.getItem('sqlt_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }
    
    setLoading(true);
    api<ProgressData>('/progress')
      .then((res) => {
        setData(res);
        setError('');
      })
      .catch(() => {
        // Fallback to guest mode
        setData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('sqlt_theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  const handleLogout = () => {
    clearTokens();
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-black flex flex-col justify-stretch p-0 sm:p-4 font-space">
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&display=swap');
          .font-space {
            font-family: 'Space Grotesk', sans-serif;
          }
        `}} />
        <div className="bg-[#070A09] border-0 sm:border border-[#D8A85F]/15 rounded-none sm:rounded-[32px] p-6 sm:p-8 md:p-10 relative flex-1 min-h-screen sm:min-h-[calc(100vh-2rem)] flex items-center justify-center text-[#817B6E]">
          <div className="animate-pulse space-y-4 text-center">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D8A85F] inline-block animate-ping shadow-[0_0_8px_#D8A85F] mb-2" />
            <p className="text-xs uppercase tracking-widest font-bold font-mono">Initializing Telemetry Console...</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate overall curriculum stats
  const pathProgress = data?.pathProgress || [];
  const totalChallenges = pathProgress.reduce((sum, p) => sum + p.total, 0) || 50;
  const completedCount = pathProgress.reduce((sum, p) => sum + p.completed, 0) || 0;
  const totalPercent = totalChallenges ? Math.round((completedCount / totalChallenges) * 100) : 0;
  const cappedPercent = Math.min(100, Math.max(0, Math.round(totalPercent)));

  const xpValue = data?.xp ?? 0;
  const levelValue = data?.level ?? 1;
  const streakValue = data?.streak ?? 0;
  const isGuest = !data;

  const getPathColor = (slug: string) => {
    switch (slug) {
      case 'sql-foundations': return '#4ade80'; // Foundations (green)
      case 'sql-aggregates': return '#fb923c'; // Aggregates (orange)
      case 'sql-joins': return '#60a5fa'; // Joins (blue)
      case 'sql-subqueries': return '#a78bfa'; // Subqueries (purple)
      case 'sql-advanced': return '#f472b6'; // Advanced (pink)
      default: return '#D8A85F';
    }
  };

  return (
    <div className="w-full min-h-screen bg-black flex flex-col justify-stretch p-0 font-space">
      {/* Import Space Grotesk Font dynamically inside the component */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&display=swap');
        .font-space {
          font-family: 'Space Grotesk', sans-serif;
        }
        .crt-scanlines {
          background: linear-gradient(
            rgba(18, 16, 16, 0) 50%, 
            rgba(0, 0, 0, 0.4) 50%
          ), linear-gradient(
            90deg, 
            rgba(255, 0, 0, 0.04), 
            rgba(0, 255, 0, 0.01), 
            rgba(0, 0, 255, 0.04)
          );
          background-size: 100% 4px, 6px 100%;
        }
      `}} />

      {/* Main Skeuomorphic Console Chassis Wrapper */}
      <div className="bg-[#070A09] border-0 rounded-none p-6 sm:p-8 md:p-10 relative flex flex-col justify-between overflow-hidden shadow-2xl shadow-black/80 flex-1 min-h-screen">
        
        {/* Corner Screws for hardware tactical aesthetics */}
        <div className="absolute top-5 left-5 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner flex items-center justify-center opacity-60">
          <div className="w-2.5 h-[1.5px] bg-zinc-650 rotate-45" />
        </div>
        <div className="absolute top-5 right-5 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner flex items-center justify-center opacity-60">
          <div className="w-2.5 h-[1.5px] bg-zinc-650 -rotate-12" />
        </div>
        <div className="absolute bottom-5 left-5 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner flex items-center justify-center opacity-60">
          <div className="w-2.5 h-[1.5px] bg-zinc-650 rotate-[35deg]" />
        </div>
        <div className="absolute bottom-5 right-5 w-4 h-4 rounded-full bg-zinc-900 border border-zinc-800 shadow-inner flex items-center justify-center opacity-60">
          <div className="w-2.5 h-[1.5px] bg-zinc-650 -rotate-45" />
        </div>

        {/* Chassis Header (Navigation & Branding) */}
        <div className="flex flex-col xl:flex-row items-center justify-between gap-4 border-b border-[#D8A85F]/15 pb-6 mb-6 mt-2 relative z-20">
          {/* Logo Brand */}
          <Link href="/dashboard" className="flex items-center gap-2 bg-[#101413] border border-[#D8A85F]/20 px-3.5 py-2 rounded-xl hover:border-[#D8A85F]/40 transition group">
            <span className="w-2 h-2 rounded-full bg-[#D8A85F] animate-pulse shadow-[0_0_8px_#D8A85F]" />
            <span className="text-sm font-bold uppercase tracking-widest text-[#D8A85F] group-hover:text-[#F4EFE5] transition-colors">
              SQL Tutor 2.0
            </span>
          </Link>

          {/* Navigation Pill Group */}
          <nav className="flex flex-wrap items-center justify-center gap-1.5 bg-[#000]/40 border border-[#817B6E]/20 p-1.5 rounded-2xl max-w-full">
            {[
              { href: '/dashboard', label: 'Dashboard' },
              { href: '/paths', label: 'Paths' },
              { href: '/challenges', label: 'Challenges' },
              { href: '/workspace', label: 'Workspace' },
              { href: '/achievements', label: 'Achievements' },
              { href: '/leaderboard', label: 'Leaderboard' },
              { href: '/certificates', label: 'Certificates' },
              { href: '/settings', label: 'Settings' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  link.href === '/dashboard'
                    ? 'bg-[#D8A85F] text-[#070A09] shadow-[0_0_10px_rgba(216,168,95,0.3)]'
                    : 'text-[#817B6E] hover:text-[#F4EFE5] hover:bg-[#101413]/55'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {/* Dynamic Logout/Login action inside nav */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#817B6E] hover:text-red-400 hover:bg-red-950/20 transition-all duration-200"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-[#817B6E] hover:text-[#5FCBB9] hover:bg-[#5FCBB9]/10 transition-all duration-200"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Connection Status Button & Theme Toggle wrapper */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-[#817B6E] hover:text-[#F4EFE5] hover:bg-[#101413]/55 transition-all duration-200"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#D8A85F]" /> : <Moon className="w-4 h-4 text-[#A87E43]" />}
            </button>

            {/* Connection Status Button / Action */}
            <div className="hidden lg:flex items-center gap-2 bg-[#101413] border border-[#D8A85F]/20 px-3.5 py-1.5 rounded-xl text-[9px] text-[#817B6E] font-mono tracking-wider">
              <span className={`w-1.5 h-1.5 rounded-full ${isGuest ? 'bg-amber-500 animate-ping' : 'bg-[#5FCBB9] animate-pulse'}`} />
              <span>{isGuest ? 'GUEST-CONSOLE-STANDBY' : 'CONSOLE-RELAY-CONNECTED'}</span>
            </div>
          </div>
        </div>

        {/* Content Console Panel Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start pt-4">
          
          {/* Left Column: Spec, Title & Original Learning Path Cards */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] font-extrabold uppercase text-[#817B6E] tracking-[0.25em] flex items-center gap-2">
                <Compass className="w-3 h-3 text-[#D8A85F]" />
                Orbital SQL Telemetry Spec V4.6
              </span>
              <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-[#F4EFE5] leading-[0.95] max-w-md">
                Secure relay control for database paths.
              </h2>
              <p className="text-sm text-[#817B6E] leading-relaxed max-w-lg font-light">
                Coordinate encrypted query aggregates, relational schemas, and data structures from a single tactile command surface built for high-performance learning.
              </p>
            </div>

            {/* Launch Console Controls */}
            <div className="flex flex-wrap items-center gap-4 py-2">
              {data?.resume ? (
                <Link
                  href={`/challenges/${data.resume.challengeSlug}`}
                  className="px-6 py-3 bg-gradient-to-r from-[#D8A85F] to-[#8A734B] hover:from-[#e7b871] hover:to-[#9c845b] text-black font-extrabold text-sm rounded-full flex items-center gap-2 transition-all shadow-lg shadow-[#D8A85F]/15 active:scale-95"
                >
                  Resume Sequence
                  <span className="text-xs">→</span>
                </Link>
              ) : (
                <Link
                  href="/paths"
                  className="px-6 py-3 bg-gradient-to-r from-[#D8A85F] to-[#8A734B] hover:from-[#e7b871] hover:to-[#9c845b] text-black font-extrabold text-sm rounded-full flex items-center gap-2 transition-all shadow-lg shadow-[#D8A85F]/15 active:scale-95"
                >
                  Initialize Console
                  <span className="text-xs">→</span>
                </Link>
              )}

              {/* Status Code Badge */}
              <div className="flex items-center gap-2 bg-[#000]/40 border border-[#817B6E]/30 px-4 py-2.5 rounded-2xl text-[10px] text-[#817B6E] font-mono tracking-wider">
                <Shield className="w-3 h-3 text-[#5FCBB9]" />
                [ {isGuest ? 'GUEST-MODE-000' : `AES-USR-0${levelValue}${streakValue}`} ]
              </div>
            </div>

            {/* Resume Callout Card (restored from original dashboard) */}
            {data?.resume && (
              <Link 
                href={`/challenges/${data.resume.challengeSlug}`}
                className="block p-4 rounded-2xl border border-[#D8A85F]/35 bg-[#D8A85F]/5 hover:bg-[#D8A85F]/10 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase text-[#D8A85F] tracking-widest">Active Challenge Sequence</p>
                    <p className="text-sm font-semibold text-[#F4EFE5] mt-0.5">Continue where you left off</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#D8A85F] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            )}

            {/* Learning Path Progress Cards (Restored & styled in Aether Console UI) */}
            <div className="pt-6 border-t border-[#D8A85F]/15 space-y-3">
              <h3 className="text-xs font-extrabold uppercase text-[#817B6E] tracking-wider mb-3">
                Active SQL Tracks
              </h3>
              {pathProgress.length > 0 ? (
                pathProgress.map((p) => {
                  const color = getPathColor(p.slug);
                  return (
                    <Link 
                      key={p.slug} 
                      href="/paths" 
                      className="block p-4 rounded-xl border border-zinc-900 bg-[#101413]/60 hover:bg-[#101413]/90 hover:border-[#D8A85F]/30 transition-all duration-300 shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-[#F4EFE5]">{p.title}</span>
                        <span className="text-[9px] font-mono text-[#817B6E]">{p.completed}/{p.total} complete</span>
                      </div>
                      <div className="h-1.5 bg-[#000]/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${p.percent}%`,
                            backgroundColor: color
                          }} 
                        />
                      </div>
                    </Link>
                  );
                })
              ) : (
                /* Fallback for guest mode */
                [
                  { title: 'SQL Foundations', total: 10, percent: 0, slug: 'sql-foundations' },
                  { title: 'Aggregates & Grouping', total: 8, percent: 0, slug: 'sql-aggregates' },
                  { title: 'Joins & Relationships', total: 10, percent: 0, slug: 'sql-joins' },
                  { title: 'Subqueries & CTEs', total: 12, percent: 0, slug: 'sql-subqueries' },
                  { title: 'Advanced SQL', total: 10, percent: 0, slug: 'sql-advanced' },
                ].map((p) => {
                  const color = getPathColor(p.slug);
                  return (
                    <div 
                      key={p.title} 
                      className="p-4 rounded-xl border border-zinc-900 bg-[#101413]/30 text-zinc-650 opacity-60"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold">{p.title}</span>
                        <span className="text-[9px] font-mono">0/{p.total} complete</span>
                      </div>
                      <div className="h-1.5 bg-[#000]/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `0%`,
                            backgroundColor: color
                          }} 
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Console Telemetry, all 5 KPI cards, Radar Sweep */}
          <div className="lg:col-span-6 space-y-8">
                     {/* All 5 KPI cards displayed in Aether Grid panels */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
              {/* Card 1: Database status */}
              <div className="p-4 rounded-2xl bg-[#101413] border border-zinc-900/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex flex-col justify-between h-24">
                <span className="text-[9px] font-extrabold text-[#817B6E] uppercase tracking-wider flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  Relay Link
                </span>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`w-2 h-2 rounded-full ${isGuest ? 'bg-amber-500 shadow-[0_0_6px_#f59e0b]' : 'bg-[#5FCBB9] shadow-[0_0_6px_#5fcbb9]'} animate-pulse`} />
                  <span className="text-[10px] font-bold text-[#F4EFE5] tracking-widest uppercase truncate">
                    {isGuest ? 'Standby' : 'Active'}
                  </span>
                </div>
              </div>

              {/* Card 2: Daily Streak */}
              <div className="p-4 rounded-2xl bg-[#101413] border border-zinc-900/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex flex-col justify-between h-24">
                <span className="text-[9px] font-extrabold text-[#817B6E] uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5 text-[#fb923c] animate-pulse" />
                  Daily Streak
                </span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-lg font-bold text-[#F4EFE5]">{streakValue}</span>
                  <span className="text-[8px] font-extrabold text-[#fb923c] uppercase tracking-widest truncate">Days</span>
                </div>
              </div>

              {/* Card 3: Daily Target */}
              <div className="p-4 rounded-2xl bg-[#101413] border border-zinc-900/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex flex-col justify-between h-24">
                <span className="text-[9px] font-extrabold text-[#817B6E] uppercase tracking-wider flex items-center gap-1">
                  <Target className="w-2.5 h-2.5 text-[#5FCBB9]" />
                  Daily Target
                </span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-lg font-bold text-[#F4EFE5]">{streakValue > 0 ? '1/1' : '0/1'}</span>
                  <span className="text-[8px] font-extrabold text-[#D8A85F] uppercase tracking-widest truncate">
                    {streakValue > 0 ? 'Solved' : 'Standby'}
                  </span>
                </div>
              </div>

              {/* Card 4: Weekly Goal */}
              <div className="p-4 rounded-2xl bg-[#101413] border border-zinc-900/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex flex-col justify-between h-24">
                <span className="text-[9px] font-extrabold text-[#817B6E] uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="w-2.5 h-2.5 text-[#fbbf24]" />
                  Weekly Goal
                </span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-lg font-bold text-[#F4EFE5]">{Math.min(5, completedCount)}/5</span>
                  <span className="text-[8px] font-extrabold text-[#D8A85F] uppercase tracking-widest truncate">Solved</span>
                </div>
              </div>

              {/* Card 5: Console Rank */}
              <div className="p-4 rounded-2xl bg-[#101413] border border-zinc-900/60 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] flex flex-col justify-between h-24">
                <span className="text-[9px] font-extrabold text-[#817B6E] uppercase tracking-wider flex items-center gap-1">
                  <Award className="w-2.5 h-2.5 text-[#D8A85F]" />
                  Console Rank
                </span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-sm font-bold text-[#F4EFE5]">LVL-{levelValue}</span>
                  <span className="text-[8px] font-extrabold text-[#817B6E] uppercase tracking-widest truncate">{xpValue} XP</span>
                </div>
              </div>
            </div>

            {/* Overall Allocation progress slider */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs tracking-wider uppercase font-semibold">
                <span className="text-[#817B6E] text-[10px]">Curriculum Progress</span>
                <span className="text-[#D8A85F] font-mono">{cappedPercent}%</span>
              </div>
              
              <div className="relative h-4 bg-[#000]/60 rounded-full border border-zinc-800/80 p-0.5 overflow-visible">
                {/* Finished progress fill gradient */}
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#8A734B] via-[#D8A85F] to-[#5FCBB9] transition-all duration-75" 
                  style={{ width: `${cappedPercent}%` }}
                />
                
                {/* Skeuomorphic tactile slider handle */}
                <div 
                  className="absolute top-0 w-5 h-5 -mt-[3px] bg-zinc-900 border-2 border-[#D8A85F] rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all duration-75 select-none cursor-pointer"
                  style={{ left: `calc(${cappedPercent}% - 10px)` }}
                >
                  <div className="w-[1.5px] h-2 bg-[#D8A85F]" />
                </div>
              </div>
            </div>

            {/* CRT Screen Panel Display */}
            <div className="rounded-2xl border border-zinc-850 bg-[#0a0d0c] shadow-[inset_0_4px_12px_rgba(0,0,0,0.9)] h-60 relative overflow-hidden p-4 group">
              {/* CRT Scanline Overlay */}
              <div className="absolute inset-0 crt-scanlines pointer-events-none z-10 opacity-75" />

              {/* Animated Radar Sweep */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-zinc-900/60 flex items-center justify-center">
                {/* Rotating Conic Sweep */}
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_50%,rgba(95,203,185,0.08))] rounded-full animate-[spin_5s_linear_infinite]" />
                
                {/* Concentric Radar Grid Rings */}
                <div className="w-40 h-40 rounded-full border border-zinc-900/40 flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border border-zinc-900/30 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border border-zinc-900/20 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D8A85F] shadow-[0_0_6px_#D8A85F]" />
                    </div>
                  </div>
                </div>

                {/* Radar target point indicators */}
                <div className="absolute top-12 left-10 w-2 h-2 rounded-full bg-[#5FCBB9] animate-ping opacity-80" />
                <div className="absolute top-12 left-10 w-2 h-2 rounded-full bg-[#5FCBB9] shadow-[0_0_6px_#5fcbb9]" />
                
                <div className="absolute bottom-16 right-12 w-1.5 h-1.5 rounded-full bg-[#D8A85F] opacity-40" />
              </div>

              {/* Digital Terminal Overlay Details */}
              <div className="absolute inset-4 flex flex-col justify-between font-mono text-[10px] text-zinc-500 z-20">
                <div className="flex justify-between items-start">
                  <span className="text-[#5FCBB9] font-bold tracking-widest text-[9px]">RELAY.ON</span>
                  <span>SYNC_CYCLE: OK</span>
                </div>
                <div className="space-y-0.5 text-[9px] text-[#817B6E]">
                  <p>XP REWARD ACCRUAL: {xpValue} XP</p>
                  <p>COMPLETED SECTIONS: {completedCount} OF {totalChallenges}</p>
                  <p>OVERRIDE VERIFICATION: {manualOverride ? 'DISABLED' : 'AUTO_EXEC'}</p>
                </div>
                <div className="flex justify-between items-end">
                  <span>ORBIT FEED.07</span>
                  <span className="text-zinc-600">40 FPS</span>
                </div>
              </div>
            </div>

            {/* Manual Override Controls */}
            <div className="flex items-center justify-between border-t border-[#D8A85F]/15 pt-5 mb-2">
              <span className="text-xs font-bold text-[#817B6E] uppercase tracking-widest">
                Manual Override
              </span>
              
              {/* Tactile Toggle Switch */}
              <button 
                onClick={() => setManualOverride(!manualOverride)}
                className={`w-12 h-6 rounded-full p-1 transition-colors relative border shadow-inner ${manualOverride ? 'bg-[#5FCBB9]/20 border-[#5FCBB9]' : 'bg-[#000]/80 border-zinc-800'}`}
              >
                <div 
                  className={`w-3.5 h-3.5 rounded-full shadow transition-all duration-300 ${manualOverride ? 'bg-[#5FCBB9] translate-x-6 shadow-[#5FCBB9]/50' : 'bg-[#817B6E] translate-x-0'}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Chassis Footer Links */}
        <div className="border-t border-[#D8A85F]/15 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-bold uppercase tracking-wider text-[#817B6E]">
          <div>
            SQL Tutor 2.0 © 2026
          </div>
          <div className="flex items-center gap-6">
            <Link href="/paths" className="hover:text-[#F4EFE5] transition-colors">
              Documentation
            </Link>
            <Link href="/challenges" className="hover:text-[#F4EFE5] transition-colors">
              Archive
            </Link>
            <Link href="/pricing" className="hover:text-[#F4EFE5] transition-colors">
              Support
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
