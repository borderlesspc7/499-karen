import { Text, View } from 'react-native'
import { Building2 } from 'lucide-react-native'
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
  const isEmbedded = variant === 'embedded'

  return (
    <>
      {!isEmbedded ? (
        <View className="mb-8 items-center gap-3">
          <SummusModalBadge label="Passo 1" icon={Building2} tone="blue" />
          <Text className="text-center text-2xl font-bold leading-tight text-white">
            Conte-nos sobre a sua empresa
          </Text>
          <Text className="max-w-sm text-center text-base leading-6 text-white/55">
            Essas informações orientam a IA na criação de campanhas, conteúdos e automações alinhados
            ao seu negócio.
          </Text>
        </View>
      ) : null}

      <View className="gap-5">
        <OnboardingField
          label="Nome da empresa"
          value={companyName}
          onChangeText={onChangeCompanyName}
          placeholder="Ex: Clínica Harmonia"
          variant={variant}
        />
        <OnboardingField
          label="Produtos ou serviços oferecidos"
          value={servicesDescription}
          onChangeText={onChangeServicesDescription}
          placeholder="Ex: Harmonização facial, botox, preenchimento labial, skinbooster..."
          multiline
          hint="Descreva o que você vende hoje. Quanto mais detalhe, melhor a IA personaliza."
          variant={variant}
        />
      </View>
    </>
  )
}
