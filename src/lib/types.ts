export type Sex = 'male' | 'female';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type Goal = 'lose' | 'maintain' | 'gain';

export interface UserProfile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  /** kg per week the user wants to lose/gain, ignored when goal === 'maintain' */
  weeklyRateKg: number;
  createdAt: string;
  updatedAt: string;
}

export interface CalorieTargets {
  bmr: number;
  tdee: number;
  dailyTarget: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  caloriesPer100g: number;
  proteinPer100g?: number;
  fatPer100g?: number;
  carbsPer100g?: number;
  servingSizeG?: number;
  source: 'openfoodfacts' | 'manual' | 'photo-estimate';
  imageUrl?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  meal: MealType;
  food: FoodItem;
  grams: number;
  calories: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  loggedAt: string;
}

export interface DailySteps {
  date: string; // YYYY-MM-DD
  steps: number;
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type Equipment = 'none' | 'dumbbells' | 'full_gym';
export type FocusArea = 'full_body' | 'upper_body' | 'lower_body' | 'core' | 'cardio';

export interface WorkoutQuizAnswers {
  goal: 'lose_fat' | 'build_muscle' | 'get_fit' | 'build_strength';
  experience: ExperienceLevel;
  daysPerWeek: number;
  equipment: Equipment;
  focus: FocusArea;
  sessionMinutes: number;
}

export interface Exercise {
  id: string;
  name: string;
  focus: FocusArea[];
  equipment: Equipment[];
  level: ExperienceLevel[];
  sets: number;
  reps: string;
  restSeconds: number;
  isCardio?: boolean;
}

export interface WorkoutDay {
  day: number;
  title: string;
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  createdAt: string;
  answers: WorkoutQuizAnswers;
  days: WorkoutDay[];
}
