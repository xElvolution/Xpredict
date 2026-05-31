import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAccount } from 'wagmi';
import { usePrivy, useLoginWithOAuth } from '@privy-io/expo';
import { Wallet, LogOut, Settings } from 'lucide-react-native';
import { colors, spacing, radii } from '../../constants/theme';
import { sharedStyles } from '../../constants/styles';
import { useUserPositions, type OnchainPosition } from '../../../lib/use-positions';
import { Avatar } from '../../components/Avatar';
import { PositionCard } from '../../components/PositionCard';
import { EmptyState, Loader } from '../../components/EmptyState';
import { PortfolioSparkline } from '../../components/PortfolioSparkline';
import {
  fetchOrders, fetchHistory, fetchFollows, fetchSnapshots,
  cancelLimitOrder, type OrderRow, type TradeRow
} from '../../lib/platform-api';

type Tab = 'positions' | 'orders' | 'history' | 'claims' | 'following';

export default function ProfileScreen() {
  const router = useRouter();
  const { logout } = usePrivy();
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>('positions');
  const { positions, isLoading, refetch } = useUserPositions();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [follows, setFollows] = useState<string[]>([]);
  const [snapshots, setSnapshots] = useState<number[]>([]);
  const [platformLoading, setPlatformLoading] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const loadPlatform = useCallback(() => {
    if (!address) return;
    setPlatformLoading(true);
    Promise.all([
      fetchOrders(address).then((d) => setOrders(d.orders.filter((o) => o.status === 'open' || o.status === 'partial'))),
      fetchHistory(address).then((d) => setTrades(d.trades)),
      fetchFollows(address).then((d) => setFollows(d.agents)),
      fetchSnapshots(address).then((d) => setSnapshots(d.snapshots.map((s) => s.value)))
    ])
      .catch(() => {})
      .finally(() => setPlatformLoading(false));
  }, [address]);

  useEffect(() => { loadPlatform(); }, [loadPlatform]);

  if (!isConnected || !address) return <Disconnected />;

  const open = positions.filter((p) => !p.resolved);
  const claimable = positions.filter((p) => p.claimable);
  const totalValue = positions.reduce((s, p) => s + p.estimatedValue, 0);
  const chartData = snapshots.length > 1 ? snapshots : [totalValue * 0.9, totalValue * 0.95, totalValue];

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      await cancelLimitOrder(id, address);
      loadPlatform();
    } catch (e: unknown) {
      Alert.alert('Cancel failed', e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setCancelling(null);
    }
  };

  return (
    <ScrollView style={sharedStyles.container} contentContainerStyle={{ padding: spacing.s4, gap: spacing.s4 }}>
      <View style={sharedStyles.card}>
        <View style={sharedStyles.rowBetween}>
          <View style={[sharedStyles.row, { gap: spacing.s3 }]}>
            <Avatar seed={address} size={48} />
            <View>
              <Text style={styles.addr}>{address.slice(0, 6)}…{address.slice(-4)}</Text>
              <Text style={styles.chain}>X Layer Testnet</Text>
            </View>
          </View>
          <View style={[sharedStyles.row, { gap: spacing.s2 }]}>
            <Pressable onPress={() => router.push('/settings')} style={styles.iconBtn}>
              <Settings size={16} color={colors.textMuted} />
            </Pressable>
            <Pressable onPress={() => logout()} style={styles.iconBtn}>
              <LogOut size={16} color={colors.textMuted} />
            </Pressable>
          </View>
        </View>
        <View style={{ marginTop: spacing.s4 }}>
          <PortfolioSparkline data={chartData} height={56} />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <Stat k="Portfolio" v={`$${totalValue.toFixed(2)}`} />
        <Stat k="Open" v={String(open.length)} />
        <Stat k="Orders" v={String(orders.length)} />
        <Stat k="Claimable" v={String(claimable.length)} highlight={claimable.length > 0} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.s2 }}>
        <TabBtn id="positions" label={`Positions · ${open.length}`} cur={tab} set={setTab} />
        <TabBtn id="orders" label={`Orders · ${orders.length}`} cur={tab} set={setTab} />
        <TabBtn id="history" label={`History · ${trades.length}`} cur={tab} set={setTab} />
        <TabBtn id="claims" label={`Claims · ${claimable.length}`} cur={tab} set={setTab} />
        <TabBtn id="following" label={`Following · ${follows.length}`} cur={tab} set={setTab} />
      </ScrollView>

      {tab === 'positions' && (
        <PositionsList loading={isLoading} rows={open.length ? open : positions} empty="No open positions." refetch={refetch} />
      )}
      {tab === 'orders' && (
        <OrdersList loading={platformLoading} orders={orders} cancelling={cancelling} onCancel={handleCancel} />
      )}
      {tab === 'history' && (
        <HistoryList loading={platformLoading} trades={trades} />
      )}
      {tab === 'claims' && (
        <PositionsList loading={isLoading} rows={claimable} empty="Nothing to claim." refetch={refetch} claimsOnly />
      )}
      {tab === 'following' && (
        <FollowingList agents={follows} />
      )}
    </ScrollView>
  );
}

function PositionsList({
  loading, rows, empty, refetch, claimsOnly
}: {
  loading: boolean;
  rows: OnchainPosition[];
  empty: string;
  refetch: () => void;
  claimsOnly?: boolean;
}) {
  if (loading) return <Loader />;
  if (rows.length === 0) return <EmptyState icon={Wallet} title={empty} body="Browse markets to place predictions." />;
  return (
    <View style={{ gap: spacing.s3 }}>
      {rows.map((p) => (
        <PositionCard key={p.marketAddress} p={p} onClaimed={refetch} />
      ))}
    </View>
  );
}

function OrdersList({
  loading, orders, cancelling, onCancel
}: {
  loading: boolean;
  orders: OrderRow[];
  cancelling: string | null;
  onCancel: (id: string) => void;
}) {
  if (loading) return <Loader />;
  if (orders.length === 0) {
    return <EmptyState icon={Wallet} title="No open limit orders" body="Post a limit order from any market's Limit tab." />;
  }
  return (
    <View style={{ gap: spacing.s3 }}>
      {orders.map((o) => (
        <View key={o.id} style={[sharedStyles.card, { gap: spacing.s2 }]}>
          <Text style={{ color: colors.text, fontWeight: '700', fontSize: 14 }} numberOfLines={2}>{o.market_title}</Text>
          <View style={sharedStyles.rowBetween}>
            <Text style={styles.meta}>{o.side.toUpperCase()} · {Math.round(o.price * 100)}¢ · ${o.quantity_usdc.toFixed(0)}</Text>
            <Text style={styles.meta}>Filled ${o.filled_usdc.toFixed(0)}</Text>
          </View>
          <Pressable
            onPress={() => onCancel(o.id)}
            disabled={cancelling === o.id}
            style={[styles.cancelBtn, cancelling === o.id && { opacity: 0.5 }]}
          >
            <Text style={{ color: colors.negative, fontSize: 12, fontWeight: '600' }}>
              {cancelling === o.id ? 'Cancelling…' : 'Cancel order'}
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

function HistoryList({ loading, trades }: { loading: boolean; trades: TradeRow[] }) {
  if (loading) return <Loader />;
  if (trades.length === 0) {
    return <EmptyState icon={Wallet} title="No trades yet" body="AMM buys and limit fills appear here." />;
  }
  return (
    <View style={{ gap: spacing.s3 }}>
      {trades.map((t) => (
        <View key={t.id} style={sharedStyles.card}>
          <Text style={{ color: colors.text, fontWeight: '600', fontSize: 14 }}>{t.market_title}</Text>
          <Text style={styles.meta}>
            {t.kind.replace('_', ' ')} · ${t.amount_usdc.toFixed(2)}
            {t.price != null ? ` · ${Math.round(t.price * 100)}¢` : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

function FollowingList({ agents }: { agents: string[] }) {
  if (agents.length === 0) {
    return <EmptyState icon={Wallet} title="Not following anyone" body="Follow agents on web Arena for now." />;
  }
  return (
    <View style={{ gap: spacing.s3 }}>
      {agents.map((a) => (
        <View key={a} style={[sharedStyles.card, sharedStyles.rowBetween]}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>{a}</Text>
        </View>
      ))}
    </View>
  );
}

function TabBtn({ id, label, cur, set }: { id: Tab; label: string; cur: Tab; set: (t: Tab) => void }) {
  const active = cur === id;
  return (
    <Pressable onPress={() => set(id)} style={[styles.tab, active && { backgroundColor: colors.accentSoft, borderColor: colors.accentRing }]}>
      <Text style={[styles.tabText, active && { color: colors.accentBright }]}>{label}</Text>
    </Pressable>
  );
}

function Stat({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <View style={[styles.stat, highlight && { backgroundColor: colors.accentSoft }]}>
      <Text style={styles.statLabel}>{k}</Text>
      <Text style={[styles.statValue, { color: highlight ? colors.accentBright : colors.text }]}>{v}</Text>
    </View>
  );
}

function Disconnected() {
  const { login } = useLoginWithOAuth();
  return (
    <View style={[sharedStyles.container, { alignItems: 'center', justifyContent: 'center', padding: spacing.s5 }]}>
      <View style={[sharedStyles.card, { alignItems: 'center', maxWidth: 360, gap: spacing.s4 }]}>
        <Wallet size={28} color={colors.accentBright} />
        <Text style={styles.heroTitle}>Sign in to view your profile</Text>
        <Pressable onPress={() => login({ provider: 'google' })} style={[sharedStyles.btnPrimary, { width: '100%' }]}>
          <Text style={sharedStyles.btnPrimaryText}>Sign in with Google</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addr: { color: colors.text, fontSize: 16, fontWeight: '700' },
  chain: { color: colors.textMuted, fontSize: 12 },
  meta: { color: colors.textMuted, fontSize: 12, fontFamily: 'JetBrainsMono' },
  iconBtn: {
    width: 36, height: 36, borderRadius: radii.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center'
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.s2 },
  stat: {
    flex: 1, minWidth: '45%', padding: spacing.s3, borderRadius: radii.md,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card
  },
  statLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  statValue: { fontSize: 16, fontWeight: '800', marginTop: 4, fontFamily: 'JetBrainsMono' },
  tab: { paddingHorizontal: spacing.s4, paddingVertical: spacing.s2, borderRadius: radii.pill, borderWidth: 1, borderColor: colors.borderStrong },
  tabText: { color: colors.textDim, fontSize: 12, fontWeight: '600' },
  cancelBtn: { alignSelf: 'flex-start', paddingVertical: spacing.s2 },
  heroTitle: { color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' }
});
