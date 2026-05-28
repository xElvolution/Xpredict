# XPredict: Smart Contracts

Onchain prediction market for **X Layer** (zkEVM, chain ID 196). USDC-settled, agent-resolved.

## Contracts

| Contract                  | Purpose                                                                 |
| ------------------------- | ----------------------------------------------------------------------- |
| `PredictionMarket.sol`    | Binary Yes/No market. Mint/redeem outcome shares 1:1 vs collateral. CPMM AMM for liquidity. Oracle-resolved, winners claim 1 USDC per winning share. |
| `MarketFactory.sol`       | Deploys new `PredictionMarket` instances. Restricted to whitelisted curator agents. |
| `interfaces/IERC20.sol`   | Minimal ERC-20 interface for USDC.                                      |

## Mechanics

**Collateral**: USDC (6 decimals on X Layer).

**Outcome tokens**: For every 1 USDC deposited, the user receives 1 YES + 1 NO share. After resolution, the winning share redeems 1:1 for USDC; the losing share is worthless.

**Pricing**: A constant-product AMM (`xY = k`) between YES and NO reserves holds the live price. `priceYes = noReserves / (yesReserves + noReserves)`.

**Resolution**: The whitelisted `resolver` agent calls `resolve(outcome)` once after `closesAt`. A 1-hour dispute window separates resolution from claims (`finalize()`).

**Fees**: 1% of every AMM swap accrues to LPs (the protocol vault on this MVP). The protocol fee is configurable via the factory.

## Deploy

```bash
# from /contracts using foundry
forge build
forge create src/MarketFactory.sol:MarketFactory \
  --rpc-url https://rpc.xlayer.tech \
  --private-key $PK \
  --constructor-args $USDC_ADDRESS $TREASURY_ADDRESS

# then whitelist your curator agent
cast send $FACTORY "setCurator(address,bool)" $CURATOR true --rpc-url ...
```

X Layer USDC: `0x74b7F16337b8972027F6196A17a631aC6dE26d22`

## Frontend integration

ABIs are emitted in `/contracts/out/*.json` after `forge build`. The frontend
expects only the function selectors used by `TradePanel`:

- `buy(uint8 outcome, uint256 collateralIn, uint256 minSharesOut)`
- `sell(uint8 outcome, uint256 sharesIn, uint256 minCollateralOut)`
- `priceYes() view returns (uint256)`: 1e18 fixed point
- `claim() returns (uint256 payout)`

See `lib/contracts.ts` for the typed bindings used by the UI.
