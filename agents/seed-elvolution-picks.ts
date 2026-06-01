/**
 * Seed picks for the 4 community agents so the Arena page isn't empty.
 * Each agent gets 3 calls based on their personality, drawn from real onchain markets.
 *
 * Run: npx tsx agents/seed-elvolution-picks.ts
 */

import 'dotenv/config';
import { getDb } from '../lib/db';
import { ensureAllSchemas } from '../lib/sdk/api-utils';
import { getFactoryMarkets, getMarketState } from './lib/chain';
import { chat } from './lib/openai';

type AgentBlueprint = {
  handle: string;
  style: string;
  focus: string[];
  prompt: string;
};

const AGENTS: AgentBlueprint[] = [
  {
    handle: '@nightowl_predictor',
    style: 'Momentum',
    focus: ['Basketball', 'Crypto'],
    prompt:
      'You are NightOwl, a momentum trader. You ride trends, lean on lineup news and 24h price action. Picks should reflect that.'
  },
  {
    handle: '@kairos_bot',
    style: 'Contrarian',
    focus: ['Tennis', 'UFC'],
    prompt:
      'You are Kairos, a contrarian. You fade public favorites and back live underdogs when value aligns. Picks should reflect that.'
  },
  {
    handle: '@nebula_calls',
    style: 'Value',
    focus: ['Football'],
    prompt:
      'You are Nebula, a value bettor. You take YES/NO only when there is a clear >5% edge vs the implied Vegas line. Picks should reflect that.'
  },
  {
    handle: '@delphi_trades',
    style: 'Quant',
    focus: ['Football', 'Esports'],
    prompt:
      'You are Delphi, a quant. You back high-confidence statistical edges in football and esports tournaments. Picks should reflect that.'
  }
];

const PICKS_PER_AGENT = 3;

type MarketRow = {
  address: string;
  question: string;
  category: string;
  subtitle: string;
  priceYes: number;
};

async function loadCandidateMarkets(): Promise<MarketRow[]> {
  const db = getDb();
  const markets = await getFactoryMarkets();

  const out: MarketRow[] = [];
  for (const addr of markets) {
    const state = await getMarketState(addr);
    if (state.resolved) continue;

    // Match meta to grab category
    const { rows } = await db.query<{ category: string; subtitle: string; hidden: boolean }>(
      `SELECT category, subtitle, COALESCE(hidden, FALSE) AS hidden FROM market_meta WHERE address = $1`,
      [addr.toLowerCase()]
    );
    if (rows[0]?.hidden) continue;

    const total = BigInt(state.yesReserves) + BigInt(state.noReserves);
    const priceYes = total > 0n ? Number((BigInt(state.yesReserves) * 10000n) / total) / 10000 : 0.5;

    out.push({
      address: addr.toLowerCase(),
      question: state.question as string,
      category: rows[0]?.category ?? 'Other',
      subtitle: rows[0]?.subtitle ?? '',
      priceYes
    });
  }
  return out;
}

async function generatePickForAgent(
  agent: AgentBlueprint,
  market: MarketRow
): Promise<{ side: 'yes' | 'no'; rationale: string; confidence: number } | null> {
  const system = `${agent.prompt}\n\nGiven a market, choose YES or NO and write a 1-sentence rationale that fits your style.\nReturn STRICT JSON: {"side":"yes|no","rationale":"...","confidence":0-1}\nNo markdown.`;

  const user = `Market: "${market.question}"
Category: ${market.category}
Subtitle: ${market.subtitle}
Current implied YES probability: ${(market.priceYes * 100).toFixed(0)}%

Choose your side and explain in 1 short sentence (max 110 chars).`;

  try {
    const raw = await chat(system, user);
    const parsed = JSON.parse(raw);
    if (parsed.side !== 'yes' && parsed.side !== 'no') return null;
    if (typeof parsed.rationale !== 'string') return null;
    return {
      side: parsed.side,
      rationale: String(parsed.rationale).slice(0, 200),
      confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.5
    };
  } catch {
    return null;
  }
}

async function pickAlreadyExists(handle: string, marketAddr: string): Promise<boolean> {
  const db = getDb();
  const { rows } = await db.query(
    `SELECT 1 FROM agent_picks WHERE agent_handle = $1 AND market_id = $2 AND status = 'open' LIMIT 1`,
    [handle, marketAddr]
  );
  return rows.length > 0;
}

async function insertPick(
  handle: string,
  market: MarketRow,
  side: 'yes' | 'no',
  rationale: string,
  confidence: number
) {
  const db = getDb();
  const id = `pick_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stake = Math.round((50 + Math.random() * 250) * 100) / 100; // $50 - $300

  const impliedYes = market.priceYes;
  const taken = side === 'yes' ? impliedYes : 1 - impliedYes;
  const edge = Math.max(0, confidence - taken);

  await db.query(
    `INSERT INTO agent_picks
      (id, agent_handle, market_id, category, title, side,
       probability, agent_confidence, edge, rationale, stake)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
    [
      id,
      handle,
      market.address,
      market.category,
      market.question,
      side,
      market.priceYes,
      confidence,
      edge,
      rationale,
      stake
    ]
  );

  console.log(
    `  ${handle}: ${side.toUpperCase()} on "${market.question.slice(0, 60)}…" · conf ${(confidence * 100).toFixed(0)}% · stake $${stake}`
  );
}

async function main() {
  await ensureAllSchemas();

  console.log('Loading onchain markets…');
  const allMarkets = await loadCandidateMarkets();
  console.log(`Candidate markets (unresolved + not hidden): ${allMarkets.length}\n`);

  if (allMarkets.length === 0) {
    console.error('No open markets to pick from.');
    process.exit(1);
  }

  for (const agent of AGENTS) {
    console.log(`→ ${agent.handle} (${agent.style} · ${agent.focus.join(', ')})`);

    // Filter to agent's focus; if too few, fall back to all
    let pool = allMarkets.filter((m) => agent.focus.includes(m.category));
    if (pool.length < PICKS_PER_AGENT) pool = allMarkets;

    // Shuffle and take N
    pool = [...pool].sort(() => Math.random() - 0.5).slice(0, PICKS_PER_AGENT * 2); // overdraft for skips

    let made = 0;
    for (const market of pool) {
      if (made >= PICKS_PER_AGENT) break;
      if (await pickAlreadyExists(agent.handle, market.address)) continue;

      const decision = await generatePickForAgent(agent, market);
      if (!decision) {
        console.warn(`  (skipped — parse fail on "${market.question.slice(0, 40)}…")`);
        continue;
      }

      await insertPick(agent.handle, market, decision.side, decision.rationale, decision.confidence);
      made += 1;
    }

    if (made === 0) {
      console.log('  (no picks made — pool exhausted)');
    }
  }

  console.log('\nDone. Visit /arena to see the agent picks.');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
