import type { ReactNode } from 'react'
import { Platform, View } from 'react-native'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { SummusNavigation } from './SummusNavigation'

type SummusAppShellProps = {
  children: ReactNode
}

export function SummusAppShell({ children }: SummusAppShellProps) {
  const { isWebDesktop } = useResponsiveLayout()
  const tc = useThemeClasses()
  const showDesktopSidebar = Platform.OS === 'web' && isWebDesktop

  if (showDesktopSidebar) {
    return (
      <View className={['min-h-full flex-1 flex-row', tc.shell].join(' ')}>
        <SummusNavigation />
        <View className="min-w-0 flex-1">{children}</View>
      </View>
    )
  }

  return (
    <View className={['min-h-full flex-1', tc.shell].join(' ')}>
      {children}
    </View>
  )
}
