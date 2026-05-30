import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Clock, TrendingUp } from 'lucide-react-native';
import { colors, spacing, radii } from '../constants/theme';
import { sharedStyles } from '../constants/styles';
import { Badge } from './Badge';
import type { Market } from '../../lib/data';

export function MarketCard({ market, onPress }: { market: Market; onPress: () => void }) {
  const yes = market.outcomes[0];
  const no  = market.outcomes[1];
  const yesPct = Math.round(yes.probability * 100);
  const noPct  = 100 - yesPct;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
      style={({ pressed }) => [
        sharedStyles.card,
        styles.card,
        pressed && { opacity: 0.85 }
      ]}
    >
      <View style={[sharedStyles.rowBetween, { marginBottom: spacing.s2 }]}>
        <Badge label={market.category} tone="accent" />
        {market.trending && (
          <View style={[sharedStyles.row, { gap: 4 }]}>
            <TrendingUp size={11} color={colors.warning} />
            <Text style={styles.trending}>Trending</Text>
          </View>
        )}
      </View>

      <Text style={styles.title} numberOfLines={2}>{market.title}</Text>
      {market.subtitle ? (
        <Text style={styles.subtitle} numberOfLines={1}>{market.subtitle}</Text>
      ) : null}

      <View style={styles.outcomeRow}>
        <View style={styles.outcome}>
          <Text style={styles.outcomeLabel}>YES</Text>
          <Text style={[styles.outcomePct, { color: colors.positive }]}>{yesPct}¢</Text>
        </View>
        <View style={styles.outcome}>
          <Text style={styles.outcomeLabel}>NO</Text>
          <Text style={[styles.outcomePct, { color: colors.negative }]}>{noPct}¢</Text>
        </View>
      </View>

      <View style={[sharedStyles.row, { gap: spacing.s2, marginTop: spacing.s3 }]}>
        <Clock size={11} color={colors.textMuted} />
        <Text style={styles.foot}>
          {new Date(market.closesAt).toLocaleDateString()} · ${market.liquidity.toFixed(0)} liquidity
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.s2 },
  trending: { color: colors.warning, fontSize: 11, fontWeight: '600' },
  title: { color: colors.text, fontSize: 16, fontWeight: '700', lineHeight: 21, marginTop: spacing.s2 },
  subtitle: { color: colors.textMuted, fontSize: 12 },
  outcomeRow: { flexDirection: 'row', gap: spacing.s3, marginTop: spacing.s2 },
  outcome: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.s3,
    borderWidth: 1,
    borderColor: colors.border
  },
  outcomeLabel: { color: colors.textFaint, fontSize: 10, letterSpacing: 1, fontWeight: '600' },
  outcomePct: { fontSize: 22, fontWeight: '700', marginTop: 4 },
  foot: { color: colors.textMuted, fontSize: 11 }
});
