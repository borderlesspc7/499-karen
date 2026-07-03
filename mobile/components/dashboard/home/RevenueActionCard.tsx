import { Pressable, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { ChevronRight } from 'lucide-react-native'
import type { RevenueOpportunity } from '@shared/services/revenue-center'
import { formatCurrencyBrlCompact } from '@shared/services/revenue-center'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type RevenueActionCardProps = {
  opportunity: RevenueOpportunity
  index?: number
  onPress: () => void
}

export function RevenueActionCard({
  opportunity,
  index = 0,
  onPress,
}: RevenueActionCardProps) {
  const tc = useThemeClasses()

  const impactDisplay =
    opportunity.type === 'approve-campaign' && opportunity.secondaryValue
      ? `${opportunity.secondaryValue} novos leads`
      : `+${formatCurrencyBrlCompact(opportunity.impactValue)}`

  return (
    <Animated.View entering={FadeInDown.delay(80 + index * 60).duration(450)}>
      <Pressable
        onPress={onPress}
        className={['flex-row items-center gap-4 p-5 active:opacity-90', tc.glassCard].join(' ')}
        style={tc.cardShadow}
      >
        <View className="h-2.5 w-2.5 rounded-full bg-emerald" />

        <View className="min-w-0 flex-1 gap-1">
          <Text className={['text-base font-semibold', tc.textPrimary].join(' ')}>
            {opportunity.title}
          </Text>
          <Text className={['text-xs', tc.textMuted].join(' ')} numberOfLines={1}>
            {opportunity.subtitle}
          </Text>
          <View className="mt-2 self-start rounded-full bg-emerald/10 px-3 py-1">
            <Text className="text-xs font-semibold text-emerald">
              {opportunity.impactLabel}: {impactDisplay}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-1 rounded-full bg-forest px-4 py-2.5">
          <Text className="text-xs font-bold text-white">{opportunity.ctaLabel}</Text>
          <ChevronRight size={14} color="#FFFFFF" strokeWidth={2} />
        </View>
      </Pressable>
    </Animated.View>
  )
}
