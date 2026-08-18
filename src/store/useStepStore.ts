import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { todayKey } from '../lib/date';

interface StepState {
  /** date -> step count, for manually-entered or pedometer-accumulated history */
  history: Record<string, number>;
  stepGoal: number;
  setStepsForDate: (date: string, steps: number) => void;
  addStepsToday: (delta: number) => void;
  setStepGoal: (goal: number) => void;
  stepsForDate: (date: string) => number;
}

export const useStepStore = create<StepState>()(
  persist(
    (set, get) => ({
      history: {},
      stepGoal: 8000,
      setStepsForDate: (date, steps) =>
        set((s) => ({ history: { ...s.history, [date]: steps } })),
      addStepsToday: (delta) => {
        const date = todayKey();
        const current = get().history[date] ?? 0;
        set((s) => ({ history: { ...s.history, [date]: current + delta } }));
      },
      setStepGoal: (goal) => set({ stepGoal: goal }),
      stepsForDate: (date) => get().history[date] ?? 0,
    }),
    {
      name: 'fittrack.steps',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
