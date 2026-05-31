import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, Alert, StyleSheet, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { useAccount } from 'wagmi';
import { colors, spacing, radii } from '../constants/theme';
import { sharedStyles } from '../constants/styles';
import { fetchSettings, patchSettings, type UserSettings } from '../lib/platform-api';

export default function SettingsScreen() {
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [notifyOrders, setNotifyOrders] = useState(true);
  const [notifyResolves, setNotifyResolves] = useState(true);
  const [notifyAgents, setNotifyAgents] = useState(true);
  const [notifyDeposits, setNotifyDeposits] = useState(true);

  useEffect(() => {
    if (!address) { setLoading(false); return; }
    fetchSettings(address)
      .then(({ settings }) => {
        setDisplayName(settings.display_name ?? '');
        setEmail(settings.email ?? '');
        setNotifyOrders(settings.notify_orders !== false);
        setNotifyResolves(settings.notify_resolves !== false);
        setNotifyAgents(settings.notify_agents !== false);
        setNotifyDeposits(settings.notify_deposits !== false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [address]);

  const save = async () => {
    if (!address) return;
    setSaving(true);
    try {
      await patchSettings(address, {
        display_name: displayName || null,
        email: email || null,
        notify_orders: notifyOrders,
        notify_resolves: notifyResolves,
        notify_agents: notifyAgents,
        notify_deposits: notifyDeposits
      });
      Alert.alert('Saved', 'Settings updated.');
    } catch (e: unknown) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Settings' }} />
      <ScrollView style={sharedStyles.container} contentContainerStyle={{ padding: spacing.s4, gap: spacing.s4 }}>
        {!isConnected || !address ? (
          <View style={sharedStyles.card}>
            <Text style={{ color: colors.textMuted }}>Connect wallet to manage settings.</Text>
          </View>
        ) : loading ? (
          <ActivityIndicator color={colors.accentBright} style={{ marginTop: spacing.s8 }} />
        ) : (
          <>
            <View style={[sharedStyles.card, { gap: spacing.s4 }]}>
              <Text style={styles.section}>Profile</Text>
              <Field label="Display name" value={displayName} onChange={setDisplayName} />
              <Field label="Email" value={email} onChange={setEmail} keyboard="email-address" />
            </View>

            <View style={[sharedStyles.card, { gap: spacing.s3 }]}>
              <Text style={styles.section}>Notifications</Text>
              <ToggleRow label="Order fills" value={notifyOrders} onChange={setNotifyOrders} />
              <ToggleRow label="Market resolutions" value={notifyResolves} onChange={setNotifyResolves} />
              <ToggleRow label="New agent picks" value={notifyAgents} onChange={setNotifyAgents} />
              <ToggleRow label="Deposits & claims" value={notifyDeposits} onChange={setNotifyDeposits} />
              <Text style={styles.hint}>Push delivery ships in Phase 3. Prefs are saved now.</Text>
            </View>

            <Pressable onPress={save} disabled={saving} style={[sharedStyles.btnPrimary, saving && { opacity: 0.6 }]}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={sharedStyles.btnPrimaryText}>Save settings</Text>}
            </Pressable>
          </>
        )}
      </ScrollView>
    </>
  );
}

function Field({
  label, value, onChange, keyboard
}: { label: string; value: string; onChange: (v: string) => void; keyboard?: 'email-address' | 'default' }) {
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboard ?? 'default'}
        autoCapitalize="none"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={sharedStyles.rowBetween}>
      <Text style={{ color: colors.text, fontSize: 14 }}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.accent }} thumbColor="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  section: { fontSize: 16, fontWeight: '700', color: colors.text },
  label: { fontSize: 11, color: colors.textFaint, marginBottom: spacing.s2, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border,
    padding: spacing.s3, color: colors.text, fontSize: 15
  },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: spacing.s2 }
});
