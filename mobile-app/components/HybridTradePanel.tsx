import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../constants/theme';
import { TradePanel } from './TradePanel';
import { LimitOrderPanel } from './LimitOrderPanel';
import { OrderBook } from './OrderBook';

type Mode = 'amm' | 'limit' | 'book';

export function HybridTradePanel({
  marketAddress,
  marketId,
  marketTitle,
  category,
  yesPct,
  noPct,
  resolved
}: {
  marketAddress: `0x${string}`;
  marketId: string;
  marketTitle: string;
  category: string;
  yesPct: number;
  noPct: number;
  resolved: boolean;
}) {
  const [mode, setMode] = useState<Mode>('amm');
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const midPrice = (side === 'yes' ? yesPct : noPct) / 100;

  return (
    <View style={{ gap: spacing.s3 }}>
      <View style={styles.modeRow}>
        {(['amm', 'limit', 'book'] as Mode[]).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMode(m)}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
          >
            <Text style={[styles.modeText, mode === m && styles.modeTextActive]}>
              {m === 'amm' ? 'Instant' : m === 'limit' ? 'Limit' : 'Book'}
            </Text>
          </Pressable>
        ))}
      </View>

      {(mode === 'limit' || mode === 'book') && (
        <View style={[styles.modeRow, { gap: spacing.s2 }]}>
          {(['yes', 'no'] as const).map((s) => (
            <Pressable
              key={s}
              onPress={() => setSide(s)}
              style={[
                styles.sideBtn,
                side === s && { backgroundColor: s === 'yes' ? colors.positiveSoft : colors.negativeSoft }
              ]}
            >
              <Text style={{ color: side === s ? (s === 'yes' ? colors.positive : colors.negative) : colors.textMuted, fontWeight: '700', fontSize: 12 }}>
                {s.toUpperCase()} · {s === 'yes' ? yesPct : noPct}¢
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {mode === 'amm' && (
        <TradePanel
          marketAddress={marketAddress}
          marketId={marketId}
          marketTitle={marketTitle}
          category={category}
          yesPct={yesPct}
          noPct={noPct}
          resolved={resolved}
        />
      )}

      {mode === 'limit' && (
        <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.s4 }}>
          <LimitOrderPanel
            marketId={marketId}
            marketTitle={marketTitle}
            category={category}
            side={side}
            midPrice={midPrice}
          />
        </View>
      )}

      {mode === 'book' && (
        <View style={{ backgroundColor: colors.card, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.s4 }}>
          <OrderBook marketId={marketId} side={side} midPrice={midPrice} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  modeRow: {
    flexDirection: 'row',
    gap: 4,
    padding: 4,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  modeBtn: { flex: 1, paddingVertical: spacing.s2, alignItems: 'center', borderRadius: radii.sm },
  modeBtnActive: { backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.accentRing },
  modeText: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 0.8, textTransform: 'uppercase' },
  modeTextActive: { color: colors.accentBright },
  sideBtn: {
    flex: 1,
    paddingVertical: spacing.s2,
    alignItems: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border
  }
});
