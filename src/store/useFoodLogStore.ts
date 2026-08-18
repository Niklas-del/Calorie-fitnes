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

interface FoodLogState {
  entries: LogEntry[];
  addEntry: (food: FoodItem, grams: number, meal: MealType, date?: string) => void;
  removeEntry: (id: string) => void;
  entriesForDate: (date: string) => LogEntry[];
  totalsForDate: (date: string) => { calories: number; proteinG: number; fatG: number; carbsG: number };
}

export const useFoodLogStore = create<FoodLogState>()(
  persist(
    (set, get) => ({
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
      entriesForDate: (date) => get().entries.filter((e) => e.date === date),
      totalsForDate: (date) => {
        const items = get().entries.filter((e) => e.date === date);
        return items.reduce(
          (acc, e) => ({
            calories: acc.calories + e.calories,
            proteinG: acc.proteinG + e.proteinG,
            fatG: acc.fatG + e.fatG,
            carbsG: acc.carbsG + e.carbsG,
          }),
          { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 }
        );
      },
    }),
    {
      name: 'fittrack.foodlog',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
