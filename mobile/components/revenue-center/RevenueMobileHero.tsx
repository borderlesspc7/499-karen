import { Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { formatCurrencyBrlCompact } from '@shared/services/revenue-center'
import { MiniSparkline } from '@/components/ui/MiniSparkline'
import { premiumColors } from '@/constants/premium-theme'

type RevenueMobileHeroProps = {
  monthlyRevenue: number
}

export function RevenueMobileHero({ monthlyRevenue }: RevenueMobileHeroProps) {
  const sparkline = [80, 92, 88, 105, 110, 118, 125, 128]

  return (
    <Animated.View
      entering={FadeInDown.duration(450)}
      className="overflow-hidden rounded-3xl border border-gold/20 bg-navy p-6"
      style={{
        shadowColor: premiumColors.gold,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
        elevation: 4,
      }}
    >
      <Text className="text-xs font-medium uppercase tracking-wider text-white/50">
        Receita gerada este mês
      </Text>
      <Text className="mt-2 text-3xl font-bold tabular-nums text-gold">
        {formatCurrencyBrlCompact(monthlyRevenue)}
      </Text>
      <View className="mt-4 w-full">
        <MiniSparkline data={sparkline} color={premiumColors.gold} height={48} />
      </View>
    </Animated.View>
  )
}
