import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { FoodConfirm } from '../../src/components/FoodConfirm';
import { useT } from '../../src/i18n/useT';
import { searchFoodByName } from '../../src/services/openFoodFacts';
import { FoodItem, MealType } from '../../src/lib/types';
import { useFoodLogStore } from '../../src/store/useFoodLogStore';
import { colors, radius, spacing, typography } from '../../src/theme/theme';

export default function SearchFood() {
  const t = useT();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const addEntry = useFoodLogStore((s) => s.addEntry);

  async function runSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const items = await searchFoodByName(query.trim());
      setResults(items);
      if (items.length === 0) setError(t.food.noResults);
    } catch (e) {
      setError(t.food.searchFailed);
    } finally {
      setLoading(false);
    }
  }

  function save(grams: number, meal: MealType) {
    if (!selected) return;
    addEntry(selected, grams, meal);
    router.back();
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text style={typography.h1}>{t.food.searchTitle}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeText}>{t.common.close}</Text>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t.food.searchPlaceholder}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          onSubmitEditing={runSearch}
          returnKeyType="search"
          autoFocus
        />
      </View>

      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing(6) }} /> : null}
      {error ? <Text style={[typography.muted, { marginTop: spacing(4) }]}>{error}</Text> : null}

      {selected ? (
        <View style={{ marginTop: spacing(4) }}>
          <Pressable onPress={() => setSelected(null)}>
            <Text style={styles.backLink}>{t.food.backToResults}</Text>
          </Pressable>
          <View style={{ marginTop: spacing(3) }}>
            <FoodConfirm food={selected} onSave={save} />
          </View>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: spacing(4), paddingBottom: spacing(10) }}
          renderItem={({ item }) => (
            <Pressable onPress={() => setSelected(item)}>
              <Card style={styles.resultCard}>
                <Text style={styles.resultName}>{item.name}</Text>
                <Text style={typography.muted}>
                  {item.brand ? `${item.brand} · ` : ''}
                  {t.food.per100g(item.caloriesPer100g)}
                </Text>
              </Card>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(5) },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  closeText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  searchRow: { marginTop: spacing(4) },
  input: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(3),
    color: colors.text,
    fontSize: 15,
  },
  resultCard: { marginBottom: spacing(3) },
  resultName: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 2 },
  backLink: { color: colors.primary, fontSize: 14, fontWeight: '600' },
});
