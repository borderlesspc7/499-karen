import { Text, View } from 'react-native'
import { Building2 } from 'lucide-react-native'
import { useTranslation } from '@shared/contexts'
import { SummusModalBadge } from '@/components/ui/modal'
import { OnboardingField } from './OnboardingField'

type CompanyStepProps = {
  companyName: string
  servicesDescription: string
  onChangeCompanyName: (value: string) => void
  onChangeServicesDescription: (value: string) => void
  variant?: 'onboarding' | 'embedded'
}

export function CompanyStep({
  companyName,
  servicesDescription,
  onChangeCompanyName,
  onChangeServicesDescription,
  variant = 'onboarding',
}: CompanyStepProps) {
  const { t } = useTranslation()
  const isEmbedded = variant === 'embedded'

  return (
    <>
      {!isEmbedded ? (
        <View className="mb-8 items-center gap-3">
          <SummusModalBadge label={t('onboarding.step1')} icon={Building2} tone="blue" />
          <Text className="text-center text-2xl font-bold leading-tight text-white">
            {t('onboarding.companyTitle')}
          </Text>
          <Text className="max-w-sm text-center text-base leading-6 text-white/55">
            {t('onboarding.companySubtitle')}
          </Text>
        </View>
      ) : null}

      <View className="gap-5">
        <OnboardingField
          label={t('onboarding.companyName')}
          value={companyName}
          onChangeText={onChangeCompanyName}
          placeholder={t('onboarding.companyNamePh')}
          variant={variant}
        />
        <OnboardingField
          label={t('onboarding.servicesLabel')}
          value={servicesDescription}
          onChangeText={onChangeServicesDescription}
          placeholder={t('onboarding.servicesPh')}
          multiline
          hint={t('onboarding.servicesHint')}
          variant={variant}
        />
      </View>
    </>
  )
}
