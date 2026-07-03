import { Text, View } from 'react-native'
import Animated, { FadeInUp } from 'react-native-reanimated'
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

function buildMetricItems(metrics: RevenueDailyMetrics): MetricItem[] {
  return [
    {
      label: 'Receita gerada',
      value: metrics.revenueGenerated,
      format: (v) => formatCurrencyBrlCompact(Math.round(v)),
    },
    {
      label: 'Leads',
      value: metrics.leadsRecovered,
      format: (v) => `+${Math.round(v)}`,
    },
    {
      label: 'Tempo economizado',
      value: metrics.hoursSaved,
      format: (v) => `${Math.round(v)}h`,
    },
    {
      label: 'Horas IA',
      value: metrics.hoursWorkedByAi,
      format: (v) => `${Math.round(v)}h`,
    },
  ]
}

export function RevenueMetricsStrip({ metrics }: RevenueMetricsStripProps) {
  const tc = useThemeClasses()
  const items = buildMetricItems(metrics)

  return (
    <Animated.View entering={FadeInUp.delay(400).duration(500)} className="gap-3">
      <Text className={tc.sectionLabel}>Hoje sua equipe de IA executou</Text>
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
