import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

interface MacroBarProps {
  label: string;
  grams: number;
  targetGrams: number;
  color: string;
}

export function MacroBar({ label, grams, targetGrams, color }: MacroBarProps) {
  const pct = targetGrams > 0 ? Math.min(1, grams / targetGrams) : 0;
  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {grams}g / {targetGrams}g
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: spacing(3) },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing(1) },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  value: { fontSize: 12, color: colors.textMuted },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.cardAlt,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill },
});
