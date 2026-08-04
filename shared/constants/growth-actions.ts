import type { TranslationKey } from '../i18n'
import type { MissionImpactCategory } from '../types/gamification'

export type GrowthActionDefinition = {
  titleKey: TranslationKey
  /** @deprecated Prefer titleKey + t() — kept for gradual migration */
  title: string
  xpReward: number
  revenueGain: number
  impactCategory: MissionImpactCategory
}

export const GROWTH_ACTIONS: Record<string, GrowthActionDefinition> = {
  'reactivate-inactive-leads': {
    titleKey: 'growth.reactivateLeads',
    title: 'Reativar 12 leads inativos',
    xpReward: 150,
    revenueGain: 8400,
    impactCategory: 'vendas',
  },
  'follow-up-leads': {
    titleKey: 'growth.followUpLeads',
    title: 'Follow up com 3 leads quentes',
    xpReward: 80,
    revenueGain: 2400,
    impactCategory: 'vendas',
  },
  'rewrite-headline': {
    titleKey: 'growth.rewriteHeadline',
    title: 'Reescrever headline do site',
    xpReward: 100,
    revenueGain: 1800,
    impactCategory: 'marketing',
  },
  'send-proposal': {
    titleKey: 'growth.sendProposal',
    title: 'Enviar proposta comercial',
    xpReward: 120,
    revenueGain: 5200,
    impactCategory: 'vendas',
  },
  'add-cta': {
    titleKey: 'growth.addCta',
    title: 'Adicionar CTA na página principal',
    xpReward: 120,
    revenueGain: 1400,
    impactCategory: 'posicionamento',
  },
  'configure-crm': {
    titleKey: 'growth.configureCrm',
    title: 'Configurar automação no CRM',
    xpReward: 90,
    revenueGain: 2100,
    impactCategory: 'automacao',
  },
  'publish-testimonial': {
    titleKey: 'growth.publishTestimonial',
    title: 'Publicar depoimento de cliente',
    xpReward: 70,
    revenueGain: 950,
    impactCategory: 'credibilidade',
  },
  'launch-campaign': {
    titleKey: 'growth.launchCampaign',
    title: 'Publicar campanha omnichannel',
    xpReward: 180,
    revenueGain: 6400,
    impactCategory: 'marketing',
  },
}

export const DEFAULT_GROWTH_ACTION: GrowthActionDefinition = {
  titleKey: 'growth.defaultAction',
  title: 'Ação estratégica executada pela IA',
  xpReward: 60,
  revenueGain: 800,
  impactCategory: 'marketing',
}
