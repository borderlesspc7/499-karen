import { Pressable, Text, View } from 'react-native'
import { Sparkles, Zap } from 'lucide-react-native'
import { GROWTH_ACTIONS } from '@shared/constants/growth-actions'
import { premiumColors, premiumShadows } from '@/constants/premium-theme'
import { useThemeClasses } from '@/hooks/useThemeClasses'

export const FEATURED_ACTION_ID = 'reactivate-inactive-leads'
export const featuredAction = GROWTH_ACTIONS[FEATURED_ACTION_ID]

type NextBestActionCardProps = {
  onRequestApproval: () => void
}

function formatRevenue(amount: number): string {
  return amount.toLocaleString('pt-BR')
}

export function NextBestActionCard({ onRequestApproval }: NextBestActionCardProps) {
  const tc = useThemeClasses()

  return (
    <View
      className={['overflow-hidden border border-gold/30 p-6', tc.card].join(' ')}
      style={tc.isDark ? tc.cardShadow : premiumShadows.gold}
    >
      <View className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gold/5" />
      <View className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-gold/10" />

      <View className="flex-row items-center gap-2">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-gold/15">
          <Sparkles size={14} color={premiumColors.gold} strokeWidth={1.5} />
        </View>
        <Text className="text-xs font-bold uppercase tracking-wider text-gold">
          Oportunidade para hoje
        </Text>
      </View>

      <Text className={['mt-4 text-lg font-semibold', tc.textPrimary].join(' ')}>
        Sua maior oportunidade hoje:
      </Text>

      <Text className={['mt-2 text-xl font-bold leading-7', tc.textPrimary].join(' ')}>
        {featuredAction.title}
      </Text>

      <View className="mt-4 self-start rounded-full border border-emerald/15 bg-emerald/10 px-3.5 py-2">
        <Text className="text-sm font-bold text-emerald">
          Impacto estimado: +R$ {formatRevenue(featuredAction.revenueGain)}
        </Text>
      </View>

      <Pressable
        onPress={onRequestApproval}
        className="mt-6 flex-row items-center justify-center gap-2 rounded-card bg-forest py-4 active:opacity-90"
      >
        <Zap size={18} color="#FFFFFF" fill="#FFFFFF" strokeWidth={1.5} />
        <Text className="text-base font-bold text-white">Executar Agora</Text>
      </Pressable>
    </View>
  )
}
