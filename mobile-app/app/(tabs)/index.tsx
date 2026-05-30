import { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { colors, spacing, radii } from '../../constants/theme';
import { sharedStyles } from '../../constants/styles';
import { useMarkets } from '../../lib/use-markets';
import { MarketCard } from '../../components/MarketCard';
import { EmptyState, Loader } from '../../components/EmptyState';
import type { Category } from '../../../lib/data';

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
        <Search size={16} color={colors.textMuted} style={styles.searchIcon} />
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
              android_ripple={{ color: 'rgba(255,255,255,0.05)', borderless: false }}
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
        <Loader label="Loading markets from chain..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No markets match"
          body="The Curator agent posts new markets every 30 min."
        />
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

const styles = StyleSheet.create({
  searchRow: {
    position: 'relative',
    paddingHorizontal: spacing.s4,
    paddingTop: spacing.s3,
    paddingBottom: spacing.s2
  },
  searchIcon: {
    position: 'absolute',
    left: spacing.s4 + 4,
    top: 24,
    zIndex: 1
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
  }
});
