import { View, StyleSheet } from 'react-native';
import { colors, radii } from '../constants/theme';

/**
 * Horizontal YES/NO probability bar. Pure visual.
 */
export function PriceBar({ yesPct }: { yesPct: number }) {
  const noPct = 100 - yesPct;
  return (
    <View style={styles.bar}>
      <View style={[styles.yes, { flex: yesPct }]} />
      <View style={[styles.no, { flex: noPct }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.pill,
    overflow: 'hidden'
  },
  yes: { backgroundColor: colors.positive },
  no:  { backgroundColor: colors.negative }
});
