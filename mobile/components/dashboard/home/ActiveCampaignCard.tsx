import { Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Megaphone, TrendingUp } from 'lucide-react-native'
import { ActivatedGlow } from '@/components/ui/ActivatedGlow'
import { premiumColors, premiumShadows } from '@/constants/premium-theme'

const CAMPAIGN_METRICS = [
  { id: 'views', label: 'Visualizações', value: '14.5k' },
  { id: 'leads', label: 'Leads Gerados', value: '42' },
  { id: 'cpl', label: 'Custo por Lead', value: 'R$ 8,50' },
] as const

type ActiveCampaignCardProps = {
  isJustActivated?: boolean
}

export function ActiveCampaignCard({ isJustActivated = false }: ActiveCampaignCardProps) {
  return (
    <ActivatedGlow active={isJustActivated}>
      <Animated.View
        entering={
          isJustActivated
            ? FadeInDown.duration(500).springify().damping(14)
            : undefined
        }
        className="overflow-hidden rounded-card border border-summus-700 bg-navy p-5"
        style={[
          premiumShadows.navy,
          isJustActivated
            ? { shadowColor: premiumColors.gold, shadowOpacity: 0.25 }
            : undefined,
        ]}
      >
        <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold/5" />
        <View className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-gold/5" />

        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-2">
            <View className="flex-row items-center gap-2">
              <Megaphone size={14} color={premiumColors.gold} strokeWidth={1.5} />
              <Text className="text-xs font-bold uppercase tracking-wider text-gold">
                Campanha Ativa
              </Text>
            </View>
            <Text className="text-2xl font-bold tracking-tight text-white">Novo Serviço</Text>
            <Text className="text-sm leading-5 text-white/55">
              {isJustActivated
                ? 'Sua campanha acaba de entrar no ar — a IA está operando em todos os canais.'
                : 'Resultados omnichannel gerados pela IA após publicação automática.'}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5 rounded-full border border-emerald/20 bg-emerald/10 px-3 py-1.5">
            <TrendingUp size={12} color={premiumColors.emerald} strokeWidth={2} />
            <Text className="text-[11px] font-bold text-emerald">
              {isJustActivated ? 'Ativada agora' : 'Ao vivo'}
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row gap-2">
          {CAMPAIGN_METRICS.map((metric) => (
            <View
              key={metric.id}
              className="flex-1 rounded-card border border-white/10 bg-white/5 px-3 py-3"
            >
              <Text className="text-[10px] font-semibold uppercase tracking-wide text-white/45">
                {metric.label}
              </Text>
              <Text className="mt-1 text-lg font-bold text-white">{metric.value}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </ActivatedGlow>
  )
}
