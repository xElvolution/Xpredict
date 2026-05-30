import { View, Text, StyleSheet, type ViewStyle } from 'react-native';
import { colors, spacing, radii } from '../constants/theme';

type Tone = 'accent' | 'positive' | 'negative' | 'warning' | 'neutral';

const TONE_STYLES: Record<Tone, { bg: string; border: string; text: string }> = {
  accent:   { bg: colors.accentSoft,   border: colors.accentRing,         text: colors.accentBright },
  positive: { bg: colors.positiveSoft, border: 'rgba(0, 255, 135, 0.30)', text: colors.positive },
  negative: { bg: colors.negativeSoft, border: 'rgba(255, 77, 109, 0.30)', text: colors.negative },
  warning:  { bg: 'rgba(255, 176, 32, 0.10)', border: 'rgba(255, 176, 32, 0.30)', text: colors.warning },
  neutral:  { bg: colors.surface, border: colors.border, text: colors.textDim }
};

export function Badge({
  label,
  tone = 'neutral',
  style
}: {
  label: string;
  tone?: Tone;
  style?: ViewStyle;
}) {
  const t = TONE_STYLES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg, borderColor: t.border }, style]}>
      <Text style={[styles.text, { color: t.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.s3,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4
  }
});
