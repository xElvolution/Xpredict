import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, Clock, Loader2 } from 'lucide-react-native';
import { parseUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { usePrivy, useLoginWithOAuth } from '@privy-io/expo';
import { colors, spacing, radii } from '../../constants/theme';
import { sharedStyles } from '../../constants/styles';
import { useMarketState, toUiMarket } from '../../../lib/markets-onchain';
import { ADDRESSES, ERC20_ABI, PREDICTION_MARKET_ABI, USDC_DECIMALS } from '../../../lib/contracts';
import { env } from '../../lib/env';

type Meta = { category?: string; subtitle?: string; agent_handle?: string; trending?: boolean };

export default function MarketDetailScreen() {
  const { address: rawAddr } = useLocalSearchParams<{ address: string }>();
  const router = useRouter();
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
        <ActivityIndicator color={colors.accentBright} />
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
        <View style={styles.headerCard}>
          <View style={[sharedStyles.row, { gap: spacing.s2, flexWrap: 'wrap', marginBottom: spacing.s3 }]}>
            <View style={[sharedStyles.badge, sharedStyles.badgeAccent]}>
              <Text style={{ color: colors.accentBright, fontSize: 11, fontWeight: '600' }}>
                {market.category}
              </Text>
            </View>
            {state.resolved ? (
              <View style={[sharedStyles.badge, sharedStyles.badgePositive]}>
                <Text style={{ color: colors.positive, fontSize: 11, fontWeight: '600' }}>
                  Resolved: {state.winningOutcome === 0 ? 'YES' : 'NO'}
                </Text>
              </View>
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
            <View>
              <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}>YES</Text>
              <Text style={{ color: colors.positive, fontSize: 28, fontWeight: '800' }}>{yesPct}%</Text>
            </View>
            <View>
              <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '600' }}>NO</Text>
              <Text style={{ color: colors.negative, fontSize: 28, fontWeight: '800' }}>{noPct}%</Text>
            </View>
          </View>
          <View style={styles.probBar}>
            <View style={[styles.probFillYes, { flex: yesPct }]} />
            <View style={[styles.probFillNo, { flex: noPct }]} />
          </View>
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

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <View style={sharedStyles.rowBetween}>
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{k}</Text>
      <Text style={{ color: colors.text, fontSize: 13, fontFamily: 'JetBrainsMono', fontWeight: '600' }}>{v}</Text>
    </View>
  );
}

function TradePanel({
  marketAddress,
  yesPct,
  noPct,
  resolved
}: {
  marketAddress: `0x${string}`;
  yesPct: number;
  noPct: number;
  resolved: boolean;
}) {
  const [side, setSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('25');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { user, isReady } = usePrivy();
  const { login } = useLoginWithOAuth();
  const { address: userAddr, isConnected } = useAccount();

  const numericAmount = Math.max(0, Number(amount) || 0);
  const amountWei = numericAmount > 0 ? parseUnits(amount, USDC_DECIMALS) : 0n;
  const pct = side === 'yes' ? yesPct : noPct;
  const odds = pct > 0 ? 100 / pct : 0;
  const potential = numericAmount * odds;

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: ADDRESSES.USDC,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: userAddr && marketAddress ? [userAddr, marketAddress] : undefined,
    query: { enabled: !!(userAddr && marketAddress) }
  });

  const { data: usdcBalance } = useReadContract({
    address: ADDRESSES.USDC,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddr ? [userAddr] : undefined,
    query: { enabled: !!userAddr }
  });

  const { writeContractAsync: approveWrite, isPending: approving } = useWriteContract();
  const { writeContractAsync: buyWrite, isPending: buying } = useWriteContract();
  const { writeContractAsync: mintWrite, isPending: minting } = useWriteContract();

  const { isLoading: confirming } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: !!txHash }
  });

  const needsApproval = (allowance ?? 0n) < amountWei;
  const insufficient = (usdcBalance ?? 0n) < amountWei;
  const isWorking = approving || buying || confirming;

  const handlePredict = async () => {
    setError('');
    if (!user) {
      try {
        await login({ provider: 'google' });
      } catch (e: any) {
        setError(e?.message ?? 'Login failed');
      }
      return;
    }
    if (numericAmount <= 0) return setError('Enter a stake');
    if (insufficient) return setError('Insufficient USDC. Tap mint test USDC below.');

    try {
      if (needsApproval) {
        const h = await approveWrite({
          address: ADDRESSES.USDC,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [marketAddress, amountWei]
        });
        setTxHash(h);
        await new Promise((r) => setTimeout(r, 3000));
        await refetchAllowance();
      }
      const h = await buyWrite({
        address: marketAddress,
        abi: PREDICTION_MARKET_ABI,
        functionName: 'buy',
        args: [side === 'yes' ? 0 : 1, amountWei, 0n]
      });
      setTxHash(h);
      Alert.alert('Prediction placed', `Tx: ${h.slice(0, 10)}…`);
    } catch (e: any) {
      setError(e?.shortMessage ?? e?.message ?? 'Failed');
    }
  };

  const handleMint = async () => {
    setError('');
    if (!userAddr) return login({ provider: 'google' });
    try {
      const h = await mintWrite({
        address: ADDRESSES.USDC,
        abi: ERC20_ABI,
        functionName: 'mint',
        args: [userAddr, parseUnits('1000', USDC_DECIMALS)]
      });
      setTxHash(h);
      Alert.alert('Minted 1000 test USDC');
    } catch (e: any) {
      setError(e?.shortMessage ?? 'Mint failed');
    }
  };

  if (resolved) {
    return (
      <View style={[sharedStyles.card, { alignItems: 'center', padding: spacing.s5 }]}>
        <Text style={{ color: colors.textMuted }}>Market resolved. Trading closed.</Text>
      </View>
    );
  }

  return (
    <View style={[sharedStyles.card, { gap: spacing.s4 }]}>
      <View style={sharedStyles.rowBetween}>
        <Text style={[styles.sectionLabel, { fontSize: 13, fontWeight: '700', color: colors.text, textTransform: 'none', letterSpacing: 0 }]}>
          Place prediction
        </Text>
        <Text style={{ fontSize: 10, color: colors.textFaint, fontFamily: 'JetBrainsMono', letterSpacing: 1.2 }}>
          USDC · X LAYER
        </Text>
      </View>

      <View style={styles.toggle}>
        <Pressable
          onPress={() => setSide('yes')}
          style={[styles.toggleBtn, side === 'yes' && { backgroundColor: colors.positiveSoft, borderColor: 'rgba(0,255,135,0.3)' }]}
        >
          <Text style={{ color: side === 'yes' ? colors.positive : colors.textDim, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }}>YES</Text>
          <Text style={{ color: side === 'yes' ? colors.positive : colors.textMuted, fontSize: 22, fontWeight: '800', fontFamily: 'JetBrainsMono' }}>{yesPct}¢</Text>
        </Pressable>
        <Pressable
          onPress={() => setSide('no')}
          style={[styles.toggleBtn, side === 'no' && { backgroundColor: colors.negativeSoft, borderColor: 'rgba(255,77,109,0.3)' }]}
        >
          <Text style={{ color: side === 'no' ? colors.negative : colors.textDim, fontSize: 11, fontWeight: '700', letterSpacing: 0.8 }}>NO</Text>
          <Text style={{ color: side === 'no' ? colors.negative : colors.textMuted, fontSize: 22, fontWeight: '800', fontFamily: 'JetBrainsMono' }}>{noPct}¢</Text>
        </Pressable>
      </View>

      <View>
        <Text style={styles.sectionLabel}>Stake (USDC)</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="25"
          placeholderTextColor={colors.textMuted}
          style={styles.amountInput}
        />
        <View style={[sharedStyles.row, { gap: spacing.s2, marginTop: spacing.s2 }]}>
          {[10, 25, 100, 500].map((v) => (
            <Pressable key={v} onPress={() => setAmount(String(v))} style={styles.quickBtn}>
              <Text style={{ color: colors.textDim, fontSize: 12, fontWeight: '600' }}>${v}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.s2 }}>
        <Line k="Odds"          v={`${odds.toFixed(2)}x`} />
        <Line k="Potential payout" v={`$${potential.toFixed(2)}`} highlight />
        <Line k="Your USDC"     v={usdcBalance ? `$${(Number(usdcBalance) / 1e6).toFixed(2)}` : '$0.00'} />
      </View>

      {error ? <Text style={{ color: colors.negative, fontSize: 12 }}>{error}</Text> : null}

      <Pressable
        onPress={handlePredict}
        disabled={isWorking}
        style={[sharedStyles.btnPrimary, isWorking && { opacity: 0.6 }]}
      >
        {isWorking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={sharedStyles.btnPrimaryText}>
            {!user ? 'Sign in to predict' : needsApproval ? 'Approve & predict' : 'Predict'}
          </Text>
        )}
      </Pressable>

      <Pressable onPress={handleMint} disabled={minting} style={sharedStyles.btnGhost}>
        <Text style={{ color: colors.textDim, fontWeight: '600' }}>
          {minting ? 'Minting...' : 'Mint 1000 test USDC'}
        </Text>
      </Pressable>
    </View>
  );
}

function Line({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <View style={sharedStyles.rowBetween}>
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{k}</Text>
      <Text style={{
        color: colors.text,
        fontSize: highlight ? 15 : 13,
        fontWeight: highlight ? '800' : '600',
        fontFamily: 'JetBrainsMono'
      }}>
        {v}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', alignItems: 'center' },
  headerCard: { gap: spacing.s2 },
  title: { color: colors.text, fontSize: 22, fontWeight: '800', lineHeight: 28 },
  subtitle: { color: colors.textDim, fontSize: 14, lineHeight: 20 },
  sectionLabel: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase'
  },
  probBar: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    overflow: 'hidden'
  },
  probFillYes: { backgroundColor: colors.positive },
  probFillNo:  { backgroundColor: colors.negative },
  toggle: {
    flexDirection: 'row',
    gap: spacing.s2,
    padding: 4,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  toggleBtn: {
    flex: 1,
    padding: spacing.s3,
    alignItems: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent'
  },
  amountInput: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.s4,
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'JetBrainsMono'
  },
  quickBtn: {
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.s2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong
  }
});
