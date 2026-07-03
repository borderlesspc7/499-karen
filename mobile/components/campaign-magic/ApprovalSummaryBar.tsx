import { Text, View } from 'react-native'
import { Clock, Layers, Megaphone, Users } from 'lucide-react-native'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type ApprovalSummaryBarProps = {
  channels: string[]
  pieceCount: number
  hoursSaved: number
  estimatedLeads: number
}

export function ApprovalSummaryBar({
  channels,
  pieceCount,
  hoursSaved,
  estimatedLeads,
}: ApprovalSummaryBarProps) {
  const tc = useThemeClasses()
  const { isWebDesktop } = useResponsiveLayout()

  const items = [
    {
      icon: Megaphone,
      label: 'Canais',
      value: channels.join(', '),
    },
    {
      icon: Layers,
      label: 'Peças geradas',
      value: `${pieceCount}`,
    },
    {
      icon: Clock,
      label: 'Tempo economizado',
      value: `~${hoursSaved} horas`,
    },
    {
      icon: Users,
      label: 'Estimativa de alcance',
      value: `${estimatedLeads} leads`,
    },
  ]

  return (
    <View className={['gap-3 rounded-2xl border border-gold/15 bg-gold/5 p-4', tc.cardSm].join(' ')}>
      <Text className={tc.sectionLabel}>Resumo antes de publicar</Text>
      <View className={isWebDesktop ? 'flex-row flex-wrap gap-4' : 'gap-3'}>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <View
              key={item.label}
              className={[
                'flex-row items-start gap-3',
                isWebDesktop ? 'min-w-[45%] flex-1' : '',
              ].join(' ')}
            >
              <Icon size={14} color={premiumColors.gold} strokeWidth={1.5} />
              <View className="min-w-0 flex-1">
                <Text className={['text-xs', tc.textMuted].join(' ')}>{item.label}</Text>
                <Text className={['text-sm font-medium', tc.textPrimary].join(' ')} numberOfLines={2}>
                  {item.value}
                </Text>
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}
