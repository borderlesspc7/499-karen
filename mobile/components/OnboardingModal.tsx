import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { SummusSheetModal } from '@/components/ui/modal'
import { useGamification } from '@shared/contexts'
import type { BrandColors, BrandIdentityDraft } from '@shared/types/brand-identity'
import type { UserProfile } from '@shared/types/gamification'
import {
  createBrandIdentity,
  DEFAULT_BRAND_COLORS,
  isBrandIdentityComplete,
} from '@shared/utils/brand-identity'
import { AudienceStep } from './onboarding/AudienceStep'
import { CompanyStep } from './onboarding/CompanyStep'
import { OnboardingProgressBar } from './onboarding/OnboardingProgressBar'
import { ProfileStep } from './onboarding/ProfileStep'
import { VisualStep } from './onboarding/VisualStep'

const ADAPTATION_DELAY_MS = 2400
const BRAND_FORM_STEPS = 3

type OnboardingStep = 'profile' | 'company' | 'audience' | 'visual' | 'adapting'

type OnboardingModalProps = {
  visible: boolean
}

const INITIAL_DRAFT: {
  companyName: string
  servicesDescription: string
  targetClientType: BrandIdentityDraft['targetClientType'] | null
  targetClientDescription: string
  logoUri: string | null
  colors: BrandColors
} = {
  companyName: '',
  servicesDescription: '',
  targetClientType: null,
  targetClientDescription: '',
  logoUri: null,
  colors: {
    primary: DEFAULT_BRAND_COLORS.primary,
    secondary: DEFAULT_BRAND_COLORS.secondary,
    accent: DEFAULT_BRAND_COLORS.accent,
  },
}

export function OnboardingModal({ visible }: OnboardingModalProps) {
  const { userProfile, setUserProfile, setBrandIdentity } = useGamification()
  const [step, setStep] = useState<OnboardingStep>('profile')
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)
  const [draft, setDraft] = useState(INITIAL_DRAFT)

  const brandFormStep = useMemo(() => {
    if (step === 'company') return 1
    if (step === 'audience') return 2
    if (step === 'visual') return 3
    return 0
  }, [step])

  useEffect(() => {
    if (!visible) {
      return
    }

    if (userProfile) {
      setSelectedProfile(userProfile)
      setStep('company')
      return
    }

    setStep('profile')
    setSelectedProfile(null)
    setDraft(INITIAL_DRAFT)
  }, [visible, userProfile])

  function handleSelectProfile(profile: UserProfile) {
    setSelectedProfile(profile)
    setUserProfile(profile)
    setStep('company')
  }

  function handleFinishBrandIdentity() {
    if (!selectedProfile) {
      return
    }

    const identityDraft: BrandIdentityDraft = {
      businessProfile: selectedProfile,
      companyName: draft.companyName,
      servicesDescription: draft.servicesDescription,
      targetClientType: draft.targetClientType!,
      targetClientDescription: draft.targetClientDescription,
      logoUri: draft.logoUri,
      colors: draft.colors,
    }

    if (!isBrandIdentityComplete(identityDraft)) {
      return
    }

    setStep('adapting')

    setTimeout(() => {
      setBrandIdentity(createBrandIdentity(identityDraft))
    }, ADAPTATION_DELAY_MS)
  }

  const canAdvanceFromCompany =
    draft.companyName.trim().length > 0 && draft.servicesDescription.trim().length > 0

  const canAdvanceFromAudience = draft.targetClientType !== null

  const canFinishVisual = isBrandIdentityComplete({
    businessProfile: selectedProfile ?? 'Empresário',
    companyName: draft.companyName,
    servicesDescription: draft.servicesDescription,
    targetClientType: draft.targetClientType ?? 'outro',
    targetClientDescription: draft.targetClientDescription,
    logoUri: draft.logoUri,
    colors: draft.colors,
  })

  const showBrandProgress = step === 'company' || step === 'audience' || step === 'visual'

  return (
    <SummusSheetModal
      visible={visible}
      onClose={() => {}}
      showClose={false}
      presentationStyle="fullScreen"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {step === 'adapting' ? (
          <View className="flex-1 items-center justify-center px-6">
            <View className="items-center gap-6">
              <View className="relative h-24 w-24 items-center justify-center">
                <View className="absolute h-24 w-24 rounded-full border border-electricBlue/30 bg-electricBlue/10" />
                <View className="absolute h-16 w-16 rounded-full bg-electricBlue/15" />
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
              <View className="items-center gap-2">
                <Text className="text-center text-xl font-semibold text-white">
                  Configurando a IA com a identidade da sua marca...
                </Text>
                <Text className="text-center text-sm text-white/50">{draft.companyName}</Text>
              </View>
            </View>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerClassName="grow justify-center px-6 py-10"
            keyboardShouldPersistTaps="handled"
          >
            {step === 'profile' ? (
              <ProfileStep onSelectProfile={handleSelectProfile} />
            ) : (
              <>
                {showBrandProgress ? (
                  <OnboardingProgressBar
                    currentStep={brandFormStep}
                    totalSteps={BRAND_FORM_STEPS}
                  />
                ) : null}

                {step === 'company' ? (
                  <CompanyStep
                    companyName={draft.companyName}
                    servicesDescription={draft.servicesDescription}
                    onChangeCompanyName={(value) =>
                      setDraft((current) => ({ ...current, companyName: value }))
                    }
                    onChangeServicesDescription={(value) =>
                      setDraft((current) => ({ ...current, servicesDescription: value }))
                    }
                  />
                ) : null}

                {step === 'audience' ? (
                  <AudienceStep
                    targetClientType={draft.targetClientType}
                    targetClientDescription={draft.targetClientDescription}
                    onSelectTarget={(type) =>
                      setDraft((current) => ({ ...current, targetClientType: type }))
                    }
                    onChangeDescription={(value) =>
                      setDraft((current) => ({ ...current, targetClientDescription: value }))
                    }
                  />
                ) : null}

                {step === 'visual' ? (
                  <VisualStep
                    logoUri={draft.logoUri}
                    colors={draft.colors}
                    onChangeLogoUri={(uri) => setDraft((current) => ({ ...current, logoUri: uri }))}
                    onChangeColors={(colors: BrandColors) =>
                      setDraft((current) => ({ ...current, colors }))
                    }
                  />
                ) : null}

                {step === 'company' || step === 'audience' || step === 'visual' ? (
                  <View className="mt-8 flex-row gap-3">
                    <Pressable
                      onPress={() => {
                        if (step === 'company') {
                          setStep('profile')
                          return
                        }
                        if (step === 'audience') {
                          setStep('company')
                          return
                        }
                        if (step === 'visual') {
                          setStep('audience')
                        }
                      }}
                      className="flex-1 rounded-2xl border border-white/15 py-4"
                    >
                      <Text className="text-center text-sm font-semibold text-white/70">Voltar</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => {
                        if (step === 'company' && canAdvanceFromCompany) {
                          setStep('audience')
                          return
                        }
                        if (step === 'audience' && canAdvanceFromAudience) {
                          setStep('visual')
                          return
                        }
                        if (step === 'visual' && canFinishVisual) {
                          handleFinishBrandIdentity()
                        }
                      }}
                      disabled={
                        (step === 'company' && !canAdvanceFromCompany) ||
                        (step === 'audience' && !canAdvanceFromAudience) ||
                        (step === 'visual' && !canFinishVisual)
                      }
                      className="flex-1 rounded-2xl bg-gold py-4 disabled:opacity-40"
                    >
                      <Text className="text-center text-sm font-semibold text-deepBlue">
                        {step === 'visual' ? 'Concluir identidade' : 'Continuar'}
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </>
            )}
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SummusSheetModal>
  )
}
