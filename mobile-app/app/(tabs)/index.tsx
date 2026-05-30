import { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Clock, TrendingUp } from 'lucide-react-native';
import { colors, spacing, radii } from '../../constants/theme';
import { sharedStyles } from '../../constants/styles';
import { useMarkets } from '../../lib/use-markets';
import type { Market, Category } from '../../../lib/data';

const CATEGORIES: Array<Category | 'All'> = ['All', 'Football', 'Basketball', 'UFC', 'Tennis', 'Esports', 'Crypto'];

export default function MarketsScreen() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Category | 'All'>('All');
  const { markets, isLoading } = useMarkets();

  const filtered = useMemo(() => {
    let list = markets;
    if (cat !== 'All') list = list.filter((m) => m.category === cat);
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter((m) => m.title.toLowerCase().includes(t));
    }
    return list;
  }, [markets, q, cat]);

  return (
    <View style={sharedStyles.container}>
      <View style={styles.searchRow}>
        <Search size={16} color={colors.textMuted} style={{ position: 'absolute', left: spacing.s4 + 4, zIndex: 1 }} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search markets..."
          placeholderTextColor={colors.textMuted}
          style={styles.search}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {CATEGORIES.map((c) => {
          const active = cat === c;
          return (
            <Pressable
              key={c}
              onPress={() => setCat(c)}
              style={[
                styles.chip,
                active && { backgroundColor: colors.accentSoft, borderColor: colors.accentRing }
              ]}
            >
              <Text style={[styles.chipText, active && { color: colors.accentBright }]}>{c}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.accentBright} />
          <Text style={styles.loaderText}>Loading markets from chain...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.loader}>
          <Text style={styles.loaderText}>No markets yet. Curator agent posts new ones every 30 min.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.s4, gap: spacing.s4 }}
          renderItem={({ item }) => (
            <MarketCard market={item} onPress={() => router.push(`/market/${item.id}`)} />
          )}
        />
      )}
    </View>
  );
}

function MarketCard({ market, onPress }: { market: Market; onPress: () => void }) {
  const yes = market.outcomes[0];
  const no  = market.outcomes[1];
  const yesPct = Math.round(yes.probability * 100);
  const noPct  = 100 - yesPct;

  return (
    <Pressable onPress={onPress} style={[sharedStyles.card, styles.card]}>
      <View style={sharedStyles.rowBetween}>
        <View style={[sharedStyles.badge, sharedStyles.badgeAccent]}>
          <Text style={{ color: colors.accentBright, fontSize: 11, fontWeight: '600' }}>
            {market.category}
          </Text>
        </View>
        {market.trending && (
          <View style={[sharedStyles.row, { gap: 4 }]}>
            <TrendingUp size={11} color={colors.warning} />
            <Text style={{ color: colors.warning, fontSize: 11, fontWeight: '600' }}>Trending</Text>
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
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>
          {new Date(market.closesAt).toLocaleDateString()} · ${market.liquidity.toFixed(0)} liquidity
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    position: 'relative',
    paddingHorizontal: spacing.s4,
    paddingTop: spacing.s3,
    paddingBottom: spacing.s2
  },
  search: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.s5 + 16,
    paddingVertical: spacing.s3,
    color: colors.text,
    fontSize: 14
  },
  chipsRow: {
    paddingHorizontal: spacing.s4,
    gap: spacing.s2,
    paddingBottom: spacing.s2
  },
  chip: {
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: 'transparent'
  },
  chipText: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '500'
  },
  card: {
    gap: spacing.s3
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
    marginTop: spacing.s2
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 12
  },
  outcomeRow: {
    flexDirection: 'row',
    gap: spacing.s3,
    marginTop: spacing.s2
  },
  outcome: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.s3,
    borderWidth: 1,
    borderColor: colors.border
  },
  outcomeLabel: {
    color: colors.textFaint,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '600'
  },
  outcomePct: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.s8,
    gap: spacing.s3
  },
  loaderText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center'
  }
});
