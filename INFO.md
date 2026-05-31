# XPredict: Where to get every env value

This is the only doc you need to set up XPredict. Each section tells you:
**what to sign up for, what to copy, where to paste it.**

You'll fill values into three files (created from the `.env.example` files):
- `.env.local` (web app, project root)
- `.env` (agents, project root, same file as web)
- `mobile-app/.env` (Android app)

If a value belongs in multiple files, copy it to all of them.

---

## 1. Privy (wallet + login)

**What it does:** Handles user login (email, Google, X, injected wallets) and creates an embedded EVM wallet for users who don't have one. The same App ID is used by web AND mobile so a user logs in once everywhere. It also signs transactions for the Curator + Resolver agents via server-side wallets.

### Steps
1. Go to https://dashboard.privy.io
2. Sign in with your email or Google
3. Click **Create app** → name it `XPredict`
4. After creation, go to **Settings → API Keys**:
   - Copy **App ID** (looks like `clxxxxxxxx0000xxxxxxxx`)
   - Copy **App Secret** (only shown once, save it now)
5. Go to **Settings → Allowed origins** and add:
   - `http://localhost:3000`
   - Your Vercel URL (e.g. `https://xpredict-nu.vercel.app`)
   - `xpredict://` (mobile app deep link)
6. Go to **User Management → Server Wallets**:
   - Click **Create wallet** → name `xpredict-curator` → chain `ethereum` → save
   - Click **Create wallet** again → name `xpredict-resolver` → chain `ethereum` → save
   - For each wallet, copy its **Wallet ID** (looks like `ethereum:xxx-xxx-xxx`) AND **Address** (`0x...`)
7. Go to **Settings → Mobile (Expo)**:
   - Copy **Client ID** (different from App ID, used only by the mobile app)

### Where to put the values

| Variable | Goes in | Value |
|---|---|---|
| `PRIVY_APP_ID` | `.env.local` + `.env` | App ID |
| `NEXT_PUBLIC_PRIVY_APP_ID` | `.env.local` | App ID (same value) |
| `PRIVY_APP_SECRET` | `.env` | App Secret |
| `PRIVY_CURATOR_WALLET_ID` | `.env` | Curator wallet ID (`ethereum:xxx`) |
| `PRIVY_RESOLVER_WALLET_ID` | `.env` | Resolver wallet ID (`ethereum:xxx`) |
| `CURATOR_ADDRESS` | Foundry deploy only | Curator wallet `0x...` (from step 1.6) |
| `RESOLVER_ADDRESS` | `.env` + Foundry deploy | Resolver wallet `0x...` (from step 1.6; keep in `.env` after deploy) |
| `EXPO_PUBLIC_PRIVY_APP_ID` | `mobile-app/.env` | App ID (same value) |
| `EXPO_PUBLIC_PRIVY_CLIENT_ID` | `mobile-app/.env` | Mobile Client ID |

---

## 2. OpenAI (Curator + Resolver + Coach AI)

**What it does:** Powers the three AI agents. Curator drafts market questions. Resolver interprets settlement data. Coach answers user questions in chat.

### Steps
1. Go to https://platform.openai.com/api-keys
2. Sign in (or sign up — you'll need a credit card for usage-based billing)
3. Click **Create new secret key** → name `XPredict` → copy the key (starts with `sk-`)
4. Add at least **$5 of credit** at https://platform.openai.com/settings/organization/billing/overview
   - Hackathon usage will be ~$1-3/month at this scale

### Where to put it

| Variable | Goes in | Value |
|---|---|---|
| `OPENAI_API_KEY` | `.env` | The `sk-...` key |

---

## 3. Tavily (web search for Curator agent)

**What it does:** When the Curator agent decides what new market to draft, it searches the web for upcoming events ("UFC fights this weekend", "Champions League fixtures next week"). Tavily returns clean structured results.

### Steps
1. Go to https://tavily.com
2. Sign in with Google
3. From the dashboard, copy your **API key** (starts with `tvly-`)
4. Free tier gives 1,000 searches/month — plenty

### Where to put it

| Variable | Goes in | Value |
|---|---|---|
| `TAVILY_API_KEY` | `.env` | The `tvly-...` key |

---

## 4. X Layer Testnet OKB (gas for transactions)

**What it does:** Gas to deploy contracts and run agents. Agents need OKB to pay for `createMarket`, `seedLiquidity`, `resolve` transactions.

### Steps
1. Go to https://www.okx.com/xlayer/faucet
2. Connect your wallet OR paste an address manually
3. Faucet each of these addresses with OKB:
   - **Your deployer wallet** (whichever wallet you'll use to run `forge script`) → 0.05 OKB
   - **Privy curator wallet address** (from step 1.6) → 0.1 OKB
   - **Privy resolver wallet address** (from step 1.6) → 0.05 OKB
4. May need to wait 24h between faucet requests if hitting limits

### Where to put values

| Variable | Goes in | Value |
|---|---|---|
| `DEPLOYER_PRIVATE_KEY` | shell env when running Foundry | private key of your deployer wallet |

The other two addresses are only used by the running agents and were already configured in section 1.

---

## 5. PostgreSQL (offchain metadata + agent logs)

**What it does:** Stores market metadata (category, subtitle, agent handle) and agent activity logs. Onchain stores only the question + closesAt; everything else lives here.

### Option A: Local for development
```bash
# Windows: install via https://www.postgresql.org/download/windows/
# Then create the database:
psql -U postgres -c "CREATE USER xpredict WITH PASSWORD 'changeme';"
psql -U postgres -c "CREATE DATABASE xpredict OWNER xpredict;"
```
DATABASE_URL becomes: `postgres://xpredict:changeme@localhost:5432/xpredict`

### Option B: Free hosted (recommended, works in production)
1. Go to https://neon.tech (or supabase.com / railway.app)
2. Sign up with GitHub
3. Create project named `xpredict`
4. Copy the **connection string** (includes user, password, host, db)

### Where to put it

| Variable | Goes in | Value |
|---|---|---|
| `DATABASE_URL` | `.env` | Full Postgres connection string |

---

## 6. Foundry (deploy contracts)

**What it does:** Compiles + deploys the Solidity contracts to X Layer Testnet.

### Steps (Windows)
```powershell
# Install Foundry (one-time)
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Verify
forge --version

# Install forge-std (one-time, in contracts/ folder)
cd contracts
forge install foundry-rs/forge-std --no-commit
```

If `curl` doesn't work in PowerShell, use Git Bash or WSL for the install step. Once installed, `forge` works in any terminal.

### Agent vs treasury addresses

These are easy to mix up — they serve different roles:

| Address | Source | Purpose |
|---|---|---|
| `CURATOR_ADDRESS` | Privy `xpredict-curator` wallet | Agent that creates markets (whitelisted at deploy) |
| `RESOLVER_ADDRESS` | Privy `xpredict-resolver` wallet | Agent that settles markets (whitelisted at deploy; also stays in `.env`) |
| `TREASURY_ADDRESS` | Any wallet you control | Where protocol trading fees go — **not** an agent wallet (deployer is fine) |

### How to deploy
```powershell
# Set deploy env vars (do not commit these)
$env:DEPLOYER_PRIVATE_KEY = "0x..."
$env:CURATOR_ADDRESS  = "0x..."   # Privy xpredict-curator (step 1.6)
$env:RESOLVER_ADDRESS = "0x..."   # Privy xpredict-resolver (step 1.6)
$env:TREASURY_ADDRESS = "0x..."   # your deployer wallet or any address you control

cd contracts
forge script script/Deploy.s.sol:Deploy --rpc-url xlayer_testnet --private-key $env:DEPLOYER_PRIVATE_KEY --broadcast
```

The script prints `NEXT_PUBLIC_USDC_ADDRESS` and `NEXT_PUBLIC_FACTORY_ADDRESS` at the end. Copy them into your env files. Keep `RESOLVER_ADDRESS` in `.env` — the Curator agent needs it when creating markets. You do **not** need `CURATOR_ADDRESS` or `TREASURY_ADDRESS` in `.env` after deploy unless you redeploy.

### Where to put values

| Variable | Goes in | Value |
|---|---|---|
| `NEXT_PUBLIC_FACTORY_ADDRESS` | `.env.local` + `.env` + `mobile-app/.env` | from Foundry output |
| `NEXT_PUBLIC_USDC_ADDRESS` | `.env.local` + `.env` + `mobile-app/.env` | from Foundry output |
| `EXPO_PUBLIC_FACTORY_ADDRESS` | `mobile-app/.env` | same as `NEXT_PUBLIC_FACTORY_ADDRESS` |
| `EXPO_PUBLIC_USDC_ADDRESS` | `mobile-app/.env` | same as `NEXT_PUBLIC_USDC_ADDRESS` |

---

## 7. Expo / EAS (Android builds, no Mac needed)

**What it does:** Cloud builds your Android APK so you can install it on a phone. Works fully from Windows.

### Steps
1. Go to https://expo.dev → sign up with GitHub or email
2. Install the CLI:
   ```powershell
   npm install -g eas-cli
   eas-cli login
   ```
3. From `mobile-app/` folder:
   ```powershell
   cd mobile-app
   eas-cli init
   ```
   This writes a `projectId` into `app.json`. No env var needed.

### Build an APK
```powershell
eas-cli build --platform android --profile preview
```
Free tier gives ~30 builds/month. Each build takes 15-30 min in queue. EAS emails you when done with a download link.

---

## 8. Vercel (web deploy, optional but recommended)

**What it does:** Hosts the Next.js web app at a real URL so the mobile app can hit `/api/coach` and `/api/markets-meta`.

### Steps
1. Go to https://vercel.com → sign in with GitHub
2. **Import** your XPredict repo
3. Add environment variables (everything in `.env.local`, plus `OPENAI_API_KEY` and `DATABASE_URL` from `.env`):
   - `NEXT_PUBLIC_PRIVY_APP_ID`
   - `NEXT_PUBLIC_FACTORY_ADDRESS`
   - `NEXT_PUBLIC_USDC_ADDRESS`
   - `OPENAI_API_KEY`
   - `DATABASE_URL`
4. Deploy → copy the URL (looks like `https://xpredict-nu.vercel.app`)

### Where to put it

| Variable | Goes in | Value |
|---|---|---|
| `EXPO_PUBLIC_API_BASE_URL` | `mobile-app/.env` | Your Vercel URL |

---

## Quick checklist (copy-paste)

When you have everything, the three .env files should look like this:

### `.env.local` (web, project root)
```
NEXT_PUBLIC_PRIVY_APP_ID=clxxxxxxxx
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
```

### `.env` (agents, project root)
```
PRIVY_APP_ID=clxxxxxxxx
PRIVY_APP_SECRET=xxx
PRIVY_CURATOR_WALLET_ID=ethereum:xxx
PRIVY_RESOLVER_WALLET_ID=ethereum:xxx
RESOLVER_ADDRESS=0x...          # Privy xpredict-resolver wallet (not treasury)
OPENAI_API_KEY=sk-xxx
TAVILY_API_KEY=tvly-xxx
DATABASE_URL=postgres://xpredict:pass@host:5432/xpredict
NEXT_PUBLIC_FACTORY_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0x...
# CURATOR_ADDRESS and TREASURY_ADDRESS are deploy-only — not needed here after deploy
```

### `mobile-app/.env` (Android app)
```
EXPO_PUBLIC_PRIVY_APP_ID=clxxxxxxxx
EXPO_PUBLIC_PRIVY_CLIENT_ID=client-xxx
EXPO_PUBLIC_API_BASE_URL=https://xpredict-nu.vercel.app
EXPO_PUBLIC_FACTORY_ADDRESS=0x...
EXPO_PUBLIC_USDC_ADDRESS=0x...
```

---

## Order to do it in

1. Privy app + 2 server wallets (5 min)
2. OpenAI key + $5 credit (3 min)
3. Tavily key (1 min)
4. Postgres on Neon.tech (3 min)
5. X Layer Testnet OKB faucet for 3 addresses (5 min, sometimes wait time)
6. Install Foundry (5 min)
7. Deploy contracts (3 min)
8. Vercel deploy (5 min)
9. Expo signup + EAS init in mobile-app (5 min)
10. Run `npm install` in both root and `mobile-app/`, paste env values, smoke test together

Total: about 35-45 minutes if nothing snags.

When you're ready, ping me and we'll do steps 6-10 together so we catch issues live.
