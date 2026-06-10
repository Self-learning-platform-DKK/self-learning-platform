import Link from 'next/link';

async function getChallenges() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1'}/challenges`, { next: { revalidate: 60 } });
  if (!res.ok) return [];
  return res.json();
}

export default async function ChallengesPage() {
  const challenges = await getChallenges();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Challenge Explorer</h1>
      <p className="text-muted mb-8">50 challenges across 5 learning tracks with strong validation.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((c: { slug: string; title: string; concept: string; difficulty: string; xpReward: number; isPremium: boolean }) => (
          <Link
            key={c.slug}
            href={`/challenges/${c.slug}`}
            className="p-4 rounded-xl border border-border bg-surface hover:border-accent/50 transition"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold uppercase text-accent">{c.concept}</span>
              {c.isPremium && <span className="text-xs bg-advanced/20 text-advanced px-2 py-0.5 rounded">Pro</span>}
            </div>
            <h2 className="font-semibold mb-1">{c.title}</h2>
            <p className="text-xs text-muted">{c.difficulty} · {c.xpReward} XP</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
