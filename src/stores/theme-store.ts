import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  mode: 'light' | 'dark'
  toggle: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      toggle: () =>
        set((state) => {
          const next = state.mode === 'light' ? 'dark' : 'light'
          document.documentElement.classList.toggle('dark', next === 'dark')
          return { mode: next }
        }),
    }),
    {
      name: 'uniportal-theme',
    },
  ),
)

// Apply persisted theme on load
try {
  const stored = localStorage.getItem('uniportal-theme')
  if (stored) {
    const parsed = JSON.parse(stored) as { state?: { mode?: string } }
    if (parsed?.state?.mode === 'dark') {
      document.documentElement.classList.add('dark')
    }
  }
} catch {
  // localStorage or parse unavailable
}
