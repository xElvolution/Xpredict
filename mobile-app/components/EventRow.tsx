import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radii } from '../constants/theme';
import { sharedStyles } from '../constants/styles';
import type { LiveEvent } from '../../lib/use-live-events';

const KIND_COLOR: Record<LiveEvent['kind'], string> = {
  bet:     '#8B5CF6',
  resolve: '#00FF87',
  create:  '#FFB020'
};

const KIND_LABEL: Record<LiveEvent['kind'], string> = {
  bet:     'BET',
  resolve: 'SETTLE',
  create:  'CREATE'
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function EventRow({ event }: { event: LiveEvent }) {
  const color = KIND_COLOR[event.kind];

  return (
    <View style={[sharedStyles.card, styles.row]}>
      <View style={[sharedStyles.row, { gap: spacing.s3, flex: 1 }]}>
        <View
          style={[
            styles.kindBadge,
            { backgroundColor: `${color}1a`, borderColor: `${color}33` }
          ]}
        >
          <Text style={[styles.kindText, { color }]}>{KIND_LABEL[event.kind]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.who}>{event.who}</Text>
          <Text style={styles.text} numberOfLines={1}>{event.text}</Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        {event.amount ? (
          <Text style={styles.amount}>${event.amount.toFixed(0)}</Text>
        ) : null}
        <Text style={styles.time}>{timeAgo(event.at)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.s3,
    gap: spacing.s3
  },
  kindBadge: {
    paddingHorizontal: spacing.s2,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1
  },
  kindText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  who:    { color: colors.textMuted, fontSize: 11 },
  text:   { color: colors.text, fontSize: 13 },
  amount: { color: colors.text, fontSize: 13, fontWeight: '700', fontFamily: 'JetBrainsMono' },
  time:   { color: colors.textFaint, fontSize: 10 }
});
