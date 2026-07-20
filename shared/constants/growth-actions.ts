import type { MissionImpactCategory } from '../types/gamification'

export type GrowthActionDefinition = {
  title: string
  xpReward: number
  revenueGain: number
  impactCategory: MissionImpactCategory
}

export const GROWTH_ACTIONS: Record<string, GrowthActionDefinition> = {
  'reactivate-inactive-leads': {
    title: 'Reativar 12 leads inativos',
    xpReward: 150,
    revenueGain: 8400,
    impactCategory: 'vendas',
  },
  'follow-up-leads': {
    title: 'Follow up com 3 leads quentes',
    xpReward: 80,
    revenueGain: 2400,
    impactCategory: 'vendas',
  },
  'rewrite-headline': {
    title: 'Reescrever headline do site',
    xpReward: 100,
    revenueGain: 1800,
    impactCategory: 'marketing',
  },
  'send-proposal': {
    title: 'Enviar proposta comercial',
    xpReward: 120,
    revenueGain: 5200,
    impactCategory: 'vendas',
  },
  'add-cta': {
    title: 'Adicionar CTA na página principal',
    xpReward: 120,
    revenueGain: 1400,
    impactCategory: 'posicionamento',
  },
  'configure-crm': {
    title: 'Configurar automação no CRM',
    xpReward: 90,
    revenueGain: 2100,
    impactCategory: 'automacao',
  },
  'publish-testimonial': {
    title: 'Publicar depoimento de cliente',
    xpReward: 70,
    revenueGain: 950,
    impactCategory: 'credibilidade',
  },
  'publish-linkedin-article': {
    title: 'Publicar artigo de autoridade no LinkedIn',
    xpReward: 95,
    revenueGain: 1500,
    impactCategory: 'credibilidade',
  },
  'launch-campaign': {
    title: 'Publicar campanha omnichannel',
    xpReward: 180,
    revenueGain: 6400,
    impactCategory: 'marketing',
  },
}

export const DEFAULT_GROWTH_ACTION: GrowthActionDefinition = {
  title: 'Ação estratégica executada pela IA',
  xpReward: 60,
  revenueGain: 800,
  impactCategory: 'marketing',
}
