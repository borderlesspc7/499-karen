import { GROWTH_ACTIONS } from '../constants/growth-actions'
import { translate } from '../i18n'
import type { AppLocale } from '../types/locale'
import { DEFAULT_LOCALE } from '../types/locale'

export type RevenueOpportunityType =
  | 'reactivate-leads'
  | 'approve-campaign'
  | 'upsell'
  | 'authority'

export type RevenueOpportunity = {
  id: string
  type: RevenueOpportunityType
  title: string
  subtitle: string
  impactLabel: string
  impactValue: number
  secondaryLabel?: string
  secondaryValue?: string
  ctaLabel: string
  actionId?: string
}

export type RevenueDailyMetrics = {
  revenueGenerated: number
  revenuePotential: number
  monthlyRevenue: number
  leadsIdentified: number
  leadsRecovered: number
  hoursSaved: number
  hoursWorkedByAi: number
  roi: number
  automatedConversations: number
  conversionRate: number
  activeCampaigns: number
}

export type RevenueKpi = {
  id: string
  label: string
  displayValue: string
  changePercent: number
  changeLabel: string
  sparkline: number[]
  accentColor: '#C5A059' | '#10B981' | '#3B82F6'
}

export type OpportunityVariant = 'green' | 'blue' | 'gold'

export const OPPORTUNITY_VARIANTS: Record<RevenueOpportunityType, OpportunityVariant> = {
  'reactivate-leads': 'green',
  'approve-campaign': 'blue',
  upsell: 'gold',
  authority: 'gold',
}

export type RevenueCenterSnapshot = {
  totalOpportunitiesToday: number
  opportunities: RevenueOpportunity[]
  dailyMetrics: RevenueDailyMetrics
}

export const EMPTY_DAILY_METRICS: RevenueDailyMetrics = {
  revenueGenerated: 0,
  revenuePotential: 0,
  monthlyRevenue: 0,
  leadsIdentified: 0,
  leadsRecovered: 0,
  hoursSaved: 0,
  hoursWorkedByAi: 0,
  roi: 0,
  automatedConversations: 0,
  conversionRate: 0,
  activeCampaigns: 0,
}

export function buildRevenueKpis(
  metrics: RevenueDailyMetrics,
  locale: AppLocale = DEFAULT_LOCALE,
): RevenueKpi[] {
  return [
    {
      id: 'potential-revenue',
      label: translate(locale, 'reports.potentialRevenue'),
      displayValue: formatCurrencyBrlCompact(metrics.revenuePotential, locale),
      changePercent: metrics.revenuePotential > 0 ? 18 : 0,
      changeLabel: translate(locale, 'reports.pipelineCurrent'),
      sparkline: [0, 0, 0, 0, 0, 0, 0, metrics.revenuePotential],
      accentColor: '#10B981',
    },
    {
      id: 'leads-identified',
      label: translate(locale, 'reports.leadsIdentified'),
      displayValue: String(metrics.leadsIdentified),
      changePercent: metrics.leadsIdentified > 0 ? 32 : 0,
      changeLabel: translate(locale, 'reports.totalCrmCampaigns'),
      sparkline: [0, 0, 0, 0, 0, 0, 0, metrics.leadsIdentified],
      accentColor: '#3B82F6',
    },
    {
      id: 'hours-saved',
      label: translate(locale, 'reports.hoursSaved'),
      displayValue: `${metrics.hoursSaved}h`,
      changePercent: metrics.hoursSaved > 0 ? 40 : 0,
      changeLabel: translate(locale, 'reports.estimatedByCampaigns'),
      sparkline: [0, 0, 0, 0, 0, 0, 0, metrics.hoursSaved],
      accentColor: '#3B82F6',
    },
    {
      id: 'clients-recovered',
      label: translate(locale, 'reports.recoveredCustomers'),
      displayValue: String(metrics.leadsRecovered),
      changePercent: metrics.leadsRecovered > 0 ? 12 : 0,
      changeLabel: translate(locale, 'reports.inactiveLeadsFunnel'),
      sparkline: [0, 0, 0, 0, 0, 0, 0, metrics.leadsRecovered],
      accentColor: '#10B981',
    },
  ]
}

export function formatCurrencyBrl(amount: number, locale: AppLocale = DEFAULT_LOCALE): string {
  return amount.toLocaleString(locale, {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function formatCurrencyBrlCompact(amount: number, locale: AppLocale = DEFAULT_LOCALE): string {
  const formatted = amount.toLocaleString(locale)
  return `R$ ${formatted}`
}

/** Snapshot vazio — use `computeRevenueCenterSnapshot` com dados do Firestore. */
export function buildRevenueCenterSnapshot(): RevenueCenterSnapshot {
  const actionRevenueTotal = Object.values(GROWTH_ACTIONS).reduce(
    (sum, action) => sum + action.revenueGain,
    0,
  )

  return {
    totalOpportunitiesToday: 0,
    opportunities: [],
    dailyMetrics: {
      ...EMPTY_DAILY_METRICS,
      revenuePotential: Math.round(actionRevenueTotal * 0),
    },
  }
}
