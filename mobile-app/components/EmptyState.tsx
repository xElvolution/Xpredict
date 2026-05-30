import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { type LucideIcon } from 'lucide-react-native';
import { colors, spacing } from '../constants/theme';

export function EmptyState({
  icon: Icon,
  title,
  body
}: {
  icon?: LucideIcon;
  title: string;
  body?: string;
}) {
  return (
    <View style={styles.container}>
      {Icon && <Icon size={32} color={colors.accentBright} />}
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

export function Loader({ label }: { label?: string }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={colors.accentBright} />
      {label ? <Text style={styles.body}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.s10,
    gap: spacing.s2
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.s2
  },
  body: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    maxWidth: 280
  }
});
