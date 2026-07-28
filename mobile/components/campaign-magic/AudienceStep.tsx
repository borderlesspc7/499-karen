import { Pressable, Text, TextInput, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useTranslation } from '@shared/contexts'
import { CampaignWizardStep } from './CampaignWizardStep'
import { AUDIENCE_CHIP_KEYS } from './campaign-wizard-types'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { platformEntering } from '@/lib/platform-animation'

type AudienceStepProps = {
  audience: string
  suggestedAudience?: string
  onChangeAudience: (value: string) => void
  onBack: () => void
  onNext: () => void
}

export function AudienceStep({
  audience,
  suggestedAudience,
  onChangeAudience,
  onBack,
  onNext,
}: AudienceStepProps) {
  const tc = useThemeClasses()
  const { t } = useTranslation()
  const isValid = audience.trim().length > 0

  return (
    <CampaignWizardStep
      stepIndex={1}
      totalSteps={4}
      title={t('campaigns.audienceTitle')}
      subtitle={t('campaigns.audienceSubtitle')}
      showBack
      onBack={onBack}
    >
      {suggestedAudience ? (
        <Animated.View entering={platformEntering(FadeInDown.duration(350))}>
          <Pressable
            onPress={() => onChangeAudience(suggestedAudience)}
            className={[
              'self-start rounded-full border border-electricBlue/30 bg-electricBlue/10 px-4 py-2',
              tc.cardSm,
            ].join(' ')}
          >
            <Text className="text-xs font-medium text-electricBlue">
              {t('campaigns.audienceFromOnboarding', { value: suggestedAudience })}
            </Text>
          </Pressable>
        </Animated.View>
      ) : null}

      <TextInput
        value={audience}
        onChangeText={onChangeAudience}
        placeholder={t('campaigns.audiencePh')}
        placeholderTextColor={tc.placeholderColor}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        className={['min-h-[100px]', tc.input].join(' ')}
      />

      <View className="flex-row flex-wrap gap-2">
        {AUDIENCE_CHIP_KEYS.map((chipKey) => {
          const chipLabel = t(chipKey)
          return (
            <Pressable
              key={chipKey}
              onPress={() => onChangeAudience(chipLabel)}
              className={['rounded-full border px-3.5 py-2', tc.filterInactive].join(' ')}
            >
              <Text className={['text-xs font-medium', tc.filterInactiveText].join(' ')}>
                {chipLabel}
              </Text>
            </Pressable>
          )
        })}
      </View>

      <Pressable
        onPress={onNext}
        disabled={!isValid}
        className={[
          'rounded-2xl py-4',
          isValid ? 'bg-gold active:opacity-90' : 'bg-slate-200 opacity-50',
        ].join(' ')}
      >
        <Text className="text-center text-base font-bold text-deepBlue">
          {t('common.continue')}
        </Text>
      </Pressable>
    </CampaignWizardStep>
  )
}
