import { Pressable, Text, TextInput, View } from 'react-native'
import { CampaignWizardStep } from './CampaignWizardStep'
import { OFFER_SUGGESTIONS } from './campaign-wizard-types'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type OfferStepProps = {
  offer: string
  onChangeOffer: (value: string) => void
  onBack: () => void
  onNext: () => void
}

export function OfferStep({ offer, onChangeOffer, onBack, onNext }: OfferStepProps) {
  const tc = useThemeClasses()
  const isValid = offer.trim().length > 0

  return (
    <CampaignWizardStep
      stepIndex={2}
      totalSteps={4}
      title="Qual é a sua oferta?"
      subtitle="O que você está vendendo ou promovendo?"
      showBack
      onBack={onBack}
    >
      <TextInput
        value={offer}
        onChangeText={onChangeOffer}
        placeholder="Ex: Consultoria de harmonização facial com 20% off"
        placeholderTextColor={tc.placeholderColor}
        className={tc.input}
      />

      <View className="gap-2">
        <Text className={tc.sectionLabel}>Sugestões da IA</Text>
        <View className="flex-row flex-wrap gap-2">
          {OFFER_SUGGESTIONS.map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => onChangeOffer(suggestion)}
              className={['rounded-full border px-3.5 py-2', tc.filterInactive].join(' ')}
            >
              <Text className={['text-xs font-medium', tc.filterInactiveText].join(' ')}>
                {suggestion}
              </Text>
            </Pressable>
          ))}
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
        <Text className="text-center text-base font-bold text-deepBlue">Continuar</Text>
      </Pressable>
    </CampaignWizardStep>
  )
}
