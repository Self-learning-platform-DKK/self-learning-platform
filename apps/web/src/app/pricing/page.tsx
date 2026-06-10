import Link from 'next/link';

const plans = [
  { name: 'Free', price: '$0', features: ['All 50 curriculum challenges', 'XP & achievements', 'Workspace', 'BYOK AI keys', 'Basic certificates'] },
  { name: 'Pro', price: '$19/mo', features: ['AI Tutor & personalized learning assistant', 'Platform AI (100/day)', 'Premium certificates', 'Ad-free'], highlight: true },
  { name: 'Team', price: '$49/seat', features: ['Everything in Pro', 'Team dashboard', 'Assigned paths', '200 AI/day per seat'] },
  { name: 'Enterprise', price: 'Custom', features: ['SSO/SAML', 'Custom branding', 'LMS integration', 'SLA'] },
];

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-4">Pricing</h1>
      <p className="text-muted text-center mb-12">Core learning is free forever. AI is optional.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((p) => (
          <div key={p.name} className={`p-6 rounded-xl border ${p.highlight ? 'border-accent bg-accent/5' : 'border-border bg-surface'}`}>
            <h2 className="font-bold text-lg">{p.name}</h2>
            <p className="text-2xl font-bold my-3">{p.price}</p>
            <ul className="text-sm text-muted space-y-2">
              {p.features.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-center mt-8">
        <Link href="/signup" className="text-accent hover:underline">Start free</Link>
      </p>
    </div>
  );
}
