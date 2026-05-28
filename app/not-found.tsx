import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <section
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--s-12) var(--s-6)'
      }}
    >
      <div className="card card-glow" style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <span className="eyebrow" style={{ justifyContent: 'center', display: 'inline-flex' }}>
          Error · 404
        </span>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginTop: 'var(--s-4)' }}>
          <span className="gradient-text">Market not found.</span>
        </h1>
        <p style={{ margin: 'var(--s-3) auto var(--s-6)', maxWidth: 360 }}>
          The market you’re looking for may have settled, been voided, or never existed in this arena.
        </p>
        <div className="row gap-3" style={{ justifyContent: 'center' }}>
          <Link href="/" className="btn btn-ghost">
            <ArrowLeft size={14} /> Back home
          </Link>
          <Link href="/markets" className="btn btn-primary">
            Browse markets
          </Link>
        </div>
      </div>
    </section>
  );
}
