import { LogEntry } from './types';

export interface NutritionTotals {
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

export function entriesOnDate(entries: LogEntry[], date: string): LogEntry[] {
  return entries.filter((e) => e.date === date);
}

export function sumTotals(entries: LogEntry[]): NutritionTotals {
  return entries.reduce<NutritionTotals>(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      proteinG: acc.proteinG + e.proteinG,
      fatG: acc.fatG + e.fatG,
      carbsG: acc.carbsG + e.carbsG,
    }),
    { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 }
  );
}
