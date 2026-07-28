import { Pressable, Text, TextInput, View } from 'react-native'
import { useTranslation } from '@shared/contexts'
import { CampaignWizardStep } from './CampaignWizardStep'
import { OFFER_SUGGESTION_KEYS } from './campaign-wizard-types'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type OfferStepProps = {
  offer: string
  onChangeOffer: (value: string) => void
  onBack: () => void
  onNext: () => void
}

export function OfferStep({ offer, onChangeOffer, onBack, onNext }: OfferStepProps) {
  const tc = useThemeClasses()
  const { t } = useTranslation()
  const isValid = offer.trim().length > 0

  return (
    <CampaignWizardStep
      stepIndex={2}
      totalSteps={4}
      title={t('campaigns.offerTitle')}
      subtitle={t('campaigns.offerSubtitle')}
      showBack
      onBack={onBack}
    >
      <TextInput
        value={offer}
        onChangeText={onChangeOffer}
        placeholder={t('campaigns.offerPh')}
        placeholderTextColor={tc.placeholderColor}
        className={tc.input}
      />

      <View className="gap-2">
        <Text className={tc.sectionLabel}>{t('campaigns.aiSuggestions')}</Text>
        <View className="flex-row flex-wrap gap-2">
          {OFFER_SUGGESTION_KEYS.map((suggestionKey) => {
            const suggestion = t(suggestionKey)
            return (
              <Pressable
                key={suggestionKey}
                onPress={() => onChangeOffer(suggestion)}
                className={['rounded-full border px-3.5 py-2', tc.filterInactive].join(' ')}
              >
                <Text className={['text-xs font-medium', tc.filterInactiveText].join(' ')}>
                  {suggestion}
                </Text>
              </Pressable>
            )
          })}
        </View>
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
