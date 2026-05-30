# XPredict Deployment Guide

End-to-end setup for the XPredict autonomous prediction protocol.

## Stack overview

```
┌──────────────────────┐
│  Next.js (Vercel)    │  user-facing site, API routes, Privy auth
└──────────┬───────────┘
           │ reads/writes
┌──────────▼───────────┐
│  X Layer Testnet     │  PredictionMarket contracts, USDC settlement
└──────────▲───────────┘
           │ signs txs
┌──────────┴───────────┐
│  VPS (Linux)         │  Curator + Resolver agents, Postgres
└──────────────────────┘
```

## 1. Prerequisites

You will need:
- **Privy account** (https://dashboard.privy.io) — App ID + App Secret + 2 server wallets
- **OpenAI API key** (https://platform.openai.com/api-keys)
- **Tavily API key** (https://tavily.com)
- **X Layer Testnet OKB** in your deployer + curator + resolver wallets (faucet: https://www.okx.com/xlayer/faucet)
- **Linux VPS** (Ubuntu/Debian recommended, Node 20+, Postgres 14+)
- **Foundry** locally for contract deployment (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)

## 2. Privy setup

1. Create app at https://dashboard.privy.io
2. Settings → API Keys → copy App ID + App Secret
3. User Management → Server Wallets → create two wallets:
   - `xpredict-curator` (creates markets)
   - `xpredict-resolver` (resolves markets)
4. Note each wallet's ID and address
5. Fund both addresses with X Layer Testnet OKB (faucet)

## 3. Contract deployment

```bash
cd contracts
forge install foundry-rs/forge-std --no-commit

# Set deploy env vars
export DEPLOYER_PRIVATE_KEY=0x...   # your deployer wallet
export CURATOR_ADDRESS=0x...        # Privy curator wallet address
export RESOLVER_ADDRESS=0x...       # Privy resolver wallet address
export TREASURY_ADDRESS=0x...       # treasury (can be deployer)

forge script script/Deploy.s.sol:Deploy \
  --rpc-url xlayer_testnet \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast
```

The script prints `NEXT_PUBLIC_USDC_ADDRESS` and `NEXT_PUBLIC_FACTORY_ADDRESS` at the end. Copy those into your `.env.local` and into the VPS `.env`.

## 4. VPS setup (Ubuntu/Debian)

```bash
# 4a. Install Node, Postgres, pm2
sudo apt update
sudo apt install -y nodejs npm postgresql postgresql-contrib
sudo npm install -g pm2

# 4b. Create database
sudo -u postgres psql <<EOF
CREATE USER xpredict WITH PASSWORD 'change-this-password';
CREATE DATABASE xpredict OWNER xpredict;
GRANT ALL PRIVILEGES ON DATABASE xpredict TO xpredict;
EOF

# 4c. Clone repo + install
git clone https://github.com/xElvolution/Xpredict.git
cd Xpredict
npm install

# 4d. Create .env (copy from .env.example, fill in real values)
cp .env.example .env
nano .env

# 4e. Run agents under pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup    # follow the printed instructions to enable autostart
```

## 5. Cron schedule

The agents are designed to be invoked on a schedule. Either use pm2's built-in cron mode (in `ecosystem.config.js` below) OR system cron:

```cron
# /etc/cron.d/xpredict-agents
*/30 * * * * xpredict cd /home/xpredict/Xpredict && /usr/bin/npx tsx agents/curator.ts >> /var/log/curator.log 2>&1
*/15 * * * * xpredict cd /home/xpredict/Xpredict && /usr/bin/npx tsx agents/resolver.ts >> /var/log/resolver.log 2>&1
```

## 6. Frontend deployment (Vercel)

1. Import repo into Vercel
2. Set environment variables (everything from `.env.example` except `DEPLOYER_PRIVATE_KEY`):
   - `NEXT_PUBLIC_PRIVY_APP_ID`
   - `NEXT_PUBLIC_USDC_ADDRESS`
   - `NEXT_PUBLIC_FACTORY_ADDRESS`
   - `OPENAI_API_KEY` (for `/api/coach`)
   - `DATABASE_URL` (Vercel needs network access to your VPS Postgres — open port 5432 with firewall rules, or use Vercel KV / Neon as an alternative store synced from the VPS)
3. Deploy

## 7. Logs and monitoring

```bash
# Watch agent logs
pm2 logs curator
pm2 logs resolver

# Inspect DB activity
sudo -u postgres psql xpredict -c "SELECT * FROM agent_log ORDER BY created_at DESC LIMIT 20;"

# Check market count
sudo -u postgres psql xpredict -c "SELECT COUNT(*) FROM market_meta;"
```

## 8. Troubleshooting

**Agents not signing transactions**: Verify Privy wallet IDs are correct and wallets are funded with OKB.

**`forge script` fails**: Ensure `forge-std` is installed (`forge install foundry-rs/forge-std`).

**Frontend shows no markets**: The factory has zero markets at first. Either run `npx tsx agents/curator.ts` manually once, or use `/create` page (only the curator wallet can call it — for testing, temporarily whitelist your personal wallet via `factory.setCurator(yourAddr, true)` from the admin).

**Markets won't resolve**: The resolver only acts on markets past `closesAt`. For testing, deploy a market with a 1-minute `closesAt` so it's resolvable immediately.
