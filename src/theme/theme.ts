export const colors = {
  bg: '#0F1115',
  card: '#1A1D24',
  cardAlt: '#22262F',
  border: '#2A2E38',
  text: '#F5F6F8',
  textMuted: '#9AA1AC',
  primary: '#4ADE80',
  primaryDark: '#22C55E',
  accent: '#38BDF8',
  warning: '#FBBF24',
  danger: '#F87171',
  protein: '#38BDF8',
  fat: '#FBBF24',
  carbs: '#C084FC',
};

export const spacing = (n: number) => n * 4;

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  muted: { fontSize: 13, fontWeight: '400' as const, color: colors.textMuted },
  label: { fontSize: 12, fontWeight: '600' as const, color: colors.textMuted },
};
