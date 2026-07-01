import { Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Megaphone, TrendingUp } from 'lucide-react-native'
import { ActivatedGlow } from '@/components/ui/ActivatedGlow'

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
        className="overflow-hidden rounded-3xl bg-deepBlue p-5"
        style={{
          shadowColor: '#3B82F6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isJustActivated ? 0.35 : 0.2,
          shadowRadius: isJustActivated ? 20 : 14,
          elevation: 4,
        }}
      >
        <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-electricBlue/10" />

        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-2">
            <View className="flex-row items-center gap-2">
              <Megaphone size={14} color="#3B82F6" />
              <Text className="text-xs font-bold uppercase tracking-wider text-electricBlue">
                Campanha Ativa
              </Text>
            </View>
            <Text className="text-2xl font-bold text-white">Novo Serviço</Text>
            <Text className="text-sm text-white/50">
              {isJustActivated
                ? 'Sua campanha acaba de entrar no ar — a IA está operando em todos os canais.'
                : 'Resultados omnichannel gerados pela IA após publicação automática.'}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5 rounded-full bg-emerald/15 px-3 py-1.5">
            <TrendingUp size={12} color="#10B981" />
            <Text className="text-[11px] font-bold text-emerald">
              {isJustActivated ? 'Ativada agora' : 'Ao vivo'}
            </Text>
          </View>
        </View>

        <View className="mt-5 flex-row gap-2">
          {CAMPAIGN_METRICS.map((metric) => (
            <View
              key={metric.id}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-3"
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
