import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ACTIVITY_LABELS } from '../../src/lib/calorie';
import { useProfileStore } from '../../src/store/useProfileStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { colors, radius, spacing, typography } from '../../src/theme/theme';

export default function Profile() {
  const profile = useProfileStore((s) => s.profile);
  const getTargets = useProfileStore((s) => s.getTargets);
  const targets = getTargets();
  const visionApiKey = useSettingsStore((s) => s.visionApiKey);
  const setVisionApiKey = useSettingsStore((s) => s.setVisionApiKey);

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={typography.h1}>Profile</Text>

        <Card style={{ marginTop: spacing(5) }}>
          <Text style={typography.h2}>{profile.name}</Text>
          <View style={styles.statsGrid}>
            <StatCell label="Sex" value={profile.sex === 'male' ? 'Male' : 'Female'} />
            <StatCell label="Age" value={`${profile.age}`} />
            <StatCell label="Height" value={`${profile.heightCm} cm`} />
            <StatCell label="Weight" value={`${profile.weightKg} kg`} />
          </View>
          <Text style={[typography.muted, { marginTop: spacing(3) }]}>
            {ACTIVITY_LABELS[profile.activityLevel]}
          </Text>
          <Text style={[typography.muted, { marginTop: 2 }]}>
            Goal: {profile.goal === 'maintain' ? 'Maintain weight' : `${profile.goal === 'lose' ? 'Lose' : 'Gain'} ${profile.weeklyRateKg} kg/week`}
          </Text>
          <View style={{ marginTop: spacing(4) }}>
            <Button title="Edit profile" onPress={() => router.push('/profile/edit')} variant="secondary" />
          </View>
        </Card>

        {targets ? (
          <Card style={{ marginTop: spacing(4) }}>
            <Text style={typography.h2}>Daily targets</Text>
            <View style={styles.statsGrid}>
              <StatCell label="BMR" value={`${targets.bmr}`} />
              <StatCell label="TDEE" value={`${targets.tdee}`} />
              <StatCell label="Calories" value={`${targets.dailyTarget}`} />
              <StatCell label="Protein" value={`${targets.proteinG}g`} />
            </View>
          </Card>
        ) : null}

        <Card style={{ marginTop: spacing(4) }}>
          <Text style={typography.h2}>Photo estimation</Text>
          <Text style={[typography.muted, { marginTop: spacing(1), marginBottom: spacing(3) }]}>
            Add an Anthropic API key to enable AI calorie estimates from meal photos. The key is stored
            only on this device and sent directly to Anthropic's API.
          </Text>
          <TextInput
            value={visionApiKey}
            onChangeText={setVisionApiKey}
            placeholder="sk-ant-..."
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCell}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={typography.muted}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(5), paddingBottom: spacing(10) },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing(3), gap: spacing(4) },
  statCell: { minWidth: '40%' },
  statValue: { fontSize: 17, fontWeight: '700', color: colors.text },
  input: {
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
