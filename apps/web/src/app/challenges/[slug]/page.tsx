import { ChallengePlayer } from '@/components/ChallengePlayer';
import { notFound } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1';

async function getChallenge(slug: string) {
  const [challengeRes, datasetRes, pathsRes] = await Promise.all([
    fetch(`${API}/challenges/${slug}`, { next: { revalidate: 30 } }),
    fetch(`${API}/challenges/${slug}/dataset`, { next: { revalidate: 30 } }),
    fetch(`${API}/paths`, { next: { revalidate: 30 } }),
  ]);
  if (!challengeRes.ok) return null;
  const challenge = await challengeRes.json();
  const dataset = datasetRes.ok ? await datasetRes.json() : null;
  const paths = pathsRes.ok ? await pathsRes.json() : [];
  return { challenge, seedSql: dataset?.seedSql, paths };
}

export default async function ChallengePage({ params }: { params: { slug: string } }) {
  const data = await getChallenge(params.slug);
  if (!data?.seedSql) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ChallengePlayer 
        challenge={data.challenge} 
        seedSql={data.seedSql} 
        paths={data.paths} 
      />
    </div>
  );
}
