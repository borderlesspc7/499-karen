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
  'upsell': 'gold',
  'authority': 'gold',
}

export type RevenueCenterSnapshot = {
  totalOpportunitiesToday: number
  opportunities: RevenueOpportunity[]
  dailyMetrics: RevenueDailyMetrics
}

const FEATURED_OPPORTUNITIES: RevenueOpportunity[] = [
  {
    id: 'opp-reactivate',
    type: 'reactivate-leads',
    title: 'Reativar 18 leads inativos',
    subtitle: 'Leads esquecidos com alto potencial de conversão',
    impactLabel: 'Impacto estimado',
    impactValue: 9400,
    ctaLabel: 'Reativar Agora',
    actionId: 'reactivate-inactive-leads',
  },
  {
    id: 'opp-campaign',
    type: 'approve-campaign',
    title: 'Campanha pronta para publicação',
    subtitle: 'Conteúdo gerado e aguardando sua aprovação',
    impactLabel: 'Previsão',
    impactValue: 0,
    secondaryLabel: 'Novos leads',
    secondaryValue: '247',
    ctaLabel: 'Aprovar',
  },
  {
    id: 'opp-upsell',
    type: 'upsell',
    title: '3 oportunidades de upsell identificadas',
    subtitle: 'Clientes ativos prontos para upgrade',
    impactLabel: 'Impacto estimado',
    impactValue: 12300,
    ctaLabel: 'Ver',
    actionId: 'send-proposal',
  },
  {
    id: 'opp-authority',
    type: 'authority',
    title: 'Artigo de autoridade no LinkedIn',
    subtitle: 'IA identificou tema em alta no seu segmento',
    impactLabel: 'Impacto estimado',
    impactValue: 1500,
    ctaLabel: 'Gerar Artigo',
    actionId: 'publish-linkedin-article',
  },
]

const DEFAULT_DAILY_METRICS: RevenueDailyMetrics = {
  revenueGenerated: 14280,
  revenuePotential: 23480,
  monthlyRevenue: 128540,
  leadsIdentified: 247,
  leadsRecovered: 18,
  hoursSaved: 17,
  hoursWorkedByAi: 17,
  roi: 6.4,
  automatedConversations: 31,
  conversionRate: 12.4,
  activeCampaigns: 4,
}

export function buildRevenueKpis(metrics: RevenueDailyMetrics): RevenueKpi[] {
  return [
    {
      id: 'potential-revenue',
      label: 'Receita Potencial',
      displayValue: formatCurrencyBrlCompact(metrics.revenuePotential),
      changePercent: 18,
      changeLabel: 'vs ontem',
      sparkline: [12, 14, 13, 16, 15, 18, 20, 22],
      accentColor: '#10B981',
    },
    {
      id: 'leads-identified',
      label: 'Leads Identificados',
      displayValue: String(metrics.leadsIdentified),
      changePercent: 32,
      changeLabel: 'vs ontem',
      sparkline: [8, 10, 12, 11, 14, 16, 18, 22],
      accentColor: '#3B82F6',
    },
    {
      id: 'hours-saved',
      label: 'Tempo Economizado',
      displayValue: `${metrics.hoursSaved}h`,
      changePercent: 40,
      changeLabel: 'vs ontem',
      sparkline: [6, 8, 7, 10, 9, 12, 14, 17],
      accentColor: '#3B82F6',
    },
    {
      id: 'clients-recovered',
      label: 'Clientes Recuperados',
      displayValue: String(metrics.leadsRecovered),
      changePercent: 12,
      changeLabel: 'vs ontem',
      sparkline: [4, 5, 6, 8, 10, 12, 14, 18],
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

type BuildRevenueCenterInput = {
  potentialRevenue?: number
  completedActions?: number
}

export function buildRevenueCenterSnapshot(
  input: BuildRevenueCenterInput = {},
): RevenueCenterSnapshot {
  const actionRevenueTotal = Object.values(GROWTH_ACTIONS).reduce(
    (sum, action) => sum + action.revenueGain,
    0,
  )

  const basePotential = input.potentialRevenue ?? DEFAULT_DAILY_METRICS.revenuePotential
  const totalOpportunitiesToday = Math.max(
    basePotential + actionRevenueTotal * 0.15,
    DEFAULT_DAILY_METRICS.revenuePotential,
  )

  const opportunities = FEATURED_OPPORTUNITIES.map((opp) => {
    if (opp.actionId && GROWTH_ACTIONS[opp.actionId]) {
      return {
        ...opp,
        impactValue: GROWTH_ACTIONS[opp.actionId].revenueGain,
      }
    }
    return opp
  })

  const dailyMetrics: RevenueDailyMetrics = {
    ...DEFAULT_DAILY_METRICS,
    revenuePotential: Math.round(totalOpportunitiesToday),
    revenueGenerated: input.completedActions
      ? DEFAULT_DAILY_METRICS.revenueGenerated + input.completedActions * 120
      : DEFAULT_DAILY_METRICS.revenueGenerated,
  }

  return {
    totalOpportunitiesToday: Math.round(totalOpportunitiesToday),
    opportunities,
    dailyMetrics,
  }
}
