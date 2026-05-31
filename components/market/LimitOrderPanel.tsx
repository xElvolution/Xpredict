'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Loader2 } from 'lucide-react';
import { placeLimitOrder } from '@/lib/platform/client';

export function LimitOrderPanel({
  marketId,
  marketTitle,
  category,
  side,
  midPrice
}: {
  marketId: string;
  marketTitle: string;
  category: string;
  side: 'yes' | 'no';
  midPrice: number;
  onPlaced?: () => void;
}) {
  const { address } = useAccount();
  const [price, setPrice] = useState(String(Math.round(midPrice * 100)));
  const [amount, setAmount] = useState('25');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handlePlace = async () => {
    if (!address) return;
    setLoading(true);
    setMsg('');
    try {
      await placeLimitOrder({
        wallet: address,
        marketId,
        marketTitle,
        category,
        side,
        price: Number(price) / 100,
        quantityUsdc: Number(amount)
      });
      setMsg('Limit order placed');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stack-4">
      <span className="label">Limit order (CLOB)</span>
      <div className="row gap-3">
        <div className="stack-2" style={{ flex: 1 }}>
          <label className="label" style={{ fontSize: 11 }}>Limit price (¢)</label>
          <input className="input" type="number" min={1} max={99} value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <div className="stack-2" style={{ flex: 1 }}>
          <label className="label" style={{ fontSize: 11 }}>Size (USDC)</label>
          <input className="input" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
      </div>
      <button className="btn btn-primary" onClick={handlePlace} disabled={!address || loading}>
        {loading ? <Loader2 size={16} className="spin" /> : `Limit ${side.toUpperCase()}`}
      </button>
      {msg && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{msg}</p>}
      {!address && <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Connect wallet to place limit orders.</p>}
    </div>
  );
}
