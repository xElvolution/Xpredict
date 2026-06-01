/**
 * Curator Agent
 * Runs every 30 minutes via cron.
 * 1. Searches for upcoming sports/crypto events via Tavily
 * 2. Asks OpenAI to draft a Yes/No prediction market question
 * 3. Deploys the market via factory contract (Privy-signed)
 * 4. Seeds initial liquidity
 * 5. Stores metadata in Postgres
 *
 * Run: npx tsx agents/curator.ts
 * Cron: 0,30 * * * * npx tsx /path/to/agents/curator.ts >> /var/log/curator.log 2>&1
 */

import 'dotenv/config';
import { parseUnits } from 'viem';
import { ensureSchema } from '../lib/db';
import { ensureSdkSchema } from '../lib/sdk/db';
import { tavilySearch } from './lib/tavily';
import { chat } from './lib/openai';
import { sendTransaction, getAgentWallet } from './lib/privy';
import {
  encodeCreateMarket, encodeApprove, encodeSeedLiquidity,
  publicClient, getFactoryMarkets, getMarketState
} from './lib/chain';
import { logAgentAction, upsertMarketMeta } from './lib/db';
import { processPendingProposals } from './lib/proposals';
import { USDC_DECIMALS } from '../lib/contracts';

const FACTORY   = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;
const USDC      = process.env.NEXT_PUBLIC_USDC_ADDRESS    as `0x${string}`;
const CURATOR_WALLET_ID  = process.env.PRIVY_CURATOR_WALLET_ID!;
const RESOLVER_ADDRESS   = process.env.RESOLVER_ADDRESS   as `0x${string}`;
const SEED_LIQUIDITY_USDC = 500; // USDC per market

const SEARCH_QUERIES = [
  'upcoming football matches this week results predictions',
  'NBA basketball games this week schedule',
  'UFC fight card upcoming events',
  'crypto bitcoin ethereum price prediction this week',
  'tennis grand slam upcoming matches'
];

/**
 * Normalize a question for fuzzy comparison.
 * Strips punctuation, lowercases, collapses whitespace.
 */
function normalize(q: string): string {
  return q.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Word-overlap similarity (0-1). > 0.6 = "basically the same question".
 */
function similarity(a: string, b: string): number {
  const aw = new Set(normalize(a).split(' ').filter((w) => w.length > 2));
  const bw = new Set(normalize(b).split(' ').filter((w) => w.length > 2));
  if (aw.size === 0 || bw.size === 0) return 0;
  let overlap = 0;
  for (const w of aw) if (bw.has(w)) overlap++;
  return overlap / Math.min(aw.size, bw.size);
}

const SYSTEM_PROMPT = `You are a prediction market curator. Given news about upcoming sports or crypto events,
draft a single clear Yes/No prediction market question.

Rules:
- Question must be objectively resolvable (clear winner/loser, price above/below threshold)
- Must resolve within 30 days
- Format: JSON with fields: question, subtitle, category, closesAtDays, externalId
- category must be one of: Football, Basketball, UFC, Tennis, Esports, Crypto
- closesAtDays: number of days from now until market closes
- subtitle: one sentence describing resolution criteria
- externalId: a short slug for the event (e.g. "ufc-312-topuria")

Respond ONLY with valid JSON, no markdown.`;

async function run() {
  console.log(`[curator] Starting at ${new Date().toISOString()}`);

  await ensureSchema();
  await ensureSdkSchema();

  // 1. Process SDK proposal queue first
  const reviewed = await processPendingProposals();
  console.log(`[curator] Processed ${reviewed} SDK proposal(s)`);

  // 2. Auto-draft one market from live feeds
  // Allow env override (FORCE_QUERY) for one-off crypto/category-targeted runs.
  const query = process.env.FORCE_QUERY || SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
  console.log(`[curator] Searching: ${query}`);

  const searchResults = await tavilySearch(query);

  // Read existing open market questions so we don't propose duplicates
  const existingMarkets = await getFactoryMarkets();
  console.log(`[curator] ${existingMarkets.length} existing markets`);

  const existingQuestions: string[] = [];
  for (const addr of existingMarkets) {
    try {
      const s = await getMarketState(addr);
      if (!s.resolved) existingQuestions.push(s.question as string);
    } catch { /* skip */ }
  }

  const avoidBlock = existingQuestions.length
    ? `\n\nIMPORTANT — DO NOT propose any question similar to these existing open markets:\n${existingQuestions.map((q, i) => `  ${i + 1}. ${q}`).join('\n')}\n\nPick a DIFFERENT event or angle.`
    : '';

  const raw = await chat(
    SYSTEM_PROMPT,
    `Based on these recent events, draft one prediction market:\n\n${searchResults}${avoidBlock}`
  );

  let draft: { question: string; subtitle: string; category: string; closesAtDays: number; externalId: string };
  try {
    draft = JSON.parse(raw);
  } catch {
    console.error('[curator] Failed to parse OpenAI response:', raw);
    await logAgentAction('curator', 'parse_error', { raw });
    return;
  }

  if (!draft.question || !draft.category || !draft.closesAtDays) {
    console.error('[curator] Invalid draft:', draft);
    return;
  }

  // Local dedup check — even if OpenAI ignored the constraint, we reject duplicates
  const duplicate = existingQuestions.find((q) => similarity(q, draft.question) >= 0.6);
  if (duplicate) {
    console.warn(`[curator] DEDUP: skipping draft "${draft.question}" — too similar to "${duplicate}"`);
    await logAgentAction('curator', 'dedup_skipped', { draft: draft.question, similar_to: duplicate });
    return;
  }

  const closesAt = BigInt(Math.floor(Date.now() / 1000) + draft.closesAtDays * 86400);

  console.log(`[curator] Creating market: "${draft.question}"`);

  // 1. Create market
  const createData = encodeCreateMarket(draft.question, closesAt, RESOLVER_ADDRESS);
  const createHash = await sendTransaction(CURATOR_WALLET_ID, {
    to: FACTORY,
    data: createData
  });
  console.log(`[curator] createMarket tx: ${createHash}`);

  // Wait for receipt to get market address from logs
  const receipt = await publicClient.waitForTransactionReceipt({ hash: createHash });
  const marketCreatedLog = receipt.logs[receipt.logs.length - 1];
  const marketAddress = `0x${marketCreatedLog.topics[1]?.slice(26)}` as `0x${string}`;
  console.log(`[curator] Market deployed at: ${marketAddress}`);

  // 2. Approve USDC for seed liquidity
  const seedAmount = parseUnits(String(SEED_LIQUIDITY_USDC), USDC_DECIMALS);
  const approveData = encodeApprove(marketAddress, seedAmount);
  const approveHash = await sendTransaction(CURATOR_WALLET_ID, {
    to: USDC,
    data: approveData
  });
  await publicClient.waitForTransactionReceipt({ hash: approveHash });
  console.log(`[curator] Approved USDC: ${approveHash}`);

  // 3. Seed liquidity
  const seedData = encodeSeedLiquidity(seedAmount);
  const seedHash = await sendTransaction(CURATOR_WALLET_ID, {
    to: marketAddress,
    data: seedData
  });
  await publicClient.waitForTransactionReceipt({ hash: seedHash });
  console.log(`[curator] Seeded liquidity: ${seedHash}`);

  // 4. Store metadata in Postgres
  await upsertMarketMeta({
    address: marketAddress,
    category: draft.category,
    subtitle: draft.subtitle,
    agent_handle: '@curator.ai',
    external_id: draft.externalId,
    trending: false,
    hidden: false
  });

  await logAgentAction('curator', 'market_created', {
    address: marketAddress,
    question: draft.question,
    category: draft.category,
    closesAtDays: draft.closesAtDays
  }, createHash);

  console.log(`[curator] Done. Market "${draft.question}" live at ${marketAddress}`);
}

run().catch((err) => {
  console.error('[curator] Fatal error:', err);
  process.exit(1);
});
