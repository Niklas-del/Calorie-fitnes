import * as ImagePicker from 'expo-image-picker';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { MealType } from '../../src/lib/types';
import { EstimatedFoodItem, estimateCaloriesFromPhoto } from '../../src/services/visionCalorie';
import { useFoodLogStore } from '../../src/store/useFoodLogStore';
import { useSettingsStore } from '../../src/store/useSettingsStore';
import { colors, radius, spacing, typography } from '../../src/theme/theme';

const MEALS: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
];

export default function PhotoEstimate() {
  const apiKey = useSettingsStore((s) => s.visionApiKey);
  const addEntry = useFoodLogStore((s) => s.addEntry);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<EstimatedFoodItem[]>([]);
  const [notes, setNotes] = useState('');
  const [meal, setMeal] = useState<MealType>('snack');
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualGrams, setManualGrams] = useState('100');

  async function pickAndEstimate(source: 'camera' | 'library') {
    setError(null);
    const permissionResult =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      setError('Permission denied. Enable camera/photo access in system settings.');
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6 })
        : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.6 });

    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setImageUri(asset.uri);
    setItems([]);

    if (!apiKey) {
      setError('No AI vision key configured — add one in Profile > Settings, or enter this meal manually below.');
      return;
    }
    if (!asset.base64) {
      setError('Could not read image data.');
      return;
    }

    setLoading(true);
    try {
      const estimate = await estimateCaloriesFromPhoto(asset.base64, apiKey);
      setItems(estimate.items);
      setNotes(estimate.notes);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Estimation failed.');
    } finally {
      setLoading(false);
    }
  }

  function updateItemCalories(index: number, calories: string) {
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, calories: Number(calories) || 0 } : it))
    );
  }

  function saveEstimated() {
    items.forEach((item) => {
      addEntry(
        {
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: item.name,
          caloriesPer100g: item.estimatedGrams > 0 ? Math.round((item.calories / item.estimatedGrams) * 100) : item.calories,
          source: 'photo-estimate',
        },
        item.estimatedGrams || 100,
        meal
      );
    });
    router.back();
  }

  function saveManual() {
    const calories = Number(manualCalories) || 0;
    const grams = Number(manualGrams) || 100;
    if (!manualName.trim() || calories <= 0) return;
    addEntry(
      {
        id: `manual-${Date.now()}`,
        name: manualName.trim(),
        caloriesPer100g: Math.round((calories / grams) * 100),
        source: 'manual',
      },
      grams,
      meal
    );
    router.back();
  }

  const totalCalories = items.reduce((sum, i) => sum + i.calories, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: spacing(10) }}>
        <View style={styles.header}>
          <Text style={typography.h1}>Photo estimate</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.closeText}>Close</Text>
          </Pressable>
        </View>

        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} />
        ) : (
          <View style={styles.pickerRow}>
            <View style={styles.pickerItem}>
              <Button title="📷 Take Photo" onPress={() => pickAndEstimate('camera')} />
            </View>
            <View style={styles.pickerItem}>
              <Button title="🖼️ From Library" onPress={() => pickAndEstimate('library')} variant="secondary" />
            </View>
          </View>
        )}

        {loading ? (
          <View style={{ alignItems: 'center', marginTop: spacing(6) }}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[typography.muted, { marginTop: spacing(3) }]}>Analyzing photo…</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {items.length > 0 ? (
          <Card style={{ marginTop: spacing(4) }}>
            <Text style={typography.h2}>Detected items</Text>
            {notes ? <Text style={[typography.muted, { marginTop: 4 }]}>{notes}</Text> : null}
            {items.map((item, idx) => (
              <View key={idx} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={typography.muted}>~{item.estimatedGrams}g</Text>
                </View>
                <TextInput
                  value={String(item.calories)}
                  onChangeText={(v) => updateItemCalories(idx, v)}
                  keyboardType="number-pad"
                  style={styles.calInput}
                />
                <Text style={typography.muted}> kcal</Text>
              </View>
            ))}

            <Text style={[typography.label, { marginTop: spacing(4) }]}>MEAL</Text>
            <View style={styles.segmentWrap}>
              {MEALS.map((m) => (
                <Text
                  key={m.key}
                  onPress={() => setMeal(m.key)}
                  style={[styles.segment, meal === m.key && styles.segmentActive]}
                >
                  {m.label}
                </Text>
              ))}
            </View>

            <View style={styles.calRow}>
              <Text style={typography.muted}>Total</Text>
              <Text style={styles.calValue}>{totalCalories} kcal</Text>
            </View>

            <View style={{ marginTop: spacing(4) }}>
              <Button title="Add to diary" onPress={saveEstimated} />
            </View>
          </Card>
        ) : null}

        {imageUri && items.length === 0 && !loading ? (
          <Card style={{ marginTop: spacing(4) }}>
            <Text style={typography.h2}>Enter manually</Text>
            <Text style={[typography.label, { marginTop: spacing(3) }]}>FOOD NAME</Text>
            <TextInput
              value={manualName}
              onChangeText={setManualName}
              placeholder="e.g. Chicken salad"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
            <View style={styles.row2}>
              <View style={styles.col}>
                <Text style={typography.label}>GRAMS</Text>
                <TextInput
                  value={manualGrams}
                  onChangeText={setManualGrams}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <View style={styles.col}>
                <Text style={typography.label}>CALORIES</Text>
                <TextInput
                  value={manualCalories}
                  onChangeText={setManualCalories}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
            </View>
            <Text style={[typography.label, { marginTop: spacing(4) }]}>MEAL</Text>
            <View style={styles.segmentWrap}>
              {MEALS.map((m) => (
                <Text
                  key={m.key}
                  onPress={() => setMeal(m.key)}
                  style={[styles.segment, meal === m.key && styles.segmentActive]}
                >
                  {m.label}
                </Text>
              ))}
            </View>
            <View style={{ marginTop: spacing(4) }}>
              <Button title="Add to diary" onPress={saveManual} />
            </View>
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: spacing(5) },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  closeText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  pickerRow: { flexDirection: 'row', gap: spacing(3), marginTop: spacing(6) },
  pickerItem: { flex: 1 },
  preview: { width: '100%', height: 220, borderRadius: radius.lg, marginTop: spacing(4) },
  errorText: { color: colors.warning, marginTop: spacing(4) },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing(2.5),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: { fontSize: 15, fontWeight: '600', color: colors.text },
  calInput: {
    width: 70,
    textAlign: 'right',
    backgroundColor: colors.cardAlt,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(2),
  },
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
    paddingVertical: spacing(2),
    borderRadius: radius.sm - 2,
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: 12,
    overflow: 'hidden',
  },
  segmentActive: { backgroundColor: colors.primary, color: '#04140A' },
  calRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing(4),
    paddingTop: spacing(3),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  calValue: { fontSize: 15, fontWeight: '700', color: colors.text },
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
  row2: { flexDirection: 'row', gap: spacing(3), marginTop: spacing(1) },
  col: { flex: 1 },
});
