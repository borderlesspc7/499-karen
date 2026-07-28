import { Text, View } from 'react-native'
import { TrendingUp } from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'

type PipelineValueBannerProps = {
  value: number
  leadCount: number
}

export function PipelineValueBanner({ value, leadCount }: PipelineValueBannerProps) {
  const { t, locale } = useTranslation()

  return (
    <View className="rounded-3xl bg-deepBlue p-5">
      <View className="flex-row items-center gap-2">
        <TrendingUp size={16} color="#3B82F6" />
        <Text className="text-xs font-bold uppercase tracking-wider text-electricBlue">
          {t('opportunities.pipelineValue')}
        </Text>
      </View>
      <Text className="mt-2 text-3xl font-bold text-white">
        R$ {value.toLocaleString(locale)}
      </Text>
      <Text className="mt-1 text-sm text-slate-400">
        {t('opportunities.pipelineSubtitle', { count: leadCount })}
      </Text>
    </View>
  )
}
