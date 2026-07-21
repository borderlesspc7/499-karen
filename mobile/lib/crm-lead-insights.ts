import type { KanbanCardWithClient } from '@shared/types'

const HOT_COLUMN_IDS = new Set(['col-proposta', 'col-negociacao'])
const INACTIVE_COLUMN_IDS = new Set(['col-leads'])

const PRIORITY_WEIGHT: Record<KanbanCardWithClient['priority'], number> = {
  alta: 22,
  media: 10,
  baixa: -12,
}

const COLUMN_WEIGHT: Record<string, number> = {
  'col-proposta': 28,
  'col-negociacao': 22,
  'col-contato': 12,
  'col-leads': -8,
  'col-fechado': 0,
}

export function computeLeadHealthScore(card: KanbanCardWithClient): number {
  let score = 48
  score += COLUMN_WEIGHT[card.columnId] ?? 0
  score += PRIORITY_WEIGHT[card.priority]

  if (card.clientId) {
    score += 12
  }

  if (card.category === 'vendas' || card.category === 'follow-up') {
    score += 8
  }

  const variation = card.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % 11
  score += variation - 5

  return Math.min(95, Math.max(18, Math.round(score)))
}

export function isHotLead(card: KanbanCardWithClient, healthScore: number): boolean {
  if (card.columnId === 'col-fechado') {
    return false
  }

  return HOT_COLUMN_IDS.has(card.columnId) || healthScore >= 65 || card.priority === 'alta'
}

export function isColdLead(card: KanbanCardWithClient, healthScore: number): boolean {
  if (card.columnId === 'col-fechado') {
    return false
  }

  return !isHotLead(card, healthScore)
}

export function countInactiveLeads(cards: KanbanCardWithClient[]): number {
  const inactiveCount = cards.filter(
    (card) =>
      INACTIVE_COLUMN_IDS.has(card.columnId) ||
      (card.columnId === 'col-contato' && card.priority === 'baixa'),
  ).length

  return Math.max(inactiveCount, 0)
}

export function partitionLeads(cards: KanbanCardWithClient[]): {
  hotLeads: Array<KanbanCardWithClient & { healthScore: number }>
  coldLeads: Array<KanbanCardWithClient & { healthScore: number }>
} {
  const activeCards = cards.filter((card) => card.columnId !== 'col-fechado')

  const enriched = activeCards.map((card) => ({
    ...card,
    healthScore: computeLeadHealthScore(card),
  }))

  return {
    hotLeads: enriched.filter((card) => isHotLead(card, card.healthScore)),
    coldLeads: enriched.filter((card) => isColdLead(card, card.healthScore)),
  }
}

export function resolveHealthColor(score: number): string {
  if (score >= 75) {
    return '#10B981'
  }

  if (score >= 50) {
    return '#F59E0B'
  }

  return '#EF4444'
}

const NEXT_ACTION_BY_COLUMN: Record<string, string> = {
  'col-leads': 'Reativar com mensagem personalizada',
  'col-contato': 'Agendar follow-up esta semana',
  'col-proposta': 'Enviar proposta com urgência suave',
  'col-negociacao': 'Resolver objeção e fechar negócio',
}

const PRIORITY_BASE_IMPACT: Record<KanbanCardWithClient['priority'], number> = {
  alta: 8400,
  media: 4200,
  baixa: 1800,
}

const COLUMN_IMPACT_MULTIPLIER: Record<string, number> = {
  'col-negociacao': 1.25,
  'col-proposta': 1.1,
  'col-contato': 0.9,
  'col-leads': 0.75,
}

export type GrowthFlowLead = KanbanCardWithClient & {
  healthScore: number
  nextBestAction: string
  dealImpact: number
}

export function resolveNextBestAction(card: KanbanCardWithClient): string {
  return NEXT_ACTION_BY_COLUMN[card.columnId] ?? 'Definir próximo passo com a IA'
}

export function estimateDealImpact(
  card: KanbanCardWithClient,
  healthScore: number,
): number {
  const base = PRIORITY_BASE_IMPACT[card.priority]
  const multiplier = COLUMN_IMPACT_MULTIPLIER[card.columnId] ?? 1
  const healthFactor = 0.65 + healthScore / 200

  return Math.round(base * multiplier * healthFactor)
}

function enrichCardToGrowthFlowLead(card: KanbanCardWithClient): GrowthFlowLead {
  const healthScore = computeLeadHealthScore(card)

  return {
    ...card,
    healthScore,
    nextBestAction: resolveNextBestAction(card),
    dealImpact: estimateDealImpact(card, healthScore),
  }
}

export function buildGrowthFlowLeads(cards: KanbanCardWithClient[]): GrowthFlowLead[] {
  return cards
    .filter((card) => card.columnId !== 'col-fechado')
    .map(enrichCardToGrowthFlowLead)
    .sort((a, b) => b.dealImpact - a.dealImpact)
}

export function buildWonLeads(cards: KanbanCardWithClient[]): GrowthFlowLead[] {
  return cards
    .filter((card) => card.columnId === 'col-fechado')
    .map(enrichCardToGrowthFlowLead)
    .sort((a, b) => b.dealImpact - a.dealImpact)
}

export type OpportunityQuickFilter = 'todos' | 'quentes' | 'esquecidos' | 'ganhos'

export function isForgottenLead(card: KanbanCardWithClient, healthScore: number): boolean {
  if (card.columnId === 'col-fechado') {
    return false
  }

  return (
    isColdLead(card, healthScore) ||
    INACTIVE_COLUMN_IDS.has(card.columnId) ||
    (card.columnId === 'col-contato' && card.priority === 'baixa')
  )
}

export function filterGrowthFlowLeads(
  activeLeads: GrowthFlowLead[],
  wonLeads: GrowthFlowLead[],
  filter: OpportunityQuickFilter,
): GrowthFlowLead[] {
  switch (filter) {
    case 'quentes':
      return activeLeads.filter((lead) => isHotLead(lead, lead.healthScore))
    case 'esquecidos':
      return activeLeads.filter((lead) => isForgottenLead(lead, lead.healthScore))
    case 'ganhos':
      return wonLeads
  }

  return activeLeads
}

export function computePipelineNegotiationValue(leads: GrowthFlowLead[]): number {
  return leads.reduce((sum, lead) => sum + lead.dealImpact, 0)
}
