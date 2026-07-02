import { createContext } from 'react'
import type { ThemeMode } from '../types/theme'

export type ThemeContextValue = {
  theme: ThemeMode
  isDark: boolean
  isHydrated: boolean
  setTheme: (mode: ThemeMode) => Promise<void>
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
