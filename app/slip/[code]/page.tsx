'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Download, Loader } from 'lucide-react';
import { useSlip } from '@/components/slip/SlipContext';
import { decodeSlip } from '@/lib/slip-share';
import { MARKETS } from '@/lib/data';

export default function SlipCodePage() {
  const params = useParams();
  const router = useRouter();
  const { loadLegs } = useSlip();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const code = params.code as string;
    if (!code) {
      setStatus('error');
      setErrorMsg('No code provided');
      return;
    }

    const loadSlip = async () => {
      const decoded = await decodeSlip(code);
      if (!decoded) {
        setStatus('error');
        setErrorMsg('Invalid or expired slip code');
        return;
      }

      const legs = decoded.legs
        .map((leg) => {
          const market = MARKETS.find((m) => m.id === leg.m);
          if (!market) return null;
          return {
            id: leg.m,
            marketId: leg.m,
            title: market.title,
            category: market.category,
            side: leg.s,
            probability: leg.p
          };
        })
        .filter((l) => l !== null);

      if (legs.length === 0) {
        setStatus('error');
        setErrorMsg('No valid markets found in this slip');
        return;
      }

      loadLegs(legs);
      setStatus('success');

      setTimeout(() => {
        router.push('/markets');
      }, 1200);
    };

    loadSlip();
  }, [params.code, loadLegs, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--s-4)'
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        {status === 'loading' && (
          <>
            <Loader size={48} style={{ margin: '0 auto var(--s-4)', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 'var(--s-2)' }}>
              Loading slip...
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Decoding your shared parlay
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--r-lg)',
                margin: '0 auto var(--s-4)',
                background: 'var(--positive-soft)',
                border: '1px solid var(--positive)',
                color: 'var(--positive)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Download size={28} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 'var(--s-2)' }}>
              Slip loaded!
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
              Redirecting to markets...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--r-lg)',
                margin: '0 auto var(--s-4)',
                background: 'var(--negative-soft)',
                border: '1px solid var(--negative)',
                color: 'var(--negative)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 32
              }}
            >
              ✕
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 'var(--s-2)' }}>
              Invalid slip code
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 'var(--s-6)' }}>
              {errorMsg}
            </p>
            <button
              onClick={() => router.push('/markets')}
              className="btn btn-primary"
              style={{ height: 44 }}
            >
              Go to markets
            </button>
          </>
        )}

        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
