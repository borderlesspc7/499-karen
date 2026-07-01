import type { ReactNode } from 'react'
import { View, type StyleProp, type ViewStyle } from 'react-native'

type SummusModalCardProps = {
  children: ReactNode
  className?: string
  style?: StyleProp<ViewStyle>
  maxWidthClassName?: string
}

export function SummusModalCard({
  children,
  className = '',
  style,
  maxWidthClassName = 'max-w-sm',
}: SummusModalCardProps) {
  return (
    <View
      className={[
        'w-full overflow-hidden rounded-3xl border border-white/10 bg-deepBlue',
        maxWidthClassName,
        className,
      ].join(' ')}
      style={[
        {
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.22,
          shadowRadius: 28,
          elevation: 14,
        },
        style,
      ]}
    >
      <View className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-electricBlue/12" />
      <View className="absolute -bottom-24 -left-20 h-44 w-44 rounded-full bg-gold/6" />
      <View className="relative">{children}</View>
    </View>
  )
}
