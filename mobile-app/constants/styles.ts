import { StyleSheet } from 'react-native';
import { colors, radii, spacing } from './theme';

export const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.s5
  },
  cardGlow: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.accentRing,
    padding: spacing.s5
  },
  surface: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  btnPrimary: {
    backgroundColor: colors.accent,
    paddingVertical: spacing.s3,
    paddingHorizontal: spacing.s5,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15
  },
  btnGhost: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.s3,
    paddingHorizontal: spacing.s5,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center'
  },
  badge: {
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.s1,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start'
  },
  badgeAccent: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accentRing
  },
  badgePositive: {
    backgroundColor: colors.positiveSoft,
    borderColor: 'rgba(0, 255, 135, 0.30)'
  },
  badgeNegative: {
    backgroundColor: colors.negativeSoft,
    borderColor: 'rgba(255, 77, 109, 0.30)'
  }
});
