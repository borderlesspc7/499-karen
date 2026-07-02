import { useEffect } from 'react'
import { Platform } from 'react-native'
import { useTheme } from '@shared/contexts'
import { premiumColors } from '@/constants/premium-theme'

export function ThemeSync() {
  const { isDark } = useTheme()

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return
    }

    const backgroundColor = isDark ? premiumColors.navy : premiumColors.surface
    const textColor = isDark ? '#F8FAFC' : premiumColors.textPrimary

    document.documentElement.classList.toggle('dark', isDark)
    document.body.style.backgroundColor = backgroundColor
    document.body.style.color = textColor

    const themeMeta = document.querySelector('meta[name="theme-color"]')
    if (themeMeta) {
      themeMeta.setAttribute('content', isDark ? premiumColors.navy : premiumColors.surface)
    }
  }, [isDark])

  return null
}
