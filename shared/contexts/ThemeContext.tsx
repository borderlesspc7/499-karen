import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { getStorage } from '../storage'
import {
  DEFAULT_THEME_MODE,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from '../types/theme'
import { ThemeContext } from './theme-context'

type ThemeProviderProps = {
  children: ReactNode
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'light' || value === 'dark'
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(DEFAULT_THEME_MODE)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    let isMounted = true

    getStorage()
      .getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (!isMounted) {
          return
        }

        if (isThemeMode(stored)) {
          setThemeState(stored)
        }

        setIsHydrated(true)
      })
      .catch(() => {
        if (isMounted) {
          setIsHydrated(true)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const setTheme = useCallback(async (mode: ThemeMode) => {
    setThemeState(mode)
    await getStorage().setItem(THEME_STORAGE_KEY, mode)
  }, [])

  const value = useMemo(
    () => ({
      theme,
      isDark: theme === 'dark',
      isHydrated,
      setTheme,
    }),
    [isHydrated, setTheme, theme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
