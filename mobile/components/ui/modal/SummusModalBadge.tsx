import type { ReactNode } from 'react'
import { Text, View } from 'react-native'
import type { LucideIcon } from 'lucide-react-native'

type SummusModalBadgeProps = {
  label: string
  icon?: LucideIcon
  tone?: 'gold' | 'blue' | 'emerald'
}

const TONE_STYLES = {
  gold: {
    border: 'border-gold/30',
    background: 'bg-gold/10',
    text: 'text-gold',
    icon: '#F59E0B',
  },
  blue: {
    border: 'border-electricBlue/30',
    background: 'bg-electricBlue/10',
    text: 'text-electricBlue',
    icon: '#3B82F6',
  },
  emerald: {
    border: 'border-emerald/30',
    background: 'bg-emerald/10',
    text: 'text-emerald',
    icon: '#10B981',
  },
} as const

export function SummusModalBadge({ label, icon: Icon, tone = 'gold' }: SummusModalBadgeProps) {
  const styles = TONE_STYLES[tone]

  return (
    <View
      className={[
        'flex-row items-center gap-2 self-start rounded-full border px-3 py-1.5',
        styles.border,
        styles.background,
      ].join(' ')}
    >
      {Icon ? <Icon size={12} color={styles.icon} /> : null}
      <Text className={['text-[11px] font-bold uppercase tracking-wider', styles.text].join(' ')}>
        {label}
      </Text>
    </View>
  )
}
