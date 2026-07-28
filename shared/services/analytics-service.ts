import type { Client, SavedCampaign } from '../types'
import type { KanbanCardWithClient } from '../utils/link-crm-clients'
import { GROWTH_ACTIONS } from '../constants/growth-actions'
import { translate } from '../i18n'
import type { AppLocale } from '../types/locale'
import { DEFAULT_LOCALE } from '../types/locale'
import type {
  GrowthDataPoint,
  ProgressMetric,
  ReportKpi,
  ReportsSnapshot,
} from '../types/reports'
import {
  formatCurrencyBrl,
  formatCurrencyBrlCompact,
  type RevenueCenterSnapshot,
  type RevenueDailyMetrics,
  type RevenueOpportunity,
} from './revenue-center'

const WON_COLUMN_ID = 'col-fechado'
const INACTIVE_COLUMN_IDS = new Set(['col-leads'])
const NEGOTIATION_COLUMN_IDS = new Set(['col-proposta', 'col-negociacao'])

const MONTH_KEYS = [
  'reports.monthJan',
  'reports.monthFeb',
  'reports.monthMar',
  'reports.monthApr',
  'reports.monthMay',
  'reports.monthJun',
  'reports.monthJul',
  'reports.monthAug',
  'reports.monthSep',
  'reports.monthOct',
  'reports.monthNov',
  'reports.monthDec',
] as const

const PRIORITY_VALUE: Record<KanbanCardWithClient['priority'], number> = {
  alta: 4800,
  media: 2800,
  baixa: 1200,
}

const CATEGORY_LOSS_KEYS: Record<string, string> = {
  vendas: 'reports.lossPrice',
  'follow-up': 'reports.lossTiming',
  marketing: 'reports.lossCompetition',
  suporte: 'reports.lossFit',
}

const CHANNEL_BAR_COLORS = ['bg-violet-500', 'bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-rose-500']

export type AnalyticsInput = {
  clients: Client[]
  cards: KanbanCardWithClient[]
  campaigns: SavedCampaign[]
  potentialRevenue?: number
  completedActions?: number
}

function estimateDealValue(card: KanbanCardWithClient): number {
  if (typeof card.dealValue === 'number' && card.dealValue > 0) {
    return card.dealValue
  }

  return PRIORITY_VALUE[card.priority] ?? 2000
}

function countInactiveLeads(cards: KanbanCardWithClient[]): number {
  return cards.filter(
    (card) =>
      card.columnId !== WON_COLUMN_ID &&
      (INACTIVE_COLUMN_IDS.has(card.columnId) ||
        (card.columnId === 'col-contato' && card.priority === 'baixa')),
  ).length
}

function countUpsellOpportunities(clients: Client[], cards: KanbanCardWithClient[]): number {
  const activeClientIds = new Set(
    clients.filter((client) => client.status === 'ativo').map((client) => client.id),
  )

  return cards.filter(
    (card) =>
      card.clientId &&
      activeClientIds.has(card.clientId) &&
      NEGOTIATION_COLUMN_IDS.has(card.columnId),
  ).length
}

function computePipelineRevenue(cards: KanbanCardWithClient[]): number {
  return cards
    .filter((card) => card.columnId !== WON_COLUMN_ID)
    .reduce((sum, card) => sum + estimateDealValue(card), 0)
}

function computeWonRevenue(cards: KanbanCardWithClient[]): number {
  return cards
    .filter((card) => card.columnId === WON_COLUMN_ID)
    .reduce((sum, card) => sum + estimateDealValue(card), 0)
}

function parseDueDateMonth(dueDate: string): number | null {
  const parts = dueDate.split('/')
  if (parts.length !== 3) {
    return null
  }

  const month = Number(parts[1])
  return Number.isFinite(month) && month >= 1 && month <= 12 ? month - 1 : null
}

function buildGrowthChart(cards: KanbanCardWithClient[], locale: AppLocale): GrowthDataPoint[] {
  const now = new Date()
  const months: GrowthDataPoint[] = []

  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const monthIndex = date.getMonth()

    const oportunidades = cards.filter((card) => {
      const cardMonth = parseDueDateMonth(card.dueDate)
      if (cardMonth === null) {
        return offset === 0
      }
      return cardMonth === monthIndex
    }).length

    const fechamentos = cards.filter((card) => {
      if (card.columnId !== WON_COLUMN_ID) {
        return false
      }
      const cardMonth = parseDueDateMonth(card.dueDate)
      if (cardMonth === null) {
        return offset === 0
      }
      return cardMonth === monthIndex
    }).length

    months.push({
      month: translate(locale, MONTH_KEYS[monthIndex] ?? 'common.emDash'),
      oportunidades: Math.max(oportunidades, offset === 0 ? cards.length : oportunidades),
      fechamentos,
    })
  }

  return months
}

function buildLossReasons(cards: KanbanCardWithClient[], locale: AppLocale): ProgressMetric[] {
  const stalledCards = cards.filter(
    (card) => card.columnId !== WON_COLUMN_ID && INACTIVE_COLUMN_IDS.has(card.columnId),
  )

  if (stalledCards.length === 0) {
    return [{ label: translate(locale, 'reports.noLossData'), value: 0, barClassName: 'bg-slate-400' }]
  }

  const counts = new Map<string, number>()
  for (const card of stalledCards) {
    const key = CATEGORY_LOSS_KEYS[card.category] ?? 'reports.lossOther'
    const label = translate(locale, key)
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  const total = stalledCards.length
  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([label, count], index) => ({
      label,
      value: Math.round((count / total) * 100),
      barClassName: CHANNEL_BAR_COLORS[index % CHANNEL_BAR_COLORS.length] ?? 'bg-slate-400',
    }))
}

function buildChannelPerformance(campaigns: SavedCampaign[], locale: AppLocale): ProgressMetric[] {
  const channelCounts = new Map<string, number>()

  for (const campaign of campaigns) {
    for (const channel of campaign.channels) {
      const normalized = channel.charAt(0).toUpperCase() + channel.slice(1)
      channelCounts.set(normalized, (channelCounts.get(normalized) ?? 0) + campaign.metrics.leads)
    }
  }

  if (channelCounts.size === 0) {
    return [{ label: translate(locale, 'reports.noActiveCampaigns'), value: 0, barClassName: 'bg-slate-400' }]
  }

  const total = Array.from(channelCounts.values()).reduce((sum, value) => sum + value, 0)

  return Array.from(channelCounts.entries())
    .sort((left, right) => right[1] - left[1])
    .map(([label, count], index) => ({
      label,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      barClassName: CHANNEL_BAR_COLORS[index % CHANNEL_BAR_COLORS.length] ?? 'bg-slate-400',
    }))
}

export function computeDailyMetrics(input: AnalyticsInput): RevenueDailyMetrics {
  const { clients, cards, campaigns, potentialRevenue, completedActions } = input

  const inactiveLeads = countInactiveLeads(cards)
  const wonRevenue = computeWonRevenue(cards)
  const pipelineRevenue = computePipelineRevenue(cards)
  const activeCampaigns = campaigns.filter((campaign) => campaign.status === 'active').length
  const totalLeads = clients.filter((client) => client.status === 'prospecto').length + cards.length
  const wonCount = cards.filter((card) => card.columnId === WON_COLUMN_ID).length
  const conversionRate =
    cards.length > 0 ? Number(((wonCount / cards.length) * 100).toFixed(1)) : 0

  const campaignLeads = campaigns.reduce((sum, campaign) => sum + campaign.metrics.leads, 0)
  const campaignViews = campaigns.reduce((sum, campaign) => sum + campaign.metrics.views, 0)

  const revenuePotential = potentialRevenue ?? pipelineRevenue
  const revenueGenerated =
    wonRevenue + (completedActions ? completedActions * 120 : 0)

  const avgCostPerLead =
    campaigns.length > 0
      ? campaigns.reduce((sum, c) => sum + c.metrics.costPerLead, 0) / campaigns.length
      : 0

  const roi =
    avgCostPerLead > 0
      ? Number((revenueGenerated / (avgCostPerLead * Math.max(campaignLeads, 1))).toFixed(1))
      : 0

  void campaignViews

  return {
    revenueGenerated,
    revenuePotential,
    monthlyRevenue: wonRevenue + pipelineRevenue * 0.35,
    leadsIdentified: totalLeads + campaignLeads,
    leadsRecovered: inactiveLeads,
    hoursSaved: Math.round(activeCampaigns * 4 + campaigns.length * 2),
    hoursWorkedByAi: Math.round(activeCampaigns * 4 + campaigns.length * 2),
    roi,
    automatedConversations: campaigns.reduce(
      (sum, campaign) => sum + Math.round(campaign.metrics.leads * 0.3),
      0,
    ),
    conversionRate,
    activeCampaigns,
  }
}

export function computeRevenueOpportunities(
  input: AnalyticsInput,
  locale: AppLocale = DEFAULT_LOCALE,
): RevenueOpportunity[] {
  const inactiveCount = countInactiveLeads(input.cards)
  const upsellCount = countUpsellOpportunities(input.clients, input.cards)
  const draftCampaign = input.campaigns.find((campaign) => campaign.status === 'draft')
  const pendingCampaign = input.campaigns.find(
    (campaign) => campaign.status === 'active' && campaign.metrics.leads === 0,
  )

  const opportunities: RevenueOpportunity[] = []

  if (inactiveCount > 0) {
    opportunities.push({
      id: 'opp-reactivate',
      type: 'reactivate-leads',
      title: translate(locale, 'reports.reactivateTitle', { count: inactiveCount }),
      subtitle: translate(locale, 'reports.reactivateSubtitle'),
      impactLabel: translate(locale, 'reports.estimatedImpact'),
      impactValue: GROWTH_ACTIONS['reactivate-inactive-leads'].revenueGain,
      ctaLabel: translate(locale, 'reports.reactivateCta'),
      actionId: 'reactivate-inactive-leads',
    })
  }

  if (draftCampaign || pendingCampaign) {
    const campaign = draftCampaign ?? pendingCampaign!
    opportunities.push({
      id: 'opp-campaign',
      type: 'approve-campaign',
      title: translate(locale, 'reports.campaignReadyTitle'),
      subtitle: campaign.title,
      impactLabel: translate(locale, 'reports.forecast'),
      impactValue: 0,
      secondaryLabel: translate(locale, 'reports.newLeadsLabel'),
      secondaryValue: String(campaign.estimatedLeads),
      ctaLabel: translate(locale, 'reports.approveCta'),
    })
  }

  if (upsellCount > 0) {
    opportunities.push({
      id: 'opp-upsell',
      type: 'upsell',
      title: translate(locale, 'reports.upsellTitle', { count: upsellCount }),
      subtitle: translate(locale, 'reports.upsellSubtitle'),
      impactLabel: translate(locale, 'reports.estimatedImpact'),
      impactValue: GROWTH_ACTIONS['send-proposal'].revenueGain,
      ctaLabel: translate(locale, 'reports.viewCta'),
      actionId: 'send-proposal',
    })
  }

  return opportunities
}

export function computeRevenueCenterSnapshot(
  input: AnalyticsInput,
  locale: AppLocale = DEFAULT_LOCALE,
): RevenueCenterSnapshot {
  const dailyMetrics = computeDailyMetrics(input)
  const opportunities = computeRevenueOpportunities(input, locale)

  return {
    totalOpportunitiesToday: dailyMetrics.revenuePotential,
    opportunities,
    dailyMetrics,
  }
}

export function computeReportsSnapshot(
  input: AnalyticsInput,
  locale: AppLocale = DEFAULT_LOCALE,
): ReportsSnapshot {
  const { clients, cards, campaigns } = input
  const wonCount = cards.filter((card) => card.columnId === WON_COLUMN_ID).length
  const pipelineRevenue = computePipelineRevenue(cards) + computeWonRevenue(cards)
  const prospectCount = clients.filter((client) => client.status === 'prospecto').length
  const conversionRate =
    cards.length > 0 ? Math.round((wonCount / cards.length) * 100) : 0

  const kpis: ReportKpi[] = [
    {
      id: 'revenue',
      label: translate(locale, 'reports.estimatedRevenue'),
      value: formatCurrencyBrl(pipelineRevenue, locale),
      change: pipelineRevenue > 0
        ? translate(locale, 'reports.basedOnPipeline')
        : translate(locale, 'reports.noOpportunities'),
      changeType: pipelineRevenue > 0 ? 'positive' : 'neutral',
    },
    {
      id: 'leads',
      label: translate(locale, 'reports.newLeads'),
      value: String(prospectCount + cards.filter((c) => c.columnId === 'col-leads').length),
      change: translate(locale, 'reports.clientsInCrm', { count: clients.length }),
      changeType: 'positive',
    },
    {
      id: 'conversion',
      label: translate(locale, 'reports.conversionRate'),
      value: `${conversionRate}%`,
      change: translate(locale, 'reports.closings', { count: wonCount }),
      changeType: conversionRate >= 20 ? 'positive' : conversionRate > 0 ? 'negative' : 'neutral',
    },
    {
      id: 'closing-time',
      label: translate(locale, 'reports.activeCampaigns'),
      value: String(campaigns.filter((c) => c.status === 'active').length),
      change: translate(locale, 'reports.leadsGenerated', {
        count: campaigns.reduce((sum, c) => sum + c.metrics.leads, 0),
      }),
      changeType: 'neutral',
    },
  ]

  return {
    kpis,
    growthChart: buildGrowthChart(cards, locale),
    lossReasons: buildLossReasons(cards, locale),
    channelPerformance: buildChannelPerformance(campaigns, locale),
  }
}

export function buildRevenueKpisFromMetrics(
  metrics: RevenueDailyMetrics,
  locale: AppLocale = DEFAULT_LOCALE,
) {
  return [
    {
      id: 'potential-revenue',
      label: translate(locale, 'reports.potentialRevenue'),
      displayValue: formatCurrencyBrlCompact(metrics.revenuePotential, locale),
      changePercent: metrics.revenuePotential > 0 ? 18 : 0,
      changeLabel: translate(locale, 'reports.pipelineCurrent'),
      sparkline: buildSparkline(metrics.revenuePotential),
      accentColor: '#10B981' as const,
    },
    {
      id: 'leads-identified',
      label: translate(locale, 'reports.leadsIdentified'),
      displayValue: String(metrics.leadsIdentified),
      changePercent: metrics.leadsIdentified > 0 ? 32 : 0,
      changeLabel: translate(locale, 'reports.totalCrmCampaigns'),
      sparkline: buildSparkline(metrics.leadsIdentified),
      accentColor: '#3B82F6' as const,
    },
    {
      id: 'hours-saved',
      label: translate(locale, 'reports.hoursSaved'),
      displayValue: `${metrics.hoursSaved}h`,
      changePercent: metrics.hoursSaved > 0 ? 40 : 0,
      changeLabel: translate(locale, 'reports.activeAutomations'),
      sparkline: buildSparkline(metrics.hoursSaved),
      accentColor: '#3B82F6' as const,
    },
    {
      id: 'clients-recovered',
      label: translate(locale, 'reports.recoveredCustomers'),
      displayValue: String(metrics.leadsRecovered),
      changePercent: metrics.leadsRecovered > 0 ? 12 : 0,
      changeLabel: translate(locale, 'reports.inactiveLeads'),
      sparkline: buildSparkline(metrics.leadsRecovered),
      accentColor: '#10B981' as const,
    },
  ]
}

function buildSparkline(value: number): number[] {
  if (value <= 0) {
    return [0, 0, 0, 0, 0, 0, 0, 0]
  }

  const step = value / 8
  return Array.from({ length: 8 }, (_, index) => Math.round(step * (index + 1)))
}
