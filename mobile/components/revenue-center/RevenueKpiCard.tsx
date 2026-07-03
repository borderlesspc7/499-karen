import { Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { TrendingUp } from 'lucide-react-native'
import type { RevenueKpi } from '@shared/services/revenue-center'
import { MiniSparkline } from '@/components/ui/MiniSparkline'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { platformEntering } from '@/lib/platform-animation'

type RevenueKpiCardProps = {
  kpi: RevenueKpi
  index?: number
  desktop?: boolean
}

export function RevenueKpiCard({ kpi, index = 0, desktop = false }: RevenueKpiCardProps) {
  const tc = useThemeClasses()

  return (
    <Animated.View
      entering={platformEntering(FadeInDown.delay(index * 60).duration(400))}
      className={[
        'min-w-0 flex-1 overflow-hidden',
        desktop ? 'min-h-[200px] gap-4 rounded-3xl px-7 py-6' : 'gap-2 p-5',
        tc.glassCard,
      ].join(' ')}
      style={tc.cardShadow}
    >
      <Text
        className={[
          desktop ? 'text-base font-medium' : 'text-xs font-medium',
          tc.textMuted,
        ].join(' ')}
        numberOfLines={1}
      >
        {kpi.label}
      </Text>

      <View className={desktop ? 'my-3 w-full' : 'my-1 w-full'}>
        <MiniSparkline
          data={kpi.sparkline}
          color={kpi.accentColor}
          height={desktop ? 56 : 36}
        />
      </View>

      <Text
        className={[
          desktop ? 'text-4xl font-bold' : 'text-2xl font-bold',
          'tabular-nums',
          tc.textPrimary,
        ].join(' ')}
        numberOfLines={1}
      >
        {kpi.displayValue}
      </Text>

      <View className="flex-row items-center gap-1.5">
        <TrendingUp size={desktop ? 16 : 12} color={kpi.accentColor} />
        <Text
          className={desktop ? 'text-base font-semibold' : 'text-xs font-semibold'}
          style={{ color: kpi.accentColor }}
          numberOfLines={1}
        >
          +{kpi.changePercent}% {kpi.changeLabel}
        </Text>
      </View>
    </Animated.View>
  )
}
