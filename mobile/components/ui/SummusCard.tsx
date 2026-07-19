import type { ReactNode } from 'react'
import { View } from 'react-native'
import { premiumShadows } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type SummusCardProps = {
  children: ReactNode
  className?: string
}

export function SummusCard({ children, className = '' }: SummusCardProps) {
  const tc = useThemeClasses()

  return (
    <View className={[tc.card, 'p-6', className].join(' ')} style={tc.cardShadow}>
      {children}
    </View>
  )
}

export function SummusDarkCard({ children, className = '' }: SummusCardProps) {
  return (
    <View
      className={[
        'overflow-hidden rounded-card border border-summus-700 bg-summus-900 p-6',
        className,
      ].join(' ')}
      style={premiumShadows.navy}
    >
      {children}
    </View>
  )
}
