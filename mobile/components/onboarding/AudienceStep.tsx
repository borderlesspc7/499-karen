import { Text, View } from 'react-native'
import { Target } from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'
import type { TranslationKey } from '@shared/i18n'
import type { TargetClientType } from '@shared/types/brand-identity'
import { AnimatedPressable } from '@/components/ui/AnimatedPressable'
import { SummusModalBadge } from '@/components/ui/modal'
import { OnboardingField } from './OnboardingField'

const TARGET_OPTIONS: Array<{ type: TargetClientType; labelKey: TranslationKey }> = [
  { type: 'mulheres-estetica', labelKey: 'onboarding.audEsthetics' },
  { type: 'executivos', labelKey: 'onboarding.audExecutives' },
  { type: 'noivas-eventos', labelKey: 'onboarding.audBrides' },
  { type: 'premium-alto-ticket', labelKey: 'onboarding.audPremium' },
  { type: 'publico-local', labelKey: 'onboarding.audLocal' },
  { type: 'outro', labelKey: 'onboarding.audOther' },
]

type AudienceStepProps = {
  targetClientType: TargetClientType | null
  targetClientDescription: string
  onSelectTarget: (type: TargetClientType) => void
  onChangeDescription: (value: string) => void
  variant?: 'onboarding' | 'embedded'
}

export function AudienceStep({
  targetClientType,
  targetClientDescription,
  onSelectTarget,
  onChangeDescription,
  variant = 'onboarding',
}: AudienceStepProps) {
  const { t } = useTranslation()
  const isEmbedded = variant === 'embedded'

  return (
    <>
      {!isEmbedded ? (
        <View className="mb-8 items-center gap-3">
          <SummusModalBadge label={t('onboarding.step2')} icon={Target} tone="emerald" />
          <Text className="text-center text-2xl font-bold leading-tight text-white">
            {t('onboarding.audienceTitle')}
          </Text>
          <Text className="max-w-sm text-center text-base leading-6 text-white/55">
            {t('onboarding.audienceSubtitle')}
          </Text>
        </View>
      ) : null}

      <View className="gap-3">
        {TARGET_OPTIONS.map(({ type, labelKey }) => {
          const isSelected = targetClientType === type

          return (
            <AnimatedPressable
              key={type}
              onPress={() => onSelectTarget(type)}
              haptic={false}
              className={[
                'rounded-2xl border px-4 py-3.5',
                isEmbedded
                  ? isSelected
                    ? 'border-violet-400 bg-violet-50'
                    : 'border-slate-200 bg-white'
                  : isSelected
                    ? 'border-gold bg-gold/10'
                    : 'border-white/10 bg-white/5',
              ].join(' ')}
            >
              <Text
                className={[
                  'text-sm font-medium',
                  isEmbedded
                    ? isSelected
                      ? 'text-violet-700'
                      : 'text-slate-700'
                    : isSelected
                      ? 'text-gold'
                      : 'text-white/80',
                ].join(' ')}
              >
                {t(labelKey)}
              </Text>
            </AnimatedPressable>
          )
        })}
      </View>

      {targetClientType === 'outro' || targetClientDescription.length > 0 ? (
        <View className="mt-5">
          <OnboardingField
            label={t('onboarding.detailsLabel')}
            value={targetClientDescription}
            onChangeText={onChangeDescription}
            placeholder={t('onboarding.detailsPh')}
            multiline
            variant={variant}
          />
        </View>
      ) : null}
    </>
  )
}
