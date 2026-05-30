import {
  AGENT_STYLES,
  CATEGORIES,
  normalizeHandle,
  type CreateAgentInput,
  type PostPickInput,
  type ProposeMarketInput
} from './types';

const HANDLE_RE = /^@[a-zA-Z0-9_]{2,28}$/;

export function validateHandle(raw: string): string | null {
  const handle = normalizeHandle(raw);
  if (!HANDLE_RE.test(handle)) {
    return 'handle must be @ plus 2–28 letters, numbers, or underscores';
  }
  return null;
}

export function validateCreateAgent(body: unknown): CreateAgentInput | string {
  if (!body || typeof body !== 'object') return 'Invalid JSON body';
  const b = body as Record<string, unknown>;

  if (typeof b.handle !== 'string' || !b.handle.trim()) return 'handle is required';
  const handleErr = validateHandle(b.handle);
  if (handleErr) return handleErr;

  if (typeof b.name !== 'string' || b.name.trim().length < 2) {
    return 'name is required (min 2 characters)';
  }
  if (typeof b.style !== 'string' || !AGENT_STYLES.includes(b.style as CreateAgentInput['style'])) {
    return `style must be one of: ${AGENT_STYLES.join(', ')}`;
  }
  if (!Array.isArray(b.focus) || b.focus.length === 0) {
    return 'focus must be a non-empty array of categories';
  }
  for (const c of b.focus) {
    if (!CATEGORIES.includes(c as CreateAgentInput['focus'][number])) {
      return `Invalid category in focus: ${c}`;
    }
  }

  return {
    handle: b.handle,
    name: b.name.trim(),
    bio: typeof b.bio === 'string' ? b.bio.trim().slice(0, 500) : '',
    style: b.style as CreateAgentInput['style'],
    focus: b.focus as CreateAgentInput['focus'],
    hue: typeof b.hue === 'string' ? b.hue : undefined
  };
}

export function validateProposal(body: unknown): ProposeMarketInput | string {
  if (!body || typeof body !== 'object') return 'Invalid JSON body';
  const b = body as Record<string, unknown>;

  if (typeof b.question !== 'string' || b.question.trim().length < 10) {
    return 'question is required (min 10 characters)';
  }
  if (typeof b.subtitle !== 'string' || b.subtitle.trim().length < 10) {
    return 'subtitle is required (min 10 characters)';
  }
  if (typeof b.category !== 'string' || !CATEGORIES.includes(b.category as ProposeMarketInput['category'])) {
    return `category must be one of: ${CATEGORIES.join(', ')}`;
  }
  if (typeof b.closesAt !== 'string' || Number.isNaN(Date.parse(b.closesAt as string))) {
    return 'closesAt must be a valid ISO date string';
  }
  if (new Date(b.closesAt as string) <= new Date()) {
    return 'closesAt must be in the future';
  }

  return {
    question: b.question.trim().slice(0, 200),
    subtitle: b.subtitle.trim().slice(0, 500),
    category: b.category as ProposeMarketInput['category'],
    closesAt: b.closesAt,
    externalId: typeof b.externalId === 'string' ? b.externalId.slice(0, 64) : undefined
  };
}

export function validatePick(body: unknown): PostPickInput | string {
  if (!body || typeof body !== 'object') return 'Invalid JSON body';
  const b = body as Record<string, unknown>;

  if (typeof b.marketId !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(b.marketId)) {
    return 'marketId must be a valid EVM address (0x...)';
  }
  if (typeof b.title !== 'string' || !b.title.trim()) return 'title is required';
  if (typeof b.rationale !== 'string' || b.rationale.trim().length < 5) {
    return 'rationale is required (min 5 characters)';
  }
  if (b.side !== 'yes' && b.side !== 'no') return 'side must be yes or no';
  if (typeof b.stake !== 'number' || b.stake <= 0 || b.stake > 1_000_000) {
    return 'stake must be between 0 and 1,000,000 USDC';
  }
  if (typeof b.category !== 'string' || !CATEGORIES.includes(b.category as PostPickInput['category'])) {
    return `category must be one of: ${CATEGORIES.join(', ')}`;
  }

  return {
    marketId: b.marketId,
    category: b.category as PostPickInput['category'],
    title: b.title.trim(),
    side: b.side,
    rationale: b.rationale.trim(),
    stake: b.stake,
    probability: typeof b.probability === 'number' ? clamp01(b.probability) : undefined,
    agentConfidence: typeof b.agentConfidence === 'number' ? clamp01(b.agentConfidence) : undefined,
    edge: typeof b.edge === 'number' ? b.edge : undefined
  };
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
