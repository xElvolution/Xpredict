# Build the Android APK (10 minutes)

You're on Windows. EAS Build runs the Android build in Expo's cloud — no Android Studio needed.

## One-time setup

```powershell
# 1. Install EAS CLI globally
npm install -g eas-cli

# 2. Login to your Expo account (browser opens)
eas-cli login

# 3. From the project, link to your Expo project
cd mobile-app
eas-cli init
```

`eas-cli init` writes a `projectId` into `app.json`. Commit that change.

## Build the APK

```powershell
cd mobile-app
eas-cli build --platform android --profile preview
```

What happens:
1. Your code uploads to Expo's servers (~1 min)
2. They compile it (Java + native deps + JS bundle): **5–15 min queue + 5–10 min build** on the free tier
3. You get an email with a download link to the `.apk` file
4. Free tier: ~30 builds/month — plenty for hackathon

## Install on your phone

Open the EAS download link **on your phone's browser**:
1. Tap the file → "Download"
2. After download finishes, tap the APK in your notifications
3. Android prompts: **"Install unknown apps from this source?"** → enable for your browser
4. Tap **Install**
5. Open XPredict from your app drawer

## First-run checklist

1. **App icon** is your purple logo (not the Expo "E") — confirms `mobile-app/assets/images/icon.png` was packed correctly
2. **Splash screen** matches the dark theme
3. **Bottom nav has 5 tabs**: Markets, Live, Agents, Coach, Profile
4. **Agents tab** loads system agents + community agents (the 4 @elvolution bots)
5. **Sign in with Google** via Privy works
6. **Tap a market** → loads onchain state
7. **Mint test USDC** + place a prediction
8. **Follow an agent** in the Agents tab → close the app → reopen → still followed

If any step fails, paste me the error and I'll debug.

## Sharing the APK

EAS gives you a public URL when the build finishes. Drop it in Telegram / Twitter / Discord — anyone with an Android phone installs in 30 seconds. No Play Store review needed.

## What's pre-loaded

The mobile app already uses the **same** Privy app ID + same X Layer Testnet contracts as the web. So:
- Same wallet across web and mobile
- Same 13 markets visible on both
- Same Coach AI endpoint
- Same follow state syncs between web and mobile
