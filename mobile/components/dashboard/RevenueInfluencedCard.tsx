import { Text, View } from 'react-native'
import { TrendingUp } from 'lucide-react-native'
import Svg, { Polyline } from 'react-native-svg'
import { premiumColors } from '@/constants/premium-theme'
import { SummusDarkCard } from '@/components/ui/SummusCard'
import { dashboardMockData } from '@/constants/dashboard-mock-data'

function MiniSparkline() {
  return (
    <Svg width={80} height={32} viewBox="0 0 80 32">
      <Polyline
        points="0,28 12,22 24,24 36,16 48,18 60,10 72,12 80,4"
        fill="none"
        stroke={premiumColors.gold}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  )
}

export function RevenueInfluencedCard() {
  const { amount, changePercent, periodLabel } = dashboardMockData.revenue

  return (
    <SummusDarkCard>
      <Text className="text-xs font-medium uppercase tracking-wider text-slate-400">
        Revenue Influenced
      </Text>
      <Text className="mt-2 text-3xl font-bold text-white">
        ${amount.toLocaleString('en-US')}
      </Text>
      <View className="mt-2 flex-row items-center gap-1">
        <TrendingUp size={14} color="#34D399" />
        <Text className="text-xs font-semibold text-emerald-400">
          {changePercent}% {periodLabel}
        </Text>
      </View>
      <View className="mt-3 items-end">
        <MiniSparkline />
      </View>
    </SummusDarkCard>
  )
}
