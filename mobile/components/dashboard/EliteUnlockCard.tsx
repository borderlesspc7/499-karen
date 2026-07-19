import { Pressable, Text, View } from 'react-native'
import { ArrowRight, Gem } from 'lucide-react-native'
import { premiumColors } from '@/constants/premium-theme'
import { SummusDarkCard } from '@/components/ui/SummusCard'
import { dashboardMockData } from '@/constants/dashboard-mock-data'

export function EliteUnlockCard() {
  const { title, description } = dashboardMockData.eliteUnlock

  return (
    <SummusDarkCard className="overflow-hidden">
      <View className="flex-row items-center gap-4">
        <View className="h-20 w-20 items-center justify-center rounded-2xl bg-gold-500/15">
          <View className="h-14 w-14 items-center justify-center rounded-xl bg-gold-400/25">
            <Gem size={32} color={premiumColors.gold} />
          </View>
        </View>
        <View className="flex-1">
          <Text className="text-[10px] font-bold uppercase tracking-wider text-gold-400">
            Elite Unlock
          </Text>
          <Text className="mt-1 text-base font-bold text-white">{title}</Text>
          <Text className="mt-1 text-xs leading-5 text-slate-400">{description}</Text>
        </View>
      </View>

      <Pressable className="mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-gold-500 py-3 active:bg-gold-400">
        <Text className="text-sm font-bold text-summus-950">Open Now</Text>
        <ArrowRight size={16} color="#020617" />
      </Pressable>
    </SummusDarkCard>
  )
}
