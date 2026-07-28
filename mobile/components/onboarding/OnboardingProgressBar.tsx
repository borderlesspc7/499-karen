import { Text, View } from 'react-native'
import { useTranslation } from '@shared/contexts'

type OnboardingProgressBarProps = {
  currentStep: number
  totalSteps: number
}

export function OnboardingProgressBar({ currentStep, totalSteps }: OnboardingProgressBarProps) {
  const { t } = useTranslation()
  const progress = Math.min(1, Math.max(0, currentStep / totalSteps))

  return (
    <View className="gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-medium uppercase tracking-wider text-white/40">
          {t('onboarding.progressLabel')}
        </Text>
        <Text className="text-xs font-medium text-white/50">
          {t('onboarding.stepOf', { current: currentStep, total: totalSteps })}
        </Text>
      </View>
      <View className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <View
          className="h-full rounded-full bg-gold"
          style={{ width: `${progress * 100}%` }}
        />
      </View>
    </View>
  )
}
