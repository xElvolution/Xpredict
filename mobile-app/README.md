# XPredict Mobile

React Native (Expo) app for XPredict. Shares contract ABIs, chain config, and onchain hooks with the web app via relative imports.

## Quick start (Windows)

```powershell
# 1. Install deps
cd mobile-app
npm install

# 2. Set env vars
copy .env.example .env
# Edit .env with your values

# 3. Run in Expo Go on your phone (no build needed)
npm run start
# Then scan the QR with Expo Go (App Store / Play Store)
```

For most development, **Expo Go on your phone is enough** — no Android Studio, no Xcode, no build process. Save the file, the app reloads instantly.

## Architecture

- **Expo Router** — file-based routing in `app/`, mirroring Next.js App Router conventions
- **Privy + wagmi** — same Privy App ID as the web app, so a user logs in once and the wallet works everywhere
- **Shared lib** — imports from `../lib/contracts.ts`, `../lib/markets-onchain.ts`, etc. via Metro's `watchFolders` (configured in `metro.config.js`)
- **Theme** — same dark cyberpunk palette as the web, ported to React Native StyleSheet in `constants/theme.ts`

## Screens

| Path                          | Purpose                                       |
|-------------------------------|-----------------------------------------------|
| `app/(tabs)/index.tsx`        | Markets list (browse, filter, search)         |
| `app/(tabs)/live.tsx`         | Live onchain event stream                     |
| `app/(tabs)/coach.tsx`        | Coach AI chat (hits web app's /api/coach)     |
| `app/(tabs)/profile.tsx`      | User positions + claim                        |
| `app/market/[address].tsx`    | Market detail + trade panel                   |

## Building APK / IPA via EAS

You're on Windows so you'll use Expo's cloud build service (EAS Build).

```powershell
# 1. Login to Expo
npx eas-cli login

# 2. Initialize project (writes a projectId into app.json)
npx eas-cli init

# 3. Build Android APK (free tier, ~10-30 min queue)
npx eas-cli build --platform android --profile preview

# 4. Build iOS (requires paid Apple Developer account, $99/yr)
npx eas-cli build --platform ios --profile preview
```

EAS gives you a download link when the build finishes. Drop the APK on your phone or share with testers.

For iOS, you can use TestFlight to distribute to up to 10,000 internal testers without App Store review.

## Distribution

- **Hackathon / soft launch**: share the APK link directly. Users install via "Unknown sources" on Android.
- **Beta testing**: Expo's internal distribution + TestFlight for iOS.
- **Public stores**: Play Store + App Store come later, after legal review for prediction-market compliance.

## Push notifications

Push notifications are on the v2 roadmap. The mobile app already runs without them. When ready, we'll add a Notifier agent on the VPS that watches onchain events and sends Expo push notifications to subscribed users.

## Troubleshooting

**`Unable to resolve module`** — Metro is misconfigured. Check `metro.config.js` `watchFolders` includes the workspace root.

**Privy login opens browser but doesn't return** — the app's URL scheme isn't set up. Confirm `app.json` has `"scheme": "xpredict"` and Privy's allowed redirect URIs include `xpredict://`.

**Wagmi error "no transport"** — `wagmi.ts` is missing the chain transport. Currently configured for X Layer Testnet (chain 195) and X Layer Mainnet (chain 196).

**Contract calls fail with "wrong network"** — switch your Privy embedded wallet to X Layer Testnet manually, or the app will warn you.
