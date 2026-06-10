'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, setTokens } from '@/lib/api';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await api<{ tokens: { accessToken: string } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, username, password }),
      });
      setTokens(res.tokens.accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-2">Create free account</h1>
      <p className="text-muted text-sm mb-6">Save progress, earn XP, unlock achievements. No AI required.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-surface border border-border" required />
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-surface border border-border" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 rounded-lg bg-surface border border-border" required />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="w-full py-2 bg-accent text-black font-semibold rounded-lg">Sign up</button>
      </form>
      <p className="text-sm text-muted mt-4 text-center">
        Have an account? <Link href="/login" className="text-accent">Login</Link>
      </p>
    </div>
  );
}
