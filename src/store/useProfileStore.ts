import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { calculateCalorieTargets } from '../lib/calorie';
import { CalorieTargets, UserProfile } from '../lib/types';

interface ProfileState {
  profile: UserProfile | null;
  hasHydrated: boolean;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
  setHasHydrated: (v: boolean) => void;
  getTargets: () => CalorieTargets | null;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      hasHydrated: false,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
      getTargets: () => {
        const p = get().profile;
        if (!p) return null;
        return calculateCalorieTargets(
          p.sex,
          p.weightKg,
          p.heightCm,
          p.age,
          p.activityLevel,
          p.goal,
          p.weeklyRateKg
        );
      },
    }),
    {
      name: 'fittrack.profile',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
