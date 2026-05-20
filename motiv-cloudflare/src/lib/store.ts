import { create } from "zustand";

interface AppStore {
  darkMode: boolean;
  soundEnabled: boolean;
  toggleDarkMode: () => void;
  toggleSound: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  darkMode: typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches : false,
  soundEnabled: true,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
}));
