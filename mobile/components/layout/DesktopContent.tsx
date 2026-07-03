import type { ReactNode } from 'react'
import { View } from 'react-native'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type DesktopMaxWidth = 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl'

const MAX_WIDTH_CLASS: Record<DesktopMaxWidth, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '7xl': 'max-w-7xl',
}

type DesktopContentProps = {
  children: ReactNode
  maxWidth?: DesktopMaxWidth
  className?: string
  centered?: boolean
}

export function DesktopContent({
  children,
  maxWidth = '7xl',
  className = '',
  centered = true,
}: DesktopContentProps) {
  const { isWebDesktop } = useResponsiveLayout()

  if (!isWebDesktop) {
    return <View className={className}>{children}</View>
  }

  return (
    <View
      className={[
        'w-full',
        centered ? 'mx-auto' : '',
        MAX_WIDTH_CLASS[maxWidth],
        className,
      ].join(' ')}
    >
      {children}
    </View>
  )
}
