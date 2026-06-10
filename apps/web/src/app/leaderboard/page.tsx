async function getLeaderboard() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1'}/leaderboard`, { next: { revalidate: 30 } });
  if (!res.ok) return [];
  return res.json();
}

export default async function LeaderboardPage() {
  const board = await getLeaderboard();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Leaderboard</h1>
      {board.length === 0 ? (
        <p className="text-muted text-center">No rankings yet — be the first!</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-left border-b border-border">
              <th className="py-2">#</th>
              <th>User</th>
              <th>XP</th>
              <th>Level</th>
              <th>Streak</th>
            </tr>
          </thead>
          <tbody>
            {board.map((u: { rank: number; username: string; xp: number; level: number; streak: number }) => (
              <tr key={u.username} className="border-b border-border">
                <td className="py-3">{u.rank}</td>
                <td className="font-medium">{u.username}</td>
                <td>{u.xp}</td>
                <td>{u.level}</td>
                <td>{u.streak}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
