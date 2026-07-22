import type { Client, SavedCampaign } from '../types'
import type { KanbanCardWithClient } from '../utils/link-crm-clients'
import { GROWTH_ACTIONS } from '../constants/growth-actions'
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

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const PRIORITY_VALUE: Record<KanbanCardWithClient['priority'], number> = {
  alta: 4800,
  media: 2800,
  baixa: 1200,
}

const CATEGORY_LOSS_LABELS: Record<string, string> = {
  vendas: 'Preço acima do budget',
  'follow-up': 'Timing inadequado',
  marketing: 'Concorrência direta',
  suporte: 'Falta de fit com produto',
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

function buildGrowthChart(cards: KanbanCardWithClient[]): GrowthDataPoint[] {
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
      month: MONTH_LABELS[monthIndex] ?? '—',
      oportunidades: Math.max(oportunidades, offset === 0 ? cards.length : oportunidades),
      fechamentos,
    })
  }

  return months
}

function buildLossReasons(cards: KanbanCardWithClient[]): ProgressMetric[] {
  const stalledCards = cards.filter(
    (card) => card.columnId !== WON_COLUMN_ID && INACTIVE_COLUMN_IDS.has(card.columnId),
  )

  if (stalledCards.length === 0) {
    return [{ label: 'Sem dados de perda', value: 0, barClassName: 'bg-slate-400' }]
  }

  const counts = new Map<string, number>()
  for (const card of stalledCards) {
    const label = CATEGORY_LOSS_LABELS[card.category] ?? 'Outros motivos'
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

function buildChannelPerformance(campaigns: SavedCampaign[]): ProgressMetric[] {
  const channelCounts = new Map<string, number>()

  for (const campaign of campaigns) {
    for (const channel of campaign.channels) {
      const normalized = channel.charAt(0).toUpperCase() + channel.slice(1)
      channelCounts.set(normalized, (channelCounts.get(normalized) ?? 0) + campaign.metrics.leads)
    }
  }

  if (channelCounts.size === 0) {
    return [{ label: 'Sem campanhas ativas', value: 0, barClassName: 'bg-slate-400' }]
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

export function computeRevenueOpportunities(input: AnalyticsInput): RevenueOpportunity[] {
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
      title: `Reativar ${inactiveCount} leads inativos`,
      subtitle: 'Leads esquecidos com alto potencial de conversão',
      impactLabel: 'Impacto estimado',
      impactValue: GROWTH_ACTIONS['reactivate-inactive-leads'].revenueGain,
      ctaLabel: 'Reativar Agora',
      actionId: 'reactivate-inactive-leads',
    })
  }

  if (draftCampaign || pendingCampaign) {
    const campaign = draftCampaign ?? pendingCampaign!
    opportunities.push({
      id: 'opp-campaign',
      type: 'approve-campaign',
      title: 'Campanha pronta para publicação',
      subtitle: campaign.title,
      impactLabel: 'Previsão',
      impactValue: 0,
      secondaryLabel: 'Novos leads',
      secondaryValue: String(campaign.estimatedLeads),
      ctaLabel: 'Aprovar',
    })
  }

  if (upsellCount > 0) {
    opportunities.push({
      id: 'opp-upsell',
      type: 'upsell',
      title: `${upsellCount} oportunidades de upsell identificadas`,
      subtitle: 'Clientes ativos prontos para upgrade',
      impactLabel: 'Impacto estimado',
      impactValue: GROWTH_ACTIONS['send-proposal'].revenueGain,
      ctaLabel: 'Ver',
      actionId: 'send-proposal',
    })
  }

  return opportunities
}

export function computeRevenueCenterSnapshot(input: AnalyticsInput): RevenueCenterSnapshot {
  const dailyMetrics = computeDailyMetrics(input)
  const opportunities = computeRevenueOpportunities(input)

  return {
    totalOpportunitiesToday: dailyMetrics.revenuePotential,
    opportunities,
    dailyMetrics,
  }
}

export function computeReportsSnapshot(input: AnalyticsInput): ReportsSnapshot {
  const { clients, cards, campaigns } = input
  const wonCount = cards.filter((card) => card.columnId === WON_COLUMN_ID).length
  const pipelineRevenue = computePipelineRevenue(cards) + computeWonRevenue(cards)
  const prospectCount = clients.filter((client) => client.status === 'prospecto').length
  const conversionRate =
    cards.length > 0 ? Math.round((wonCount / cards.length) * 100) : 0

  const kpis: ReportKpi[] = [
    {
      id: 'revenue',
      label: 'Receita Estimada',
      value: formatCurrencyBrl(pipelineRevenue),
      change: pipelineRevenue > 0 ? 'Baseado no pipeline' : 'Sem oportunidades',
      changeType: pipelineRevenue > 0 ? 'positive' : 'neutral',
    },
    {
      id: 'leads',
      label: 'Novos Leads',
      value: String(prospectCount + cards.filter((c) => c.columnId === 'col-leads').length),
      change: `${clients.length} clientes no CRM`,
      changeType: 'positive',
    },
    {
      id: 'conversion',
      label: 'Taxa de Conversão',
      value: `${conversionRate}%`,
      change: `${wonCount} fechamentos`,
      changeType: conversionRate >= 20 ? 'positive' : conversionRate > 0 ? 'negative' : 'neutral',
    },
    {
      id: 'closing-time',
      label: 'Campanhas Ativas',
      value: String(campaigns.filter((c) => c.status === 'active').length),
      change: `${campaigns.reduce((sum, c) => sum + c.metrics.leads, 0)} leads gerados`,
      changeType: 'neutral',
    },
  ]

  return {
    kpis,
    growthChart: buildGrowthChart(cards),
    lossReasons: buildLossReasons(cards),
    channelPerformance: buildChannelPerformance(campaigns),
  }
}

export function buildRevenueKpisFromMetrics(metrics: RevenueDailyMetrics) {
  return [
    {
      id: 'potential-revenue',
      label: 'Receita Potencial',
      displayValue: formatCurrencyBrlCompact(metrics.revenuePotential),
      changePercent: metrics.revenuePotential > 0 ? 18 : 0,
      changeLabel: 'pipeline atual',
      sparkline: buildSparkline(metrics.revenuePotential),
      accentColor: '#10B981' as const,
    },
    {
      id: 'leads-identified',
      label: 'Leads Identificados',
      displayValue: String(metrics.leadsIdentified),
      changePercent: metrics.leadsIdentified > 0 ? 32 : 0,
      changeLabel: 'total CRM + campanhas',
      sparkline: buildSparkline(metrics.leadsIdentified),
      accentColor: '#3B82F6' as const,
    },
    {
      id: 'hours-saved',
      label: 'Tempo Economizado',
      displayValue: `${metrics.hoursSaved}h`,
      changePercent: metrics.hoursSaved > 0 ? 40 : 0,
      changeLabel: 'automações ativas',
      sparkline: buildSparkline(metrics.hoursSaved),
      accentColor: '#3B82F6' as const,
    },
    {
      id: 'clients-recovered',
      label: 'Clientes Recuperados',
      displayValue: String(metrics.leadsRecovered),
      changePercent: metrics.leadsRecovered > 0 ? 12 : 0,
      changeLabel: 'leads inativos',
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
