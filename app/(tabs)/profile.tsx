import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { LANGUAGES } from '../../src/i18n';
import { useT } from '../../src/i18n/useT';
import { useLanguageStore } from '../../src/store/useLanguageStore';
import { useProfileStore } from '../../src/store/useProfileStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { colors, radius, spacing, typography } from '../../src/theme/theme';

export default function Profile() {
  const t = useT();
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const profile = useProfileStore((s) => s.profile);
  const getTargets = useProfileStore((s) => s.getTargets);
  const targets = getTargets();
  const visionApiKey = useSettingsStore((s) => s.visionApiKey);
  const setVisionApiKey = useSettingsStore((s) => s.setVisionApiKey);

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={typography.h1}>{t.profile.title}</Text>

        <Card style={{ marginTop: spacing(5) }}>
          <Text style={typography.h2}>{profile.name}</Text>
          <View style={styles.statsGrid}>
            <StatCell label={t.profile.sex} value={profile.sex === 'male' ? t.profile.male : t.profile.female} />
            <StatCell label={t.profile.age} value={`${profile.age}`} />
            <StatCell label={t.profile.height} value={`${profile.heightCm} cm`} />
            <StatCell label={t.profile.weight} value={`${profile.weightKg} kg`} />
          </View>
          <Text style={[typography.muted, { marginTop: spacing(3) }]}>
            {t.activity[profile.activityLevel]}
          </Text>
          <Text style={[typography.muted, { marginTop: 2 }]}>
            {profile.goal === 'maintain'
              ? t.profile.goalMaintain
              : profile.goal === 'lose'
                ? t.profile.goalLose(profile.weeklyRateKg)
                : t.profile.goalGain(profile.weeklyRateKg)}
          </Text>
          <View style={{ marginTop: spacing(4) }}>
            <Button title={t.profile.editProfile} onPress={() => router.push('/profile/edit')} variant="secondary" />
          </View>
        </Card>

        {targets ? (
          <Card style={{ marginTop: spacing(4) }}>
            <Text style={typography.h2}>{t.profile.dailyTargets}</Text>
            <View style={styles.statsGrid}>
              <StatCell label={t.profile.bmr} value={`${targets.bmr}`} />
              <StatCell label={t.profile.tdee} value={`${targets.tdee}`} />
              <StatCell label={t.profile.calories} value={`${targets.dailyTarget}`} />
              <StatCell label={t.profile.protein} value={`${targets.proteinG}g`} />
            </View>
          </Card>
        ) : null}

        <Card style={{ marginTop: spacing(4) }}>
          <Text style={typography.h2}>{t.profile.language}</Text>
          <View style={styles.langRow}>
            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => setLanguage(lang.code)}
                style={[styles.langChip, language === lang.code && styles.langChipActive]}
              >
                <Text style={styles.langFlag}>{lang.flag}</Text>
                <Text style={[styles.langLabel, language === lang.code && styles.langLabelActive]}>
                  {lang.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card style={{ marginTop: spacing(4) }}>
          <Text style={typography.h2}>{t.profile.photoEstimation}</Text>
          <Text style={[typography.muted, { marginTop: spacing(1), marginBottom: spacing(3) }]}>
            {t.profile.apiKeyBlurb}
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
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2.5), marginTop: spacing(3) },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    backgroundColor: colors.cardAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(3.5),
  },
  langChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  langFlag: { fontSize: 18 },
  langLabel: { color: colors.text, fontWeight: '600', fontSize: 14 },
  langLabelActive: { color: '#04140A' },
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
