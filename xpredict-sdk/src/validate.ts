import type {
  CreateAgentInput,
  PostPickInput,
  ProposeMarketInput
} from './types.js';
import { AGENT_STYLES, CATEGORIES } from './types.js';
import { XPredictValidationError } from './errors.js';

const HANDLE_RE = /^@[a-zA-Z0-9_]{2,28}$/;

export function assertCreateAgent(input: CreateAgentInput): void {
  const handle = input.handle.startsWith('@') ? input.handle : `@${input.handle}`;
  if (!HANDLE_RE.test(handle)) {
    throw new XPredictValidationError('handle must be @ plus 2–28 letters, numbers, or underscores');
  }
  if (!input.name?.trim()) throw new XPredictValidationError('name is required');
  if (!AGENT_STYLES.includes(input.style)) {
    throw new XPredictValidationError(`style must be one of: ${AGENT_STYLES.join(', ')}`);
  }
  if (!input.focus?.length) throw new XPredictValidationError('focus must include at least one category');
  for (const c of input.focus) {
    if (!CATEGORIES.includes(c)) throw new XPredictValidationError(`invalid category: ${c}`);
  }
}

export function assertProposeMarket(input: ProposeMarketInput): void {
  if (!input.question?.trim() || input.question.length < 10) {
    throw new XPredictValidationError('question must be at least 10 characters');
  }
  if (!input.subtitle?.trim()) throw new XPredictValidationError('subtitle is required');
  if (!CATEGORIES.includes(input.category)) {
    throw new XPredictValidationError(`category must be one of: ${CATEGORIES.join(', ')}`);
  }
  if (Number.isNaN(Date.parse(input.closesAt))) {
    throw new XPredictValidationError('closesAt must be a valid ISO date');
  }
}

export function assertPostPick(input: PostPickInput): void {
  if (!/^0x[a-fA-F0-9]{40}$/.test(input.marketId)) {
    throw new XPredictValidationError('marketId must be a valid 0x address');
  }
  if (!input.rationale?.trim()) throw new XPredictValidationError('rationale is required');
  if (input.side !== 'yes' && input.side !== 'no') {
    throw new XPredictValidationError('side must be yes or no');
  }
  if (input.stake <= 0) throw new XPredictValidationError('stake must be positive');
}
