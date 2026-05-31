import { env } from './env';

type Envelope<T> = { ok: true; data: T } | { ok: false; error: { message: string } };

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${env.API_BASE_URL}${path}`, init);
  const json = (await res.json()) as Envelope<T>;
  if (!json.ok) throw new Error('error' in json ? json.error.message : 'Request failed');
  return json.data;
}

export type OrderRow = {
  id: string;
  market_id: string;
  market_title: string;
  side: 'yes' | 'no';
  price: number;
  quantity_usdc: number;
  filled_usdc: number;
  status: string;
  created_at: string;
};

export type TradeRow = {
  id: string;
  market_id: string;
  market_title: string;
  kind: string;
  side: string | null;
  amount_usdc: number;
  price: number | null;
  tx_hash: string | null;
  created_at: string;
};

export type BookLevel = { price: number; quantity: number; orderCount: number };

export type UserSettings = {
  display_name: string | null;
  email: string | null;
  notify_orders: boolean;
  notify_resolves: boolean;
  notify_agents: boolean;
  notify_deposits: boolean;
};

export function fetchSettings(wallet: string) {
  return apiFetch<{ settings: UserSettings }>(`/api/v1/settings?wallet=${wallet}`, {
    headers: { 'x-wallet-address': wallet }
  });
}

export function patchSettings(wallet: string, patch: Partial<UserSettings>) {
  return apiFetch<{ settings: UserSettings }>('/api/v1/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-wallet-address': wallet },
    body: JSON.stringify(patch)
  });
}

export function fetchOrders(wallet: string) {
  return apiFetch<{ orders: OrderRow[] }>(`/api/v1/orders?wallet=${wallet}`);
}

export function fetchOrderBook(marketId: string, side: 'yes' | 'no') {
  return apiFetch<{ orderBook: { bids: BookLevel[]; asks: BookLevel[] } }>(
    `/api/v1/orders?book=1&marketId=${encodeURIComponent(marketId)}&side=${side}`
  );
}

export function placeLimitOrder(body: Record<string, unknown>) {
  return apiFetch<{ order: OrderRow }>('/api/v1/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

export function cancelLimitOrder(id: string, wallet: string) {
  return apiFetch<{ order: OrderRow }>(
    `/api/v1/orders?id=${encodeURIComponent(id)}&wallet=${encodeURIComponent(wallet)}`,
    { method: 'DELETE' }
  );
}

export function fetchHistory(wallet: string) {
  return apiFetch<{ trades: TradeRow[] }>(`/api/v1/history?wallet=${wallet}`);
}

export function recordTradeHistory(body: Record<string, unknown>) {
  return apiFetch('/api/v1/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

export function fetchFollows(wallet: string) {
  return apiFetch<{ agents: string[] }>(`/api/v1/follows?wallet=${wallet}`);
}

export function fetchSnapshots(wallet: string) {
  return apiFetch<{ snapshots: { date: string; value: number }[] }>(
    `/api/v1/leaderboard?wallet=${wallet}`
  );
}
