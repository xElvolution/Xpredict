import { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useAccount } from 'wagmi';
import { colors, spacing, radii } from '../constants/theme';
import { sharedStyles } from '../constants/styles';
import { placeLimitOrder } from '../lib/platform-api';

export function LimitOrderPanel({
  marketId,
  marketTitle,
  category,
  side,
  midPrice
}: {
  marketId: string;
  marketTitle: string;
  category: string;
  side: 'yes' | 'no';
  midPrice: number;
}) {
  const { address } = useAccount();
  const [price, setPrice] = useState(String(Math.round(midPrice * 100)));
  const [amount, setAmount] = useState('25');
  const [loading, setLoading] = useState(false);

  const handlePlace = async () => {
    if (!address) return;
    setLoading(true);
    try {
      await placeLimitOrder({
        wallet: address,
        marketId,
        marketTitle,
        category,
        side,
        price: Number(price) / 100,
        quantityUsdc: Number(amount)
      });
      Alert.alert('Limit order placed', `${side.toUpperCase()} @ ${price}¢`);
    } catch (e: unknown) {
      Alert.alert('Failed', e instanceof Error ? e.message : 'Could not place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ gap: spacing.s4 }}>
      <Text style={styles.heading}>Limit order (CLOB)</Text>
      <View style={[sharedStyles.row, { gap: spacing.s3 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Limit price (¢)</Text>
          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="number-pad"
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Size (USDC)</Text>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.input}
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>
      <Pressable
        onPress={handlePlace}
        disabled={!address || loading}
        style={[sharedStyles.btnPrimary, (!address || loading) && { opacity: 0.6 }]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={sharedStyles.btnPrimaryText}>Limit {side.toUpperCase()}</Text>
        )}
      </Pressable>
      {!address && <Text style={styles.hint}>Connect wallet to place limit orders.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  heading: { fontSize: 14, fontWeight: '700', color: colors.text },
  label: { fontSize: 11, color: colors.textFaint, marginBottom: spacing.s2, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.s3,
    color: colors.text,
    fontFamily: 'JetBrainsMono',
    fontSize: 16
  },
  hint: { fontSize: 12, color: colors.textMuted }
});
