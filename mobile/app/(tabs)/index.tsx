import { useState } from 'react'
import { ScrollView } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { useAuth, useGamification } from '@shared/contexts'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'
import { ExecutionModal, type ExecutionModalProps } from '@/components/ExecutionModal'
import { LINKEDIN_AUTHORITY_OPPORTUNITY } from '@/constants/ai-content-engine'
import { CAMPAIGN_LAUNCHED_PARAM } from '@/constants/campaign-journey'
import { AuthorityOpportunityCard } from '@/components/dashboard/home/AuthorityOpportunityCard'
import { ActiveCampaignCard } from '@/components/dashboard/home/ActiveCampaignCard'
import { GrowthTree } from '@/components/dashboard/home/GrowthTree'
import { HomeGrowthScoreCard } from '@/components/dashboard/home/HomeGrowthScoreCard'
import { HomeSmartHeader } from '@/components/dashboard/home/HomeSmartHeader'
import { LiveAiActivity } from '@/components/dashboard/home/LiveAiActivity'
import {
  FEATURED_ACTION_ID,
  featuredAction,
  NextBestActionCard,
} from '@/components/dashboard/home/NextBestActionCard'

type ExecutionFlow = 'leads' | 'linkedin-article'

const LEADS_EXECUTION: Pick<
  ExecutionModalProps,
  | 'title'
  | 'aiSuggestion'
  | 'impact'
  | 'previewDetail'
  | 'contextLabel'
  | 'loadingMessage'
  | 'approveLabel'
  | 'successMessage'
> = {
  title: 'Recuperação de Leads',
  aiSuggestion:
    'Preparei uma sequência de 3 e-mails focada em gatilhos de escassez para os 12 leads inativos.',
  impact: `+R$ ${featuredAction.revenueGain.toLocaleString('pt-BR')}`,
  previewDetail:
    'E-mail 1: reativação suave com prova social. E-mail 2: urgência com vaga limitada. E-mail 3: última chamada com bónus exclusivo. Envio automático em 48h com pausas inteligentes.',
  contextLabel: 'AI Workforce',
  loadingMessage:
    'A AI Workforce está a analisar os dados e a criar a estratégia...',
  approveLabel: 'Aprovar e Executar',
  successMessage: 'Executado com sucesso! A acompanhar os resultados.',
}

function resolveUserName(email?: string | null): string {
  if (!email) {
    return 'Karen'
  }

  const localPart = email.split('@')[0] ?? 'Karen'
  return localPart.charAt(0).toUpperCase() + localPart.slice(1)
}

export default function HomeScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const { currentUser } = useAuth()
  const { businessHealth, companyStage, executeAction } = useGamification()
  const searchParams = useLocalSearchParams<Record<string, string | string[]>>()
  const [activeExecutionFlow, setActiveExecutionFlow] = useState<ExecutionFlow | null>(null)
  const [isAuthorityCardVisible, setIsAuthorityCardVisible] = useState(true)

  const campaignLaunchedParam = searchParams[CAMPAIGN_LAUNCHED_PARAM]
  const isCampaignJustLaunched =
    campaignLaunchedParam === '1' ||
    (Array.isArray(campaignLaunchedParam) && campaignLaunchedParam.includes('1'))

  const userName = resolveUserName(currentUser?.email)
  const executionConfig =
    activeExecutionFlow === 'linkedin-article'
      ? LINKEDIN_AUTHORITY_OPPORTUNITY.modal
      : LEADS_EXECUTION

  function handleApproveExecution() {
    if (activeExecutionFlow === 'linkedin-article') {
      executeAction('publish-linkedin-article')
      return
    }

    executeAction(FEATURED_ACTION_ID)
  }

  return (
    <ThemedScreen>
      <ExecutionModal
        visible={activeExecutionFlow !== null}
        title={executionConfig.title}
        aiSuggestion={executionConfig.aiSuggestion}
        impact={executionConfig.impact}
        previewDetail={executionConfig.previewDetail}
        contextLabel={executionConfig.contextLabel}
        loadingMessage={executionConfig.loadingMessage}
        approveLabel={executionConfig.approveLabel}
        successMessage={executionConfig.successMessage}
        onClose={() => setActiveExecutionFlow(null)}
        onApprove={handleApproveExecution}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName={[
          'gap-6 pb-10 pt-6',
          isWebDesktop ? 'px-8' : 'px-5',
        ].join(' ')}
        showsVerticalScrollIndicator={false}
      >
        <HomeSmartHeader userName={userName} />

        <ActiveCampaignCard isJustActivated={isCampaignJustLaunched} />

        <LiveAiActivity isLiveReveal={isCampaignJustLaunched} />

        <HomeGrowthScoreCard
          score={businessHealth.totalScore}
          companyStage={companyStage}
        />

        <NextBestActionCard onRequestApproval={() => setActiveExecutionFlow('leads')} />

        <GrowthTree businessHealth={businessHealth} />

        {isAuthorityCardVisible ? (
          <AuthorityOpportunityCard
            onGenerateArticle={() => setActiveExecutionFlow('linkedin-article')}
            onDismiss={() => setIsAuthorityCardVisible(false)}
          />
        ) : null}
      </ScrollView>
    </ThemedScreen>
  )
}
