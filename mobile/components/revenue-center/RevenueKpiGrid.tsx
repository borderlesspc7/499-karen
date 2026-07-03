import { Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import type { RevenueKpi } from '@shared/services/revenue-center'
import { RevenueKpiCard } from '@/components/revenue-center/RevenueKpiCard'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type RevenueKpiGridProps = {
  kpis: RevenueKpi[]
}

export function RevenueKpiGrid({ kpis }: RevenueKpiGridProps) {
  const { isWebDesktop } = useResponsiveLayout()

  if (isWebDesktop) {
    return (
      <View className="w-full flex-row gap-6">
        {kpis.map((kpi, index) => (
          <RevenueKpiCard key={kpi.id} kpi={kpi} index={index} desktop />
        ))}
      </View>
    )
  }

  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        {kpis.slice(0, 2).map((kpi, index) => (
          <RevenueKpiCard key={kpi.id} kpi={kpi} index={index} />
        ))}
      </View>
      <View className="flex-row gap-3">
        {kpis.slice(2, 4).map((kpi, index) => (
          <RevenueKpiCard key={kpi.id} kpi={kpi} index={index + 2} />
        ))}
      </View>
    </View>
  )
}
