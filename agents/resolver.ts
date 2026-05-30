/**
 * Resolver Agent
 * Runs every 15 minutes via cron.
 * 1. Reads all deployed markets from factory
 * 2. Finds markets past closesAt that are not yet resolved
 * 3. Queries structured data APIs to determine outcome
 * 4. Calls market.resolve(outcome) via Privy-signed tx
 *
 * Run: npx tsx agents/resolver.ts
 * Cron: 0,15,30,45 * * * * npx tsx /path/to/agents/resolver.ts >> /var/log/resolver.log 2>&1
 */

import 'dotenv/config';
import { chat } from './lib/openai';
import { sendTransaction } from './lib/privy';
import { encodeResolve, getFactoryMarkets, getMarketState, publicClient } from './lib/chain';
import { logAgentAction } from './lib/db';

const RESOLVER_WALLET_ID = process.env.PRIVY_RESOLVER_WALLET_ID!;

const SYSTEM_PROMPT = `You are a prediction market resolver. Given a Yes/No market question and data from multiple sources, determine the outcome.

Rules:
- Only resolve if the data clearly indicates YES or NO
- If data is ambiguous or event hasn't concluded, respond with SKIP
- Respond ONLY with one word: YES, NO, or SKIP`;

async function fetchSportsResult(question: string): Promise<string> {
  // TheSportsDB — free, no key needed for basic queries
  const encoded = encodeURIComponent(question);
  try {
    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=${encoded}`);
    const data = await res.json();
    if (data.event?.length > 0) {
      const event = data.event[0];
      return `Event: ${event.strEvent}, Home: ${event.intHomeScore}, Away: ${event.intAwayScore}, Status: ${event.strStatus}`;
    }
  } catch { /* ignore */ }
  return '';
}

async function fetchCryptoPrice(question: string): Promise<string> {
  // Extract coin from question heuristically
  const lower = question.toLowerCase();
  const coin = lower.includes('bitcoin') || lower.includes('btc') ? 'bitcoin'
    : lower.includes('ethereum') || lower.includes('eth') ? 'ethereum'
    : lower.includes('okb') ? 'okb'
    : null;

  if (!coin) return '';

  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=usd`);
    const data = await res.json();
    const price = data[coin]?.usd;
    return price ? `Current ${coin} price: $${price}` : '';
  } catch { /* ignore */ }
  return '';
}

async function resolveMarket(address: `0x${string}`, question: string): Promise<'YES' | 'NO' | 'SKIP'> {
  const [sportsData, cryptoData] = await Promise.all([
    fetchSportsResult(question),
    fetchCryptoPrice(question)
  ]);

  const context = [sportsData, cryptoData].filter(Boolean).join('\n');
  if (!context) return 'SKIP';

  const response = await chat(SYSTEM_PROMPT, `Market question: "${question}"\n\nData:\n${context}`);
  const verdict = response.trim().toUpperCase();

  if (verdict === 'YES') return 'YES';
  if (verdict === 'NO') return 'NO';
  return 'SKIP';
}

async function run() {
  console.log(`[resolver] Starting at ${new Date().toISOString()}`);

  const markets = await getFactoryMarkets();
  console.log(`[resolver] Checking ${markets.length} markets`);

  const now = BigInt(Math.floor(Date.now() / 1000));

  for (const address of markets) {
    const state = await getMarketState(address);

    if (state.resolved) continue;
    if (state.closesAt > now) continue;

    console.log(`[resolver] Market ${address} needs resolution: "${state.question}"`);

    const verdict = await resolveMarket(address, state.question as string);
    console.log(`[resolver] Verdict: ${verdict}`);

    if (verdict === 'SKIP') {
      await logAgentAction('resolver', 'skipped', { address, question: state.question, reason: 'ambiguous_data' });
      continue;
    }

    const outcome: 0 | 1 = verdict === 'YES' ? 0 : 1;
    const data = encodeResolve(outcome);

    try {
      const hash = await sendTransaction(RESOLVER_WALLET_ID, { to: address, data });
      await publicClient.waitForTransactionReceipt({ hash });
      console.log(`[resolver] Resolved ${address} as ${verdict}: ${hash}`);
      await logAgentAction('resolver', 'resolved', { address, question: state.question, outcome: verdict }, hash);
    } catch (err: any) {
      console.error(`[resolver] Failed to resolve ${address}:`, err.message);
      await logAgentAction('resolver', 'resolve_error', { address, error: err.message });
    }
  }

  console.log(`[resolver] Done`);
}

run().catch((err) => {
  console.error('[resolver] Fatal error:', err);
  process.exit(1);
});
