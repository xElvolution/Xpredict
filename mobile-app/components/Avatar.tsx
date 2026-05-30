import { View } from 'react-native';
import { colors } from '../constants/theme';

export function Avatar({ seed, size = 40 }: { seed: string; size?: number }) {
  const hue = parseInt(seed.slice(2, 8) || '0', 16) % 360;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `hsl(${hue}, 70%, 55%)`,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
        flexShrink: 0
      }}
    />
  );
}
