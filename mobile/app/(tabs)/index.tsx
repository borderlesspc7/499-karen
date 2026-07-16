import { useMemo, useState } from 'react'
import { ScrollView } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useAuth, useGamification } from '@shared/contexts'
import { GROWTH_ACTIONS } from '@shared/constants/growth-actions'
import {
  buildRevenueCenterSnapshot,
  buildRevenueKpis,
} from '@shared/services/revenue-center'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { DesktopContent } from '@/components/layout/DesktopContent'
import { ExecutionModal, type ExecutionModalProps } from '@/components/ExecutionModal'
import { AiWorkforcePanel } from '@/components/revenue-center/AiWorkforcePanel'
import { OpportunitySection } from '@/components/revenue-center/OpportunityCard'
import { RevenueHeader } from '@/components/revenue-center/RevenueHeader'
import { RevenueKpiGrid } from '@/components/revenue-center/RevenueKpiGrid'
import { RevenueMobileHero } from '@/components/revenue-center/RevenueMobileHero'
import { LINKEDIN_AUTHORITY_OPPORTUNITY } from '@/constants/ai-content-engine'
import { CAMPAIGN_LAUNCHED_PARAM } from '@/constants/campaign-journey'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type ExecutionFlow = 'leads' | 'linkedin-article' | 'upsell'

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
    'Preparei uma sequência de 3 e-mails focada em gatilhos de escassez para os 18 leads inativos.',
  impact: `+R$ ${GROWTH_ACTIONS['reactivate-inactive-leads'].revenueGain.toLocaleString('pt-BR')}`,
  previewDetail:
    'E-mail 1: reativação suave com prova social. E-mail 2: urgência com vaga limitada. E-mail 3: última chamada com bónus exclusivo.',
  contextLabel: 'Cognitive Core',
  loadingMessage: 'O Núcleo Cognitivo está reconstruindo contexto e calculando a decisão…',
  approveLabel: 'Aprovar e Executar',
  successMessage: 'Sequência ativada. Impacto estimado sendo rastreado.',
}

const UPSELL_EXECUTION: Pick<
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
  title: 'Oportunidades de Upsell',
  aiSuggestion:
    'Identifiquei 3 clientes ativos prontos para upgrade com alto potencial de receita.',
  impact: `+R$ ${GROWTH_ACTIONS['send-proposal'].revenueGain.toLocaleString('pt-BR')}`,
  previewDetail:
    'Cliente A: plano premium (+R$ 4.800). Cliente B: pacote anual (+R$ 4.200). Cliente C: serviço complementar (+R$ 3.300).',
  contextLabel: 'Decision Engine',
  loadingMessage: 'Decision Engine preparando alternativas e impacto estimado…',
  approveLabel: 'Ver Oportunidades',
  successMessage: 'Propostas prontas para envio.',
}

function resolveUserName(email?: string | null): string {
  if (!email) return 'você'
  const localPart = email.split('@')[0] ?? 'você'
  return localPart.charAt(0).toUpperCase() + localPart.slice(1)
}

export default function HomeScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const { currentUser } = useAuth()
  const { potentialRevenue, completedActions, executeAction } = useGamification()
  const searchParams = useLocalSearchParams<Record<string, string | string[]>>()
  const [activeExecutionFlow, setActiveExecutionFlow] = useState<ExecutionFlow | null>(null)

  const campaignLaunchedParam = searchParams[CAMPAIGN_LAUNCHED_PARAM]
  const isCampaignJustLaunched =
    campaignLaunchedParam === '1' ||
    (Array.isArray(campaignLaunchedParam) && campaignLaunchedParam.includes('1'))

  const userName = resolveUserName(currentUser?.email)

  const revenueSnapshot = useMemo(
    () =>
      buildRevenueCenterSnapshot({
        potentialRevenue,
        completedActions,
      }),
    [potentialRevenue, completedActions],
  )

  const kpis = useMemo(
    () => buildRevenueKpis(revenueSnapshot.dailyMetrics),
    [revenueSnapshot.dailyMetrics],
  )

  const executionConfig =
    activeExecutionFlow === 'linkedin-article'
      ? LINKEDIN_AUTHORITY_OPPORTUNITY.modal
      : activeExecutionFlow === 'upsell'
        ? UPSELL_EXECUTION
        : LEADS_EXECUTION

  function handleApproveExecution() {
    if (activeExecutionFlow === 'linkedin-article') {
      executeAction('publish-linkedin-article')
      return
    }
    if (activeExecutionFlow === 'upsell') {
      executeAction('send-proposal')
      return
    }
    executeAction('reactivate-inactive-leads')
  }

  function handleOpportunityPress(opportunityId: string) {
    switch (opportunityId) {
      case 'opp-reactivate':
        setActiveExecutionFlow('leads')
        break
      case 'opp-campaign':
        router.push('/(tabs)/campaign-magic')
        break
      case 'opp-upsell':
        setActiveExecutionFlow('upsell')
        break
      case 'opp-authority':
        setActiveExecutionFlow('linkedin-article')
        break
      default:
        break
    }
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
          'gap-8 pb-12',
          isWebDesktop ? 'px-8 py-8' : 'px-5 pt-6',
        ].join(' ')}
        showsVerticalScrollIndicator={false}
      >
        <DesktopContent maxWidth="7xl" className="gap-8">
        <RevenueHeader userName={userName} />

        {isWebDesktop ? (
          <RevenueKpiGrid kpis={kpis} />
        ) : (
          <RevenueMobileHero monthlyRevenue={revenueSnapshot.dailyMetrics.monthlyRevenue} />
        )}

        {!isWebDesktop ? <RevenueKpiGrid kpis={kpis} /> : null}

        <OpportunitySection
          opportunities={revenueSnapshot.opportunities}
          onPress={handleOpportunityPress}
          limit={isWebDesktop ? 3 : 4}
        />

        <AiWorkforcePanel isLiveReveal={isCampaignJustLaunched} />
        </DesktopContent>
      </ScrollView>
    </ThemedScreen>
  )
}
