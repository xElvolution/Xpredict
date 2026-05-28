/**
 * Onchain contract bindings — addresses + ABIs used by the frontend.
 * Replace addresses with the live deployment after `forge create`.
 */

export const ADDRESSES = {
  USDC:    '0x74b7F16337b8972027F6196A17a631aC6dE26d22' as const, // X Layer USDC
  FACTORY: '0x0000000000000000000000000000000000000000' as const, // set after deploy
} as const;

export const PREDICTION_MARKET_ABI = [
  { type: 'function', name: 'question',     stateMutability: 'view',
    inputs: [], outputs: [{ type: 'string' }] },
  { type: 'function', name: 'closesAt',     stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'priceYes',     stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'priceNo',      stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'yesReserves',  stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'noReserves',   stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'sharesOf',     stateMutability: 'view',
    inputs: [{ type: 'uint8' }, { type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'resolved',     stateMutability: 'view',
    inputs: [], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'finalized',    stateMutability: 'view',
    inputs: [], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'winningOutcome', stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint8' }] },

  { type: 'function', name: 'mintSet',      stateMutability: 'nonpayable',
    inputs: [{ type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'burnSet',      stateMutability: 'nonpayable',
    inputs: [{ type: 'uint256' }], outputs: [] },
  { type: 'function', name: 'buy',          stateMutability: 'nonpayable',
    inputs: [{ type: 'uint8' }, { type: 'uint256' }, { type: 'uint256' }],
    outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'sell',         stateMutability: 'nonpayable',
    inputs: [{ type: 'uint8' }, { type: 'uint256' }, { type: 'uint256' }],
    outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'claim',        stateMutability: 'nonpayable',
    inputs: [], outputs: [{ type: 'uint256' }] }
] as const;

export const FACTORY_ABI = [
  { type: 'function', name: 'createMarket', stateMutability: 'nonpayable',
    inputs: [{ type: 'string' }, { type: 'uint256' }, { type: 'address' }],
    outputs: [{ type: 'address' }] },
  { type: 'function', name: 'marketsLength', stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'markets',       stateMutability: 'view',
    inputs: [{ type: 'uint256' }], outputs: [{ type: 'address' }] }
] as const;

export const ERC20_ABI = [
  { type: 'function', name: 'balanceOf',   stateMutability: 'view',
    inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'allowance',   stateMutability: 'view',
    inputs: [{ type: 'address' }, { type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'approve',     stateMutability: 'nonpayable',
    inputs: [{ type: 'address' }, { type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'decimals',    stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint8' }] }
] as const;
