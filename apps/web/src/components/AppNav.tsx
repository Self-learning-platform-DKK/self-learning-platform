'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { clearTokens } from '@/lib/api';
import { Sun, Moon } from 'lucide-react';

const links = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/paths', label: 'Paths' },
  { href: '/challenges', label: 'Challenges' },
  { href: '/workspace', label: 'Workspace' },
  { href: '/achievements', label: 'Achievements' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/certificates', label: 'Certificates' },
  { href: '/settings', label: 'Settings' },
];

export function AppNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('sqlt_access_token'));
    const savedTheme = localStorage.getItem('sqlt_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }
  }, [pathname]);

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

  // Do not render global header on the dashboard page itself
  if (pathname === '/dashboard') {
    return null;
  }

  return (
    <header className="border-b border-[#D8A85F]/15 bg-[#070A09]/90 backdrop-blur-md sticky top-0 z-50 font-space w-full">
      {/* Import Space Grotesk Font dynamically inside AppNav */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&display=swap');
        .font-space {
          font-family: 'Space Grotesk', sans-serif;
        }
      `}} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-16">
        <Link href="/dashboard" className="flex items-center gap-2 bg-[#101413] border border-[#D8A85F]/20 px-3.5 py-1.5 rounded-xl hover:border-[#D8A85F]/40 transition group shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D8A85F] animate-pulse shadow-[0_0_8px_#D8A85F]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#D8A85F] group-hover:text-[#F4EFE5] transition-colors">
            SQL Tutor 2.0
          </span>
        </Link>
        
        <nav className="flex items-center gap-1.5 bg-[#000]/40 border border-[#817B6E]/20 p-1 rounded-2xl overflow-x-auto max-w-full scrollbar-none">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap',
                pathname.startsWith(l.href)
                  ? 'bg-[#D8A85F] text-[#070A09] shadow-[0_0_10px_rgba(216,168,95,0.3)]'
                  : 'text-[#817B6E] hover:text-[#F4EFE5] hover:bg-[#101413]/55'
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-[#817B6E] hover:text-[#F4EFE5] hover:bg-[#101413]/55 transition-all duration-200"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-[#D8A85F]" /> : <Moon className="w-4.5 h-4.5 text-[#A87E43]" />}
          </button>

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
        </div>
      </div>
    </header>
  );
}
