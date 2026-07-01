import { Pressable, Text, View } from 'react-native'

type OnboardingProgressBarProps = {
  currentStep: number
  totalSteps: number
}

export function OnboardingProgressBar({ currentStep, totalSteps }: OnboardingProgressBarProps) {
  const progress = Math.min(1, Math.max(0, currentStep / totalSteps))

  return (
    <View className="mb-8 gap-2">
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-medium uppercase tracking-wider text-white/40">
          Identidade da marca
        </Text>
        <Text className="text-xs font-medium text-white/50">
          {currentStep} de {totalSteps}
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
