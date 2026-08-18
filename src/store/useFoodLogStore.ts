import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { todayKey } from '../lib/date';
import { FoodItem, LogEntry, MealType } from '../lib/types';

function computeNutrition(food: FoodItem, grams: number) {
  const ratio = grams / 100;
  return {
    calories: Math.round(food.caloriesPer100g * ratio),
    proteinG: Math.round((food.proteinPer100g ?? 0) * ratio),
    fatG: Math.round((food.fatPer100g ?? 0) * ratio),
    carbsG: Math.round((food.carbsPer100g ?? 0) * ratio),
  };
}

// Only raw state and actions live here on purpose. Derived values (a filtered
// list, a totals object) must NOT be exposed as store methods: calling one from
// inside a selector returns a freshly built array/object every render, and
// zustand v5's useSyncExternalStore reads that new reference as "state changed",
// which re-renders forever and hard-crashes the app. Derive with the helpers in
// src/lib/nutrition.ts wrapped in useMemo instead.
interface FoodLogState {
  entries: LogEntry[];
  addEntry: (food: FoodItem, grams: number, meal: MealType, date?: string) => void;
  removeEntry: (id: string) => void;
}

export const useFoodLogStore = create<FoodLogState>()(
  persist(
    (set) => ({
      entries: [],
      addEntry: (food, grams, meal, date) => {
        const nutrition = computeNutrition(food, grams);
        const entry: LogEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          date: date ?? todayKey(),
          meal,
          food,
          grams,
          loggedAt: new Date().toISOString(),
          ...nutrition,
        };
        set((s) => ({ entries: [entry, ...s.entries] }));
      },
      removeEntry: (id) => set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),
    }),
    {
      name: 'fittrack.foodlog',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
