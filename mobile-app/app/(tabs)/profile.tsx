import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useAccount } from 'wagmi';
import { usePrivy, useLoginWithOAuth } from '@privy-io/expo';
import { Wallet, Trophy, LogOut } from 'lucide-react-native';
import { colors, spacing, radii } from '../../constants/theme';
import { sharedStyles } from '../../constants/styles';
import { useUserPositions } from '../../../lib/use-positions';
import { Avatar } from '../../components/Avatar';
import { PositionCard } from '../../components/PositionCard';
import { EmptyState, Loader } from '../../components/EmptyState';

type Tab = 'open' | 'settled' | 'all';

export default function ProfileScreen() {
  const { user, logout } = usePrivy();
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>('open');
  const { positions, isLoading, refetch } = useUserPositions();

  if (!isConnected || !address) return <Disconnected />;

  const open      = positions.filter((p) => !p.resolved);
  const settled   = positions.filter((p) => p.resolved);
  const claimable = positions.filter((p) => p.claimable);
  const totalValue = positions.reduce((s, p) => s + p.estimatedValue, 0);

  const visible = tab === 'open' ? open : tab === 'settled' ? settled : positions;

  return (
    <ScrollView style={sharedStyles.container} contentContainerStyle={{ padding: spacing.s4, gap: spacing.s4 }}>
      <View style={sharedStyles.card}>
        <View style={sharedStyles.rowBetween}>
          <View style={[sharedStyles.row, { gap: spacing.s3 }]}>
            <Avatar seed={address} size={48} />
            <View>
              <Text style={styles.addr}>
                {address.slice(0, 6)}…{address.slice(-4)}
              </Text>
              <Text style={styles.chain}>X Layer Testnet</Text>
            </View>
          </View>
          <Pressable
            onPress={() => logout()}
            android_ripple={{ color: 'rgba(255,255,255,0.05)', borderless: true, radius: 20 }}
            style={styles.iconBtn}
          >
            <LogOut size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <Stat k="Portfolio" v={`$${totalValue.toFixed(2)}`} />
        <Stat k="Open"      v={String(open.length)} />
        <Stat k="Claimable" v={String(claimable.length)} highlight={claimable.length > 0} />
      </View>

      <View style={[sharedStyles.row, { gap: spacing.s2 }]}>
        {(['open', 'settled', 'all'] as Tab[]).map((t) => {
          const active = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => setTab(t)}
              android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
              style={[styles.tab, active && { backgroundColor: colors.accentSoft, borderColor: colors.accentRing }]}
            >
              <Text style={[styles.tabText, active && { color: colors.accentBright }]}>
                {t === 'open' ? `Open · ${open.length}` : t === 'settled' ? `Settled · ${settled.length}` : `All · ${positions.length}`}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {isLoading ? (
        <Loader />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title={`No ${tab === 'all' ? '' : tab} positions yet`}
          body="Browse markets and place your first prediction."
        />
      ) : (
        <View style={{ gap: spacing.s3 }}>
          {visible.map((p) => (
            <PositionCard key={p.marketAddress} p={p} onClaimed={refetch} />
          ))}
        </View>
      )}
    </ScrollView>
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
        <View style={styles.heroAvatar}>
          <Wallet size={28} color={colors.accentBright} />
        </View>
        <Text style={styles.heroTitle}>Sign in to view your profile</Text>
        <Text style={styles.heroBody}>
          Your positions, P&amp;L, and claimable winnings live onchain.
        </Text>
        <Pressable
          onPress={() => login({ provider: 'google' })}
          android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
          style={[sharedStyles.btnPrimary, { width: '100%' }]}
        >
          <Text style={sharedStyles.btnPrimaryText}>Sign in with Google</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addr: { color: colors.text, fontSize: 16, fontWeight: '700' },
  chain: { color: colors.textMuted, fontSize: 12 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statsGrid: { flexDirection: 'row', gap: spacing.s3 },
  stat: {
    flex: 1,
    padding: spacing.s4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
    fontFamily: 'JetBrainsMono'
  },
  tab: {
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong
  },
  tabText: { color: colors.textDim, fontSize: 12, fontWeight: '600' },
  heroAvatar: {
    width: 64,
    height: 64,
    borderRadius: radii.lg,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentRing,
    alignItems: 'center',
    justifyContent: 'center'
  },
  heroTitle: { color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  heroBody:  { color: colors.textMuted, textAlign: 'center', fontSize: 13 }
});
