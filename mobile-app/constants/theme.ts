export const colors = {
  bg:           '#0A0A0F',
  bgElevated:   '#11111A',
  card:         '#13131C',
  surface:      '#16161F',
  border:       'rgba(255,255,255,0.07)',
  borderStrong: 'rgba(255,255,255,0.14)',

  text:         '#F4F4F7',
  textDim:      '#A7A7B5',
  textMuted:    '#6E6E80',
  textFaint:    '#4A4A55',

  accent:       '#7C3AED',
  accentBright: '#A78BFA',
  accentSoft:   'rgba(124, 58, 237, 0.10)',
  accentRing:   'rgba(124, 58, 237, 0.32)',

  positive:     '#00FF87',
  positiveSoft: 'rgba(0, 255, 135, 0.10)',
  negative:     '#FF4D6D',
  negativeSoft: 'rgba(255, 77, 109, 0.10)',
  warning:      '#FFB020'
};

export const spacing = {
  s1: 4, s2: 8, s3: 12, s4: 16, s5: 20, s6: 24, s8: 32, s10: 40, s12: 48, s16: 64
};

export const radii = {
  sm: 8, md: 12, lg: 16, pill: 999
};

export const fonts = {
  sans: 'Inter, system-ui, -apple-system, sans-serif',
  mono: 'JetBrainsMono, ui-monospace, monospace'
};

export const typography = {
  h1:    { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.6 },
  h2:    { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.4 },
  h3:    { fontSize: 18, fontWeight: '700' as const, letterSpacing: -0.2 },
  body:  { fontSize: 14, fontWeight: '400' as const, color: colors.text },
  label: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 1.2, textTransform: 'uppercase' as const, color: colors.textFaint },
  mono:  { fontSize: 13, fontFamily: fonts.mono, color: colors.text }
};
