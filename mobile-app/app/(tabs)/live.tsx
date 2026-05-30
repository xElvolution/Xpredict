import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Activity } from 'lucide-react-native';
import { colors, spacing } from '../../constants/theme';
import { sharedStyles } from '../../constants/styles';
import { useLiveEvents } from '../../../lib/use-live-events';
import { EventRow } from '../../components/EventRow';
import { EmptyState } from '../../components/EmptyState';

export default function LiveScreen() {
  const events = useLiveEvents();

  return (
    <View style={sharedStyles.container}>
      <View style={styles.header}>
        <View style={[sharedStyles.row, { gap: spacing.s2 }]}>
          <View style={styles.dot} />
          <Text style={styles.streaming}>STREAMING · X LAYER</Text>
        </View>
        <Text style={styles.count}>{events.length} events</Text>
      </View>

      {events.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Listening for events…"
          body="Bets, market creations, and settlements will stream here as they happen onchain."
        />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ padding: spacing.s4, gap: spacing.s2 }}
          renderItem={({ item }) => <EventRow event={item} />}
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
  streaming: {
    color: colors.positive,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2
  },
  count: { color: colors.textMuted, fontSize: 11 }
});
