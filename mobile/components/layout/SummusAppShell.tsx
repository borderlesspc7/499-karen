import type { ReactNode } from 'react'
import { View } from 'react-native'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type SummusAppShellProps = {
  children: ReactNode
}

export function SummusAppShell({ children }: SummusAppShellProps) {
  const tc = useThemeClasses()

  return (
    <View className={['min-h-full flex-1', tc.shell].join(' ')}>
      {children}
    </View>
  )
}
