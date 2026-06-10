'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [stats, setStats] = useState<{ registrations: number; challengeCompletions: number; totalAttempts: number; failRate: number } | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1'}/admin/analytics/summary`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
      <p className="text-muted mb-8">Analytics summary · Challenge builder UI coming in admin portal expansion</p>
      {stats ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats).map(([k, v]) => (
            <div key={k} className="p-4 rounded-xl border border-border bg-surface">
              <p className="text-2xl font-bold">{v}</p>
              <p className="text-xs text-muted uppercase">{k.replace(/([A-Z])/g, ' $1')}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted">Loading… (start API with npm run dev:api)</p>
      )}
    </div>
  );
}
