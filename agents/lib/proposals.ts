/**
 * Processes pending market proposals from the SDK queue.
 * Called by the Curator agent after (or instead of) auto-drafting.
 */

import { parseUnits } from 'viem';
import { chat } from './openai';
import { sendTransaction } from './privy';
import {
  encodeApprove,
  encodeCreateMarket,
  encodeSeedLiquidity,
  publicClient
} from './chain';
import { logAgentAction, upsertMarketMeta } from './db';
import { listProposals, updateProposalStatus } from '../../lib/sdk/db';
import { USDC_DECIMALS } from '../../lib/contracts';

const FACTORY = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;
const USDC = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`;
const CURATOR_WALLET_ID = process.env.PRIVY_CURATOR_WALLET_ID!;
const RESOLVER_ADDRESS = process.env.RESOLVER_ADDRESS as `0x${string}`;
const SEED_LIQUIDITY_USDC = 500;

const REVIEW_PROMPT = `You are a prediction market quality reviewer. Given a proposed Yes/No market, decide if it should go live.

Rules:
- Question must be objectively resolvable with a clear YES or NO outcome
- Must not be duplicate, vague, or offensive
- closesAt must be reasonable (event should happen before close)

Respond ONLY with JSON: { "decision": "approve" | "reject", "reason": "short explanation" }`;

async function deployApprovedMarket(
  question: string,
  closesAt: Date,
  meta: { category: string; subtitle: string; agent_handle: string; external_id: string | null }
): Promise<`0x${string}`> {
  const closesAtUnix = BigInt(Math.floor(closesAt.getTime() / 1000));

  const createData = encodeCreateMarket(question, closesAtUnix, RESOLVER_ADDRESS);
  const createHash = await sendTransaction(CURATOR_WALLET_ID, {
    to: FACTORY,
    data: createData
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: createHash });
  const marketCreatedLog = receipt.logs[receipt.logs.length - 1];
  const marketAddress = `0x${marketCreatedLog.topics[1]?.slice(26)}` as `0x${string}`;

  const seedAmount = parseUnits(String(SEED_LIQUIDITY_USDC), USDC_DECIMALS);
  const approveData = encodeApprove(marketAddress, seedAmount);
  const approveHash = await sendTransaction(CURATOR_WALLET_ID, {
    to: USDC,
    data: approveData
  });
  await publicClient.waitForTransactionReceipt({ hash: approveHash });

  const seedData = encodeSeedLiquidity(seedAmount);
  const seedHash = await sendTransaction(CURATOR_WALLET_ID, {
    to: marketAddress,
    data: seedData
  });
  await publicClient.waitForTransactionReceipt({ hash: seedHash });

  await upsertMarketMeta({
    address: marketAddress,
    category: meta.category,
    subtitle: meta.subtitle,
    agent_handle: meta.agent_handle,
    external_id: meta.external_id,
    trending: false,
    hidden: false
  });

  return marketAddress;
}

export async function processPendingProposals(): Promise<number> {
  const pending = await listProposals({ status: 'pending' });
  if (pending.length === 0) {
    console.log('[proposals] No pending proposals');
    return 0;
  }

  console.log(`[proposals] Reviewing ${pending.length} pending proposal(s)`);
  let processed = 0;

  for (const proposal of pending) {
    try {
      const reviewInput = JSON.stringify({
        question: proposal.question,
        subtitle: proposal.subtitle,
        category: proposal.category,
        closes_at: proposal.closes_at,
        agent: proposal.agent_handle
      });

      const raw = await chat(REVIEW_PROMPT, reviewInput);
      let decision: { decision: string; reason: string };
      try {
        decision = JSON.parse(raw);
      } catch {
        console.error('[proposals] Failed to parse review:', raw);
        await updateProposalStatus(proposal.id, 'rejected', {
          reject_reason: 'Curator could not parse review response'
        });
        processed++;
        continue;
      }

      if (decision.decision !== 'approve') {
        await updateProposalStatus(proposal.id, 'rejected', {
          reject_reason: decision.reason ?? 'Did not meet quality bar'
        });
        await logAgentAction('curator', 'proposal_rejected', {
          proposalId: proposal.id,
          question: proposal.question,
          reason: decision.reason
        });
        console.log(`[proposals] Rejected: "${proposal.question}" — ${decision.reason}`);
        processed++;
        continue;
      }

      const marketAddress = await deployApprovedMarket(
        proposal.question,
        new Date(proposal.closes_at),
        {
          category: proposal.category,
          subtitle: proposal.subtitle,
          agent_handle: proposal.agent_handle,
          external_id: proposal.external_id
        }
      );

      await updateProposalStatus(proposal.id, 'approved', { market_address: marketAddress });
      await logAgentAction(
        'curator',
        'proposal_approved',
        {
          proposalId: proposal.id,
          question: proposal.question,
          agent: proposal.agent_handle,
          address: marketAddress
        },
        undefined
      );

      console.log(`[proposals] Approved: "${proposal.question}" → ${marketAddress}`);
      processed++;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[proposals] Error processing ${proposal.id}:`, message);
      await logAgentAction('curator', 'proposal_error', { proposalId: proposal.id, error: message });
    }
  }

  return processed;
}
