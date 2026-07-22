import { GROWTH_ACTIONS } from '../constants/growth-actions'

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

export function buildRevenueKpis(metrics: RevenueDailyMetrics): RevenueKpi[] {
  return [
    {
      id: 'potential-revenue',
      label: 'Receita Potencial',
      displayValue: formatCurrencyBrlCompact(metrics.revenuePotential),
      changePercent: metrics.revenuePotential > 0 ? 18 : 0,
      changeLabel: 'pipeline atual',
      sparkline: [0, 0, 0, 0, 0, 0, 0, metrics.revenuePotential],
      accentColor: '#10B981',
    },
    {
      id: 'leads-identified',
      label: 'Leads Identificados',
      displayValue: String(metrics.leadsIdentified),
      changePercent: metrics.leadsIdentified > 0 ? 32 : 0,
      changeLabel: 'total CRM + campanhas',
      sparkline: [0, 0, 0, 0, 0, 0, 0, metrics.leadsIdentified],
      accentColor: '#3B82F6',
    },
    {
      id: 'hours-saved',
      label: 'Tempo Economizado',
      displayValue: `${metrics.hoursSaved}h`,
      changePercent: metrics.hoursSaved > 0 ? 40 : 0,
      changeLabel: 'estimado por campanhas',
      sparkline: [0, 0, 0, 0, 0, 0, 0, metrics.hoursSaved],
      accentColor: '#3B82F6',
    },
    {
      id: 'clients-recovered',
      label: 'Clientes Recuperados',
      displayValue: String(metrics.leadsRecovered),
      changePercent: metrics.leadsRecovered > 0 ? 12 : 0,
      changeLabel: 'leads inativos no funil',
      sparkline: [0, 0, 0, 0, 0, 0, 0, metrics.leadsRecovered],
      accentColor: '#10B981',
    },
  ]
}

export function formatCurrencyBrl(amount: number): string {
  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function formatCurrencyBrlCompact(amount: number): string {
  const formatted = amount.toLocaleString('pt-BR')
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
