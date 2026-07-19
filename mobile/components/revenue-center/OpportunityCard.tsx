import { Pressable, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import type { OpportunityVariant, RevenueOpportunity } from '@shared/services/revenue-center'
import {
  formatCurrencyBrlCompact,
  OPPORTUNITY_VARIANTS,
} from '@shared/services/revenue-center'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { platformEntering } from '@/lib/platform-animation'

type OpportunityCardProps = {
  opportunity: RevenueOpportunity
  index?: number
  onPress: () => void
}

const VARIANT_STYLES: Record<
  OpportunityVariant,
  { border: string; badge: string; badgeText: string; button: string; dot: string }
> = {
  green: {
    border: 'border-emerald/20',
    badge: 'bg-emerald/10',
    badgeText: 'text-emerald',
    button: 'bg-emerald',
    dot: 'bg-emerald',
  },
  blue: {
    border: 'border-electricBlue/20',
    badge: 'bg-electricBlue/10',
    badgeText: 'text-electricBlue',
    button: 'bg-electricBlue',
    dot: 'bg-electricBlue',
  },
  gold: {
    border: 'border-gold/25',
    badge: 'bg-gold/10',
    badgeText: 'text-gold',
    button: 'bg-gold',
    dot: 'bg-gold',
  },
}

export function OpportunityCard({ opportunity, index = 0, onPress }: OpportunityCardProps) {
  const tc = useThemeClasses()
  const { isWebDesktop } = useResponsiveLayout()
  const variant = OPPORTUNITY_VARIANTS[opportunity.type]
  const styles = VARIANT_STYLES[variant]

  const impactDisplay =
    opportunity.type === 'approve-campaign' && opportunity.secondaryValue
      ? `${opportunity.secondaryValue} novos leads`
      : `+${formatCurrencyBrlCompact(opportunity.impactValue)}`

  const buttonTextClass = variant === 'gold' ? 'text-deepBlue' : 'text-white'

  return (
    <Animated.View
      entering={platformEntering(FadeInDown.delay(100 + index * 70).duration(450))}
      className={isWebDesktop ? 'min-w-0 flex-1' : ''}
    >
      <View
        className={[
          'gap-4 overflow-hidden border p-5',
          tc.glassCard,
          styles.border,
          isWebDesktop ? 'h-full' : '',
        ].join(' ')}
        style={tc.cardShadow}
      >
        <View className="flex-row items-center gap-2">
          <View className={['h-2 w-2 rounded-full', styles.dot].join(' ')} />
          <Text className={['flex-1 text-base font-semibold leading-snug', tc.textPrimary].join(' ')}>
            {opportunity.title}
          </Text>
        </View>

        <Text className={['text-xs leading-5', tc.textSecondary].join(' ')} numberOfLines={2}>
          {opportunity.subtitle}
        </Text>

        <View className={['self-start rounded-full px-3 py-1.5', styles.badge].join(' ')}>
          <Text className={['text-xs font-semibold', styles.badgeText].join(' ')}>
            {opportunity.impactLabel}: {impactDisplay}
          </Text>
        </View>

        <Pressable
          onPress={onPress}
          className={['items-center rounded-xl py-3 active:opacity-90', styles.button].join(' ')}
        >
          <Text className={['text-sm font-bold', buttonTextClass].join(' ')}>
            {opportunity.ctaLabel === 'Reativar Agora'
              ? 'Executar agora'
              : opportunity.ctaLabel === 'Aprovar'
                ? 'Aprovar campanha'
                : opportunity.ctaLabel === 'Ver'
                  ? 'Ver oportunidades'
                  : opportunity.ctaLabel}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  )
}

type OpportunitySectionProps = {
  opportunities: RevenueOpportunity[]
  onPress: (id: string) => void
  limit?: number
}

export function OpportunitySection({
  opportunities,
  onPress,
  limit,
}: OpportunitySectionProps) {
  const tc = useThemeClasses()
  const { isWebDesktop } = useResponsiveLayout()
  const resolvedLimit = limit ?? (isWebDesktop ? 3 : 4)
  const visible = opportunities.slice(0, resolvedLimit)

  return (
    <View className="gap-4">
      <Text className={['text-lg font-bold', tc.textPrimary].join(' ')}>
        Oportunidades para hoje
      </Text>
      <View className={isWebDesktop ? 'flex-row gap-4' : 'gap-3'}>
        {visible.map((opportunity, index) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            index={index}
            onPress={() => onPress(opportunity.id)}
          />
        ))}
      </View>
    </View>
  )
}
