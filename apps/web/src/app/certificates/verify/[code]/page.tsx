async function verify(code: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/v1'}/certificates/verify/${code}`);
  if (!res.ok) return null;
  return res.json();
}

export default async function VerifyPage({ params }: { params: { code: string } }) {
  const cert = await verify(params.code);

  if (!cert) {
    return <div className="max-w-md mx-auto px-4 py-16 text-center text-red-400">Certificate not found</div>;
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="p-8 rounded-2xl border-2 border-accent bg-surface">
        <p className="text-xs uppercase tracking-wider text-accent mb-4">Verified Certificate</p>
        <h1 className="text-2xl font-bold mb-2">{cert.examTitle}</h1>
        <p className="text-lg mb-4">Awarded to <strong>{cert.username}</strong></p>
        <p className="text-muted">Score: {cert.score}%</p>
        <p className="text-sm text-muted mt-2">{new Date(cert.issuedAt).toLocaleDateString()}</p>
        <p className="text-xs text-muted mt-6 font-mono">{cert.verifyCode}</p>
      </div>
    </div>
  );
}
