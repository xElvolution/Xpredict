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
import { tavilySearch } from './lib/tavily';
import { chat } from './lib/openai';
import { sendTransaction, getAgentWallet } from './lib/privy';
import {
  encodeCreateMarket, encodeApprove, encodeSeedLiquidity,
  publicClient, getFactoryMarkets
} from './lib/chain';
import { logAgentAction, upsertMarketMeta } from './lib/db';
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

  // Pick a random search query to vary market types
  const query = SEARCH_QUERIES[Math.floor(Math.random() * SEARCH_QUERIES.length)];
  console.log(`[curator] Searching: ${query}`);

  const searchResults = await tavilySearch(query);

  const raw = await chat(SYSTEM_PROMPT, `Based on these recent events, draft one prediction market:\n\n${searchResults}`);

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

  // Check if we already have a market with this externalId
  // (simple dedup — in production use a proper check)
  const existingMarkets = await getFactoryMarkets();
  console.log(`[curator] ${existingMarkets.length} existing markets`);

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
    trending: false
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
