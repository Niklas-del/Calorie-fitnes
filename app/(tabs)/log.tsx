import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { useT } from '../../src/i18n/useT';
import { todayKey } from '../../src/lib/date';
import { entriesOnDate, sumTotals } from '../../src/lib/nutrition';
import { MealType } from '../../src/lib/types';
import { useFoodLogStore } from '../../src/store/useFoodLogStore';
import { colors, radius, spacing, typography } from '../../src/theme/theme';

const MEAL_KEYS: { key: MealType; label: 'breakfast' | 'lunch' | 'dinner' | 'snacks' }[] = [
  { key: 'breakfast', label: 'breakfast' },
  { key: 'lunch', label: 'lunch' },
  { key: 'dinner', label: 'dinner' },
  { key: 'snack', label: 'snacks' },
];

export default function Diary() {
  const t = useT();
  const today = todayKey();
  // Select raw state and derive here — a selector that builds a new array/object
  // each call makes zustand re-render forever (see the note in useFoodLogStore).
  const allEntries = useFoodLogStore((s) => s.entries);
  const removeEntry = useFoodLogStore((s) => s.removeEntry);
  const entries = useMemo(() => entriesOnDate(allEntries, today), [allEntries, today]);
  const totals = useMemo(() => sumTotals(entries), [entries]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={typography.h1}>{t.diary.title}</Text>
        <Text style={[typography.muted, { marginBottom: spacing(5) }]}>
          {t.diary.loggedToday(totals.calories)}
        </Text>

        <View style={styles.quickAddRow}>
          <View style={styles.quickAddItem}>
            <Button title={t.dashboard.search} onPress={() => router.push('/log/search')} variant="secondary" />
          </View>
          <View style={styles.quickAddItem}>
            <Button title={t.dashboard.barcode} onPress={() => router.push('/log/scan')} variant="secondary" />
          </View>
          <View style={styles.quickAddItem}>
            <Button title={t.dashboard.photo} onPress={() => router.push('/log/photo')} variant="secondary" />
          </View>
        </View>

        {MEAL_KEYS.map((meal) => {
          const items = entries.filter((e) => e.meal === meal.key);
          const mealTotal = items.reduce((sum, e) => sum + e.calories, 0);
          return (
            <View key={meal.key} style={{ marginTop: spacing(6) }}>
              <View style={styles.mealHeader}>
                <Text style={typography.h2}>{t.meals[meal.label]}</Text>
                <Text style={typography.muted}>{mealTotal} {t.common.kcal}</Text>
              </View>
              {items.length === 0 ? (
                <Text style={[typography.muted, { marginTop: spacing(2) }]}>{t.diary.nothingLogged}</Text>
              ) : (
                <Card style={{ marginTop: spacing(2) }}>
                  {items.map((entry, idx) => (
                    <View
                      key={entry.id}
                      style={[styles.entryRow, idx < items.length - 1 && styles.entryDivider]}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.entryName}>{entry.food.name}</Text>
                        <Text style={typography.muted}>
                          {entry.grams}{t.common.grams} · {entry.calories} {t.common.kcal}
                        </Text>
                      </View>
                      <Pressable onPress={() => removeEntry(entry.id)} hitSlop={12}>
                        <Text style={styles.removeText}>✕</Text>
                      </Pressable>
                    </View>
                  ))}
                </Card>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing(5), paddingBottom: spacing(10) },
  quickAddRow: { flexDirection: 'row', gap: spacing(3) },
  quickAddItem: { flex: 1 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  entryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing(2.5) },
  entryDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  entryName: { fontSize: 15, fontWeight: '600', color: colors.text },
  removeText: { color: colors.textMuted, fontSize: 16, paddingHorizontal: spacing(2) },
});
