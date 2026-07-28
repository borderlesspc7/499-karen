import { Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useTranslation } from '@shared/contexts'
import type { TranslationKey } from '@shared/i18n'
import { formatCurrencyBrlCompact } from '@shared/services/revenue-center'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { premiumShadows } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type RevenueHeroCardProps = {
  userName: string
  totalOpportunities: number
  greeting?: string
}

function resolveGreeting(t: (key: TranslationKey) => string): string {
  const hour = new Date().getHours()
  if (hour < 12) return t('home.goodMorning')
  if (hour < 18) return t('home.goodAfternoon')
  return t('home.goodEvening')
}

export function RevenueHeroCard({
  userName,
  totalOpportunities,
  greeting: greetingProp,
}: RevenueHeroCardProps) {
  const { t } = useTranslation()
  const tc = useThemeClasses()
  const greeting = greetingProp ?? resolveGreeting(t)

  return (
    <Animated.View
      entering={FadeInDown.duration(500)}
      className={['overflow-hidden p-7', tc.heroCard].join(' ')}
      style={tc.isDark ? premiumShadows.navy : premiumShadows.card}
    >
      <Text className={['text-lg font-medium', tc.textSecondary].join(' ')}>
        {t('home.greetingName', { greeting, name: userName })}
      </Text>
      <Text className={['mt-6 text-sm', tc.textMuted].join(' ')}>
        {t('home.todayWeFound')}
      </Text>
      <View className="mt-1 flex-row items-baseline gap-1">
        <AnimatedCounter
          value={totalOpportunities}
          formatter={(v) => formatCurrencyBrlCompact(Math.round(v))}
          className="text-[32px] font-bold tracking-tight text-gold"
        />
      </View>
      <Text className={['mt-1 text-base', tc.textSecondary].join(' ')}>
        {t('home.inOpportunities')}
      </Text>
    </Animated.View>
  )
}
