import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAccount, useDisconnect, useWriteContract } from 'wagmi';
import { usePrivy, useLoginWithOAuth } from '@privy-io/expo';
import { Wallet, Trophy, LogOut, ArrowUpRight } from 'lucide-react-native';
import { colors, spacing, radii } from '../../constants/theme';
import { sharedStyles } from '../../constants/styles';
import { useUserPositions, type OnchainPosition } from '../../../lib/use-positions';
import { PREDICTION_MARKET_ABI } from '../../../lib/contracts';

type Tab = 'open' | 'settled' | 'all';

export default function ProfileScreen() {
  const { user, logout } = usePrivy();
  const { address, isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>('open');
  const { positions, isLoading, refetch } = useUserPositions();

  if (!isConnected || !address) return <Disconnected />;

  const open    = positions.filter((p) => !p.resolved);
  const settled = positions.filter((p) => p.resolved);
  const claimable = positions.filter((p) => p.claimable);
  const totalValue = positions.reduce((s, p) => s + p.estimatedValue, 0);

  const visible = tab === 'open' ? open : tab === 'settled' ? settled : positions;

  return (
    <ScrollView style={sharedStyles.container} contentContainerStyle={{ padding: spacing.s4, gap: spacing.s4 }}>
      <View style={sharedStyles.card}>
        <View style={sharedStyles.rowBetween}>
          <View style={[sharedStyles.row, { gap: spacing.s3 }]}>
            <View style={styles.avatar}>
              <Wallet size={24} color={colors.accentBright} />
            </View>
            <View>
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>
                {address.slice(0, 6)}…{address.slice(-4)}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>X Layer Testnet</Text>
            </View>
          </View>
          <Pressable onPress={() => logout()} style={styles.iconBtn}>
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
        <View style={styles.loader}>
          <ActivityIndicator color={colors.accentBright} />
        </View>
      ) : visible.length === 0 ? (
        <View style={[sharedStyles.card, styles.empty]}>
          <Wallet size={32} color={colors.accentBright} />
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: spacing.s3 }}>
            No {tab === 'all' ? '' : tab} positions yet
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: spacing.s2 }}>
            Browse markets and place your first prediction.
          </Text>
        </View>
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

function PositionCard({ p, onClaimed }: { p: OnchainPosition; onClaimed: () => void }) {
  const router = useRouter();
  const { writeContractAsync, isPending } = useWriteContract();

  const handleClaim = async () => {
    try {
      await writeContractAsync({
        address: p.marketAddress,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'claim'
      });
      onClaimed();
      Alert.alert('Claimed', 'Winnings sent to your wallet.');
    } catch (err: any) {
      Alert.alert('Claim failed', err?.shortMessage ?? err?.message ?? 'Unknown error');
    }
  };

  return (
    <Pressable
      onPress={() => router.push(`/market/${p.marketAddress}`)}
      style={[sharedStyles.card, { gap: spacing.s3 }]}
    >
      <Text style={{ color: colors.text, fontSize: 14, fontWeight: '600', lineHeight: 19 }} numberOfLines={2}>
        {p.question}
      </Text>

      <View style={[sharedStyles.row, { gap: spacing.s5 }]}>
        {p.yesShares > 0 && (
          <View>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>YES shares</Text>
            <Text style={{ color: colors.positive, fontFamily: 'JetBrainsMono', fontWeight: '600' }}>
              {p.yesShares.toFixed(2)}
            </Text>
          </View>
        )}
        {p.noShares > 0 && (
          <View>
            <Text style={{ color: colors.textMuted, fontSize: 11 }}>NO shares</Text>
            <Text style={{ color: colors.negative, fontFamily: 'JetBrainsMono', fontWeight: '600' }}>
              {p.noShares.toFixed(2)}
            </Text>
          </View>
        )}
        <View>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>Est. value</Text>
          <Text style={{ color: colors.text, fontFamily: 'JetBrainsMono', fontWeight: '700' }}>
            ${p.estimatedValue.toFixed(2)}
          </Text>
        </View>
      </View>

      {p.claimable && (
        <Pressable
          onPress={handleClaim}
          disabled={isPending}
          style={[sharedStyles.btnPrimary, { backgroundColor: colors.positive }]}
        >
          <View style={[sharedStyles.row, { gap: spacing.s2 }]}>
            <Trophy size={14} color="#000" />
            <Text style={{ color: '#000', fontWeight: '700' }}>
              {isPending ? 'Claiming…' : 'Claim winnings'}
            </Text>
          </View>
        </Pressable>
      )}
    </Pressable>
  );
}

function Stat({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <View style={[styles.stat, highlight && { backgroundColor: colors.accentSoft }]}>
      <Text style={{ color: colors.textMuted, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 }}>
        {k}
      </Text>
      <Text style={{
        color: highlight ? colors.accentBright : colors.text,
        fontSize: 18,
        fontWeight: '800',
        marginTop: 4,
        fontFamily: 'JetBrainsMono'
      }}>
        {v}
      </Text>
    </View>
  );
}

function Disconnected() {
  const { login } = useLoginWithOAuth();
  return (
    <View style={[sharedStyles.container, styles.center]}>
      <View style={[sharedStyles.card, { alignItems: 'center', maxWidth: 360, gap: spacing.s4 }]}>
        <View style={styles.avatar}>
          <Wallet size={28} color={colors.accentBright} />
        </View>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '700', textAlign: 'center' }}>
          Sign in to view your profile
        </Text>
        <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 13 }}>
          Your positions, P&amp;L, and claimable winnings live onchain.
        </Text>
        <Pressable
          onPress={() => login({ provider: 'google' })}
          style={[sharedStyles.btnPrimary, { width: '100%' }]}
        >
          <Text style={sharedStyles.btnPrimaryText}>Sign in with Google</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.accentRing,
    alignItems: 'center',
    justifyContent: 'center'
  },
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
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.s3
  },
  stat: {
    flex: 1,
    padding: spacing.s4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card
  },
  tab: {
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.s2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong
  },
  tabText: {
    color: colors.textDim,
    fontSize: 12,
    fontWeight: '600'
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.s8
  },
  loader: {
    paddingVertical: spacing.s10,
    alignItems: 'center'
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.s5
  }
});
