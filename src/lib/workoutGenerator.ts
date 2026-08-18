import { EXERCISES } from '../data/exercises';
import { DayTitleKey, Exercise, FocusArea, WorkoutDay, WorkoutPlan, WorkoutQuizAnswers } from './types';

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DAY_TITLE_LABELS: Record<DayTitleKey, string> = {
  fullBody: 'Full Body',
  upperBody: 'Upper Body',
  lowerBody: 'Lower Body',
  core: 'Core & Conditioning',
  cardio: 'Cardio',
};

const FOCUS_TO_TITLE_KEY: Record<FocusArea, DayTitleKey> = {
  full_body: 'fullBody',
  upper_body: 'upperBody',
  lower_body: 'lowerBody',
  core: 'core',
  cardio: 'cardio',
};

// Returns a translation key plus an optional index, so the UI can render the
// title in the user's language. `title` is still filled in with English for
// plans that were saved before translations existed.
function dayTitleFor(
  index: number,
  totalDays: number
): { titleKey: DayTitleKey; titleIndex?: number; title: string } {
  if (totalDays <= 3) {
    return {
      titleKey: 'fullBody',
      titleIndex: index + 1,
      title: `${DAY_TITLE_LABELS.fullBody} ${index + 1}`,
    };
  }
  if (totalDays === 4) {
    const key: DayTitleKey = index % 2 === 0 ? 'upperBody' : 'lowerBody';
    return { titleKey: key, title: DAY_TITLE_LABELS[key] };
  }
  const rotation: FocusArea[] = ['upper_body', 'lower_body', 'full_body', 'core', 'cardio'];
  const key = FOCUS_TO_TITLE_KEY[rotation[index % rotation.length]];
  return { titleKey: key, title: DAY_TITLE_LABELS[key] };
}

function dayFocusFor(index: number, totalDays: number, primaryFocus: FocusArea): FocusArea[] {
  if (totalDays <= 3) return ['full_body', primaryFocus];
  if (totalDays === 4) return index % 2 === 0 ? ['upper_body'] : ['lower_body'];
  const rotation: FocusArea[] = ['upper_body', 'lower_body', 'full_body', 'core', 'cardio'];
  return [rotation[index % rotation.length]];
}

function exercisesPerDay(sessionMinutes: number): number {
  return clamp(Math.round(sessionMinutes / 8), 4, 8);
}

export function generateWorkoutPlan(answers: WorkoutQuizAnswers): WorkoutPlan {
  const pool = EXERCISES.filter(
    (ex) => ex.equipment.includes(answers.equipment) && ex.level.includes(answers.experience)
  );

  const count = exercisesPerDay(answers.sessionMinutes);
  const wantsCardioBoost = answers.goal === 'lose_fat';
  const wantsStrengthBias = answers.goal === 'build_strength' || answers.goal === 'build_muscle';

  const days: WorkoutDay[] = [];
  const usedRecently = new Set<string>();

  for (let i = 0; i < answers.daysPerWeek; i++) {
    const dayFocus = dayFocusFor(i, answers.daysPerWeek, answers.focus);
    const dayFocusSet = new Set<FocusArea>([...dayFocus, answers.focus]);

    let candidates = pool.filter((ex) => ex.focus.some((f) => dayFocusSet.has(f)));
    if (candidates.length < count) {
      candidates = pool; // fall back to the whole pool if the split is too narrow
    }

    // Prefer exercises not used in the previous day, then shuffle for variety.
    const fresh = shuffle(candidates.filter((ex) => !usedRecently.has(ex.id)));
    const stale = shuffle(candidates.filter((ex) => usedRecently.has(ex.id)));
    let ordered = [...fresh, ...stale];

    if (wantsStrengthBias) {
      ordered = [...ordered].sort((a, b) => Number(!!b.isCardio === false) - Number(!!a.isCardio === false));
    }

    let selected: Exercise[] = ordered.slice(0, count);

    if (wantsCardioBoost && !selected.some((e) => e.isCardio)) {
      const cardioPick = pool.find((e) => e.isCardio);
      if (cardioPick) selected = [...selected.slice(0, count - 1), cardioPick];
    }

    usedRecently.clear();
    selected.forEach((e) => usedRecently.add(e.id));

    days.push({
      day: i + 1,
      ...dayTitleFor(i, answers.daysPerWeek),
      exercises: selected,
    });
  }

  return {
    id: `${Date.now()}`,
    createdAt: new Date().toISOString(),
    answers,
    days,
  };
}
