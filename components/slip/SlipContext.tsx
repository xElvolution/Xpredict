'use client';

import {
  createContext, useContext, useEffect, useMemo, useState,
  type ReactNode
} from 'react';

export type SlipLeg = {
  id: string;             // marketId
  marketId: string;
  title: string;
  category: string;
  side: 'yes' | 'no';
  probability: number;    // 0..1, used to compute decimal odds = 1 / probability
};

type SlipState = {
  legs: SlipLeg[];
  stake: number;          // USDC
};

type SlipCtx = SlipState & {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addLeg: (leg: SlipLeg) => void;
  removeLeg: (id: string) => void;
  flipLeg: (id: string) => void;
  setStake: (n: number) => void;
  clear: () => void;
  hasLeg: (marketId: string, side?: 'yes' | 'no') => boolean;
  loadLegs: (legs: SlipLeg[]) => void;
  /** decimal multiplier (>=1). Empty slip = 1. */
  combinedOdds: number;
  potentialPayout: number;
  profit: number;
};

const Ctx = createContext<SlipCtx | null>(null);
const STORAGE_KEY = 'xpredict.slip.v1';

export function SlipProvider({ children }: { children: ReactNode }) {
  const [legs, setLegs]   = useState<SlipLeg[]>([]);
  const [stake, setStake] = useState<number>(25);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as SlipState;
        if (Array.isArray(parsed.legs)) setLegs(parsed.legs);
        if (typeof parsed.stake === 'number') setStake(parsed.stake);
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ legs, stake })); }
    catch { /* ignore */ }
  }, [legs, stake, hydrated]);

  const addLeg = (leg: SlipLeg) => {
    setLegs((prev) => {
      const idx = prev.findIndex((l) => l.id === leg.id);
      if (idx === -1) return [...prev, leg];
      const next = prev.slice();
      next[idx] = leg;       // replace side on same market
      return next;
    });
    // Drawer no longer auto-opens — user must click the Slip FAB.
  };

  const removeLeg = (id: string) =>
    setLegs((prev) => prev.filter((l) => l.id !== id));

  const flipLeg = (id: string) =>
    setLegs((prev) =>
      prev.map((l) => l.id === id
        ? { ...l, side: l.side === 'yes' ? 'no' : 'yes', probability: 1 - l.probability }
        : l)
    );

  const clear = () => setLegs([]);

  const loadLegs = (newLegs: SlipLeg[]) => {
    setLegs(newLegs);
    setOpen(true);
  };

  const hasLeg = (marketId: string, side?: 'yes' | 'no') =>
    legs.some((l) => l.id === marketId && (side ? l.side === side : true));

  const combinedOdds = useMemo(() => {
    if (legs.length === 0) return 1;
    return legs.reduce((acc, l) => acc * (1 / Math.max(0.01, l.probability)), 1);
  }, [legs]);

  const potentialPayout = stake * combinedOdds;
  const profit = Math.max(0, potentialPayout - stake);

  const value: SlipCtx = {
    legs,
    stake,
    isOpen,
    open: () => setOpen(true),
    close: () => setOpen(false),
    toggle: () => setOpen((v) => !v),
    addLeg,
    removeLeg,
    flipLeg,
    setStake,
    clear,
    loadLegs,
    hasLeg,
    combinedOdds,
    potentialPayout,
    profit
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSlip() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSlip must be used inside <SlipProvider>');
  return ctx;
}
