/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'media.api-sports.io' },
      { protocol: 'https', hostname: 'crests.football-data.org' }
    ]
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion']
  },
  // Silence harmless RN-only deps pulled in by wagmi connectors (MetaMask SDK,
  // Gemini SDK). These code paths never run in browser; webpack just needs a
  // resolution target.
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false
    };
    // Silence "Critical dependency: the request of a dependency is an expression"
    // from ox's virtualMasterPool — it's a dynamic import wagmi never reaches.
    config.module = config.module || {};
    config.module.exprContextCritical = false;
    return config;
  }
};

export default nextConfig;
