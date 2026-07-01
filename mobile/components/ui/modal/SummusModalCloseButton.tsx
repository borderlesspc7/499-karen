import type { ReactNode } from 'react'
import { Pressable, type StyleProp, type ViewStyle } from 'react-native'
import { X } from 'lucide-react-native'

type SummusModalCloseButtonProps = {
  onPress: () => void
  accessibilityLabel?: string
  className?: string
  style?: StyleProp<ViewStyle>
  variant?: 'dark' | 'light'
}

export function SummusModalCloseButton({
  onPress,
  accessibilityLabel = 'Fechar',
  className = '',
  style,
  variant = 'dark',
}: SummusModalCloseButtonProps) {
  const isLight = variant === 'light'

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      className={[
        'h-10 w-10 items-center justify-center rounded-2xl border active:opacity-70',
        isLight ? 'border-slate-200 bg-slate-100' : 'border-white/10 bg-white/10',
        className,
      ].join(' ')}
      style={style}
    >
      <X size={18} color={isLight ? '#64748B' : '#CBD5E1'} strokeWidth={2.25} />
    </Pressable>
  )
}
