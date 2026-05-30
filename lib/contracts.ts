/**
 * Onchain contract bindings: addresses + ABIs used by the frontend.
 * Addresses come from env vars, set after `forge script Deploy`.
 */

export const ADDRESSES = {
  USDC:    (process.env.NEXT_PUBLIC_USDC_ADDRESS    || '0x0000000000000000000000000000000000000000') as `0x${string}`,
  FACTORY: (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`
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
  { type: 'function', name: 'totalLpShares', stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint256' }] },

  { type: 'function', name: 'seedLiquidity', stateMutability: 'nonpayable',
    inputs: [{ type: 'uint256' }], outputs: [{ type: 'uint256' }] },
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
  { type: 'function', name: 'resolve',      stateMutability: 'nonpayable',
    inputs: [{ type: 'uint8' }], outputs: [] },
  { type: 'function', name: 'finalize',     stateMutability: 'nonpayable',
    inputs: [], outputs: [] },
  { type: 'function', name: 'claim',        stateMutability: 'nonpayable',
    inputs: [], outputs: [{ type: 'uint256' }] },

  // events
  { type: 'event', name: 'Bought',
    inputs: [
      { name: 'buyer',        type: 'address', indexed: true },
      { name: 'outcome',      type: 'uint8',   indexed: false },
      { name: 'collateralIn', type: 'uint256', indexed: false },
      { name: 'sharesOut',    type: 'uint256', indexed: false }
    ]
  },
  { type: 'event', name: 'Sold',
    inputs: [
      { name: 'seller',         type: 'address', indexed: true },
      { name: 'outcome',        type: 'uint8',   indexed: false },
      { name: 'sharesIn',       type: 'uint256', indexed: false },
      { name: 'collateralOut',  type: 'uint256', indexed: false }
    ]
  },
  { type: 'event', name: 'Resolved',
    inputs: [
      { name: 'winningOutcome', type: 'uint8',   indexed: false },
      { name: 'resolver',       type: 'address', indexed: false }
    ]
  },
  { type: 'event', name: 'Claimed',
    inputs: [
      { name: 'account', type: 'address', indexed: true },
      { name: 'payout',  type: 'uint256', indexed: false }
    ]
  }
] as const;

export const FACTORY_ABI = [
  { type: 'function', name: 'createMarket', stateMutability: 'nonpayable',
    inputs: [{ type: 'string' }, { type: 'uint256' }, { type: 'address' }],
    outputs: [{ type: 'address' }] },
  { type: 'function', name: 'marketsLength', stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'markets',       stateMutability: 'view',
    inputs: [{ type: 'uint256' }], outputs: [{ type: 'address' }] },
  { type: 'function', name: 'curators',      stateMutability: 'view',
    inputs: [{ type: 'address' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'resolvers',     stateMutability: 'view',
    inputs: [{ type: 'address' }], outputs: [{ type: 'bool' }] },

  { type: 'event', name: 'MarketCreated',
    inputs: [
      { name: 'market',   type: 'address', indexed: true },
      { name: 'curator',  type: 'address', indexed: true },
      { name: 'question', type: 'string',  indexed: false },
      { name: 'closesAt', type: 'uint256', indexed: false }
    ]
  }
] as const;

export const ERC20_ABI = [
  { type: 'function', name: 'balanceOf',   stateMutability: 'view',
    inputs: [{ type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'allowance',   stateMutability: 'view',
    inputs: [{ type: 'address' }, { type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'approve',     stateMutability: 'nonpayable',
    inputs: [{ type: 'address' }, { type: 'uint256' }], outputs: [{ type: 'bool' }] },
  { type: 'function', name: 'decimals',    stateMutability: 'view',
    inputs: [], outputs: [{ type: 'uint8' }] },
  { type: 'function', name: 'mint',        stateMutability: 'nonpayable',
    inputs: [{ type: 'address' }, { type: 'uint256' }], outputs: [{ type: 'bool' }] }
] as const;

/** USDC has 6 decimals */
export const USDC_DECIMALS = 6;
