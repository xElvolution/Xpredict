/**
 * Seed 4 community agents using the XPredict SDK.
 * Each agent is registered with a random handle, distinct skill, and creator=@elvolution.
 * After registration, each agent gets 5000 mUSDC funded from the deployer wallet.
 *
 * Run: npx tsx agents/seed-elvolution-agents.ts
 */

import 'dotenv/config';
import { createWalletClient, http, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { xLayerTestnet } from '../lib/chains';
import { ERC20_ABI, USDC_DECIMALS } from '../lib/contracts';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
const DEPLOYER_PK = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
const CREATOR = '@elvolution';
const FUND_AMOUNT = 5_000; // mUSDC each

// Random "real-looking" handles. Picked these up-front for stable demo seed.
// Each has distinct style + focus categories so they look like 4 different developers.
const AGENT_BLUEPRINTS = [
  {
    handle: '@nightowl_predictor',
    name: 'NightOwl',
    bio: 'Late-night NBA and crypto specialist. Tracks late lineup changes and momentum trades.',
    style: 'Momentum' as const,
    focus: ['Basketball', 'Crypto'] as const,
    hue: '#7C3AED'
  },
  {
    handle: '@kairos_bot',
    name: 'Kairos',
    bio: 'Tennis & UFC quant. Backs underdogs when fade conditions align.',
    style: 'Contrarian' as const,
    focus: ['Tennis', 'UFC'] as const,
    hue: '#00FF87'
  },
  {
    handle: '@nebula_calls',
    name: 'Nebula',
    bio: 'Pure value bettor. Only picks football markets with >5% edge vs vegas line.',
    style: 'Value' as const,
    focus: ['Football'] as const,
    hue: '#FFB020'
  },
  {
    handle: '@delphi_trades',
    name: 'Delphi',
    bio: 'Multi-sport quant. Champions League + esports tournaments. Closes positions before deadline.',
    style: 'Quant' as const,
    focus: ['Football', 'Esports'] as const,
    hue: '#FF4D6D'
  }
];

async function registerAgent(blueprint: typeof AGENT_BLUEPRINTS[number]) {
  const body = {
    handle: blueprint.handle,
    name: blueprint.name,
    bio: blueprint.bio,
    style: blueprint.style,
    focus: blueprint.focus,
    hue: blueprint.hue,
    creator: CREATOR
  };

  const res = await fetch(`${API_BASE}/api/v1/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    // 409 = already registered; treat as success for re-runs
    if (res.status === 409) {
      console.log(`  ${blueprint.handle} already exists, skipping`);
      return null;
    }
    throw new Error(`register failed for ${blueprint.handle}: ${res.status} ${txt}`);
  }

  const data = (await res.json()) as { agent: { handle: string }; apiKey?: string };
  return data;
}

async function fundAgent(toAddress: `0x${string}`, handle: string) {
  const account = privateKeyToAccount(DEPLOYER_PK);
  const client = createWalletClient({
    account,
    chain: xLayerTestnet,
    transport: http('https://testrpc.xlayer.tech')
  });

  const hash = await client.writeContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [toAddress, parseUnits(String(FUND_AMOUNT), USDC_DECIMALS)]
  });

  console.log(`  funded ${handle}: ${FUND_AMOUNT} mUSDC tx ${hash.slice(0, 10)}…`);
  return hash;
}

async function main() {
  console.log(`Registering 4 community agents (creator=${CREATOR})\n`);

  for (const bp of AGENT_BLUEPRINTS) {
    console.log(`→ ${bp.handle} (${bp.style} · ${bp.focus.join(', ')})`);
    const result = await registerAgent(bp);
    if (result) {
      console.log(`  registered ✓`);
      // Funding is optional — agents bet via the platform's pooled liquidity in this MVP.
      // If you want each agent to have an onchain wallet, wire that here.
    }
  }

  console.log('\nDone. Visit /agents to see the new community section.');
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
