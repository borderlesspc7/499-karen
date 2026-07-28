import { Pressable, Text, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Check } from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'
import { CampaignWizardStep } from './CampaignWizardStep'
import { CAMPAIGN_OBJECTIVES, type CampaignObjective } from './campaign-wizard-types'
import { useThemeClasses } from '@/hooks/useThemeClasses'
import { platformEntering } from '@/lib/platform-animation'

type ObjectiveStepProps = {
  selected: CampaignObjective | null
  onSelect: (objective: CampaignObjective) => void
  onNext: () => void
}

export function ObjectiveStep({ selected, onSelect, onNext }: ObjectiveStepProps) {
  const tc = useThemeClasses()
  const { t } = useTranslation()

  return (
    <CampaignWizardStep
      stepIndex={0}
      totalSteps={4}
      title={t('campaigns.objectiveTitle')}
      subtitle={t('campaigns.objectiveSubtitle')}
    >
      <View className="gap-3">
        {CAMPAIGN_OBJECTIVES.map((option, index) => {
          const isSelected = selected === option.id

          return (
            <Animated.View
              key={option.id}
              entering={platformEntering(FadeInDown.delay(index * 50).duration(350))}
            >
              <Pressable
                onPress={() => onSelect(option.id)}
                className={[
                  'flex-row items-center gap-4 rounded-2xl border p-5',
                  isSelected
                    ? 'border-gold/40 bg-gold/10'
                    : tc.isDark
                      ? 'border-white/10 bg-white/5'
                      : 'border-premiumBorder bg-white',
                ].join(' ')}
              >
                <View
                  className={[
                    'h-5 w-5 items-center justify-center rounded-full border-2',
                    isSelected ? 'border-gold bg-gold' : 'border-slate-300',
                  ].join(' ')}
                >
                  {isSelected ? <Check size={12} color="#FFFFFF" strokeWidth={3} /> : null}
                </View>
                <View className="flex-1">
                  <Text className={['text-base font-semibold', tc.textPrimary].join(' ')}>
                    {t(option.labelKey)}
                  </Text>
                  <Text className={['mt-0.5 text-xs', tc.textMuted].join(' ')}>
                    {t(option.descriptionKey)}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          )
        })}
      </View>

      <Pressable
        onPress={onNext}
        disabled={!selected}
        className={[
          'mt-2 rounded-2xl py-4',
          selected ? 'bg-gold active:opacity-90' : 'bg-slate-200 opacity-50',
        ].join(' ')}
      >
        <Text className="text-center text-base font-bold text-deepBlue">
          {t('common.continue')}
        </Text>
      </Pressable>
    </CampaignWizardStep>
  )
}
