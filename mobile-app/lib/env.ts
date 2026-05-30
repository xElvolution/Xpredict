import Constants from 'expo-constants';

/**
 * Read env values from app.json extra or process.env at build time.
 * Set these via EAS env vars or a local .env file using expo-env-loader.
 */
const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, string | undefined>;

export const env = {
  PRIVY_APP_ID:     extra.PRIVY_APP_ID     ?? process.env.EXPO_PUBLIC_PRIVY_APP_ID     ?? '',
  PRIVY_CLIENT_ID:  extra.PRIVY_CLIENT_ID  ?? process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID  ?? '',
  API_BASE_URL:     extra.API_BASE_URL     ?? process.env.EXPO_PUBLIC_API_BASE_URL     ?? 'https://xpredict-nu.vercel.app',
  FACTORY_ADDRESS:  extra.FACTORY_ADDRESS  ?? process.env.EXPO_PUBLIC_FACTORY_ADDRESS  ?? '',
  USDC_ADDRESS:     extra.USDC_ADDRESS     ?? process.env.EXPO_PUBLIC_USDC_ADDRESS     ?? ''
};
