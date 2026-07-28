import { Text, View } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
import { useTranslation } from '@shared/contexts'
import type { TranslationKey } from '@shared/i18n'
import type { RevenueDailyMetrics } from '@shared/services/revenue-center'
import { formatCurrencyBrlCompact } from '@shared/services/revenue-center'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type RevenueMetricsStripProps = {
  metrics: RevenueDailyMetrics
}

type MetricItem = {
  label: string
  value: number
  format: (v: number) => string
  suffix?: string
}

function buildMetricItems(
  metrics: RevenueDailyMetrics,
  t: (key: TranslationKey) => string,
): MetricItem[] {
  return [
    {
      label: t('home.revenueGenerated'),
      value: metrics.revenueGenerated,
      format: (v) => formatCurrencyBrlCompact(Math.round(v)),
    },
    {
      label: t('home.leads'),
      value: metrics.leadsRecovered,
      format: (v) => `+${Math.round(v)}`,
    },
    {
      label: t('home.timeSaved'),
      value: metrics.hoursSaved,
      format: (v) => `${Math.round(v)}h`,
    },
    {
      label: t('home.aiHours'),
      value: metrics.hoursWorkedByAi,
      format: (v) => `${Math.round(v)}h`,
    },
  ]
}

export function RevenueMetricsStrip({ metrics }: RevenueMetricsStripProps) {
  const { t } = useTranslation()
  const tc = useThemeClasses()
  const items = buildMetricItems(metrics, t)

  return (
    <Animated.View entering={FadeInUp.delay(400).duration(500)} className="gap-3">
      <Text className={tc.sectionLabel}>{t('home.aiTeamExecuted')}</Text>
      <View
        className={['flex-row flex-wrap gap-3 p-5', tc.glassCard].join(' ')}
        style={tc.cardShadow}
      >
        {items.map((item) => (
          <View key={item.label} className="min-w-[45%] flex-1 gap-1">
            <AnimatedCounter
              value={item.value}
              formatter={item.format}
              className={['text-xl font-bold tabular-nums', tc.revenueMetric].join(' ')}
            />
            <Text className={['text-xs', tc.textMuted].join(' ')}>{item.label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  )
}
