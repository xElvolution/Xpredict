import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { useWriteContract } from 'wagmi';
import { colors, spacing } from '../constants/theme';
import { sharedStyles } from '../constants/styles';
import { Badge } from './Badge';
import { PREDICTION_MARKET_ABI } from '../../lib/contracts';
import type { OnchainPosition } from '../../lib/use-positions';

export function PositionCard({ p, onClaimed }: { p: OnchainPosition; onClaimed: () => void }) {
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
      android_ripple={{ color: 'rgba(255,255,255,0.05)' }}
      style={[sharedStyles.card, { gap: spacing.s3 }]}
    >
      <Text style={styles.question} numberOfLines={2}>
        {p.question}
      </Text>

      <View style={[sharedStyles.row, { gap: spacing.s5 }]}>
        {p.yesShares > 0 && (
          <Stat label="YES shares" value={p.yesShares.toFixed(2)} color={colors.positive} />
        )}
        {p.noShares > 0 && (
          <Stat label="NO shares" value={p.noShares.toFixed(2)} color={colors.negative} />
        )}
        <Stat label="Est. value" value={`$${p.estimatedValue.toFixed(2)}`} color={colors.text} bold />
      </View>

      <View style={[sharedStyles.row, { gap: spacing.s2, justifyContent: 'space-between' }]}>
        {p.resolved
          ? <Badge label={`Resolved: ${p.winningOutcome === 0 ? 'YES' : 'NO'}`} tone="positive" />
          : <Badge label="Open" tone="neutral" />}

        {p.claimable && (
          <Pressable
            onPress={handleClaim}
            disabled={isPending}
            style={[sharedStyles.btnPrimary, { backgroundColor: colors.positive, paddingHorizontal: spacing.s4, paddingVertical: spacing.s2 }]}
          >
            <View style={[sharedStyles.row, { gap: spacing.s2 }]}>
              <Trophy size={14} color="#000" />
              <Text style={{ color: '#000', fontWeight: '700', fontSize: 13 }}>
                {isPending ? 'Claiming…' : 'Claim'}
              </Text>
            </View>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

function Stat({ label, value, color, bold }: { label: string; value: string; color: string; bold?: boolean }) {
  return (
    <View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color, fontWeight: bold ? '700' : '600' }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  question: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 11
  },
  statValue: {
    fontFamily: 'JetBrainsMono'
  }
});
