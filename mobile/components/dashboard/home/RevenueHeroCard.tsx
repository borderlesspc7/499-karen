import { Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { formatCurrencyBrlCompact } from '@shared/services/revenue-center'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { premiumShadows } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type RevenueHeroCardProps = {
  userName: string
  totalOpportunities: number
  greeting?: string
}

function resolveGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function RevenueHeroCard({
  userName,
  totalOpportunities,
  greeting = resolveGreeting(),
}: RevenueHeroCardProps) {
  const tc = useThemeClasses()

  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      className={['overflow-hidden p-7', tc.heroCard].join(' ')}
      style={tc.isDark ? premiumShadows.navy : premiumShadows.card}
    >
      <Text className={['text-lg font-medium', tc.textSecondary].join(' ')}>
        {greeting}, {userName}.
      </Text>
      <Text className={['mt-6 text-sm', tc.textMuted].join(' ')}>
        Hoje encontramos
      </Text>
      <View className="mt-1 flex-row items-baseline gap-1">
        <AnimatedCounter
          value={totalOpportunities}
          formatter={(v) => formatCurrencyBrlCompact(Math.round(v))}
          className="text-[32px] font-bold tracking-tight text-gold"
        />
      </View>
      <Text className={['mt-1 text-base', tc.textSecondary].join(' ')}>
        em oportunidades para sua empresa.
      </Text>
    </Animated.View>
  )
}
