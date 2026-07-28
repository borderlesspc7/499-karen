import {
  computeReportsSnapshot,
  computeRevenueCenterSnapshot,
  type AnalyticsInput,
} from '@shared/services/analytics-service'
import type { ReportsSnapshot } from '@shared/types'
import type { AppLocale } from '@shared/types/locale'
import { DEFAULT_LOCALE } from '@shared/types/locale'
import type { RevenueCenterSnapshot } from '@shared/services/revenue-center'
import { loadLinkedCrmSnapshot } from './crm-client-service'
import { getCampaignRepository } from './firestore-campaign-repository'

export type AnalyticsData = {
  revenue: RevenueCenterSnapshot
  reports: ReportsSnapshot
}

export async function loadAnalyticsData(
  userId: string,
  gamificationInput?: Pick<AnalyticsInput, 'potentialRevenue' | 'completedActions'>,
  locale: AppLocale = DEFAULT_LOCALE,
): Promise<AnalyticsData> {
  const [crmSnapshot, campaigns] = await Promise.all([
    loadLinkedCrmSnapshot(userId),
    getCampaignRepository().listByUser(userId),
  ])

  const input: AnalyticsInput = {
    clients: crmSnapshot.clients,
    cards: crmSnapshot.cards,
    campaigns,
    potentialRevenue: gamificationInput?.potentialRevenue,
    completedActions: gamificationInput?.completedActions,
  }

  return {
    revenue: computeRevenueCenterSnapshot(input, locale),
    reports: computeReportsSnapshot(input, locale),
  }
}
