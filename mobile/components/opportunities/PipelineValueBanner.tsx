import { Text, View } from 'react-native'
import { TrendingUp } from 'lucide-react-native'

type PipelineValueBannerProps = {
  value: number
  leadCount: number
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('pt-BR')
}

export function PipelineValueBanner({ value, leadCount }: PipelineValueBannerProps) {
  return (
    <View className="rounded-3xl bg-deepBlue p-5">
      <View className="flex-row items-center gap-2">
        <TrendingUp size={16} color="#3B82F6" />
        <Text className="text-xs font-bold uppercase tracking-wider text-electricBlue">
          Valor do Pipeline
        </Text>
      </View>
      <Text className="mt-2 text-3xl font-bold text-white">
        R$ {formatCurrency(value)}
      </Text>
      <Text className="mt-1 text-sm text-slate-400">
        em negociação · {leadCount} {leadCount === 1 ? 'oportunidade' : 'oportunidades'}
      </Text>
    </View>
  )
}
