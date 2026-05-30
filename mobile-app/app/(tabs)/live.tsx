import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Activity } from 'lucide-react-native';
import { colors, spacing, radii } from '../../constants/theme';
import { sharedStyles } from '../../constants/styles';
import { useLiveEvents, type LiveEvent } from '../../../lib/use-live-events';

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

export default function LiveScreen() {
  const events = useLiveEvents();

  return (
    <View style={sharedStyles.container}>
      <View style={styles.header}>
        <View style={[sharedStyles.row, { gap: spacing.s2 }]}>
          <View style={styles.dot} />
          <Text style={{ color: colors.positive, fontSize: 11, fontWeight: '700', letterSpacing: 1.2 }}>
            STREAMING · X LAYER
          </Text>
        </View>
        <Text style={{ color: colors.textMuted, fontSize: 11 }}>{events.length} events</Text>
      </View>

      {events.length === 0 ? (
        <View style={styles.empty}>
          <Activity size={32} color={colors.accentBright} />
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginTop: spacing.s3 }}>
            Listening for events…
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: spacing.s2 }}>
            Bets, market creations, and settlements will stream here as they happen onchain.
          </Text>
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ padding: spacing.s4, gap: spacing.s2 }}
          renderItem={({ item }) => (
            <View style={[sharedStyles.card, styles.eventCard]}>
              <View style={[sharedStyles.row, { gap: spacing.s3, flex: 1 }]}>
                <View
                  style={[
                    styles.kindBadge,
                    { backgroundColor: `${KIND_COLOR[item.kind]}1a`, borderColor: `${KIND_COLOR[item.kind]}33` }
                  ]}
                >
                  <Text style={{ color: KIND_COLOR[item.kind], fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>
                    {KIND_LABEL[item.kind]}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 11 }}>{item.who}</Text>
                  <Text style={{ color: colors.text, fontSize: 13 }} numberOfLines={1}>
                    {item.text}
                  </Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                {item.amount ? (
                  <Text style={{ color: colors.text, fontSize: 13, fontWeight: '700', fontFamily: 'JetBrainsMono' }}>
                    ${item.amount.toFixed(0)}
                  </Text>
                ) : null}
                <Text style={{ color: colors.textFaint, fontSize: 10 }}>{timeAgo(item.at)}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.s4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.positive
  },
  empty: {
    alignItems: 'center',
    padding: spacing.s10,
    gap: spacing.s2
  },
  eventCard: {
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
  }
});
