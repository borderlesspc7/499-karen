import { Text, View } from 'react-native'
import { Sparkles } from 'lucide-react-native'
import type { InboxPriority } from '@shared/types'
import { formatCurrencyBrlCompact } from '@shared/services/revenue-center'
import { premiumColors } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type InboxAiSummaryProps = {
  summary: string
  estimatedValue?: number
  priority?: InboxPriority
  compact?: boolean
}

const PRIORITY_COLORS: Record<InboxPriority, string> = {
  hot: '#EF4444',
  warm: '#F59E0B',
  cold: '#94A3B8',
}

export function InboxAiSummary({
  summary,
  estimatedValue,
  priority = 'warm',
  compact = false,
}: InboxAiSummaryProps) {
  const tc = useThemeClasses()

  if (compact) {
    return (
      <View className="flex-row items-center gap-1.5">
        <Sparkles size={10} color={premiumColors.gold} />
        <Text className={['flex-1 text-xs', tc.textMuted].join(' ')} numberOfLines={1}>
          IA: {summary}
        </Text>
        {estimatedValue ? (
          <Text className="text-xs font-semibold text-gold">
            {formatCurrencyBrlCompact(estimatedValue)}
          </Text>
        ) : null}
      </View>
    )
  }

  return (
    <View className={['flex-row items-start gap-2 rounded-xl border border-gold/15 bg-gold/5 px-3 py-2', tc.cardSm].join(' ')}>
      <View
        className="mt-1 h-2 w-2 rounded-full"
        style={{ backgroundColor: PRIORITY_COLORS[priority] }}
      />
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-1">
          <Sparkles size={11} color={premiumColors.gold} />
          <Text className="text-[10px] font-bold uppercase tracking-wider text-gold">IA</Text>
        </View>
        <Text className={['mt-0.5 text-xs leading-4', tc.textSecondary].join(' ')}>
          {summary}
        </Text>
        {estimatedValue ? (
          <Text className="mt-1 text-xs font-semibold text-emerald">
            Potencial: +{formatCurrencyBrlCompact(estimatedValue)}
          </Text>
        ) : null}
      </View>
    </View>
  )
}
