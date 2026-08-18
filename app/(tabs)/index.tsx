import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { MacroBar } from '../../src/components/MacroBar';
import { ProgressRing } from '../../src/components/ProgressRing';
import { todayKey } from '../../src/lib/date';
import { entriesOnDate, sumTotals } from '../../src/lib/nutrition';
import { useFoodLogStore } from '../../src/store/useFoodLogStore';
import { useProfileStore } from '../../src/store/useProfileStore';
import { useStepStore } from '../../src/store/useStepStore';
import { colors, spacing, typography } from '../../src/theme/theme';

export default function Dashboard() {
  const profile = useProfileStore((s) => s.profile);
  const getTargets = useProfileStore((s) => s.getTargets);
  const targets = getTargets();
  const today = todayKey();
  // Select raw state and derive here — a selector that builds a new object each
  // call makes zustand re-render forever (see the note in useFoodLogStore).
  const entries = useFoodLogStore((s) => s.entries);
  const totals = useMemo(() => sumTotals(entriesOnDate(entries, today)), [entries, today]);
  const steps = useStepStore((s) => s.history[today] ?? 0);
  const stepGoal = useStepStore((s) => s.stepGoal);

  const target = targets?.dailyTarget ?? 2000;
  const remaining = target - totals.calories;
  const progress = target > 0 ? totals.calories / target : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={typography.h1}>Hi {profile?.name ?? 'there'} 👋</Text>
        <Text style={[typography.muted, { marginBottom: spacing(5) }]}>
          {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>

        <Card style={styles.ringCard}>
          <ProgressRing
            progress={progress}
            color={remaining < 0 ? colors.danger : colors.primary}
            label={`${Math.abs(remaining)}`}
            sublabel={remaining < 0 ? 'kcal over' : 'kcal left'}
          />
          <View style={styles.ringStatsRow}>
            <Stat label="Target" value={`${target}`} />
            <Stat label="Eaten" value={`${totals.calories}`} />
            <Stat label="Steps" value={`${steps}`} />
          </View>
        </Card>

        {targets ? (
          <Card style={{ marginTop: spacing(4) }}>
            <Text style={[typography.h2, { marginBottom: spacing(3) }]}>Macros</Text>
            <MacroBar label="Protein" grams={totals.proteinG} targetGrams={targets.proteinG} color={colors.protein} />
            <MacroBar label="Carbs" grams={totals.carbsG} targetGrams={targets.carbsG} color={colors.carbs} />
            <MacroBar label="Fat" grams={totals.fatG} targetGrams={targets.fatG} color={colors.fat} />
          </Card>
        ) : null}

        <Card style={{ marginTop: spacing(4) }}>
          <View style={styles.stepsRow}>
            <View>
              <Text style={typography.h2}>{steps.toLocaleString()} steps</Text>
              <Text style={typography.muted}>Goal: {stepGoal.toLocaleString()}</Text>
            </View>
            <Text style={styles.stepsEmoji}>👟</Text>
          </View>
        </Card>

        <Text style={[typography.h2, { marginTop: spacing(6), marginBottom: spacing(3) }]}>
          Log food
        </Text>
        <View style={styles.quickAddRow}>
          <View style={styles.quickAddItem}>
            <Button title="🔍 Search" onPress={() => router.push('/log/search')} variant="secondary" />
          </View>
          <View style={styles.quickAddItem}>
            <Button title="📷 Barcode" onPress={() => router.push('/log/scan')} variant="secondary" />
          </View>
          <View style={styles.quickAddItem}>
            <Button title="🖼️ Photo" onPress={() => router.push('/log/photo')} variant="secondary" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(5), paddingBottom: spacing(10) },
  ringCard: { alignItems: 'center', paddingVertical: spacing(6) },
  ringStatsRow: { flexDirection: 'row', marginTop: spacing(5), gap: spacing(6) },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  stepsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepsEmoji: { fontSize: 32 },
  quickAddRow: { flexDirection: 'row', gap: spacing(3) },
  quickAddItem: { flex: 1 },
});
