import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { router } from 'expo-router'
import {
  buildCampaignPrompt,
  computeApprovalSummary,
  CAMPAIGN_OBJECTIVES,
  type CampaignObjective,
  type CampaignWizardData,
} from '@/components/campaign-magic/campaign-wizard-types'
import { CAMPAIGN_LAUNCHED_PARAM } from '@/constants/campaign-journey'
import { getCampaignRepository } from '@/lib/firestore-campaign-repository'
import { useAuth, useGamification, useTranslation } from '@shared/contexts'
import type { TranslationKey, TranslationParams } from '@shared/i18n'
import { AiOrchestrationError } from '@shared/services/ai-orchestration-service'
import type { SavedCampaign } from '@shared/types'
import {
  generateCampaignContent,
  type GeneratedCampaignContent,
} from '@shared/utils/generate-campaign-content'

export type CampaignScreenPhase = 'hub' | 'wizard' | 'loading' | 'dashboard'
export type CampaignWizardStep = 0 | 1 | 2 | 3
export type CampaignApprovalTab = 'social' | 'emails' | 'landing'

const EMPTY_CAMPAIGN: GeneratedCampaignContent = {
  social: [],
  emails: [],
  landing: [],
}

const INITIAL_WIZARD_DATA: CampaignWizardData = {
  objective: null,
  audience: '',
  offer: '',
}

const WIZARD_DRAFT_DEBOUNCE_MS = 500

function wizardDraftKey(userId: string) {
  return `summus_campaign_wizard_draft_v1:${userId}`
}

function resolveCampaignTitle(
  data: CampaignWizardData,
  t: (key: TranslationKey, params?: TranslationParams) => string,
): string {
  if (data.offer.trim()) {
    return data.offer.trim()
  }

  const objectiveKey = CAMPAIGN_OBJECTIVES.find((item) => item.id === data.objective)?.labelKey
  return objectiveKey
    ? t('campaigns.campaignLabel', { label: t(objectiveKey) })
    : t('campaigns.newCampaign')
}

export function useCampaignMagicScreen() {
  const { currentUser } = useAuth()
  const { brandIdentity, brandAiContext, userProfile, executeAction } = useGamification()
  const { t } = useTranslation()

  const [phase, setPhase] = useState<CampaignScreenPhase>('hub')
  const [wizardStep, setWizardStep] = useState<CampaignWizardStep>(0)
  const [wizardData, setWizardData] = useState<CampaignWizardData>(INITIAL_WIZARD_DATA)
  const [prompt, setPrompt] = useState('')
  const [activeTab, setActiveTab] = useState<CampaignApprovalTab>('social')
  const [isSuccessVisible, setIsSuccessVisible] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [generatedCampaign, setGeneratedCampaign] =
    useState<GeneratedCampaignContent>(EMPTY_CAMPAIGN)
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false)
  const draftTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [activeCampaigns, setActiveCampaigns] = useState<SavedCampaign[]>([])
  const [isLoadingCampaigns, setIsLoadingCampaigns] = useState(true)
  const [campaignsError, setCampaignsError] = useState<string | null>(null)

  const suggestedAudience =
    brandIdentity?.targetClientDescription || (brandIdentity ? brandIdentity.companyName : '')

  const pieceCount = useMemo(
    () =>
      generatedCampaign.social.length +
      generatedCampaign.emails.length +
      generatedCampaign.landing.length,
    [generatedCampaign],
  )

  const approvalSummary = useMemo(() => computeApprovalSummary(pieceCount), [pieceCount])
  const previewCards = generatedCampaign[activeTab]

  const loadActiveCampaigns = useCallback(async () => {
    if (!currentUser?.id) {
      setActiveCampaigns([])
      setIsLoadingCampaigns(false)
      return
    }

    setIsLoadingCampaigns(true)
    setCampaignsError(null)

    try {
      const campaigns = await getCampaignRepository().listActiveByUser(currentUser.id)
      setActiveCampaigns(campaigns)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('campaigns.loadFailed')
      setCampaignsError(message)
    } finally {
      setIsLoadingCampaigns(false)
    }
  }, [currentUser?.id, t])

  useEffect(() => {
    void loadActiveCampaigns()
  }, [loadActiveCampaigns])

  useEffect(() => {
    if (!currentUser?.id || hasRestoredDraft) {
      return
    }

    let isMounted = true

    void AsyncStorage.getItem(wizardDraftKey(currentUser.id)).then((raw) => {
      if (!isMounted) return

      if (raw) {
        try {
          const draft = JSON.parse(raw) as {
            wizardStep?: CampaignWizardStep
            wizardData?: CampaignWizardData
            phase?: CampaignScreenPhase
          }

          if (draft.wizardData) {
            setWizardData({ ...INITIAL_WIZARD_DATA, ...draft.wizardData })
          }
          if (typeof draft.wizardStep === 'number') {
            setWizardStep(draft.wizardStep)
          }
          if (draft.phase === 'wizard') {
            setPhase('wizard')
          }
        } catch {
          // rascunho inválido
        }
      }

      setHasRestoredDraft(true)
    })

    return () => {
      isMounted = false
    }
  }, [currentUser?.id, hasRestoredDraft])

  useEffect(() => {
    if (!currentUser?.id || !hasRestoredDraft || phase !== 'wizard') {
      return
    }

    if (draftTimeoutRef.current) {
      clearTimeout(draftTimeoutRef.current)
    }

    draftTimeoutRef.current = setTimeout(() => {
      void AsyncStorage.setItem(
        wizardDraftKey(currentUser.id),
        JSON.stringify({
          phase,
          wizardStep,
          wizardData,
        }),
      )
    }, WIZARD_DRAFT_DEBOUNCE_MS)

    return () => {
      if (draftTimeoutRef.current) {
        clearTimeout(draftTimeoutRef.current)
      }
    }
  }, [currentUser?.id, hasRestoredDraft, phase, wizardStep, wizardData])

  const clearWizardDraft = useCallback(async () => {
    if (!currentUser?.id) return
    await AsyncStorage.removeItem(wizardDraftKey(currentUser.id))
  }, [currentUser?.id])

  const handleStartCreate = useCallback(() => {
    setWizardData(INITIAL_WIZARD_DATA)
    setWizardStep(0)
    setPrompt('')
    setActiveTab('social')
    setGeneratedCampaign(EMPTY_CAMPAIGN)
    setPhase('wizard')
  }, [])

  const handleBackToHub = useCallback(() => {
    setPhase('hub')
    void loadActiveCampaigns()
  }, [loadActiveCampaigns])

  const handleBackToWizardStart = useCallback(() => {
    setWizardStep(0)
    setPhase('wizard')
  }, [])

  const handleLoadingComplete = useCallback(() => {
    setPhase('dashboard')
  }, [])

  const handleGenerate = useCallback(() => {
    const builtPrompt = buildCampaignPrompt(wizardData, t)
    setPrompt(builtPrompt)
    setPhase('loading')
    void clearWizardDraft()

    void generateCampaignContent({
      userPrompt: builtPrompt,
      brandIdentity,
      brandAiContext,
      userProfile,
      objective: wizardData.objective ?? undefined,
      audience: wizardData.audience || undefined,
      offer: wizardData.offer || undefined,
    })
      .then((content) => {
        setGeneratedCampaign(content)
      })
      .catch((error) => {
        setPhase('wizard')
        const message =
          error instanceof AiOrchestrationError ? error.message : t('campaigns.generateFailed')
        Alert.alert(t('campaigns.aiUnavailable'), message)
      })
  }, [wizardData, brandIdentity, brandAiContext, userProfile, clearWizardDraft, t])

  const handleEdit = useCallback(() => {
    Alert.alert(t('campaigns.editTitle'), t('campaigns.editBody'))
  }, [t])

  const handlePublish = useCallback(async () => {
    if (!currentUser?.id) {
      Alert.alert(t('campaigns.sessionRequired'), t('campaigns.sessionRequiredBody'))
      return
    }

    if (isPublishing) {
      return
    }

    setIsPublishing(true)

    try {
      await getCampaignRepository().createActive({
        userId: currentUser.id,
        title: resolveCampaignTitle(wizardData, t),
        objective: (wizardData.objective ?? 'promote') as CampaignObjective,
        audience: wizardData.audience,
        offer: wizardData.offer,
        channels: approvalSummary.channels,
        pieceCount: approvalSummary.pieceCount,
        estimatedLeads: approvalSummary.estimatedLeads,
        prompt,
      })

      executeAction('launch-campaign')
      await loadActiveCampaigns()
      await clearWizardDraft()
      setIsSuccessVisible(true)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('campaigns.publishFailed')
      Alert.alert(t('campaigns.publishFailedTitle'), message)
    } finally {
      setIsPublishing(false)
    }
  }, [
    currentUser?.id,
    isPublishing,
    wizardData,
    approvalSummary.channels,
    approvalSummary.pieceCount,
    approvalSummary.estimatedLeads,
    prompt,
    executeAction,
    loadActiveCampaigns,
    clearWizardDraft,
    t,
  ])

  const navigateToHomeAfterLaunch = useCallback(() => {
    setIsSuccessVisible(false)
    router.replace({
      pathname: '/(tabs)/index',
      params: { [CAMPAIGN_LAUNCHED_PARAM]: '1' },
    })
  }, [])

  const handleCloseSuccess = useCallback(() => {
    setIsSuccessVisible(false)
    setPhase('hub')
    void loadActiveCampaigns()
  }, [loadActiveCampaigns])

  const handleViewOnHome = useCallback(() => {
    navigateToHomeAfterLaunch()
  }, [navigateToHomeAfterLaunch])

  return {
    brandIdentity,
    phase,
    wizardStep,
    setWizardStep,
    wizardData,
    setWizardData,
    prompt,
    activeTab,
    setActiveTab,
    isSuccessVisible,
    isPublishing,
    generatedCampaign,
    activeCampaigns,
    isLoadingCampaigns,
    campaignsError,
    suggestedAudience,
    approvalSummary,
    previewCards,
    loadActiveCampaigns,
    handleStartCreate,
    handleBackToHub,
    handleBackToWizardStart,
    handleLoadingComplete,
    handleGenerate,
    handleEdit,
    handlePublish,
    handleCloseSuccess,
    handleViewOnHome,
  }
}
