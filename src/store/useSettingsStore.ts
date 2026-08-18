import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface SettingsState {
  visionApiKey: string;
  setVisionApiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      visionApiKey: '',
      setVisionApiKey: (key) => set({ visionApiKey: key }),
    }),
    {
      name: 'fittrack.settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
