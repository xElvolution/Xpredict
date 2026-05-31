import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { sharedStyles } from '../constants/styles';
import { fetchOrderBook, type BookLevel } from '../lib/platform-api';

export function OrderBook({
  marketId,
  side,
  midPrice
}: {
  marketId: string;
  side: 'yes' | 'no';
  midPrice: number;
}) {
  const [bids, setBids] = useState<BookLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetchOrderBook(marketId, side)
        .then((d) => { if (!cancelled) setBids(d.orderBook.bids); })
        .catch(() => { if (!cancelled) setBids([]); })
        .finally(() => { if (!cancelled) setLoading(false); });
    load();
    const t = setInterval(load, 8000);
    return () => { cancelled = true; clearInterval(t); };
  }, [marketId, side]);

  const maxQty = Math.max(...bids.map((b) => b.quantity), 1);

  return (
    <View style={{ gap: spacing.s3 }}>
      <View style={sharedStyles.rowBetween}>
        <Text style={styles.label}>Order book · {side.toUpperCase()}</Text>
        <Text style={styles.mid}>Mid {Math.round(midPrice * 100)}¢</Text>
      </View>
      {loading ? (
        <ActivityIndicator color={colors.accentBright} />
      ) : bids.length === 0 ? (
        <Text style={styles.empty}>No limit orders yet. Be the first.</Text>
      ) : (
        bids.map((b) => (
          <View key={b.price} style={[sharedStyles.row, { gap: spacing.s3 }]}>
            <Text style={[styles.price, { color: colors.positive }]}>{Math.round(b.price * 100)}¢</Text>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${(b.quantity / maxQty) * 100}%` }]} />
            </View>
            <Text style={styles.qty}>${b.quantity.toFixed(0)}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11, fontWeight: '600', color: colors.textFaint, letterSpacing: 1, textTransform: 'uppercase' },
  mid: { fontSize: 12, color: colors.textMuted, fontFamily: 'JetBrainsMono' },
  empty: { fontSize: 13, color: colors.textMuted, paddingVertical: spacing.s4 },
  price: { width: 40, fontSize: 13, fontFamily: 'JetBrainsMono' },
  barTrack: { flex: 1, height: 8, backgroundColor: colors.surface, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: colors.positiveSoft, borderRadius: 4 },
  qty: { width: 56, textAlign: 'right', fontSize: 12, color: colors.textDim, fontFamily: 'JetBrainsMono' }
});
