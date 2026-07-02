import type { ReactNode } from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { Edge } from 'react-native-safe-area-context'
import { useTheme } from '@shared/contexts'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type AppScreenProps = {
  children: ReactNode
  className?: string
  edges?: Edge[]
  fullWidth?: boolean
  variant?: 'light' | 'dark' | 'auto'
  withPadding?: boolean
}

export function AppScreen({
  children,
  className = '',
  edges = ['top'],
  fullWidth = false,
  variant = 'auto',
  withPadding = true,
}: AppScreenProps) {
  const { isWebDesktop } = useResponsiveLayout()
  const { isDark } = useTheme()

  const resolvedIsDark = variant === 'auto' ? isDark : variant === 'dark'
  const bgClass = resolvedIsDark ? 'bg-navy' : 'bg-surface'

  if (isWebDesktop) {
    return (
      <View className={`w-full ${bgClass} ${className}`}>
        <View
          className={[
            'mx-auto w-full',
            fullWidth ? 'max-w-[1600px] px-6 py-5 lg:px-8 lg:py-6' : 'max-w-7xl px-6 py-5 lg:px-8 lg:py-6',
          ].join(' ')}
        >
          {children}
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView className={`flex-1 ${bgClass} ${className}`} edges={edges}>
      <View className={withPadding ? 'flex-1 px-4 py-4' : 'flex-1'}>{children}</View>
    </SafeAreaView>
  )
}

type ThemedScreenProps = {
  children: ReactNode
  className?: string
  edges?: Edge[]
}

export function ThemedScreen({ children, className = '', edges = ['top'] }: ThemedScreenProps) {
  const tc = useThemeClasses()

  return (
    <SafeAreaView className={['flex-1', tc.screen, className].join(' ')} edges={edges}>
      {children}
    </SafeAreaView>
  )
}
