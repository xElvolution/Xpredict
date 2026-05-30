/**
 * Polyfills required for wagmi/viem to work inside React Native.
 * Imported at the very top of app/_layout.tsx so it runs before anything else.
 */
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

if (typeof globalThis.Buffer === 'undefined') {
  globalThis.Buffer = Buffer as unknown as typeof globalThis.Buffer;
}
