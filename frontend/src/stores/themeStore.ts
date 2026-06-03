import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemePreset } from '@/lib/theme'

interface ThemeStore {
  preset: ThemePreset
  setPreset: (p: ThemePreset) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      preset: 'indigo',
      setPreset: (preset) => set({ preset }),
    }),
    { name: 'planday-theme' } // localStorage 키
  )
)
