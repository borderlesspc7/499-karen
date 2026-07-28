import { useMemo, useState } from 'react'
import { ActivityIndicator, ScrollView, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useAuth, useGamification, useTranslation } from '@shared/contexts'
import { GROWTH_ACTIONS } from '@shared/constants/growth-actions'
import { ThemedScreen } from '@/components/layout/AppScreen'
import { DesktopContent } from '@/components/layout/DesktopContent'
import { ExecutionModal, type ExecutionModalProps } from '@/components/ExecutionModal'
import { AiWorkforcePanel } from '@/components/revenue-center/AiWorkforcePanel'
import { OpportunitySection } from '@/components/revenue-center/OpportunityCard'
import { RevenueHeader } from '@/components/revenue-center/RevenueHeader'
import { RevenueKpiGrid } from '@/components/revenue-center/RevenueKpiGrid'
import { RevenueMobileHero } from '@/components/revenue-center/RevenueMobileHero'
import { GettingStartedChecklist } from '@/components/guidance/GettingStartedChecklist'
import { CAMPAIGN_LAUNCHED_PARAM } from '@/constants/campaign-journey'
import { useAnalyticsData } from '@/hooks/useAnalyticsData'
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout'

type ExecutionFlow = 'leads' | 'linkedin-article' | 'upsell'

function resolveUserName(email: string | null | undefined, fallback: string): string {
  if (!email) return fallback
  const localPart = email.split('@')[0] ?? fallback
  return localPart.charAt(0).toUpperCase() + localPart.slice(1)
}

export default function HomeScreen() {
  const { isWebDesktop } = useResponsiveLayout()
  const { currentUser } = useAuth()
  const { executeAction } = useGamification()
  const { t, locale } = useTranslation()
  const { revenue, kpis, isLoading } = useAnalyticsData()
  const searchParams = useLocalSearchParams<Record<string, string | string[]>>()
  const [activeExecutionFlow, setActiveExecutionFlow] = useState<ExecutionFlow | null>(null)

  const campaignLaunchedParam = searchParams[CAMPAIGN_LAUNCHED_PARAM]
  const isCampaignJustLaunched =
    campaignLaunchedParam === '1' ||
    (Array.isArray(campaignLaunchedParam) && campaignLaunchedParam.includes('1'))

  const userName = resolveUserName(currentUser?.email, t('home.youFallback'))

  const leadsExecution = useMemo<
    Pick<
      ExecutionModalProps,
      | 'title'
      | 'aiSuggestion'
      | 'impact'
      | 'previewDetail'
      | 'loadingMessage'
      | 'successMessage'
    >
  >(
    () => ({
      title: t('home.leadRecovery'),
      aiSuggestion: t('home.leadRecoverySuggestion'),
      impact: `+R$ ${GROWTH_ACTIONS['reactivate-inactive-leads'].revenueGain.toLocaleString(locale)}`,
      previewDetail: t('home.leadRecoveryPreview'),
      loadingMessage: t('home.leadRecoveryLoading'),
      successMessage: t('home.leadRecoverySuccess'),
    }),
    [t, locale],
  )

  const upsellExecution = useMemo<
    Pick<
      ExecutionModalProps,
      | 'title'
      | 'aiSuggestion'
      | 'impact'
      | 'previewDetail'
      | 'loadingMessage'
      | 'approveLabel'
      | 'successMessage'
    >
  >(
    () => ({
      title: t('home.upsellOpportunities'),
      aiSuggestion: t('home.upsellSuggestion'),
      impact: `+R$ ${GROWTH_ACTIONS['send-proposal'].revenueGain.toLocaleString(locale)}`,
      previewDetail: t('home.upsellPreview'),
      loadingMessage: t('home.upsellLoading'),
      approveLabel: t('home.seeOpportunities'),
      successMessage: t('home.upsellSuccess'),
    }),
    [t, locale],
  )

  const linkedinExecution = useMemo<
    Pick<
      ExecutionModalProps,
      | 'title'
      | 'aiSuggestion'
      | 'impact'
      | 'previewDetail'
      | 'loadingMessage'
      | 'approveLabel'
      | 'successMessage'
    >
  >(
    () => ({
      title: t('home.linkedinTitle'),
      aiSuggestion: t('home.linkedinSuggestion'),
      impact: t('home.linkedinImpact'),
      previewDetail: t('home.linkedinPreview'),
      loadingMessage: t('home.linkedinLoading'),
      approveLabel: t('home.linkedinApprove'),
      successMessage: t('home.linkedinSuccess'),
    }),
    [t],
  )

  const executionConfig =
    activeExecutionFlow === 'linkedin-article'
      ? linkedinExecution
      : activeExecutionFlow === 'upsell'
        ? upsellExecution
        : leadsExecution

  const executionApproveLabel =
    activeExecutionFlow === 'upsell'
      ? upsellExecution.approveLabel
      : activeExecutionFlow === 'linkedin-article'
        ? linkedinExecution.approveLabel
        : undefined

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

  if (isLoading || !revenue) {
    return (
      <ThemedScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#C5A059" />
        </View>
      </ThemedScreen>
    )
  }

  return (
    <ThemedScreen>
      <ExecutionModal
        visible={activeExecutionFlow !== null}
        title={executionConfig.title}
        aiSuggestion={executionConfig.aiSuggestion}
        impact={executionConfig.impact}
        previewDetail={executionConfig.previewDetail}
        loadingMessage={executionConfig.loadingMessage}
        approveLabel={executionApproveLabel}
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

        <GettingStartedChecklist />

        {isWebDesktop ? (
          <RevenueKpiGrid kpis={kpis} />
        ) : (
          <RevenueMobileHero monthlyRevenue={revenue.dailyMetrics.monthlyRevenue} />
        )}

        {!isWebDesktop ? <RevenueKpiGrid kpis={kpis} /> : null}

        <OpportunitySection
          opportunities={revenue.opportunities}
          onPress={handleOpportunityPress}
          limit={isWebDesktop ? 3 : 4}
        />

        <AiWorkforcePanel isLiveReveal={isCampaignJustLaunched} />
        </DesktopContent>
      </ScrollView>
    </ThemedScreen>
  )
}
