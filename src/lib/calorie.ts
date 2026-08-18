import { ActivityLevel, CalorieTargets, Goal, Sex } from './types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little to no exercise)',
  light: 'Light (exercise 1-3 days/week)',
  moderate: 'Moderate (exercise 3-5 days/week)',
  active: 'Active (exercise 6-7 days/week)',
  very_active: 'Very active (hard exercise & physical job)',
};

/** One kg of body fat is ~7700 kcal. */
const KCAL_PER_KG = 7700;

export function calculateBmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  // Mifflin-St Jeor equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel];
}

export function calculateDailyTarget(tdee: number, goal: Goal, weeklyRateKg: number): number {
  if (goal === 'maintain') return tdee;
  const dailyDelta = (weeklyRateKg * KCAL_PER_KG) / 7;
  const target = goal === 'lose' ? tdee - dailyDelta : tdee + dailyDelta;
  // Safety floor so we never recommend a dangerously low intake.
  const floor = goal === 'lose' ? 1200 : 0;
  return Math.round(Math.max(target, floor));
}

export function calculateMacros(dailyTarget: number, weightKg: number): {
  proteinG: number;
  fatG: number;
  carbsG: number;
} {
  // ~1.8g protein/kg bodyweight, 25% of calories from fat, remainder carbs.
  const proteinG = Math.round(weightKg * 1.8);
  const proteinKcal = proteinG * 4;
  const fatKcal = dailyTarget * 0.25;
  const fatG = Math.round(fatKcal / 9);
  const carbsKcal = Math.max(dailyTarget - proteinKcal - fatKcal, 0);
  const carbsG = Math.round(carbsKcal / 4);
  return { proteinG, fatG, carbsG };
}

export function calculateCalorieTargets(
  sex: Sex,
  weightKg: number,
  heightCm: number,
  age: number,
  activityLevel: ActivityLevel,
  goal: Goal,
  weeklyRateKg: number
): CalorieTargets {
  const bmr = Math.round(calculateBmr(sex, weightKg, heightCm, age));
  const tdee = Math.round(calculateTdee(bmr, activityLevel));
  const dailyTarget = calculateDailyTarget(tdee, goal, weeklyRateKg);
  const macros = calculateMacros(dailyTarget, weightKg);
  return { bmr, tdee, dailyTarget, ...macros };
}
