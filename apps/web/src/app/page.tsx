import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20 text-center">
      <h1 className="text-5xl font-bold mb-4 tracking-tight">
        Learn SQL by <span className="text-accent">doing</span>
      </h1>
      <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
        Interactive challenges, Monaco SQL editor, progress tracking, and achievements.
        AI tutoring is optional — the platform works fully without it.
      </p>
      <div className="flex gap-4 justify-center flex-wrap">
        <Link href="/challenges/select-everything" className="px-6 py-3 bg-accent text-black font-semibold rounded-lg hover:opacity-90">
          Try a challenge
        </Link>
        <Link href="/dashboard" className="px-6 py-3 border border-border rounded-lg hover:bg-surface">
          Dashboard
        </Link>
        <Link href="/signup" className="px-6 py-3 border border-border rounded-lg hover:bg-surface">
          Sign up free
        </Link>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mt-16 text-left">
        {[
          { title: 'Browser SQL', desc: 'Run queries instantly with sql.js — no setup required.' },
          { title: 'Real validation', desc: 'AST + result checks prevent gaming answers.' },
          { title: 'AI optional', desc: 'Hints, challenges, and XP work without any API key.' },
        ].map((f) => (
          <div key={f.title} className="p-5 rounded-xl border border-border bg-surface">
            <h3 className="font-semibold mb-2">{f.title}</h3>
            <p className="text-sm text-muted">{f.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 flex gap-6 justify-center text-sm text-muted">
        <Link href="/features" className="hover:text-white">Features</Link>
        <Link href="/pricing" className="hover:text-white">Pricing</Link>
        <Link href="/leaderboard" className="hover:text-white">Leaderboard</Link>
      </div>
    </div>
  );
}
