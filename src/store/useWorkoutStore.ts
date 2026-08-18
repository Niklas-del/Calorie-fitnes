import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { WorkoutPlan } from '../lib/types';

interface WorkoutState {
  currentPlan: WorkoutPlan | null;
  setPlan: (plan: WorkoutPlan) => void;
  clearPlan: () => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set) => ({
      currentPlan: null,
      setPlan: (plan) => set({ currentPlan: plan }),
      clearPlan: () => set({ currentPlan: null }),
    }),
    {
      name: 'fittrack.workout',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
