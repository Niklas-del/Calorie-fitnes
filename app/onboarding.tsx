import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { useT } from '../src/i18n/useT';
import { ActivityLevel, Goal, Sex } from '../src/lib/types';
import { useProfileStore } from '../src/store/useProfileStore';
import { colors, radius, spacing, typography } from '../src/theme/theme';

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmentWrap}>
      {options.map((opt) => (
        <Text
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[styles.segment, value === opt.value && styles.segmentActive]}
        >
          {opt.label}
        </Text>
      ))}
    </View>
  );
}

export default function Onboarding() {
  const t = useT();
  const setProfile = useProfileStore((s) => s.setProfile);

  const [name, setName] = useState('');
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState('28');
  const [heightCm, setHeightCm] = useState('175');
  const [weightKg, setWeightKg] = useState('75');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goal, setGoal] = useState<Goal>('maintain');
  const [weeklyRateKg, setWeeklyRateKg] = useState('0.5');

  // On Android the keyboard resizes the window rather than scrolling the form,
  // so a field near the bottom (the target rate) ends up hidden behind it and
  // you cannot see what you are typing. Scroll it into view once the keyboard
  // has actually animated in.
  const scrollRef = useRef<ScrollView>(null);
  const revealFocusedField = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  }, []);

  const canSubmit =
    age.trim() !== '' && heightCm.trim() !== '' && weightKg.trim() !== '' && !Number.isNaN(Number(age));

  function submit() {
    const now = new Date().toISOString();
    setProfile({
      name: name.trim() || 'You',
      sex,
      age: Number(age),
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      activityLevel,
      goal,
      weeklyRateKg: goal === 'maintain' ? 0 : Number(weeklyRateKg) || 0.5,
      createdAt: now,
      updatedAt: now,
    });
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={typography.h1}>{t.onboarding.title}</Text>
          <Text style={[typography.muted, { marginBottom: spacing(6) }]}>
            {t.onboarding.subtitle}
          </Text>

          <Card style={{ marginBottom: spacing(4) }}>
            <Text style={typography.label}>{t.onboarding.name}</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t.onboarding.namePlaceholder}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />

            <Text style={[typography.label, { marginTop: spacing(4) }]}>{t.onboarding.sex}</Text>
            <Segmented
              value={sex}
              onChange={setSex}
              options={[
                { value: 'male', label: t.onboarding.male },
                { value: 'female', label: t.onboarding.female },
              ]}
            />

            <View style={styles.row3}>
              <View style={styles.col}>
                <Text style={typography.label}>{t.onboarding.age}</Text>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View style={styles.col}>
                <Text style={typography.label}>{t.onboarding.height}</Text>
                <TextInput
                  value={heightCm}
                  onChangeText={setHeightCm}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View style={styles.col}>
                <Text style={typography.label}>{t.onboarding.weight}</Text>
                <TextInput
                  value={weightKg}
                  onChangeText={setWeightKg}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>
            </View>
          </Card>

          <Card style={{ marginBottom: spacing(4) }}>
            <Text style={typography.label}>{t.onboarding.activityLevel}</Text>
            <View style={{ marginTop: spacing(2) }}>
              {(Object.keys(t.activity) as ActivityLevel[]).map((level) => (
                <Text
                  key={level}
                  onPress={() => setActivityLevel(level)}
                  style={[styles.listOption, activityLevel === level && styles.listOptionActive]}
                >
                  {t.activity[level]}
                </Text>
              ))}
            </View>
          </Card>

          <Card style={{ marginBottom: spacing(4) }}>
            <Text style={typography.label}>{t.onboarding.goal}</Text>
            <Segmented
              value={goal}
              onChange={setGoal}
              options={[
                { value: 'lose', label: t.goals.lose },
                { value: 'maintain', label: t.goals.maintain },
                { value: 'gain', label: t.goals.gain },
              ]}
            />
            {goal !== 'maintain' ? (
              <>
                <Text style={[typography.label, { marginTop: spacing(4) }]}>
                  {t.onboarding.targetRate}
                </Text>
                <TextInput
                  value={weeklyRateKg}
                  onChangeText={setWeeklyRateKg}
                  onFocus={revealFocusedField}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
                <Text style={[typography.muted, { marginTop: spacing(1) }]}>
                  {t.onboarding.rateHint}
                </Text>
              </>
            ) : null}
          </Card>

          <Button title={t.common.continue} onPress={submit} disabled={!canSubmit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  // Extra bottom room so the last field clears the keyboard once scrolled to.
  scroll: { padding: spacing(5), paddingBottom: spacing(20) },
  input: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2.5),
    color: colors.text,
    marginTop: spacing(1.5),
    fontSize: 15,
  },
  row3: { flexDirection: 'row', gap: spacing(3), marginTop: spacing(4) },
  col: { flex: 1 },
  segmentWrap: {
    flexDirection: 'row',
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    padding: 4,
    marginTop: spacing(1.5),
    gap: 4,
  },
  segment: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: spacing(2.5),
    borderRadius: radius.sm - 2,
    color: colors.textMuted,
    fontWeight: '600',
    overflow: 'hidden',
  },
  segmentActive: { backgroundColor: colors.primary, color: '#04140A' },
  listOption: {
    color: colors.textMuted,
    paddingVertical: spacing(3),
    paddingHorizontal: spacing(3),
    borderRadius: radius.sm,
    marginTop: spacing(1),
  },
  listOptionActive: { backgroundColor: colors.cardAlt, color: colors.text, fontWeight: '700' },
});
