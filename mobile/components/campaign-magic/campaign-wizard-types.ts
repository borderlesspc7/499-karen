export type CampaignObjective =
  | 'sell'
  | 'schedule'
  | 'authority'
  | 'reactivate'
  | 'promote'

export type CampaignWizardData = {
  objective: CampaignObjective | null
  audience: string
  offer: string
}

export const CAMPAIGN_OBJECTIVES: {
  id: CampaignObjective
  label: string
  description: string
}[] = [
  { id: 'sell', label: 'Vender', description: 'Converter leads em clientes pagantes' },
  { id: 'schedule', label: 'Agendar', description: 'Marcar consultas, demos ou reuniões' },
  { id: 'authority', label: 'Gerar autoridade', description: 'Posicionar sua marca como referência' },
  { id: 'reactivate', label: 'Recuperar clientes', description: 'Reengajar leads e clientes inativos' },
  { id: 'promote', label: 'Promover novo serviço', description: 'Lançar ou divulgar uma oferta nova' },
]

export const OFFER_SUGGESTIONS = [
  'Consultoria estratégica premium',
  'Harmonização facial',
  'Pacote de implantes dentários',
  'Diagnóstico gratuito do funil',
  'Programa de fidelidade anual',
] as const

export function buildCampaignPrompt(data: CampaignWizardData): string {
  const objective = CAMPAIGN_OBJECTIVES.find((o) => o.id === data.objective)
  const parts = [
    objective ? `Objetivo: ${objective.label}.` : '',
    data.audience ? `Público: ${data.audience}.` : '',
    data.offer ? `Oferta: ${data.offer}.` : '',
  ].filter(Boolean)

  return parts.join(' ')
}

export function computeApprovalSummary(pieceCount: number) {
  return {
    channels: ['Instagram', 'Facebook', 'LinkedIn', 'E-mail'],
    pieceCount,
    hoursSaved: 17,
    estimatedLeads: 247,
    expectedRoi: 6.4,
  }
}
