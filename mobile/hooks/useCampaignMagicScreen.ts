import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert } from 'react-native'
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
import { useAuth, useGamification } from '@shared/contexts'
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

function resolveCampaignTitle(data: CampaignWizardData): string {
  if (data.offer.trim()) {
    return data.offer.trim()
  }

  const objectiveLabel = CAMPAIGN_OBJECTIVES.find((item) => item.id === data.objective)?.label
  return objectiveLabel ? `Campanha: ${objectiveLabel}` : 'Nova campanha'
}

export function useCampaignMagicScreen() {
  const { currentUser } = useAuth()
  const { brandIdentity, brandAiContext, userProfile, executeAction } = useGamification()

  const [phase, setPhase] = useState<CampaignScreenPhase>('hub')
  const [wizardStep, setWizardStep] = useState<CampaignWizardStep>(0)
  const [wizardData, setWizardData] = useState<CampaignWizardData>(INITIAL_WIZARD_DATA)
  const [prompt, setPrompt] = useState('')
  const [activeTab, setActiveTab] = useState<CampaignApprovalTab>('social')
  const [isSuccessVisible, setIsSuccessVisible] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [generatedCampaign, setGeneratedCampaign] =
    useState<GeneratedCampaignContent>(EMPTY_CAMPAIGN)

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
      const message =
        error instanceof Error ? error.message : 'Não foi possível carregar as campanhas.'
      setCampaignsError(message)
    } finally {
      setIsLoadingCampaigns(false)
    }
  }, [currentUser?.id])

  useEffect(() => {
    void loadActiveCampaigns()
  }, [loadActiveCampaigns])

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

  const handleLoadingComplete = useCallback(() => {
    setPhase('dashboard')
  }, [])

  const handleGenerate = useCallback(() => {
    const builtPrompt = buildCampaignPrompt(wizardData)
    setPrompt(builtPrompt)
    setPhase('loading')

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
          error instanceof AiOrchestrationError
            ? error.message
            : 'Não foi possível gerar a campanha com IA.'
        Alert.alert('IA indisponível', message)
      })
  }, [wizardData, brandIdentity, brandAiContext, userProfile])

  const handleEdit = useCallback(() => {
    Alert.alert(
      'Editar Campanha',
      'Em breve você poderá ajustar cada peça da campanha individualmente.',
    )
  }, [])

  const handlePublish = useCallback(async () => {
    if (!currentUser?.id) {
      Alert.alert('Sessão necessária', 'Faça login para publicar e salvar a campanha.')
      return
    }

    if (isPublishing) {
      return
    }

    setIsPublishing(true)

    try {
      await getCampaignRepository().createActive({
        userId: currentUser.id,
        title: resolveCampaignTitle(wizardData),
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
      setIsSuccessVisible(true)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível publicar a campanha.'
      Alert.alert('Falha ao publicar', message)
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
    handleLoadingComplete,
    handleGenerate,
    handleEdit,
    handlePublish,
    handleCloseSuccess,
    handleViewOnHome,
  }
}
