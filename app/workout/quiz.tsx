import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { useT } from '../../src/i18n/useT';
import { generateWorkoutPlan } from '../../src/lib/workoutGenerator';
import { Equipment, ExperienceLevel, FocusArea, WorkoutQuizAnswers } from '../../src/lib/types';
import { useWorkoutStore } from '../../src/store/useWorkoutStore';
import { colors, radius, spacing, typography } from '../../src/theme/theme';

function ChoiceGrid<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; sub?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.grid}>
      {options.map((opt) => (
        <Pressable key={opt.value} onPress={() => onChange(opt.value)} style={styles.gridItemWrap}>
          <View style={[styles.gridItem, value === opt.value && styles.gridItemActive]}>
            <Text style={[styles.gridLabel, value === opt.value && styles.gridLabelActive]}>
              {opt.label}
            </Text>
            {opt.sub ? <Text style={styles.gridSub}>{opt.sub}</Text> : null}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export default function WorkoutQuiz() {
  const t = useT();
  const setPlan = useWorkoutStore((s) => s.setPlan);

  const [goal, setGoal] = useState<WorkoutQuizAnswers['goal']>('get_fit');
  const [experience, setExperience] = useState<ExperienceLevel>('beginner');
  const [daysPerWeek, setDaysPerWeek] = useState(3);
  const [equipment, setEquipment] = useState<Equipment>('none');
  const [focus, setFocus] = useState<FocusArea>('full_body');
  const [sessionMinutes, setSessionMinutes] = useState(30);

  function generate() {
    const answers: WorkoutQuizAnswers = { goal, experience, daysPerWeek, equipment, focus, sessionMinutes };
    const plan = generateWorkoutPlan(answers);
    setPlan(plan);
    router.replace('/(tabs)/workout');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={typography.h1}>{t.quiz.title}</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.closeText}>{t.common.close}</Text>
          </Pressable>
        </View>
        <Text style={[typography.muted, { marginBottom: spacing(5) }]}>
          {t.quiz.subtitle}
        </Text>

        <Card style={{ marginBottom: spacing(4) }}>
          <Text style={typography.h2}>{t.quiz.goalQ}</Text>
          <ChoiceGrid
            value={goal}
            onChange={setGoal}
            options={[
              { value: 'lose_fat', label: t.quiz.loseFat },
              { value: 'build_muscle', label: t.quiz.buildMuscle },
              { value: 'build_strength', label: t.quiz.getStronger },
              { value: 'get_fit', label: t.quiz.generalFitness },
            ]}
          />
        </Card>

        <Card style={{ marginBottom: spacing(4) }}>
          <Text style={typography.h2}>{t.quiz.experienceQ}</Text>
          <ChoiceGrid
            value={experience}
            onChange={setExperience}
            options={[
              { value: 'beginner', label: t.quiz.beginner },
              { value: 'intermediate', label: t.quiz.intermediate },
              { value: 'advanced', label: t.quiz.advanced },
            ]}
          />
        </Card>

        <Card style={{ marginBottom: spacing(4) }}>
          <Text style={typography.h2}>{t.quiz.daysQ}</Text>
          <ChoiceGrid
            value={String(daysPerWeek)}
            onChange={(v) => setDaysPerWeek(Number(v))}
            options={[2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: String(n) }))}
          />
        </Card>

        <Card style={{ marginBottom: spacing(4) }}>
          <Text style={typography.h2}>{t.quiz.equipmentQ}</Text>
          <ChoiceGrid
            value={equipment}
            onChange={setEquipment}
            options={[
              { value: 'none', label: t.quiz.bodyweightOnly },
              { value: 'dumbbells', label: t.quiz.dumbbells },
              { value: 'full_gym', label: t.quiz.fullGym },
            ]}
          />
        </Card>

        <Card style={{ marginBottom: spacing(4) }}>
          <Text style={typography.h2}>{t.quiz.focusQ}</Text>
          <ChoiceGrid
            value={focus}
            onChange={setFocus}
            options={[
              { value: 'full_body', label: t.quiz.fullBody },
              { value: 'upper_body', label: t.quiz.upperBody },
              { value: 'lower_body', label: t.quiz.lowerBody },
              { value: 'core', label: t.quiz.core },
              { value: 'cardio', label: t.quiz.cardio },
            ]}
          />
        </Card>

        <Card style={{ marginBottom: spacing(6) }}>
          <Text style={typography.h2}>{t.quiz.lengthQ}</Text>
          <ChoiceGrid
            value={String(sessionMinutes)}
            onChange={(v) => setSessionMinutes(Number(v))}
            options={[15, 30, 45, 60].map((n) => ({ value: String(n), label: t.quiz.minutes(n) }))}
          />
        </Card>

        <Button title={t.quiz.generate} onPress={generate} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(5), paddingBottom: spacing(10) },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  closeText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2.5), marginTop: spacing(3) },
  gridItemWrap: { minWidth: '30%', flexGrow: 1 },
  gridItem: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(3),
    alignItems: 'center',
  },
  gridItemActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  gridLabel: { color: colors.text, fontWeight: '600', fontSize: 13 },
  gridLabelActive: { color: '#04140A' },
  gridSub: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
});
