import type { SubscriptionPlan, SubscriptionPlanId } from '../types/subscription'

/**
 * Catálogo comercial atual do Summus Edge.
 * Preço Elite (R$ 297/mês) já exibido em Settings / Profile.
 */
export const SUBSCRIPTION_PLANS: readonly SubscriptionPlan[] = [
  {
    id: 'elite',
    name: 'Elite',
    productName: 'Summus Edge',
    tagline: 'Cognitive Operating System',
    description:
      'Acesso completo ao Núcleo Cognitivo, motores, campanhas, inbox e canais — o plano que você já conhece.',
    priceMonthlyCents: 29700,
    priceYearlyCents: 297000,
    currency: 'brl',
    stripePriceIdMonthly: 'price_mock_elite_monthly',
    stripePriceIdYearly: 'price_mock_elite_yearly',
    highlights: [
      'Núcleo Cognitivo com Context, Decision e Blind Spot',
      'Campanhas com IA e Inbox unificado',
      'Canais Instagram, Facebook e LinkedIn',
      'Oportunidades (CRM) e automações',
      'Suporte prioritário',
    ],
    entitlements: {
      maxChannels: 5,
      maxCampaignsPerMonth: 60,
      aiGenerationsPerMonth: 500,
      inboxSeats: 5,
      hasPrioritySupport: true,
      hasAdvancedAnalytics: true,
    },
    isFeatured: true,
  },
] as const

export function getSubscriptionPlan(planId: SubscriptionPlanId): SubscriptionPlan {
  const plan = SUBSCRIPTION_PLANS.find((item) => item.id === planId)
  if (!plan) {
    throw new Error(`Plano desconhecido: ${planId}`)
  }
  return plan
}

export function formatPlanPriceBrl(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
