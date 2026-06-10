'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function AchievementsPage() {
  const [items, setItems] = useState<{ slug: string; title: string; description: string; icon: string; earned: boolean; xpBonus: number }[]>([]);

  useEffect(() => {
    api<typeof items>('/achievements').then(setItems).catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Achievements</h1>
      {!items.length ? (
        <p className="text-muted text-center py-8">
          <Link href="/login" className="text-accent">Sign in</Link> to track achievements
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((a) => (
            <div key={a.slug} className={`p-4 rounded-xl border ${a.earned ? 'border-beginner/40 bg-beginner/5' : 'border-border bg-surface opacity-60'}`}>
              <div className="text-2xl mb-2">{a.icon}</div>
              <h2 className="font-semibold">{a.title}</h2>
              <p className="text-sm text-muted">{a.description}</p>
              <p className="text-xs text-muted mt-2">+{a.xpBonus} XP</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
