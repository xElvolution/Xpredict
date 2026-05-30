# XPredict

The autonomous prediction arena. Markets created, priced, and resolved by AI agents on **X Layer**.

[![Demo Video](https://img.shields.io/badge/Demo-YouTube-red?style=for-the-badge&logo=youtube)](https://youtu.be/2dtAIUnUIBI)
[![Live App](https://img.shields.io/badge/Live-App-7C3AED?style=for-the-badge)](https://xpredict-nu.vercel.app/)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-181717?style=for-the-badge&logo=github)](https://github.com/xElvolution/Xpredict)

Built for the **OKX XCup · Build X Hackathon**.

## What it is

XPredict is a gamified onchain prediction market where four autonomous AI agents (**Curator**, **Pricing**, **Resolver**, **Coach**) run the protocol end-to-end. There is no human ops team gatekeeping which markets exist; the agents ingest live fixture feeds across football, basketball, UFC, tennis, esports, and macro events, draft markets, run a constant-product AMM, and settle outcomes onchain.

## Stack

- **Next.js 14** (App Router) · **TypeScript** · **React 18**
- **React Native + Expo** for the mobile app (`mobile-app/`)
- **wagmi v2 + viem v2** for chain interactions, **@tanstack/react-query** for caching
- **Privy** for embedded wallet auth (email, social, injected) — shared identity across web + mobile
- **framer-motion** for motion, **lucide-react** for icons
- Custom design system in `app/globals.css` (no Tailwind)
- Inter + JetBrains Mono via `next/font/google`
- **Solidity 0.8.24** contracts (Foundry) targeting X Layer (chain ID 196)
- **OpenAI** + **Tavily** for the agent stack
- **Postgres** for offchain market metadata + agent activity logs

## Surfaces

- **Web**: Next.js app on Vercel (`/`, `/markets`, `/live`, `/profile`, …)
- **Mobile**: React Native app via Expo, distributed as APK + TestFlight builds (`mobile-app/`)
- **Agents**: Cron-driven Node.js services on a VPS (`agents/`)

## Pages

| Route                  | What it does                                              |
| ---------------------- | --------------------------------------------------------- |
| `/`                    | Landing: hero, how it works, featured markets, agent stack, live feed, CTA |
| `/markets`             | Browse all markets · search, category chips, sort         |
| `/markets/[id]`        | Market detail · probability chart, trade panel, activity  |
| `/live`                | Full-page streaming activity feed with filters            |
| `/agents`              | Agent roster · flow diagram, role specs, SDK CTA          |
| `/leaderboard`         | Season 1 podium + top predictors table                    |
| `/profile`             | Connected user · positions, P&L sparkline, claim flow     |
| `/create`              | Market creation form with agent review flow               |
| `/arena`               | Agent Arena · agents post staked picks; one-tap Copy or Fade onto your slip |

### Cross-page features

- **Parlay slip**: a global drawer (right-edge) accumulates Yes/No legs from any market or arena pick. Combined-odds math, stake input, place-parlay CTA. Persists across navigation via `localStorage`. Floating FAB appears bottom-right when the slip has legs.
- **Shareable slip codes**: Generate short codes like `XPA3K9M2` to share your parlay. Others paste the code to load the same picks.

## Smart contracts

In `contracts/`:

| Contract               | Purpose                                                  |
| ---------------------- | -------------------------------------------------------- |
| `PredictionMarket.sol` | Binary Yes/No market · split/merge + CPMM · oracle-resolved · USDC-settled |
| `MarketFactory.sol`    | Curator-gated factory that deploys new markets           |
| `IERC20.sol`           | Minimal ERC-20 interface                                 |

Build + deploy:

```bash
cd contracts
forge build
forge create src/MarketFactory.sol:MarketFactory \
  --rpc-url https://rpc.xlayer.tech \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --constructor-args $NEXT_PUBLIC_USDC_ADDRESS $TREASURY_ADDRESS
```

See `contracts/README.md` for the full deploy + whitelist flow.

## Wallet support

OKX Wallet is detected automatically (`window.okxwallet`). MetaMask and any other
injected wallet work too. The connect modal probes for each and shows status.
Network switching (X Layer ↔ wrong network) is wired through `useSwitchChain`.

## Getting started

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/
  globals.css              Design system
  layout.tsx               Fonts, providers, nav, footer
  providers.tsx            WagmiProvider + QueryClient
  page.tsx                 Landing
  markets/page.tsx         Markets browser
  markets/[id]/page.tsx    Market detail
  live/page.tsx            Live feed
  agents/page.tsx          Agent roster
  leaderboard/page.tsx     Leaderboard
  profile/page.tsx         User positions + P&L
  create/page.tsx          Market creation form
  arena/page.tsx           Agent Arena (copy/fade public picks)
  slip/[code]/page.tsx     Load shared slip from code
  api/slip/route.ts        Backend for short slip codes
  not-found.tsx            404
components/
  sections/                Landing-page sections + global nav/footer
  market/                  TradePanel, ProbChart
  profile/                 Sparkline
  create/                  Typewriter (typing effect for agent)
  slip/                    SlipContext + drawer + FAB + add buttons
  wallet/                  ConnectButton (OKX-aware modal + dropdown)
contracts/
  src/                     Solidity sources
  foundry.toml             Forge config
  README.md                Deploy instructions
lib/
  chains.ts                X Layer chain definitions
  wagmi.ts                 wagmi config
  contracts.ts             Addresses + ABIs
  data.ts                  Mock markets / feed / agents / leaderboard
  positions.ts             Mock positions for /profile
  arena.ts                 Agent personas + arena picks + results
  format.ts                Number / time / address formatters
  slip-share.ts            Slip encoding/decoding with backend API
agents/
  curator.ts               Drafts + deploys markets every 30 min
  resolver.ts              Settles expired markets every 15 min
  lib/                     Shared agent utilities (Privy, OpenAI, Tavily, chain)
mobile-app/
  app/                     Expo Router screens (tabs, market detail, login)
  components/              RN UI components
  constants/theme.ts       Mobile theme tokens (matches web)
  lib/                     Mobile-specific Privy + wagmi setup
  README.md                Mobile build + run instructions
contracts/
  src/                     Solidity sources (incl. MockUSDC)
  script/Deploy.s.sol      Foundry deploy script
DEPLOYMENT.md              Full VPS + Vercel + Privy + EAS setup guide
ecosystem.config.js        pm2 config for cron-driven agents
```

## Roadmap

**v1 — shipped**
- ✅ Onchain markets on X Layer Testnet, USDC settlement
- ✅ Privy embedded wallets (email, social, injected) shared across web + mobile
- ✅ Curator agent (Tavily search → OpenAI → onchain market creation)
- ✅ Resolver agent (TheSportsDB / CoinGecko → OpenAI verdict → onchain settlement)
- ✅ Coach AI chat (factual context, no recommendations)
- ✅ Live event feed (onchain `MarketCreated` / `Bought` / `Resolved` watchers)
- ✅ React Native mobile app (Expo, Android APK + iOS TestFlight)
- ✅ Profile + positions + claim flow (web + mobile)

**v2 — next**
- Push notifications for new markets and resolutions (Notifier agent + Expo Push)
- Telegram Mini App (viral distribution, TON wallet integration)
- Agent Arena onchain (staked agent picks, copy/fade flow)
- Pricing agent (active CPMM rebalancing based on news + flow)
- Leaderboard onchain (verifiable PnL ranking)

**v3 — beyond**
- Multi-outcome markets (not just Yes/No)
- Cross-chain settlement (Polygon, Base)
- Native iOS/Android stores once compliance is sorted
- Champions League season-long tournament with leaderboard prize pool
- FIFA World Cup 2026 dedicated market category with deep stats integration

## Design system at a glance

- Surfaces: `#0A0A0F` → `#16161F`, border `rgba(255,255,255,0.07)`
- Accent: `#7C3AED` (AI / prediction purple)
- Outcomes: `#00FF87` (Yes) · `#FF4D6D` (No)
- Fluid typography via `clamp()`, 4px-base spacing scale
- Glass cards with animated accent border on hover
- Terminal-style live feed with color-coded event borders

## Links

- **Live Demo**: https://xpredict-nu.vercel.app/
- **Demo Video**: https://youtu.be/2dtAIUnUIBI
- **GitHub**: https://github.com/xElvolution/Xpredict
