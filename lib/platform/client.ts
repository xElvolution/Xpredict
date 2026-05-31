type Envelope<T> = { ok: true; data: T; meta?: unknown } | { ok: false; error: { message: string } };

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  const json = (await res.json()) as Envelope<T>;
  if (!json.ok) {
    throw new Error('error' in json ? json.error.message : 'Request failed');
  }
  return json.data;
}

export function fetchSettings(wallet: string) {
  return apiFetch<{ settings: Record<string, unknown> }>(`/api/v1/settings?wallet=${wallet}`, {
    headers: { 'x-wallet-address': wallet }
  });
}

export function patchSettings(wallet: string, patch: Record<string, unknown>) {
  return apiFetch<{ settings: Record<string, unknown> }>('/api/v1/settings', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'x-wallet-address': wallet },
    body: JSON.stringify(patch)
  });
}

export function fetchOrders(wallet: string, status?: string) {
  const q = status ? `&status=${status}` : '';
  return apiFetch<{ orders: OrderRow[] }>(`/api/v1/orders?wallet=${wallet}${q}`);
}

export function fetchOrderBook(marketId: string, side: 'yes' | 'no') {
  return apiFetch<{ orderBook: { bids: BookLevel[]; asks: BookLevel[] } }>(
    `/api/v1/orders?book=1&marketId=${marketId}&side=${side}`
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
  return apiFetch<{ order: OrderRow }>(`/api/v1/orders?id=${id}&wallet=${wallet}`, { method: 'DELETE' });
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

export function followAgentApi(wallet: string, agent: string) {
  return apiFetch('/api/v1/follows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet, agent })
  });
}

export function fetchSnapshots(wallet: string) {
  return apiFetch<{ snapshots: { date: string; value: number }[] }>(
    `/api/v1/leaderboard?wallet=${wallet}`
  );
}

export function fetchAgentLeaderboard() {
  return apiFetch<{ leaderboard: AgentRank[] }>('/api/v1/leaderboard?type=agents');
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

export type AgentRank = {
  handle: string;
  name: string;
  record: { wins: number; losses: number; roi: number };
};
