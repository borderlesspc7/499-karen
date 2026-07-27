import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth, useGamification } from '@shared/contexts'
import type { BrandColors, BrandIdentityDraft } from '@shared/types/brand-identity'
import type { UserProfile } from '@shared/types/gamification'
import {
  createBrandIdentity,
  DEFAULT_BRAND_COLORS,
  isBrandIdentityComplete,
} from '@shared/utils/brand-identity'
import { uploadBrandLogo } from '@/lib/storage-service'
import { AudienceStep } from './onboarding/AudienceStep'
import { CompanyStep } from './onboarding/CompanyStep'
import { OnboardingProgressBar } from './onboarding/OnboardingProgressBar'
import { ProfileStep } from './onboarding/ProfileStep'
import { VisualStep } from './onboarding/VisualStep'

const ADAPTATION_DELAY_MS = 2400
const BRAND_FORM_STEPS = 3
const DRAFT_SAVE_DEBOUNCE_MS = 500

type OnboardingStep = 'profile' | 'company' | 'audience' | 'visual' | 'adapting'

type OnboardingDraftPersist = {
  step: OnboardingStep
  selectedProfile: UserProfile | null
  draft: {
    companyName: string
    servicesDescription: string
    targetClientType: BrandIdentityDraft['targetClientType'] | null
    targetClientDescription: string
    logoUri: string | null
    colors: BrandColors
  }
}

type OnboardingModalProps = {
  visible: boolean
}

const INITIAL_DRAFT: OnboardingDraftPersist['draft'] = {
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

function draftStorageKey(userId: string) {
  return `summus_onboarding_draft_v1:${userId}`
}

/**
 * Overlay full-screen (não RN Modal) — o Modal nativo falha com frequência
 * logo após `router.replace` do paywall e “pula” a etapa da empresa.
 */
export function OnboardingModal({ visible }: OnboardingModalProps) {
  const { currentUser } = useAuth()
  const { userProfile, brandIdentity, setUserProfile, setBrandIdentity } = useGamification()
  const [step, setStep] = useState<OnboardingStep>('profile')
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null)
  const [draft, setDraft] = useState(INITIAL_DRAFT)
  const [hasInitializedSession, setHasInitializedSession] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const brandFormStep = useMemo(() => {
    if (step === 'company') return 1
    if (step === 'audience') return 2
    if (step === 'visual') return 3
    return 0
  }, [step])

  useEffect(() => {
    if (!visible || !currentUser?.id) {
      setHasInitializedSession(false)
      return
    }

    if (hasInitializedSession) {
      return
    }

    let isMounted = true

    void (async () => {
      const raw = await AsyncStorage.getItem(draftStorageKey(currentUser.id))
      let persisted: OnboardingDraftPersist | null = null

      if (raw) {
        try {
          persisted = JSON.parse(raw) as OnboardingDraftPersist
        } catch {
          persisted = null
        }
      }

      if (!isMounted) return

      if (persisted?.draft) {
        setDraft({
          ...INITIAL_DRAFT,
          ...persisted.draft,
          colors: persisted.draft.colors ?? { ...DEFAULT_BRAND_COLORS },
        })
        if (persisted.selectedProfile) {
          setSelectedProfile(persisted.selectedProfile)
        }
        if (
          persisted.step &&
          persisted.step !== 'adapting' &&
          (persisted.selectedProfile || persisted.step === 'profile')
        ) {
          setStep(persisted.step === 'profile' && !persisted.selectedProfile ? 'profile' : persisted.step)
          setHasInitializedSession(true)
          return
        }
      }

      if (userProfile) {
        const hasCompleteBrand =
          brandIdentity !== null &&
          isBrandIdentityComplete({
            businessProfile: userProfile,
            companyName: brandIdentity.companyName,
            servicesDescription: brandIdentity.servicesDescription,
            targetClientType: brandIdentity.targetClientType,
            targetClientDescription: brandIdentity.targetClientDescription,
            logoUri: brandIdentity.logoUri,
            colors: brandIdentity.colors,
          })

        if (!hasCompleteBrand) {
          setSelectedProfile(userProfile)
          setStep('company')
          if (brandIdentity) {
            setDraft({
              companyName: brandIdentity.companyName ?? '',
              servicesDescription: brandIdentity.servicesDescription ?? '',
              targetClientType: brandIdentity.targetClientType ?? null,
              targetClientDescription: brandIdentity.targetClientDescription ?? '',
              logoUri: brandIdentity.logoUri ?? null,
              colors: brandIdentity.colors ?? { ...DEFAULT_BRAND_COLORS },
            })
          } else {
            setDraft(INITIAL_DRAFT)
          }
          setHasInitializedSession(true)
          return
        }
      }

      setStep('profile')
      setSelectedProfile(null)
      setDraft(INITIAL_DRAFT)
      setHasInitializedSession(true)
    })()

    return () => {
      isMounted = false
    }
  }, [visible, userProfile, brandIdentity, hasInitializedSession, currentUser?.id])

  useEffect(() => {
    if (!visible || !hasInitializedSession || !currentUser?.id || step === 'adapting') {
      return
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      const payload: OnboardingDraftPersist = {
        step,
        selectedProfile,
        draft,
      }
      void AsyncStorage.setItem(draftStorageKey(currentUser.id), JSON.stringify(payload))
    }, DRAFT_SAVE_DEBOUNCE_MS)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [visible, hasInitializedSession, currentUser?.id, step, selectedProfile, draft])

  function handleSelectProfile(profile: UserProfile) {
    setSelectedProfile(profile)
    setUserProfile(profile)
    setStep('company')
  }

  function handleBackToStart() {
    setStep('profile')
  }

  async function handleFinishBrandIdentity() {
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

    try {
      let logoUri = draft.logoUri
      if (logoUri && currentUser?.id && !logoUri.startsWith('http')) {
        logoUri = await uploadBrandLogo({ userId: currentUser.id, localUri: logoUri })
      }

      setTimeout(() => {
        setBrandIdentity(createBrandIdentity({ ...identityDraft, logoUri }))
        if (currentUser?.id) {
          void AsyncStorage.removeItem(draftStorageKey(currentUser.id))
        }
      }, ADAPTATION_DELAY_MS)
    } catch {
      setTimeout(() => {
        setBrandIdentity(createBrandIdentity(identityDraft))
        if (currentUser?.id) {
          void AsyncStorage.removeItem(draftStorageKey(currentUser.id))
        }
      }, ADAPTATION_DELAY_MS)
    }
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

  if (!visible) {
    return null
  }

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <SafeAreaView className="flex-1 bg-deepBlue" edges={['top', 'bottom']}>
        <View className="absolute inset-0 overflow-hidden" pointerEvents="none">
          <View className="absolute -right-28 top-0 h-72 w-72 rounded-full bg-electricBlue/10" />
          <View className="absolute -left-36 bottom-24 h-80 w-80 rounded-full bg-gold/6" />
        </View>

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
                    Olá! Eu sou a Meridian e estou configurando a identidade da sua marca…
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
                    <View className="mb-4 gap-2">
                      <Pressable onPress={handleBackToStart} className="self-start py-1">
                        <Text className="text-xs font-semibold text-gold">← Voltar ao início</Text>
                      </Pressable>
                      <OnboardingProgressBar
                        currentStep={brandFormStep}
                        totalSteps={BRAND_FORM_STEPS}
                      />
                    </View>
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
                      onChangeLogoUri={(uri) =>
                        setDraft((current) => ({ ...current, logoUri: uri }))
                      }
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
                        <Text className="text-center text-sm font-semibold text-white/70">
                          Voltar
                        </Text>
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
                            void handleFinishBrandIdentity()
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
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
})
