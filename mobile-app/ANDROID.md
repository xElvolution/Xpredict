# Android Build Guide

End-to-end: from clean clone to APK installed on your phone.

## Prerequisites

- **Windows 10/11** (these instructions assume Windows but work on Mac/Linux too)
- **Node 18+** installed (`node --version`)
- **An Expo account** (free, sign up at https://expo.dev)
- **A physical Android phone** OR an Android emulator
- **All env values from `INFO.md`** filled into `mobile-app/.env`

## Step 1: Install dependencies

```powershell
cd mobile-app
npm install
```

If you see peer dependency warnings about React or Expo, that's fine — Expo SDK 52 with React 18.3 is the supported combo.

## Step 2: Test locally with Expo Go (recommended first)

Expo Go is a free app on the Play Store that runs your code without a build step. Save a file, the app reloads. Use this for ~95% of dev work.

```powershell
# From mobile-app/
npm run start
```

A QR code prints in the terminal.

1. Install **Expo Go** from the Google Play Store on your phone
2. Open Expo Go → tap "Scan QR code" → scan the QR
3. The app loads on your phone

If your computer and phone aren't on the same WiFi (common in offices, public WiFi):
```powershell
npm run start -- --tunnel
```
This routes through Expo's server so the QR works anywhere.

## Step 3: Initialize EAS (one-time)

EAS Build compiles your code into a real APK. You need this for: production builds, distributing to testers without Expo Go, App Store / Play Store submission.

```powershell
# Install the EAS CLI globally
npm install -g eas-cli

# Login
eas-cli login

# From mobile-app/, link the project to your Expo account
cd mobile-app
eas-cli init
```

`eas-cli init` writes a `projectId` into `app.json`. Commit that change.

## Step 4: Build the APK

```powershell
eas-cli build --platform android --profile preview
```

What happens:
1. Your code uploads to Expo's build servers
2. They compile it (Java + native deps + your JS bundle) — takes 15-30 min in queue, 5-10 min actual build
3. You get an email with a download link to the `.apk` file
4. Free tier: ~30 builds/month — plenty for hackathon

## Step 5: Install the APK on your phone

The APK file Expo gives you is ~50-80 MB.

### Option A: Direct download
1. Open the EAS download link **on your phone's browser**
2. Tap the file → "Download"
3. After download, tap the APK in your notifications
4. Android will prompt: **"Install unknown apps from this source?"** → enable for your browser
5. Tap **Install**
6. Open XPredict from your app drawer

### Option B: USB transfer
1. Download the APK to your computer
2. Plug your phone in via USB
3. Copy the APK to your phone's Downloads folder
4. On the phone, open the file manager → Downloads → tap the APK → Install

### Option C: Share via link/QR
EAS gives you a shareable URL. Send it to anyone who needs to test — they install the same way.

## Step 6: First-run smoke test

Once installed, verify the core flow works:

1. **Open the app** → splash screen → markets list loads (or empty state if no markets exist yet)
2. **Tap Profile tab** → "Sign in with Google" button → tap it → Privy login flow opens in browser → complete login → you're returned to the app, signed in
3. **Tap Markets tab** → if Curator has run, you see real markets from chain. If empty, you can run `npx tsx agents/curator.ts` from the project root to create one
4. **Tap a market** → market detail opens, shows real onchain odds
5. **Tap Mint 1000 test USDC** → confirms transaction → balance updates
6. **Enter $10, tap Approve & predict** → two transactions (approve + buy) → onchain
7. **Tap Profile tab** → you see your new YES position with shares

If any step fails, check Expo's logs in the terminal that's running `npm run start`.

## Common issues

**"Network request failed"** — Privy or your API base URL is wrong. Double-check `EXPO_PUBLIC_API_BASE_URL` in `mobile-app/.env` points at your live Vercel deployment.

**Build fails with "shared lib not found"** — Metro can't find imports from `../lib/`. Verify `metro.config.js` in `mobile-app/` has the `watchFolders` set. If EAS Build can't follow symlinks/relative imports across the workspace, the workaround is to copy the files into `mobile-app/lib/` instead.

**Privy login opens browser but app doesn't return** — Your `xpredict://` deep link isn't registered. Verify `app.json` has `"scheme": "xpredict"` (it does in the current config) AND Privy dashboard's **Allowed Origins** includes `xpredict://`.

**App crashes on launch with "crypto undefined"** — wagmi/viem polyfills aren't loaded. Check that `app/_layout.tsx` starts with `import '../lib/polyfills';` (it does in the current code).

**APK installed but app icon is blank/default** — `assets/images/icon.png` and `assets/images/adaptive-icon.png` are missing. Add 1024x1024 PNGs (transparent background for adaptive).

## Distribution to testers

Easiest way to share the APK with judges or beta users:

1. Build with `--profile preview` (already configured for APK output)
2. Copy the EAS download URL
3. Share the URL on Telegram/Twitter/Discord/email
4. Anyone with an Android phone can install in 30 seconds

For Play Store distribution:
- Build with `--profile production` (outputs `.aab` bundle)
- `eas-cli submit --platform android` (uploads to Play Console)
- This requires a Play Console developer account ($25 one-time)
- App goes through Google's review (1-7 days)

For hackathon, **stick with APK distribution** — you control timing, no review process.

## What's NOT in this build (yet)

These are deferred to v2 and not blocking your launch:

- Push notifications (need a Notifier agent + token registry)
- iOS build (requires Mac OR EAS paid tier; doesn't matter for Android-only launch)
- Parlay slip drawer (single-market betting works; parlays are mobile v2)
- Biometric auth (Privy supports it, just not wired yet)
- Background sync of onchain state when app is closed

These don't affect the demo. The app is feature-complete for the hackathon's purpose: prove that XPredict works end-to-end on Android, with autonomous AI agents creating markets and users trading from their phones.
