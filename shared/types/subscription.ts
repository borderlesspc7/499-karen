/**
 * Modelo de assinatura alinhado ao Stripe Billing.
 * Fonte de verdade em produção: webhook Stripe → Firestore.
 * @see https://docs.stripe.com/billing/subscriptions/overview
 */

export type SubscriptionPlanId = 'elite'

export type SubscriptionStatus =
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'paused'
  | 'none'

export type SubscriptionBillingInterval = 'month' | 'year'

export type SubscriptionMode = 'mock' | 'stripe'

export type PlanEntitlements = {
  maxChannels: number
  maxCampaignsPerMonth: number
  aiGenerationsPerMonth: number
  inboxSeats: number
  hasPrioritySupport: boolean
  hasAdvancedAnalytics: boolean
}

export type SubscriptionPlan = {
  id: SubscriptionPlanId
  name: string
  productName: string
  tagline: string
  description: string
  priceMonthlyCents: number
  priceYearlyCents: number
  currency: 'brl'
  /** Placeholder Stripe Price IDs — trocar pelos reais no Dashboard */
  stripePriceIdMonthly: string
  stripePriceIdYearly: string
  highlights: string[]
  entitlements: PlanEntitlements
  isFeatured: boolean
}

export type UserSubscription = {
  planId: SubscriptionPlanId
  status: SubscriptionStatus
  mode: SubscriptionMode
  billingInterval: SubscriptionBillingInterval
  /** Stripe Customer ID (cus_…) */
  stripeCustomerId: string | null
  /** Stripe Subscription ID (sub_…) */
  stripeSubscriptionId: string | null
  /** Stripe Checkout Session ID (cs_…) */
  stripeCheckoutSessionId: string | null
  /** Stripe Price ID (price_…) */
  stripePriceId: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  cancelAtPeriodEnd: boolean
  entitlements: PlanEntitlements
  updatedAt: string
  createdAt: string
}

export type CreateCheckoutSessionRequest = {
  planId: SubscriptionPlanId
  billingInterval: SubscriptionBillingInterval
  successUrl: string
  cancelUrl: string
}

export type CreateCheckoutSessionResponse = {
  mode: SubscriptionMode
  sessionId: string
  /** Em modo Stripe real: URL do Checkout hospedado */
  checkoutUrl: string | null
  /** Em modo mock: cliente confirma pagamento in-app */
  requiresInAppConfirmation: boolean
}

export type ConfirmMockCheckoutRequest = {
  sessionId: string
  planId: SubscriptionPlanId
  billingInterval: SubscriptionBillingInterval
}

export type ConfirmMockCheckoutResponse = {
  ok: true
  subscription: UserSubscription
}

export function isSubscriptionActive(status: SubscriptionStatus | null | undefined): boolean {
  return status === 'active' || status === 'trialing' || status === 'past_due'
}
