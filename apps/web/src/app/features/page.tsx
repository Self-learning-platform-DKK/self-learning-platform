export default function FeaturesPage() {
  const features = [
    { title: 'Monaco SQL Editor', desc: 'Syntax highlighting, IntelliSense, formatting, Ctrl+Enter to run.' },
    { title: 'Multi-layer validation', desc: 'AST structure + result checks — no more gaming answers.' },
    { title: 'Learning paths', desc: 'Beginner → Advanced tracks with XP and progress sync.' },
    { title: 'SQL Workspace', desc: 'Free sandbox with datasets — no account needed.' },
    { title: 'Gamification', desc: 'XP, levels, streaks, achievements, leaderboard.' },
    { title: 'Certificates', desc: 'Pass exams, get verifiable certificates.' },
    { title: 'AI (optional)', desc: 'Tutor, debugger via Pro plan or BYOK. Platform works without it.' },
    { title: 'Enterprise ready', desc: 'Teams, SSO, audit logs — Phase 8 foundation in API.' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Features</h1>
      <div className="space-y-6">
        {features.map((f) => (
          <div key={f.title} className="p-5 rounded-xl border border-border">
            <h2 className="font-semibold text-lg mb-1">{f.title}</h2>
            <p className="text-muted">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
