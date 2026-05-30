import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { colors, spacing } from '../../constants/theme';
import { sharedStyles } from '../../constants/styles';
import { useMarketState, toUiMarket } from '../../../lib/markets-onchain';
import { TradePanel } from '../../components/TradePanel';
import { PriceBar } from '../../components/PriceBar';
import { Badge } from '../../components/Badge';
import { Loader } from '../../components/EmptyState';
import { env } from '../../lib/env';

type Meta = { category?: string; subtitle?: string; agent_handle?: string; trending?: boolean };

export default function MarketDetailScreen() {
  const { address: rawAddr } = useLocalSearchParams<{ address: string }>();
  const address = rawAddr as `0x${string}`;
  const isValid = address?.startsWith('0x') && address.length === 42;

  const { state, isLoading } = useMarketState(isValid ? address : undefined);
  const [meta, setMeta] = useState<Meta>({});

  useEffect(() => {
    if (!isValid) return;
    fetch(`${env.API_BASE_URL}/api/markets-meta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses: [address] })
    })
      .then((r) => r.json())
      .then((data) => setMeta(data.meta?.[address.toLowerCase()] ?? {}))
      .catch(() => setMeta({}));
  }, [address]);

  if (!isValid) {
    return (
      <View style={[sharedStyles.container, styles.center]}>
        <Text style={{ color: colors.text }}>Invalid market address</Text>
      </View>
    );
  }

  if (isLoading || !state) {
    return (
      <View style={[sharedStyles.container, styles.center]}>
        <Loader />
      </View>
    );
  }

  const market = toUiMarket(state, meta);
  const yesPct = Math.round(market.outcomes[0].probability * 100);
  const noPct  = 100 - yesPct;

  const closesAtMs = Number(state.closesAt) * 1000;
  const closesIn = closesAtMs - Date.now();
  const closesText = closesIn > 0
    ? `Closes in ${Math.ceil(closesIn / (1000 * 60 * 60 * 24))}d`
    : 'Closed';

  return (
    <>
      <Stack.Screen options={{ title: market.category }} />
      <ScrollView style={sharedStyles.container} contentContainerStyle={{ padding: spacing.s4, gap: spacing.s4 }}>
        <View style={{ gap: spacing.s2 }}>
          <View style={[sharedStyles.row, { gap: spacing.s2, flexWrap: 'wrap', marginBottom: spacing.s2 }]}>
            <Badge label={market.category} tone="accent" />
            {state.resolved ? (
              <Badge label={`Resolved: ${state.winningOutcome === 0 ? 'YES' : 'NO'}`} tone="positive" />
            ) : (
              <View style={[sharedStyles.row, { gap: 4 }]}>
                <Clock size={11} color={colors.textMuted} />
                <Text style={{ color: colors.textMuted, fontSize: 11 }}>{closesText}</Text>
              </View>
            )}
          </View>

          <Text style={styles.title}>{market.title}</Text>
          {market.subtitle ? <Text style={styles.subtitle}>{market.subtitle}</Text> : null}
        </View>

        <View style={[sharedStyles.card, { gap: spacing.s3 }]}>
          <Text style={styles.sectionLabel}>Implied probability</Text>
          <View style={[sharedStyles.row, { gap: spacing.s5 }]}>
            <Probability label="YES" pct={yesPct} color={colors.positive} />
            <Probability label="NO"  pct={noPct}  color={colors.negative} />
          </View>
          <PriceBar yesPct={yesPct} />
        </View>

        <TradePanel
          marketAddress={address}
          yesPct={yesPct}
          noPct={noPct}
          resolved={state.resolved}
        />

        <View style={[sharedStyles.card, { gap: spacing.s3 }]}>
          <Text style={styles.sectionLabel}>Onchain stats</Text>
          <Stat k="YES reserves" v={(Number(state.yesReserves) / 1e6).toFixed(2) + ' USDC'} />
          <Stat k="NO reserves"  v={(Number(state.noReserves) / 1e6).toFixed(2) + ' USDC'} />
          <Stat k="Market addr"  v={`${address.slice(0, 6)}…${address.slice(-4)}`} />
        </View>
      </ScrollView>
    </>
  );
}

function Probability({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <View>
      <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}>{label}</Text>
      <Text style={{ color, fontSize: 28, fontWeight: '800' }}>{pct}%</Text>
    </View>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <View style={sharedStyles.rowBetween}>
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{k}</Text>
      <Text style={{
        color: colors.text, fontSize: 13, fontFamily: 'JetBrainsMono', fontWeight: '600'
      }}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', lineHeight: 28 },
  subtitle: { color: colors.textDim, fontSize: 14, lineHeight: 20 },
  sectionLabel: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  }
});
