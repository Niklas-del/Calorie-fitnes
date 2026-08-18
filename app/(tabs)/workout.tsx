import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { useWorkoutStore } from '../../src/store/useWorkoutStore';
import { colors, radius, spacing, typography } from '../../src/theme/theme';

export default function Workout() {
  const plan = useWorkoutStore((s) => s.currentPlan);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={typography.h1}>Workout</Text>

        {!plan ? (
          <Card style={{ marginTop: spacing(5), alignItems: 'center', paddingVertical: spacing(8) }}>
            <Text style={{ fontSize: 40, marginBottom: spacing(3) }}>🏋️</Text>
            <Text style={[typography.h2, { textAlign: 'center' }]}>No plan yet</Text>
            <Text style={[typography.muted, { textAlign: 'center', marginTop: spacing(2), marginBottom: spacing(5) }]}>
              Answer a quick quiz and we'll build a weekly workout split for you.
            </Text>
            <Button title="Build my workout" onPress={() => router.push('/workout/quiz')} />
          </Card>
        ) : (
          <>
            <Text style={[typography.muted, { marginTop: spacing(2), marginBottom: spacing(5) }]}>
              {plan.answers.daysPerWeek} days/week · {plan.answers.equipment.replace('_', ' ')} ·{' '}
              {plan.answers.sessionMinutes} min sessions
            </Text>

            {plan.days.map((day) => (
              <Card key={day.day} style={{ marginBottom: spacing(4) }}>
                <View style={styles.dayHeader}>
                  <Text style={typography.h2}>
                    Day {day.day} · {day.title}
                  </Text>
                </View>
                {day.exercises.map((ex, idx) => (
                  <View
                    key={ex.id}
                    style={[styles.exRow, idx < day.exercises.length - 1 && styles.exDivider]}
                  >
                    <Text style={styles.exName}>{ex.name}</Text>
                    <Text style={typography.muted}>
                      {ex.sets} × {ex.reps} · rest {ex.restSeconds}s
                    </Text>
                  </View>
                ))}
              </Card>
            ))}

            <Button title="Retake quiz" onPress={() => router.push('/workout/quiz')} variant="secondary" />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(5), paddingBottom: spacing(10) },
  dayHeader: { marginBottom: spacing(2) },
  exRow: { paddingVertical: spacing(2.5) },
  exDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  exName: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 2 },
});
