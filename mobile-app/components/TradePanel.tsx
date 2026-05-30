import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { parseUnits } from 'viem';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { usePrivy, useLoginWithOAuth } from '@privy-io/expo';
import { colors, spacing, radii } from '../constants/theme';
import { sharedStyles } from '../constants/styles';
import { ADDRESSES, ERC20_ABI, PREDICTION_MARKET_ABI, USDC_DECIMALS } from '../../lib/contracts';

type Side = 'yes' | 'no';

export function TradePanel({
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
  const [side, setSide] = useState<Side>('yes');
  const [amount, setAmount] = useState('25');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { user } = usePrivy();
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
    if (insufficient) return setError('Insufficient USDC. Claim test USDC at xpredict.app on web.');

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
        <Text style={styles.heading}>Place prediction</Text>
        <Text style={styles.chain}>USDC · X LAYER</Text>
      </View>

      <View style={styles.toggle}>
        <SideButton
          label="YES"
          pct={yesPct}
          active={side === 'yes'}
          tone="yes"
          onPress={() => setSide('yes')}
        />
        <SideButton
          label="NO"
          pct={noPct}
          active={side === 'no'}
          tone="no"
          onPress={() => setSide('no')}
        />
      </View>

      <View>
        <Text style={styles.label}>Stake (USDC)</Text>
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
        <Line k="Odds"             v={`${odds.toFixed(2)}x`} />
        <Line k="Potential payout" v={`$${potential.toFixed(2)}`} highlight />
        <Line k="Your USDC"        v={usdcBalance ? `$${(Number(usdcBalance) / 1e6).toFixed(2)}` : '$0.00'} />
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
    </View>
  );
}

function SideButton({
  label, pct, active, tone, onPress
}: {
  label: string; pct: number; active: boolean; tone: 'yes' | 'no'; onPress: () => void;
}) {
  const tint = tone === 'yes' ? colors.positive : colors.negative;
  const tintSoft = tone === 'yes' ? colors.positiveSoft : colors.negativeSoft;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.toggleBtn,
        active && { backgroundColor: tintSoft, borderColor: tint + '4d' }
      ]}
    >
      <Text style={[styles.toggleLabel, { color: active ? tint : colors.textDim }]}>{label}</Text>
      <Text style={[styles.togglePct, { color: active ? tint : colors.textMuted }]}>{pct}¢</Text>
    </Pressable>
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
      }}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { color: colors.text, fontSize: 14, fontWeight: '700' },
  chain: { fontSize: 10, color: colors.textFaint, fontFamily: 'JetBrainsMono', letterSpacing: 1.2 },
  label: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: spacing.s2
  },
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
  toggleLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  togglePct: { fontSize: 22, fontWeight: '800', fontFamily: 'JetBrainsMono', marginTop: 4 },
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
