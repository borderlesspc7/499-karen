import type { ReactNode } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type CampaignWizardStepProps = {
  stepIndex: number
  totalSteps: number
  title: string
  subtitle?: string
  children: ReactNode
  onBack?: () => void
  showBack?: boolean
}

export function CampaignWizardStep({
  stepIndex,
  totalSteps,
  title,
  subtitle,
  children,
  onBack,
  showBack = false,
}: CampaignWizardStepProps) {
  const tc = useThemeClasses()

  return (
    <View className="gap-6">
      <View className="flex-row items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <View
            key={index}
            className={[
              'h-1 flex-1 rounded-full',
              index <= stepIndex ? 'bg-gold' : tc.progressTrack,
            ].join(' ')}
          />
        ))}
      </View>

      {showBack && onBack ? (
        <Pressable onPress={onBack} className="self-start">
          <Text className={['text-sm font-medium', tc.backText].join(' ')}>← Voltar</Text>
        </Pressable>
      ) : null}

      <View className="gap-2">
        <Text className={['text-2xl font-bold', tc.textPrimary].join(' ')}>{title}</Text>
        {subtitle ? (
          <Text className={['text-sm leading-5', tc.textSecondary].join(' ')}>{subtitle}</Text>
        ) : null}
      </View>

      {children}
    </View>
  )
}
