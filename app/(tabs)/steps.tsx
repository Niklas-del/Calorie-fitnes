import { Pedometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ProgressRing } from '../../src/components/ProgressRing';
import { useT } from '../../src/i18n/useT';
import { formatShortDay, lastNDateKeys, todayKey } from '../../src/lib/date';
import { useStepStore } from '../../src/store/useStepStore';
import { colors, radius, spacing, typography } from '../../src/theme/theme';

export default function Steps() {
  const t = useT();
  const today = todayKey();
  const stepGoal = useStepStore((s) => s.stepGoal);
  const setStepsForDate = useStepStore((s) => s.setStepsForDate);
  const setStepGoal = useStepStore((s) => s.setStepGoal);
  const history = useStepStore((s) => s.history);
  const stepsToday = history[today] ?? 0;

  const [available, setAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [goalInput, setGoalInput] = useState(String(stepGoal));
  const baselineRef = useRef(0);

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    (async () => {
      const isAvailable = await Pedometer.isAvailableAsync().catch(() => false);
      setAvailable(isAvailable);
      if (!isAvailable) {
        setError(t.steps.unavailable);
        return;
      }

      const perm = await Pedometer.requestPermissionsAsync().catch(() => null);
      if (perm && !perm.granted) {
        setError(t.steps.permissionDenied);
        return;
      }

      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      try {
        const result = await Pedometer.getStepCountAsync(start, end);
        baselineRef.current = result.steps;
        setStepsForDate(today, result.steps);
      } catch {
        // Historical counts aren't available on this platform (e.g. some Android
        // devices) - fall back to whatever was already persisted for today.
        baselineRef.current = stepsToday;
      }

      subscription = Pedometer.watchStepCount((result) => {
        setStepsForDate(today, baselineRef.current + result.steps);
      });
    })();

    return () => subscription?.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const last7 = lastNDateKeys(7);
  const maxSteps = Math.max(stepGoal, ...last7.map((d) => history[d] ?? 0), 1);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={typography.h1}>{t.steps.title}</Text>
        {error ? <Text style={[typography.muted, { marginTop: spacing(2) }]}>{error}</Text> : null}

        <Card style={styles.ringCard}>
          <ProgressRing
            progress={stepGoal > 0 ? stepsToday / stepGoal : 0}
            color={colors.accent}
            label={stepsToday.toLocaleString()}
            sublabel={t.steps.stepsToday}
          />
        </Card>

        <Card style={{ marginTop: spacing(4) }}>
          <Text style={[typography.h2, { marginBottom: spacing(3) }]}>{t.steps.last7Days}</Text>
          <View style={styles.chartRow}>
            {last7.map((d) => {
              const value = history[d] ?? 0;
              const height = Math.max(4, (value / maxSteps) * 100);
              return (
                <View key={d} style={styles.chartCol}>
                  <View style={styles.chartTrack}>
                    <View
                      style={[
                        styles.chartFill,
                        { height: `${height}%`, backgroundColor: d === today ? colors.accent : colors.cardAlt },
                      ]}
                    />
                  </View>
                  <Text style={typography.muted}>{formatShortDay(d)}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        <Card style={{ marginTop: spacing(4) }}>
          <Text style={typography.label}>{t.steps.dailyGoal}</Text>
          <View style={styles.goalRow}>
            <TextInput
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="number-pad"
              style={styles.input}
            />
            <View style={{ width: spacing(3) }} />
            <Button title={t.common.save} onPress={() => setStepGoal(Number(goalInput) || stepGoal)} variant="secondary" />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(5), paddingBottom: spacing(10) },
  ringCard: { alignItems: 'center', paddingVertical: spacing(6), marginTop: spacing(4) },
  chartRow: { flexDirection: 'row', justifyContent: 'space-between', height: 140, alignItems: 'flex-end' },
  chartCol: { alignItems: 'center', flex: 1 },
  chartTrack: {
    width: 18,
    height: 100,
    justifyContent: 'flex-end',
    borderRadius: radius.pill,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  chartFill: { width: '100%', borderRadius: radius.pill },
  goalRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing(2) },
  input: {
    flex: 1,
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    color: colors.text,
    fontSize: 15,
  },
});
