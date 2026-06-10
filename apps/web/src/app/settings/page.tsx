'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [keys, setKeys] = useState<{ provider: string; keyHint: string }[]>([]);
  const [provider, setProvider] = useState('ANTHROPIC');
  const [apiKey, setApiKey] = useState('');
  const [aiStatus, setAiStatus] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api<{ enabled: boolean; message: string }>('/ai/status').then((s) => setAiStatus(s.message)).catch(() => {});
    api<{ provider: string; keyHint: string }[]>('/ai/keys').then(setKeys).catch(() => {});
  }, []);

  async function saveKey() {
    try {
      await api('/ai/keys', { method: 'POST', body: JSON.stringify({ provider, apiKey }) });
      setMsg('BYOK key saved (encrypted server-side)');
      setApiKey('');
      const k = await api<{ provider: string; keyHint: string }[]>('/ai/keys');
      setKeys(k);
    } catch (e) {
      setMsg((e as Error).message);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold">Settings</h1>
      <section className="p-5 rounded-xl border border-border bg-surface space-y-3">
        <h2 className="font-semibold">AI (Optional)</h2>
        <p className="text-sm text-muted">{aiStatus || 'Loading…'}</p>
        <p className="text-xs text-muted">Core learning works without AI. BYOK lets you use your own Claude, OpenAI, or Gemini key.</p>
        <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-bg border border-border">
          <option value="ANTHROPIC">Claude (Anthropic)</option>
          <option value="OPENAI">OpenAI</option>
          <option value="GOOGLE">Gemini (Google)</option>
        </select>
        <input type="password" placeholder="API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full px-3 py-2 rounded-lg bg-bg border border-border" />
        <button onClick={saveKey} className="px-4 py-2 bg-accent text-black rounded-lg text-sm font-semibold">Save BYOK key</button>
        {keys.length > 0 && (
          <ul className="text-sm text-muted">
            {keys.map((k) => <li key={k.provider}>{k.provider}: {k.keyHint}</li>)}
          </ul>
        )}
        {msg && <p className="text-sm">{msg}</p>}
      </section>
    </div>
  );
}
