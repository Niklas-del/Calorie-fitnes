import { EXERCISES } from '../data/exercises';
import { Exercise, FocusArea, WorkoutDay, WorkoutPlan, WorkoutQuizAnswers } from './types';

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

function dayTitleFor(index: number, totalDays: number, focus: FocusArea): string {
  if (totalDays <= 3) return `Full Body ${index + 1}`;
  if (totalDays === 4) return index % 2 === 0 ? 'Upper Body' : 'Lower Body';
  const rotation: FocusArea[] = ['upper_body', 'lower_body', 'full_body', 'core', 'cardio'];
  const f = rotation[index % rotation.length];
  const labels: Record<FocusArea, string> = {
    upper_body: 'Upper Body',
    lower_body: 'Lower Body',
    full_body: 'Full Body',
    core: 'Core & Conditioning',
    cardio: 'Cardio',
  };
  return labels[f];
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
      title: dayTitleFor(i, answers.daysPerWeek, answers.focus),
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
