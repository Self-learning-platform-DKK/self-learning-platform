'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function CertificatesPage() {
  const [certs, setCerts] = useState<{ verifyCode: string; score: number; issuedAt: string; exam: { title: string } }[]>([]);

  useEffect(() => {
    api<typeof certs>('/certificates').then(setCerts).catch(() => {});
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Certificates</h1>
      <p className="text-muted mb-8">Earn certificates by passing path exams.</p>
      {certs.length === 0 ? (
        <div className="text-center py-8 text-muted">
          <p>No certificates yet.</p>
          <Link href="/paths" className="text-accent text-sm mt-2 inline-block">Start a learning path</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {certs.map((c) => (
            <Link key={c.verifyCode} href={`/certificates/verify/${c.verifyCode}`} className="block p-4 rounded-xl border border-border bg-surface hover:border-accent/50">
              <h2 className="font-semibold">{c.exam.title}</h2>
              <p className="text-sm text-muted">Score: {c.score}% · {new Date(c.issuedAt).toLocaleDateString()}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
