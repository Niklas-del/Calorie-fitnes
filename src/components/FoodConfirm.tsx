import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { FoodItem, MealType } from '../lib/types';
import { colors, radius, spacing, typography } from '../theme/theme';
import { Button } from './Button';
import { Card } from './Card';

const MEALS: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
];

interface FoodConfirmProps {
  food: FoodItem;
  onSave: (grams: number, meal: MealType) => void;
  saving?: boolean;
}

export function FoodConfirm({ food, onSave, saving }: FoodConfirmProps) {
  const [grams, setGrams] = useState(String(food.servingSizeG ?? 100));
  const [meal, setMeal] = useState<MealType>('snack');

  const gramsNum = Number(grams) || 0;
  const calories = Math.round((food.caloriesPer100g * gramsNum) / 100);

  return (
    <Card>
      <Text style={typography.h2}>{food.name}</Text>
      {food.brand ? <Text style={typography.muted}>{food.brand}</Text> : null}

      <Text style={[typography.label, { marginTop: spacing(4) }]}>AMOUNT (GRAMS)</Text>
      <TextInput
        value={grams}
        onChangeText={setGrams}
        keyboardType="number-pad"
        style={styles.input}
      />

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
        <Text style={typography.muted}>Estimated calories</Text>
        <Text style={styles.calValue}>{calories} kcal</Text>
      </View>

      <View style={{ marginTop: spacing(4) }}>
        <Button
          title="Add to diary"
          onPress={() => onSave(gramsNum, meal)}
          disabled={gramsNum <= 0}
          loading={saving}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
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
});
