import { Pressable, Text, View } from 'react-native'
import { Sparkles, Wand2 } from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'
import { CampaignWizardStep } from './CampaignWizardStep'
import { CAMPAIGN_OBJECTIVES, type CampaignWizardData } from './campaign-wizard-types'
import { useThemeClasses } from '@/hooks/useThemeClasses'

type ConfirmStepProps = {
  data: CampaignWizardData
  onBack: () => void
  onGenerate: () => void
}

export function ConfirmStep({ data, onBack, onGenerate }: ConfirmStepProps) {
  const tc = useThemeClasses()
  const { t } = useTranslation()
  const objectiveKey = CAMPAIGN_OBJECTIVES.find((o) => o.id === data.objective)?.labelKey
  const objectiveLabel = objectiveKey ? t(objectiveKey) : t('common.emDash')

  return (
    <CampaignWizardStep
      stepIndex={3}
      totalSteps={4}
      title={t('campaigns.confirmTitle')}
      subtitle={t('campaigns.confirmSubtitle')}
      showBack
      onBack={onBack}
    >
      <View className={['gap-4 p-5', tc.glassCard].join(' ')}>
        <SummaryRow label={t('campaigns.labelObjective')} value={objectiveLabel} tc={tc} />
        <SummaryRow label={t('campaigns.labelAudience')} value={data.audience} tc={tc} />
        <SummaryRow label={t('campaigns.labelOffer')} value={data.offer} tc={tc} />
      </View>

      <View
        className={[
          'flex-row items-center gap-2 rounded-2xl border border-gold/20 bg-gold/5 p-4',
          tc.cardSm,
        ].join(' ')}
      >
        <Sparkles size={16} color="#C5A059" />
        <Text className={['flex-1 text-xs leading-5', tc.textSecondary].join(' ')}>
          {t('campaigns.aiHint')}
        </Text>
      </View>

      <Pressable
        onPress={onGenerate}
        className="flex-row items-center justify-center gap-2 rounded-2xl bg-gold py-4 active:opacity-90"
        style={{
          shadowColor: '#C5A059',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <Wand2 size={18} color="#0A1128" />
        <Text className="text-base font-bold text-deepBlue">{t('campaigns.generateFull')}</Text>
      </Pressable>
    </CampaignWizardStep>
  )
}

function SummaryRow({
  label,
  value,
  tc,
}: {
  label: string
  value: string
  tc: ReturnType<typeof useThemeClasses>
}) {
  return (
    <View className="gap-1">
      <Text className={tc.sectionLabel}>{label}</Text>
      <Text className={['text-sm font-medium', tc.textPrimary].join(' ')}>{value}</Text>
    </View>
  )
}
