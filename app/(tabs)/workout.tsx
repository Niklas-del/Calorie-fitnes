import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { useT } from '../../src/i18n/useT';
import { Exercise, WorkoutDay } from '../../src/lib/types';
import { useWorkoutStore } from '../../src/store/useWorkoutStore';
import { colors, radius, spacing, typography } from '../../src/theme/theme';

export default function Workout() {
  const t = useT();
  const plan = useWorkoutStore((s) => s.currentPlan);
  // Which exercise row is expanded, keyed by "<day>-<exerciseId>" so the same
  // exercise appearing on two days expands independently.
  const [expanded, setExpanded] = useState<string | null>(null);

  function dayTitle(day: WorkoutDay): string {
    const base = day.titleKey ? t.workout.dayTitles[day.titleKey] : day.title;
    return day.titleIndex ? `${base} ${day.titleIndex}` : base;
  }

  function exerciseCopy(ex: Exercise): { name: string; how: string | null } {
    const entry = t.exercises[ex.id as keyof typeof t.exercises];
    // Fall back to the English name in the exercise data if an exercise is ever
    // added without translations.
    return entry ? { name: entry.name, how: entry.how } : { name: ex.name, how: null };
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={typography.h1}>{t.workout.title}</Text>

        {!plan ? (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🏋️</Text>
            <Text style={[typography.h2, { textAlign: 'center' }]}>{t.workout.noPlan}</Text>
            <Text style={styles.emptyBody}>{t.workout.noPlanBody}</Text>
            <Button title={t.workout.build} onPress={() => router.push('/workout/quiz')} />
          </Card>
        ) : (
          <>
            <Text style={[typography.muted, { marginTop: spacing(2) }]}>
              {t.workout.perWeek(plan.answers.daysPerWeek)} ·{' '}
              {t.workout.equipmentLabel[plan.answers.equipment]} ·{' '}
              {t.workout.minSessions(plan.answers.sessionMinutes)}
            </Text>
            <Text style={[typography.muted, { marginTop: 2, marginBottom: spacing(5) }]}>
              {t.workout.tapForDetails}
            </Text>

            {plan.days.map((day) => (
              <Card key={day.day} style={{ marginBottom: spacing(4) }}>
                <Text style={[typography.h2, { marginBottom: spacing(2) }]}>
                  {t.workout.day} {day.day} · {dayTitle(day)}
                </Text>

                {day.exercises.map((ex, idx) => {
                  const key = `${day.day}-${ex.id}`;
                  const isOpen = expanded === key;
                  const { name, how } = exerciseCopy(ex);
                  return (
                    <Pressable
                      key={key}
                      onPress={() => setExpanded(isOpen ? null : key)}
                      style={[styles.exRow, idx < day.exercises.length - 1 && styles.exDivider]}
                    >
                      <View style={styles.exHeader}>
                        <Text style={styles.exName}>{name}</Text>
                        <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>›</Text>
                      </View>
                      <Text style={typography.muted}>
                        {ex.sets} × {ex.reps} · {t.workout.rest} {ex.restSeconds}s
                      </Text>

                      {isOpen && how ? (
                        <View style={styles.howBox}>
                          <Text style={styles.howLabel}>{t.workout.howTo}</Text>
                          <Text style={styles.howText}>{how}</Text>
                        </View>
                      ) : null}
                    </Pressable>
                  );
                })}
              </Card>
            ))}

            <Button
              title={t.workout.retake}
              onPress={() => router.push('/workout/quiz')}
              variant="secondary"
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(5), paddingBottom: spacing(10) },
  emptyCard: { marginTop: spacing(5), alignItems: 'center', paddingVertical: spacing(8) },
  emptyEmoji: { fontSize: 40, marginBottom: spacing(3) },
  emptyBody: {
    ...typography.muted,
    textAlign: 'center',
    marginTop: spacing(2),
    marginBottom: spacing(5),
  },
  exRow: { paddingVertical: spacing(2.5) },
  exDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  exHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  exName: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 2, flex: 1 },
  chevron: { color: colors.textMuted, fontSize: 20, paddingLeft: spacing(2) },
  chevronOpen: { color: colors.primary, transform: [{ rotate: '90deg' }] },
  howBox: {
    marginTop: spacing(3),
    padding: spacing(3),
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  howLabel: {
    ...typography.label,
    color: colors.primary,
    marginBottom: spacing(1.5),
  },
  howText: { fontSize: 14, lineHeight: 21, color: colors.text },
});
