import { Pressable, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { CampaignWizardStep } from './CampaignWizardStep'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { platformEntering } from '@/lib/platform-animation'

type AudienceStepProps = {
  audience: string
  suggestedAudience?: string
  onChangeAudience: (value: string) => void
  onBack: () => void
  onNext: () => void
}

const AUDIENCE_CHIPS = [
  'Mulheres 30-50 anos',
  'Empresários locais',
  'Clínicas estéticas',
  'Profissionais liberais',
  'E-commerce premium',
]

export function AudienceStep({
  audience,
  suggestedAudience,
  onChangeAudience,
  onBack,
  onNext,
}: AudienceStepProps) {
  const tc = useThemeClasses()
  const isValid = audience.trim().length > 0

  return (
    <CampaignWizardStep
      stepIndex={1}
      totalSteps={4}
      title="Quem é seu público?"
      subtitle="Descreva quem você quer alcançar com esta campanha."
      showBack
      onBack={onBack}
    >
      {suggestedAudience ? (
        <Animated.View entering={platformEntering(FadeInDown.duration(350))}>
          <Pressable
            onPress={() => onChangeAudience(suggestedAudience)}
            className={['self-start rounded-full border border-electricBlue/30 bg-electricBlue/10 px-4 py-2', tc.cardSm].join(' ')}
          >
            <Text className="text-xs font-medium text-electricBlue">
              Usar do onboarding: {suggestedAudience}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}

      <TextInput
        value={audience}
        onChangeText={onChangeAudience}
        placeholder="Ex: Mulheres de 35 a 55 anos interessadas em estética facial"
        placeholderTextColor={tc.placeholderColor}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className={['min-h-[100px]', tc.input].join(' ')}
      />

      <View className="flex-row flex-wrap gap-2">
        {AUDIENCE_CHIPS.map((chip) => (
          <Pressable
            key={chip}
            onPress={() => onChangeAudience(chip)}
            className={['rounded-full border px-3.5 py-2', tc.filterInactive].join(' ')}
          >
            <Text className={['text-xs font-medium', tc.filterInactiveText].join(' ')}>{chip}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={onNext}
        disabled={!isValid}
        className={[
          'rounded-2xl py-4',
          isValid ? 'bg-gold active:opacity-90' : 'bg-slate-200 opacity-50',
        ].join(' ')}
      >
        <Text className="text-center text-base font-bold text-deepBlue">Continuar</Text>
      </Pressable>
    </CampaignWizardStep>
  )
}
